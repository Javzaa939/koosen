import os

from rest_framework import serializers
from student.serializers import StudentSimpleListSerializer
from core.serializers import TeachersSerializer
from lms.models import OnlineLesson,Challenge, LessonMaterial, OnlineWeek , Announcement, HomeWork,  HomeWorkStudent
from core.models import Teachers
from django.db.models import Count
from rest_framework.response import Response
import requests
from django.conf import settings

from main.utils.file import split_root_path
from main.utils.function.utils import get_file_from_cdn


class OnlineLessonSerializer(serializers.ModelSerializer):
    lesson_name = serializers.SerializerMethodField()
    lesson_code = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    total_homeworks_and_exams = serializers.SerializerMethodField()
    student_data = StudentSimpleListSerializer(source='students', many=True, read_only=True)
    teacher = TeachersSerializer(read_only=True)

    class Meta:
        model = OnlineLesson
        fields = '__all__'

    def get_lesson_name(self, obj):
        return obj.lesson.name

    def get_lesson_code(self, obj):
        return obj.lesson.code

    def get_student_count(self, obj):
        return obj.students.count()

    def get_total_homeworks_and_exams(self, obj):
        homework_count = 0
        challenge_count = 0
        week_count = obj.weeks.count()
        for week in obj.weeks.all():
            if week.homework:
                homework_count += 1
            if week.challenge:
                challenge_count += 1

        return {
            'homework_count': homework_count,
            'challenge_count': challenge_count,
            'week_count': week_count
        }
class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'

class OnlineWeekSerializer(serializers.ModelSerializer):
    lekts_path = serializers.SerializerMethodField()
    class Meta:
        model = OnlineWeek
        fields = '__all__'

    def get_lekts_path(self, obj):
        full_path = ''
        path = obj.lekts_file

        if path:
            full_path = settings.ASSIGNMENT + str(path)
            cdn_data = {}
            try:
                cdn_data = get_file_from_cdn(full_path)
            except Exception as e:
                print(e)

            if cdn_data.get('success'):
                full_path = settings.CDN_FILE_URL + full_path

        return full_path

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
        request = self.context.get('request')
        material_type = request.query_params.get('type')
        cdn_connection_alive = True

        if material_type:
            queryset = LessonMaterial.objects.filter(user=obj.user, material_type=material_type).values('id', 'path', 'created_at')
            files_info = []
            for item in queryset:
                file_path = item['path']
                full_path = settings.ASSIGNMENT + str(file_path)
                cdn_data = {}

                if cdn_connection_alive:
                    try:
                        cdn_data = get_file_from_cdn(full_path)
                    except Exception as e:
                        print(e)
                        cdn_connection_alive = False

                if cdn_data.get('success'):
                    file_path = settings.CDN_FILE_URL + full_path

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
                else:
                    files_info.append({
                        'id': item['id'],
                        'path': file_path,
                        'created_at': item['created_at'],
                        'size': None
                    })

            return {
                'material_type': material_type,
                'count': len(files_info),
                'files': files_info
            }
        else:
            for material_type in range(1, 5):
                queryset = LessonMaterial.objects.filter(user=obj.user, material_type=material_type).values('id', 'path', 'created_at')

                files_info = []
                for item in queryset:
                    file_path = item['path']
                    full_path = settings.ASSIGNMENT + str(file_path)
                    cdn_data = {}

                    if cdn_connection_alive:
                        try:
                            cdn_data = get_file_from_cdn(full_path)
                        except Exception as e:
                            print(e)
                            cdn_connection_alive = False

                    if cdn_data.get('success'):
                        success_data = cdn_data.get('data')

                        file_path = success_data.get('full_path')

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
                    else:
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


class AnnouncementSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = '__all__'

    def get_full_name(self, obj):
        if obj.created_user.full_name:
            return obj.created_user.full_name
        return None


class HomeWorkSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = HomeWork
        fields = '__all__'

    def get_file(self, obj):
        full_path = None

        if obj.file:
            path = split_root_path(obj.file.path)
            path = os.path.join(settings.HOMEWORK, path)

            cdn_data = get_file_from_cdn(path)

            if cdn_data.get('success'):
                full_path = settings.CDN_FILE_URL + path


        return full_path


class HomeWorkStudentSerializer(serializers.ModelSerializer):
    homework = HomeWorkSerializer()
    send_file = serializers.SerializerMethodField()

    class Meta:
        model = HomeWorkStudent
        fields = ['id','homework','status', 'score', 'score_comment', 'send_file', 'description']

    def get_send_file(self,obj):
        return settings.CDN_FILE_URL+str(obj.send_file)