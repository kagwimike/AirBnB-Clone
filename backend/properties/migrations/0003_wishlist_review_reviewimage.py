# Generated manually for the guest wishlist and review features.
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('properties', '0002_property_category'), ('bookings', '0001_initial'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(name='Wishlist', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('name', models.CharField(default='My wishlist', max_length=100)),
            ('share_token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
            ('is_shared', models.BooleanField(default=False)),
            ('created_at', models.DateTimeField(auto_now_add=True)),
            ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlists', to=settings.AUTH_USER_MODEL)),
            ('properties', models.ManyToManyField(blank=True, related_name='wishlists', to='properties.property')),
        ]),
        migrations.CreateModel(name='Review', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('rating', models.PositiveSmallIntegerField()), ('comment', models.TextField()), ('created_at', models.DateTimeField(auto_now_add=True)),
            ('booking', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='review', to='bookings.booking')),
            ('guest', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to=settings.AUTH_USER_MODEL)),
            ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='properties.property')),
        ]),
        migrations.CreateModel(name='ReviewImage', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('image', models.ImageField(upload_to='review_images/')),
            ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='properties.review')),
        ]),
    ]
