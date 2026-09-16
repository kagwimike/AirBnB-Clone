from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('bookings', '0002_communication'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.AlterField(
            model_name='booking', name='payment_status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('CONFIRMED', 'Confirmed'), ('CANCELLED', 'Cancelled'), ('FAILED', 'Failed'), ('CHECKED_IN', 'Checked in'), ('COMPLETED', 'Completed')], default='PENDING', max_length=20),
        ),
        migrations.CreateModel(
            name='Issue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=160)), ('description', models.TextField()), ('status', models.CharField(choices=[('OPEN', 'Open'), ('RESOLVED', 'Resolved')], default='OPEN', max_length=10)), ('resolution', models.TextField(blank=True)), ('created_at', models.DateTimeField(auto_now_add=True)), ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='issues', to='bookings.booking')),
                ('reporter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reported_issues', to=settings.AUTH_USER_MODEL)),
            ], options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='GuestReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField()), ('comment', models.TextField()), ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='guest_review', to='bookings.booking')),
                ('guest', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='written_guest_reviews', to=settings.AUTH_USER_MODEL)),
                ('host', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_guest_reviews', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]