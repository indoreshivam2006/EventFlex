# Generated migration for profile_picture field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('EventFlex_app', '0014_userprofile_average_rating_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='profile_picture',
            field=models.TextField(blank=True),
        ),
    ]
