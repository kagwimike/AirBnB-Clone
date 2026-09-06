from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('properties', '0003_wishlist_review_reviewimage')]
    operations = [
        migrations.AddField(model_name='property', name='house_rules', field=models.TextField(blank=True)),
        migrations.AddField(model_name='property', name='check_in_instructions', field=models.TextField(blank=True)),
    ]
