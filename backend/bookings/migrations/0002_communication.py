from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('bookings', '0001_initial'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name='Conversation', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('updated_at', models.DateTimeField(auto_now=True)),
            ('booking', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='conversation', to='bookings.booking')),
            ('guest', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='guest_conversations', to=settings.AUTH_USER_MODEL)),
            ('host', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='host_conversations', to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name='Notification', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('title', models.CharField(max_length=160)), ('body', models.TextField()), ('link', models.CharField(blank=True, max_length=255)), ('is_read', models.BooleanField(default=False)), ('created_at', models.DateTimeField(auto_now_add=True)),
            ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name='Message', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('body', models.TextField(blank=True)), ('attachment', models.FileField(blank=True, null=True, upload_to='message_attachments/')), ('created_at', models.DateTimeField(auto_now_add=True)), ('read_at', models.DateTimeField(blank=True, null=True)),
            ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='bookings.conversation')),
            ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to=settings.AUTH_USER_MODEL)),
        ]),
    ]
