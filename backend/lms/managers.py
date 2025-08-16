
from django.db import models


class SystemSettingsManager(models.Manager):

    @staticmethod
    def get_filters(request):
        """ Салбар сургуулийн filter ийг авах нь """

        filters = {**request.org_filter}
        print('request.org_filter', filters)

        return filters
