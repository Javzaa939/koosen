# Default model import
from django.db import models

# Gis model import
# from django.contrib.gis.db import models


class TimeAuditModel(models.Model):
    """Үүсгэсэн зассан хугацаа"""

    created_at = models.DateTimeField(auto_now=True, verbose_name="Үүсгэсэн цаг")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Зассан цаг")

    class Meta:
        abstract = True
