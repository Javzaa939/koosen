from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('lms', '0313_soulsurvey_surveyquestiontitle_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
