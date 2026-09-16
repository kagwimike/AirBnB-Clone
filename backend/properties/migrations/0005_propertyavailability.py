from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('properties', '0004_property_guest_stay_details')]
    operations = [
        migrations.CreateModel(
            name='PropertyAvailability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('is_available', models.BooleanField(default=True)),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='availability', to='properties.property')),
            ],
            options={'ordering': ['date']},
        ),
        migrations.AddConstraint(
            model_name='propertyavailability',
            constraint=models.UniqueConstraint(fields=('property', 'date'), name='unique_property_availability_date'),
        ),
    ]