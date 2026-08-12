import base64
from datetime import datetime
import requests
from django.conf import settings

DARAJA_CONSUMER_KEY = getattr(settings, 'DARAJA_CONSUMER_KEY', 'your_sandbox_consumer_key')
DARAJA_CONSUMER_SECRET = getattr(settings, 'DARAJA_CONSUMER_SECRET', 'your_sandbox_consumer_secret')
BUSINESS_SHORTCODE = '174379'
PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
CALLBACK_URL = getattr(settings, 'DARAJA_CALLBACK_URL', 'https://yourdomain.com/api/payments/callback/')

def get_daraja_access_token():
    auth_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    try:
        r = requests.get(auth_url, auth=(DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET))
        return r.json().get('access_token')
    except Exception as e:
        print("Failed to get token:", e)
        return None

def initiate_stk_push(phone_number, amount, account_reference):
    access_token = get_daraja_access_token()
    if not access_token:
        return {"error": "Authentication failed with Safaricom"}

    stk_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    data_to_encode = BUSINESS_SHORTCODE + PASSKEY + timestamp
    password = base64.b64encode(data_to_encode.encode()).decode('utf-8')

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": str(account_reference),
        "TransactionDesc": "Airbnb Property Booking Payment"
    }

    response = requests.post(stk_url, json=payload, headers=headers)
    return response.json()