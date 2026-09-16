from django.db import models
from django.conf import settings
from properties.models import Property

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('FAILED', 'Failed'),
        ('CHECKED_IN', 'Checked in'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    guests = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    mpesa_receipt = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.property.title} ({self.payment_status})"


class Conversation(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='conversation')
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='guest_conversations')
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='host_conversations')
    updated_at = models.DateTimeField(auto_now=True)


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    body = models.TextField(blank=True)
    attachment = models.FileField(upload_to='message_attachments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['created_at']


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=160)
    body = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Issue(models.Model):
    STATUS_CHOICES = [('OPEN', 'Open'), ('RESOLVED', 'Resolved')]
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='issues')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reported_issues')
    title = models.CharField(max_length=160)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    resolution = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']


class GuestReview(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='guest_review')
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_guest_reviews')
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='written_guest_reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
