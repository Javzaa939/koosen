from rest_framework import serializers
from lms.models import OnlineLesson, LessonMaterial
from core.models import Teachers
from django.db.models import Count
from rest_framework.response import Response
import requests

class OnlineLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineLesson
        fields = '__all__'

class LessonMaterialSerializer(serializers.ModelSerializer):
    school_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    salbar = serializers.SerializerMethodField()

    class Meta:
        model = LessonMaterial
        fields = ["id","user","school_name","salbar","full_name","file"]

    def get_school_name(self, obj):
        if obj.user:
            school_name = Teachers.objects.filter(user=obj.user.id).first()
            if school_name and school_name.sub_org:
                return school_name.sub_org.name
        return None

    def get_salbar(self,obj):
        if obj.user:
            salbar = Teachers.objects.filter(user=obj.user.id).first()
            if salbar and salbar.salbar:
                return salbar.salbar.name
        return None

    def get_full_name(self, obj):
        if obj.user.full_name:
            return obj.user.full_name
        return None

    def get_file(self, obj):
        data = []
        for material_type in range(1, 5):
            queryset = LessonMaterial.objects.filter(user=obj.user, material_type=material_type).values('id', 'path', 'created_at')

            files_info = []
            for item in queryset:
                file_path = item['path']
                try:

                    # File-ийн хэмжээ авах requests
                    response = requests.head(file_path)
                    if response.status_code == 200:
                        file_size = response.headers.get('content-length')

                        item_data = {
                            'id': item['id'],
                            'path': file_path,
                            'created_at': item['created_at'],
                            'size': file_size
                        }
                        files_info.append(item_data)
                    else:

                        files_info.append({
                            'id': item['id'],
                            'path': file_path,
                            'created_at': item['created_at'],
                            'size': None
                        })
                except requests.exceptions.RequestException as e:
                    # Handle request exception
                    files_info.append({
                        'id': item['id'],
                        'path': file_path,
                        'created_at': item['created_at'],
                        'size': None
                    })
            data.append({
                'material_type': material_type,
                'count': len(files_info),
                'files': files_info
            })

        return data


class LessonMaterialPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonMaterial
        fields = '__all__'