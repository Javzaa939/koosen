from rest_framework import serializers
from lms.models import OnlineLesson, LessonMaterial
from core.models import Teachers
from django.db.models import Count

class OnlineLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineLesson
        fields = '__all__'

class LessonMaterialSerializer(serializers.ModelSerializer):
    school_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = LessonMaterial
        fields = ["user", "created_at", "school_name", "material_type", "path", "full_name", "file_count"]

    def get_school_name(self, obj):
        if obj.user:
            school_name = Teachers.objects.filter(user=obj.user.id).first()
            if school_name and school_name.sub_org:
                return school_name.sub_org.name
        return None

    def get_full_name(self, obj):
        if obj.user:
            return obj.user.full_name
        return None

    def get_file_count(self, obj):
        if obj.user:
            counts = LessonMaterial.objects.filter(user=obj.user).count()
            # count_dict = {count['material_type']: count['count'] for count in counts}

            # return {
            #     'File': count_dict.get(1, 0),
            #     'Picture': count_dict.get(2, 0),
            #     'Video': count_dict.get(3, 0),
            #     'Audio': count_dict.get(4, 0),
            # }
            return counts
        return None