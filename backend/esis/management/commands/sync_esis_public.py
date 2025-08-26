from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Sync esis public service"

    def handle(self, *args, **kwargs):
        from django.conf import settings

        from esis.conts import PUBLIC_INFO_KEY
        from esis.services.public import sync_public_data

        token = settings.ESIS_TOKEN
        for val in PUBLIC_INFO_KEY:
            sync_public_data(val["code"], token)
