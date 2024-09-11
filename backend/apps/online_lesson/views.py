import os
from rest_framework import generics, mixins
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import permission_classes
from rest_framework.decorators import parser_classes
from rest_framework.response import Response
from rest_framework import status

from student.serializers  import StudentSimpleListSerializer
from main.utils.function.pagination import CustomPagination
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.db.models import F

from lms.models import (
    Group, LessonStandart, OnlineLesson, LessonMaterial, OnlineWeek, Announcement, HomeWork , HomeWorkStudent, Challenge, Student
)
from .serializers import (
    OnlineLessonSerializer,
    LessonMaterialSerializer,
    OnlineWeekSerializer,
    AnnouncementSerializer,
    HomeWorkSerializer,
    HomeWorkStudentSerializer
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
    mixins.CreateModelMixin,
    generics.GenericAPIView
):
    ''' Handles listing and creating online lessons '''
    queryset = OnlineLesson.objects.all()
    serializer_class = OnlineLessonSerializer

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        user = request.user
        user_obj = User.objects.filter(email=user).first()

        school_id = user_obj.info.sub_org.id if user_obj.info.sub_org else None

        if school_id == None:
            school_id = user_obj.employee.sub_org.id if user_obj.employee.sub_org else None

        if school_id:
            queryset = self.queryset.filter(lesson__school=school_id)

        serializer = self.get_serializer(queryset, many=True)
        return request.send_data(serializer.data)

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

    def put(self, request, *args, **kwargs):
        week_id = request.query_params.get('pk')
        data = request.data

        material_id = data.get('material')
        description = data.get('description')

        try:
            lesson_material = LessonMaterial.objects.get(id=material_id)
        except LessonMaterial.DoesNotExist:
            return request.send_error("LessonMaterial not found")

        try:
            online_week = OnlineWeek.objects.get(id=week_id)
        except OnlineWeek.DoesNotExist:
            return request.send_error("OnlineWeek not found")

        # week_material = WeekMaterials.objects.create(
        #     material=lesson_material,
        #     description=description
        # )

        # online_week.materials.add(week_material)
        # online_week.save()

        return Response(status=status.HTTP_200_OK)

    def delete(self,request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


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
        week_id = kwargs.get('pk')
        if week_id:
            try:
                instance = HomeWork.objects.get(id=week_id)
                week_homework = instance.homework.all()
                return_datas = self.get_serializer(week_homework, many=True).data
                return Response(return_datas)
            except OnlineWeek.DoesNotExist:
                return Response({'error': 'OnlineWeek not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.list(request).data
        return Response(serializer)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    search_fields = ['students__last_name', 'students__first_name', 'students__code']

    def get_queryset(self):
        queryset = super().get_queryset()
        lesson_id = self.request.query_params.get('lesson_id')
        if lesson_id:
            queryset = queryset.filter(id=lesson_id)
        return queryset

    def get(self, request, *args, **kwargs):
        group_id = request.query_params.get('group')

        online_lesson = self.get_queryset().first()

        students = online_lesson.students.all()

        if group_id:
            students = students.filter(group=group_id)

        serializer = StudentSimpleListSerializer(students, many=True)
        return request.send_data(list(serializer.data))
