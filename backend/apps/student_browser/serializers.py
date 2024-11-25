
import os
from rest_framework import serializers

from lms.models import Structure
from lms.models import StudentDevelop
from lms.models import Library
from lms.models import Health
from lms.models import StudentPsycholocal

from django.conf import settings
from main.utils.function.utils import get_domain_url

# Их сургуулийн бүтэц зохион байгуулалт
class StructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Structure
        fields = "__all__"


class StructureListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Structure
        fields = "__all__"

class StudentDevelopSerializer(serializers.ModelSerializer):
    " Суралцагчийн хөгжил "
    class Meta:
        model = StudentDevelop
        fields = "__all__"


class LibrarySerializer(serializers.ModelSerializer):
    " Номын сан танилуулга "
    class Meta:
        model = Library
        fields = "__all__"


class StudentPsycholocalSerializer(serializers.ModelSerializer):
    "  Сэтгэл зүйн булан "
    class Meta:
        model = StudentPsycholocal
        fields = "__all__"

class HealthSerializer(serializers.ModelSerializer):
    "  Эрүүл мэнд "
    class Meta:
        model = Health
        fields = "__all__"