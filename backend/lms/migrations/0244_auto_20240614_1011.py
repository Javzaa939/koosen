from django.db import migrations
from .helper.permissions import permissions
from django.apps import apps
from main.utils.function.utils import get_connection_db

class Migration(migrations.Migration):

    def fix_sequence(apps, schema_editor):

        cursor = get_connection_db().cursor()
        field = 'id'

        table_fields = ["core_permissions"
        ]

        for table in table_fields:

            print('Fixing sequence for {table}.{field}'.format(
                table=table,
                field=field,
            ))

            sql = """
                SELECT setval(
                    pg_get_serial_sequence('{table}', '{field}')::regclass,
                    (
                        SELECT max({field}) FROM public.{table}
                    )
                )
            """.format(
                table=table,
                field=field,
            )

            cursor.execute(sql)

    def insert_to_permissions(core_model, schema_editor):

        print('insert_to_permissions STARTING...')

        Permissions = apps.get_model('core', 'Permissions')

        for permission_item in permissions:

            permissions_name = permission_item['name']
            permissions_description = permission_item['description']
            is_permission = Permissions.objects.filter(name=permissions_name)
            if not is_permission:
                create_permissions = Permissions.objects.create(
                    name=permissions_name,
                    description=permissions_description
                )
            # print(permissions_name)

        print("___DONE___")

    dependencies = [
        ('lms', '0243_auto_20240613_1552'),
    ]

    operations = [
        migrations.RunPython(fix_sequence),
        migrations.RunPython(insert_to_permissions),
    ]
