import json
import os
import traceback
from rest_framework import generics, mixins
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import permission_classes
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

from main.utils.function.serializer import dynamic_serializer
from main.utils.function.pagination import CustomPagination
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.db.models import F, Q

from lms.models import (
    Group, LessonStandart, OnlineInfo, OnlineLesson, LessonMaterial, OnlineWeek, Announcement, HomeWork , HomeWorkStudent, Challenge, Student, OnlineWeekStudent, ELearn, OnlineSubInfo, QuezQuestions, QuezChoices
)
from .serializers import (
    OnlineLessonSerializer,
    LessonMaterialSerializer,
    OnlineWeekSerializer,
    AnnouncementSerializer,
    HomeWorkSerializer,
    HomeWorkStudentSerializer,
    LectureStudentSerializer,
    StudentSerializer,
    ELearnSerializer
)

from core.models import (
    Teachers,
    User
)

from main.utils.file import split_root_path
from main.utils.function.utils import create_file_to_cdn, remove_file_from_cdn, get_file_from_cdn, str2bool

@permission_classes([IsAuthenticated])
class OnlineLessonListAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    ''' Handles listing and creating online lessons '''
    queryset = OnlineLesson.objects.all()
    serializer_class = OnlineLessonSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'lesson__code', 'teacher__first_name']


    def get(self, request, *args, **kwargs):
        school = request.GET.get('school')
        dep_id = request.GET.get('dep_id')
        teacher_id = request.GET.get('teacher_id')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if start_date:
            self.queryset = self.queryset.filter(created_at__gte=start_date)

        if end_date:
            self.queryset = self.queryset.filter(created_at__lte=end_date+' 23:59:59')

        if school:
            self.queryset = self.queryset.filter(
                Q(teacher__salbar__isnull=False,teacher__salbar__sub_orgs=school) |
                Q(teacher__salbar__isnull=True,teacher__sub_org=school)
            )

        if dep_id:
            self.queryset = self.queryset.filter(teacher__salbar=dep_id)

        if teacher_id:
            self.queryset = self.queryset.filter(teacher=teacher_id)

        datas = self.list(request).data

        return request.send_data(datas)

    def post(self, request, *args, **kwargs):
        """ Цахим хичээл бүртгэх """

        teach_qs = Teachers.objects.filter(user__email=request.user).first()
        students_data = []
        lesson_qs = None
        data = request.data
        lesson=data.get('lesson')               # хичээл id
        group = data.get('group')               # анги
        plan = data.get('plan')
        total_score = data.get('total_score')   # оноо

        if lesson:
            lesson_qs = LessonStandart.objects.get(id=lesson)

        for i in group:
            students_id = Student.objects.filter(group_id=i).values_list('id', flat=True)
            students_data.extend(list(students_id))

        with transaction.atomic():
            if OnlineLesson.objects.filter(lesson=lesson_qs, teacher=teach_qs).exists():
                return request.send_error('ERR_001', 'Тухайн хичээл үүссэн байна')

            online_qs = OnlineLesson.objects.create(
                total_score=total_score,
                create_type=OnlineLesson.WEEK,
                lesson=lesson_qs,
                teacher=teach_qs,
                plan = plan
            )
            online_qs.students.add(*list(students_data))

        return request.send_info("INF_001")


