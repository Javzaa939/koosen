from django.db import migrations, models
import django.db.models.deletion
import lms.models


class Migration(migrations.Migration):

    dependencies = [
        ('lms', '0288_remove_studentordersport_teacher_payment_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lesson_to_teacher',
            name='lesson',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='lms.lessonstandart', verbose_name='Хичээл'),
        ),
        migrations.AlterField(
            model_name='lesson_to_teacher',
            name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.teachers', verbose_name='Багш'),
        ),
    ]
