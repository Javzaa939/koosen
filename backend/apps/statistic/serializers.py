from rest_framework import serializers

from core.models import Schools
from lms.models import Student


class SchoolsSerializer(serializers.ModelSerializer):
    ""
    unit1 = serializers.CharField(source='unit1.name', default=True)
    unit2 = serializers.CharField(source='unit2.name', default=True)
    property_type = serializers.CharField(source='property_type.name', default=True)
    educational_institution_category = serializers.CharField(source='educational_institution_category.name', default=True)

    class Meta:
        model = Schools
        fields =["name", "unit1", "unit2", "property_type", "educational_institution_category"]


# ---------------------- db3 маягт  ----------------------
class DB3Serializer(serializers.ModelSerializer):

    class Meta:
        model = Student
        fields = "__all__"
