from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from bookings.models import Booking
from properties.models import Property
from .models import Payment
from .utils import initiate_stk_push


class MpesaCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data

        property_id = data.get('property_id')
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        guests = data.get('guests')
        phone_number = data.get('mpesa_phone')

        # -----------------------------------
        # Validate required fields
        # -----------------------------------
        if not all([
            property_id,
            check_in,
            check_out,
            guests,
            phone_number
        ]):
            return Response(
                {
                    "error": "property_id, check_in, check_out, guests, "
                             "and mpesa_phone are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------
        # Get property
        # -----------------------------------
        try:
            property_obj = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
            guests = int(guests)
        except (TypeError, ValueError):
            return Response({'error': 'Use valid check-in, check-out and guest values.'}, status=status.HTTP_400_BAD_REQUEST)

        if check_out_date <= check_in_date or guests < 1 or guests > property_obj.max_guests:
            return Response({'error': 'The requested dates or guest count are not valid for this property.'}, status=status.HTTP_400_BAD_REQUEST)

        if Booking.objects.filter(property=property_obj, check_in_date__lt=check_out_date, check_out_date__gt=check_in_date, payment_status__in=['PENDING', 'CONFIRMED']).exists():
            return Response({'error': 'These dates are no longer available.'}, status=status.HTTP_409_CONFLICT)

        nights = (check_out_date - check_in_date).days
        accommodation = Decimal(property_obj.price_per_night) * nights
        cleaning_fee = Decimal('1000.00')
        service_fee = (accommodation * Decimal('0.10')).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
        taxes = ((accommodation + cleaning_fee + service_fee) * Decimal('0.16')).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
        total_price = accommodation + cleaning_fee + service_fee + taxes

        # -----------------------------------
        # Initiate M-Pesa STK Push
        # -----------------------------------
        try:
            stk_response = initiate_stk_push(
                phone_number,
                total_price,
                f"Property-{property_id}"
            )
        except Exception as e:
            return Response(
                {
                    "error": "Failed to initiate M-Pesa STK Push.",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # -----------------------------------
        # Check M-Pesa response
        # -----------------------------------
        if stk_response.get('ResponseCode') == '0':

            checkout_request_id = stk_response.get(
                'CheckoutRequestID'
            )

            merchant_request_id = stk_response.get(
                'MerchantRequestID'
            )

            # -----------------------------------
            # Create booking
            # -----------------------------------
            booking = Booking.objects.create(
                user=request.user,
                property=property_obj,
                check_in_date=check_in_date,
                check_out_date=check_out_date,
                guests=guests,
                total_price=total_price,
                payment_status='PENDING'
            )

            # -----------------------------------
            # Create payment
            # -----------------------------------
            payment = Payment.objects.create(
                booking=booking,
                user=request.user,
                amount=total_price,
                phone_number=phone_number,
                status='PENDING',
                merchant_request_id=merchant_request_id,
                checkout_request_id=checkout_request_id
            )

            return Response(
                {
                    "message": "STK Push initiated successfully. "
                               "Check your phone.",
                    "checkout_request_id": checkout_request_id,
                    "merchant_request_id": merchant_request_id,
                    "booking_id": booking.id,
                    "payment_id": payment.id,
                    "pricing": {
                        "nights": nights,
                        "accommodation": str(accommodation),
                        "cleaning_fee": str(cleaning_fee),
                        "service_fee": str(service_fee),
                        "taxes": str(taxes),
                        "total": str(total_price),
                    }
                },
                status=status.HTTP_200_OK
            )

        # -----------------------------------
        # STK Push failed
        # -----------------------------------
        return Response(
            {
                "error": "M-Pesa STK Push failed",
                "details": stk_response
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):

        try:
            res = request.data

            stk_callback = (
                res
                .get('Body', {})
                .get('stkCallback', {})
            )

            checkout_request_id = stk_callback.get(
                'CheckoutRequestID'
            )

            result_code = stk_callback.get(
                'ResultCode'
            )

            # -----------------------------------
            # Find payment
            # -----------------------------------
            payment = Payment.objects.filter(
                checkout_request_id=checkout_request_id
            ).first()

            if not payment:
                return Response(
                    {
                        "ResultCode": 0,
                        "ResultDesc": "Payment not found"
                    },
                    status=status.HTTP_200_OK
                )

            booking = payment.booking

            # -----------------------------------
            # Payment successful
            # -----------------------------------
            if result_code == 0:

                callback_metadata = (
                    stk_callback
                    .get('CallbackMetadata', {})
                    .get('Item', [])
                )

                receipt_number = next(
                    (
                        item.get('Value')
                        for item in callback_metadata
                        if item.get('Name') == 'MpesaReceiptNumber'
                    ),
                    None
                )

                # Get transaction date
                transaction_date = next(
                    (
                        item.get('Value')
                        for item in callback_metadata
                        if item.get('Name') == 'TransactionDate'
                    ),
                    None
                )

                # Update Payment
                payment.status = 'COMPLETED'
                payment.mpesa_receipt = receipt_number

                if transaction_date:
                    payment.transaction_date = str(
                        transaction_date
                    )

                payment.save()

                # Update Booking
                booking.payment_status = 'CONFIRMED'
                booking.mpesa_receipt = receipt_number
                booking.save()

            # -----------------------------------
            # Payment failed
            # -----------------------------------
            else:

                payment.status = 'FAILED'
                payment.save()

                booking.payment_status = 'FAILED'
                booking.save()

            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": "Accepted"
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            print(
                "Error processing M-Pesa callback:",
                e
            )

            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": "Accepted"
                },
                status=status.HTTP_200_OK
            )
