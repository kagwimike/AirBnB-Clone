from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('accounts', '0001_initial')]
    operations = [
        migrations.AddField(
            model_name='user',
            name='mode',
            field=models.CharField(choices=[('TRAVELING', 'Traveling'), ('HOSTING', 'Hosting')], default='TRAVELING', max_length=10),
        ),
    ]