@permission_classes([IsAuthenticated])
class AnnouncementAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    ''' Handles listing, creating, and deleting announcements '''

    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get(self, request, pk=None):
        if pk:
            self.queryset = self.queryset.filter(online_lesson=pk)
        data = self.list(request).data
        return request.send_data(data)

    def post(self, request, *args, **kwargs):
        request.data['created_user'] = request.user.id
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({'message': 'INF_013'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if not pk:
            return Response({'error': 'Method PUT not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        try:
            instance = self.get_queryset().get(pk=pk)
        except Announcement.DoesNotExist:
            return Response({'error': 'Announcement not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({'message': 'INF_013'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        self.destroy(request, pk)
        return request.send_info("INF_003")


class GlobalAnnouncementAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    def post(self, request, *args, **kwargs):
        data = request.data
        group_ids = data.get('group', [])

        if isinstance(group_ids, int):
            group_ids = [group_ids]

        online_lessons = OnlineLesson.objects.filter(students__id__in=group_ids).distinct()

        title = data.get('title')
        body = data.get('body')

        announcement_qs = Announcement.objects.create(
            title=title,
            body=body,
            is_online=True,
            created_user=request.user,
        )
        announcement_qs.online_lesson.set(online_lessons)

        return request.send_info("INF_001")

@permission_classes([IsAuthenticated])
class OnlineWeekAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    '''Хичээлийн 7 хоног'''

    queryset = OnlineWeek.objects.all().order_by('week_number')
    serializer_class = OnlineWeekSerializer

    def get(self, request, pk=None):
        week = request.query_params.get('week')
        lesson = request.query_params.get('lesson')

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        if lesson:
            self.queryset = self.queryset.filter(onlinelesson=lesson)

        if week:
            week = int(week)
            self.queryset = self.queryset.filter(week_number__lt=week)

        all_data = self.list(request).data

        return request.send_data(all_data)

    def post(self, request, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                new_week = serializer.save()

                lesson_id = kwargs.get('id')

                if lesson_id:
                    instance = OnlineLesson.objects.get(id=lesson_id)
                    instance.weeks.add(new_week)

                    instance.save()

                return request.send_info('INF_001')

        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):

        try:
            if pk:
                instance = self.queryset.filter(id=pk).first()
            datas = request.data

            # NOTE хэрэггүй датануудаа update хийх гээд байна
            if 'lekts_file' in datas:
                del datas['lekts_file']

            if 'description' in datas:
                del datas['description']

            serializer = self.serializer_class(instance, data=datas, partial=True)
            if serializer.is_valid(raise_exception=False):
                serializer.save()
            else:
                return request.send_error_valid(serializer.errors)

            return request.send_info("INF_002")
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002', e.__str__())

    def delete(self, request, pk=None):
        try:
            self.destroy(request, pk)
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002', e.__str__())

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class HomeWorkAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
):
    '''Хичээлийн 7 хоног'''
    queryset = HomeWork.objects.all()
    serializer_class = HomeWorkSerializer

    def get(self, request, pk):
        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        serializer = self.list(request).data
        return Response(serializer)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        file = request.data.get('file')
        week_id = request.data.get('week_id')

        try:
            file_name = None

            if serializer.is_valid(raise_exception=False):
                if file:
                    data = create_file_to_cdn(settings.HOMEWORK, file)

                    file_name = data.get('file_name')
                new_homework = serializer.save()

                if file_name:
                    new_homework.file = file_name
                    new_homework.save()

                if week_id:
                    instance = OnlineWeek.objects.get(id=week_id)
                    instance.homework = new_homework
                    instance.save()

                return request.send_info('INF_001')
            else:
                return request.send_error_valid(serializer.errors)
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002')

    def put(self, request, pk):

        request_data = request.data.copy()
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data, partial=True)

        file = request_data.get('file')
        week_id = request_data.get('week_id')
        changeFile = request_data.get('changeFile')

        if changeFile:
            changeFile = str2bool(changeFile)

        try:
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            file_name = None

            if serializer.is_valid(raise_exception=False):
                if file and changeFile:
                    # Файлыг засах үед хуучин файлыг устгадаг болсон
                    if instance.file:
                        path = split_root_path(instance.file.path)
                        remove_file = os.path.join(settings.CDN_MAIN_FOLDER, settings.HOMEWORK, path)

                        cdn_data = get_file_from_cdn(remove_file)
                        success = cdn_data.get('success')

                        if success:
                            # Хэрвээ cdn дээр тухайн файл үүссэн байвал устгана
                            remove_file_from_cdn(remove_file)

                    data = create_file_to_cdn(settings.HOMEWORK, file)

                    file_name = data.get('file_name')

                new_homework = serializer.save()

                if file_name:
                    new_homework.file = file_name
                    new_homework.save()

                if week_id:
                    instance = OnlineWeek.objects.get(id=week_id)
                    instance.homework = new_homework
                    instance.save()

                return request.send_info('INF_001')
            else:
                return request.send_error_valid(serializer.errors)
        except Exception as e:
            print('e', e)
            return request.send_error('ERR_002')

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


@permission_classes([IsAuthenticated])
class SentHomeWorkAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Илгээсэн гэрийн даалгавар'''
    queryset = HomeWorkStudent.objects.all()
    serializer_class = HomeWorkStudentSerializer

    def get(self, request, *args, **kwargs):
        homework_id = kwargs.get('pk')
        if homework_id:
            try:
                instance = HomeWorkStudent.objects.filter(homework_id=homework_id)
                return_datas = self.get_serializer(instance, many=True).data
                return request.send_data(return_datas)
            except OnlineWeek.DoesNotExist:
                return Response({'error': 'OnlineWeek not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.list(request).data
        return request.send_data(serializer)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self,request,pk=None):
        homework_id = pk
        data=request.data
        student_id = data.get('studentId')
        score = data.get('score')
        description = data.get('description')

        with transaction.atomic():
            obj = HomeWorkStudent.objects.get(homework_id=homework_id,student_id=student_id)
            obj.score = score
            obj.description = description
            obj.status = HomeWorkStudent.CHECKED
            obj.save()

        return request.send_info("INF_002")

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


@permission_classes([IsAuthenticated])
class OnlineLessonDetailAPIView(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Handles retrieving, updating, and deleting a specific online lesson '''
    queryset = OnlineLesson.objects.all()
    serializer_class = OnlineLessonSerializer

    def get(self, request, pk=None):
        if pk:
            data = self.retrieve(request, pk).data
        else:
            data = self.list(request).data

        return request.send_data(data)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, pk=None):
        with transaction.atomic():
            online_lesson = self.queryset.get(pk=pk)
            online_lesson.weeks.clear()
            online_lesson.delete()

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class LessonMaterialDetailAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    """ Online хичээлийн API"""

    queryset = LessonMaterial.objects.all()
    serializer_class = LessonMaterialSerializer

    def get(self,request,pk=None):

        self.queryset = self.queryset.filter(user=request.user).distinct('user')
        serializer = self.list(request).data

        return request.send_data(serializer)

    @parser_classes([MultiPartParser])
    def post(self, request):
     serializer = self.get_serializer(data=request.data)

     if serializer.is_valid():
        file = request.FILES.get('path')

        # CDN server дээр файлаа хадгалах post method
        data = create_file_to_cdn(settings.ASSIGNMENT, file)
        full_path = data.get('file_name')

        serializer.validated_data['material_type'] = request.data.get('material_type')
        serializer.validated_data['path'] = full_path
        serializer.validated_data['created_at'] = timezone.now()
        self.perform_create(serializer)

        return request.send_info("INF_001")

    def delete(self, request, pk=None):

        try:
            file = get_object_or_404(LessonMaterial,id=pk)

            # Base аас path ийн авах
            file_path = str(file.path)
            path = split_root_path(file_path)
            remove_file = os.path.join(settings.CDN_MAIN_FOLDER, settings.ASSIGNMENT, path)

            cdn_data = get_file_from_cdn(remove_file)
            success = cdn_data.get('success')

            if success:
                # Хэрвээ cdn дээр тухайн файл үүссэн байвал устгана
                remove_file_from_cdn(remove_file)

            # Хэрэв тухайн файл server-ээс устсан бол True буцаан тэр үед base-аас устган
            self.destroy(request, pk)
        except Exception as e:
            print(e)
            return request.send_error('ERR_002', 'Устгах боломжгүй')

        return request.send_info("INF_003")

class OnlineLessonTestAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):
    def get(self,request,pk=None):
        online_obj = OnlineLesson.objects.get(id=pk)
        lesson_id = online_obj.lesson
        challange = Challenge.objects.filter(lesson=164).values()
        return request.send_data(list(challange))

    def post(self,request,pk=None):
        weekid = request.data
        obj = OnlineWeek.objects.get(id=weekid)
        challenge_obj = Challenge.objects.get(id=pk)
        obj.challenge = challenge_obj
        obj.save()
        return request.send_info("INF_002")

    def delete(self,request,pk=None):
        obj = OnlineWeek.objects.get(id=pk)
        if obj:
            obj.challenge = None
            obj.save()
            return request.send_info("INF_003")
        else:
            return request.send_error("ERR_003")


class LessonListAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    def get(self, request):
        user_id = request.query_params.get('teacher_id')
        teacher = Teachers.objects.filter(user=user_id).first()
        if teacher:
            department = teacher.salbar
            lessons = LessonStandart.objects.values('id', 'code', 'name')
            return request.send_data(list(lessons))
        else:
            return request.send_data([])

    def post(self, request):
        return request.send_info("INF_003")

    def delete(self, request, pk=None):
        return request.send_info("INF_003")


class getAllGroups(mixins.ListModelMixin,
    mixins.CreateModelMixin,
    generics.GenericAPIView,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
):

    def get(self, request):
        group = Group.objects.filter(is_finish=False).annotate(profession_name=F('profession__name')).values(
            'id',
            'name',
            'profession_name'
        )

        return request.send_data(list(group))


@permission_classes([IsAuthenticated])
class OnlineWeekLektsAPIView(
    generics.GenericAPIView
):
    """ 7 хоногт лекцийн материал оруулах """

    queryset = OnlineWeek.objects.all()
    def post(self, request):
        data = request.data.dict()
        cdata = {}
        cdata['description'] = data.get('description')

        is_new = data.get('is_new')
        lekts_file = data.get('lekts_file')

        if str2bool(is_new):
            cdn_data = create_file_to_cdn(settings.ASSIGNMENT, lekts_file)
            file_name = cdn_data.get('file_name')
            obj = LessonMaterial.objects.create(
                material_type = 1,
                user = User.objects.get(email=request.user),
                path = file_name,
                created_at = timezone.now()
            )
            cdata['lekts_file'] = str(obj.path.name)
        else:
            lesson_material = LessonMaterial.objects.filter(id=data.get('lekts_file')).first()
            cdata['lekts_file'] = str(lesson_material.path.name)

        with transaction.atomic():
            self.queryset.filter(pk=data.get('id')).update(
                **cdata
            )

        return request.send_info('INF_001')

    def delete(self, request, pk=None):
        with transaction.atomic():
            self.queryset.filter(pk=pk).update(
                description='',
                lekts_file=None
            )

        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class OnlineLessonPlanAPIView(
    generics.GenericAPIView
):
    """ Төлөвлөгөө устгах """

    def delete(self, request, pk=None):
        with transaction.atomic():
            OnlineLesson.objects.filter(pk=pk).update(
                plan=None
            )

        return request.send_info('INF_003')

    def put(self, request, pk=None):
        with transaction.atomic():
            OnlineLesson.objects.filter(pk=pk).update(
                plan=request.data
            )

        return request.send_info('INF_001')


@permission_classes([IsAuthenticated])
class LessonStudentsAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin
):
    queryset = OnlineLesson.objects.all()
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['students__last_name', 'students__first_name', 'students__code', 'students__register_num']


    def get(self, request, pk=None):
        group_id = request.query_params.get('group')
        lesson_id = self.request.query_params.get('lesson_id')

        online_lesson = self.queryset.filter(id=lesson_id).first()
        students = online_lesson.students.all()

        # Тухайн онлайн хичээл үзэж байгаа ангиуд
        groups = online_lesson.students.all().values_list('group', flat=True).distinct('group')
        group_data = Group.objects.filter(id__in=groups).values('id', 'name')

        if group_id:
            students = students.filter(group=group_id)

        datas = StudentSerializer(students, many=True).data

        return_datas = {
            'datas': datas,
            'groups': list(group_data)
        }

        return request.send_data(return_datas)

    def put(self, request, pk=None):
        online_lesson = self.queryset.filter(id=pk).first()
        datas = request.data
        group_ids = [data.get('id') for data in datas]
        students = Student.objects.filter(group__in=group_ids).values_list('id', flat=True)
        old_students = online_lesson.students.all().values_list('id', flat=True)

        removed_students = set(old_students) - set(students)
        added_students = set(students) - set(old_students)

        removed_students = list(removed_students)
        added_students = list(added_students)

        with transaction.atomic():
            # Хасагдагсан оюутнуудыг хасах
            for student in removed_students:
                online_lesson.students.remove(student)

            # Нэмэгдэж байгаа оюутнуудыг нэмэх
            if len(added_students) > 0:
                online_lesson.students.add(*added_students)

        return request.send_info('INF_002')

    def delete(self, request, pk=None):
        online_lesson = self.queryset.filter(id=pk).first()
        student = request.query_params.get('student')

        with transaction.atomic():
            # Хасагдагсан оюутнуудыг хасах
            online_lesson.students.remove(student)

        return request.send_info('INF_003')


@permission_classes([IsAuthenticated])
class SentLectureAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Илгээсэн лекц материал харах нэг нэгээр нь дүгнэх'''

    queryset = OnlineWeekStudent.objects.all()
    serializer_class = LectureStudentSerializer

    def get(self, request, *args, **kwargs):
        week_id = kwargs.get('pk')
        if week_id:
            try:
                instance = OnlineWeekStudent.objects.filter(week_id=week_id)
                return_datas = self.get_serializer(instance, many=True).data
                return request.send_data(return_datas)
            except OnlineWeek.DoesNotExist:
                return Response({'error': 'OnlineWeek not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.list(request).data
        return request.send_data(serializer)

    def put(self,request,pk=None):
        obj = OnlineWeekStudent.objects.get(id=pk)
        if obj:
            obj.status = OnlineWeekStudent.CHECKED
            obj.save()
            return request.send_info("INF_002")


class SummarizeLessonMaterialAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    '''Илгээсэн лекц материал дүгнэх'''

    queryset = OnlineWeekStudent.objects.all()
    serializer_class = LectureStudentSerializer


    def put(self,request,pk=None):
        user_ids = request.data
        with transaction.atomic:
            OnlineWeekStudent.objects.filter(week_id=pk,student_id__in=user_ids).update(status=OnlineWeekStudent.CHECKED)

        return request.send_info("INF_002")

class RemoteLessonAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):
    '''Зайн сургалтын api'''

    queryset = ELearn.objects.all()
    serializer_class = ELearnSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['lesson__name', 'lesson__code', 'teacher__first_name', 'title']

    def create(self, request, data):
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return serializer.instance

    def get(self,request,pk=None):
        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)
        serializer = self.list(request).data
        return request.send_data(serializer)

    def post(self, request):
        # print(request.data)

        try:
            online_info_serializer = dynamic_serializer(OnlineInfo, "__all__", 0)
            online_sub_info_serializer = dynamic_serializer(OnlineSubInfo, "__all__", 0)
            quez_questions_serializer = dynamic_serializer(QuezQuestions, "__all__", 0)
            quez_choices_serializer = dynamic_serializer(QuezChoices, "__all__", 0)

            teacher_instance = Teachers.objects.filter(user_id=request.user.id).first()

            with transaction.atomic():
                # to keep "querydict-formdata" type to save files correctly ".dict()" not used and ".copy()" used instead
                elearn_data = request.data.copy()
                del elearn_data['onlineInfo']
                elearn_instance = self.create(request, elearn_data)

                online_info_data = json.loads(request.data.dict().pop('onlineInfo'))

                online_info_data_item_instances = []

                for online_info_data_item_ind, online_info_data_item in enumerate(online_info_data):
                    online_info_data_item['elearn'] = elearn_instance.id

                    if online_info_data_item_instances:
                        online_info_data_item['related_info'] = online_info_data_item_instances[online_info_data_item_ind - 1]

                    online_sub_info_data = online_info_data_item.pop('onlineSubInfo')
                    self.queryset = OnlineInfo.objects
                    self.serializer_class = online_info_serializer
                    online_info_data_item_instance = self.create(request, online_info_data_item)
                    online_info_data_item_instances.append(online_info_data_item_instance)
                    online_sub_info_data_item_instances = []

                    for online_sub_info_data_item in online_sub_info_data:
                        online_sub_info_data_item['parent_title'] = online_info_data_item_instance.id

                        quez_questions_data = online_sub_info_data_item.pop('quezQuestions')
                        self.queryset = OnlineSubInfo.objects
                        self.serializer_class = online_sub_info_serializer
                        online_sub_info_data_item_instance = self.create(request, online_sub_info_data_item)
                        online_sub_info_data_item_instances.append(online_sub_info_data_item_instance)

                        if online_sub_info_data_item['file_type'] == OnlineSubInfo.QUIZ:
                            quez_questions_data_item_instances = []

                            for quez_questions_data_item in quez_questions_data:
                                quez_questions_data_item['created_by'] = teacher_instance.id

                                quez_choices_data = quez_questions_data_item.pop('quezChoices')
                                self.queryset = QuezQuestions.objects
                                self.serializer_class = quez_questions_serializer
                                quez_questions_data_item_instance = self.create(request, quez_questions_data_item)
                                quez_questions_data_item_instances.append(quez_questions_data_item_instance)
                                quez_choices_data_item_instances = []

                                for quez_choices_data_item in quez_choices_data:
                                    quez_choices_data_item['created_by'] = teacher_instance.id

                                    self.queryset = QuezChoices.objects
                                    self.serializer_class = quez_choices_serializer
                                    quez_choices_data_item_instance = self.create(request, quez_choices_data_item)
                                    quez_choices_data_item_instances.append(quez_choices_data_item_instance)

                                quez_choices_data_item_instances_ids = [item.id for item in quez_choices_data_item_instances]
                                quez_questions_data_item_instance.choices.set(quez_choices_data_item_instances_ids)
                            quez_questions_data_item_instances_ids = [item.id for item in quez_questions_data_item_instances]
                            online_sub_info_data_item_instance.quiz.set(quez_questions_data_item_instances_ids)
        except ValidationError as serializer_errors:
            traceback.print_exc()
            return request.send_error_valid(serializer_errors.detail)
        except Exception:
            traceback.print_exc()
            return request.send_error("ERR_002")
        return request.send_info("INF_001")
