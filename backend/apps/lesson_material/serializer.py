from rest_framework import serializers
from apps.user.serializers import UserInfoSerializer
from lms.models import LessonMaterial
from core.models import Teachers

class LessonMaterialSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(source='user.full_name')
    school_name = serializers.SerializerMethodField()

    class Meta:
        model = LessonMaterial
        fields = ["id", "user", "created_at", "school_name", "material_type", "path", "full_name"]

    def get_school_name(self, obj):
        if obj.user:
            school_name = Teachers.objects.filter(user=obj.user.id).first()
            if school_name and school_name.sub_org:
                return school_name.sub_org.name
        return None

    # def get_total_file(self, obj):
    #     if obj.user:
    #         total_file = LessonMaterial.objects.filter(user=obj.user).exclude(material_type=LessonMaterial.FILE).count()
    #         return total_file
    #     return None

