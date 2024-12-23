
import os
from rest_framework import serializers

from lms.models import Structure
from lms.models import StudentDevelop
from lms.models import Library
from lms.models import Health, StudentRules
from lms.models import StudentPsycholocal
from lms.models import StudentTime
from lms.models import PsycholocalHelp

class StructureSerializer(serializers.ModelSerializer):
    " Их сургуулийн бүтэц зохион байгуулалт"
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


class StudentRulesSerializer(serializers.ModelSerializer):
    "  Номын сангийн журам "
    class Meta:
        model = StudentRules
        fields = "__all__"


class StudentTimeSerializer(serializers.ModelSerializer):
    "  Номын сангийн цагийн хуваарь"
    class Meta:
        model = StudentTime
        fields = "__all__"
    

class PsycholocalHelpSerializer(serializers.ModelSerializer):
    " Сэтгэл зүйн зөвлөмж "
    class Meta:
        model = PsycholocalHelp
        fields = "__all__"