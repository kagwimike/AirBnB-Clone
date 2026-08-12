from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

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
        total_price = data.get('total_price')
        phone_number = data.get('mpesa_phone')

        # -----------------------------------
        # Validate required fields
        # -----------------------------------
        if not all([
            property_id,
            check_in,
            check_out,
            guests,
            total_price,
            phone_number
        ]):
            return Response(
                {
                    "error": "property_id, check_in, check_out, guests, "
                             "total_price and mpesa_phone are required."
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
                check_in_date=check_in,
                check_out_date=check_out,
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
                    "payment_id": payment.id
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