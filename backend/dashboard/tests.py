from datetime import date, timedelta

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from bookings.models import Booking
from properties.models import Property


class DashboardApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.guest = User.objects.create_user(email='guest@example.com', password='password123', role='GUEST')
        self.host = User.objects.create_user(email='host@example.com', password='password123', role='HOST', mode='HOSTING')
        self.property = Property.objects.create(
            host=self.host,
            title='Test stay',
            description='A test stay',
            location='Nairobi',
            price_per_night=100,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_guest_bookings_are_paginated_and_scoped(self):
        Booking.objects.create(
            user=self.guest,
            property=self.property,
            check_in_date=date.today() + timedelta(days=2),
            check_out_date=date.today() + timedelta(days=4),
            guests=1,
            total_price=200,
            payment_status='CONFIRMED',
        )
        self.authenticate(self.guest)
        response = self.client.get('/api/dashboard/guest/bookings/?status=upcoming')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['property']['title'], 'Test stay')

    def test_guest_detail_cannot_access_another_guests_booking(self):
        booking = Booking.objects.create(
            user=self.host,
            property=self.property,
            check_in_date=date.today(),
            check_out_date=date.today() + timedelta(days=1),
            guests=1,
            total_price=100,
        )
        self.authenticate(self.guest)
        response = self.client.get(f'/api/bookings/{booking.id}/detail/')
        self.assertEqual(response.status_code, 404)

    def test_host_listings_are_role_gated(self):
        self.authenticate(self.guest)
        response = self.client.get('/api/dashboard/host/listings/')
        self.assertEqual(response.status_code, 403)

        self.authenticate(self.host)
        response = self.client.get('/api/dashboard/host/listings/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'][0]['status'], 'published')

    def test_host_can_check_in_and_complete_booking(self):
        booking = Booking.objects.create(
            user=self.guest,
            property=self.property,
            check_in_date=date.today(),
            check_out_date=date.today() + timedelta(days=1),
            guests=1,
            total_price=100,
            payment_status='CONFIRMED',
        )
        self.authenticate(self.host)
        response = self.client.post(f'/api/bookings/{booking.id}/host-transition/', {'action': 'check_in'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['payment_status'], 'CHECKED_IN')
        response = self.client.post(f'/api/bookings/{booking.id}/host-transition/', {'action': 'checkout'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['payment_status'], 'COMPLETED')

    def test_guest_can_report_and_host_can_resolve_issue(self):
        booking = Booking.objects.create(
            user=self.guest,
            property=self.property,
            check_in_date=date.today(),
            check_out_date=date.today() + timedelta(days=1),
            guests=1,
            total_price=100,
            payment_status='CHECKED_IN',
        )
        self.authenticate(self.guest)
        response = self.client.post('/api/bookings/issues/', {'booking': booking.id, 'title': 'No towels', 'description': 'There are no towels in the room.'}, format='json')
        self.assertEqual(response.status_code, 201)
        issue_id = response.data['id']
        self.authenticate(self.host)
        response = self.client.post(f'/api/bookings/issues/{issue_id}/resolve/', {'resolution': 'Delivered towels.'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'RESOLVED')
