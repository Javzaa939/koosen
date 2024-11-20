
from rest_framework import serializers

from lms.models import Structure
from lms.models import Teachers

from main.utils.function.utils import fix_format_date

# Их сургуулийн бүтэц зохион байгуулалт
class StructureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Structure
        fields = "__all__"


class StructureListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Structure
        fields = "__all__"
