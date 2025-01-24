
import datetime
import os

from rest_framework import mixins
from rest_framework import generics

from django.db import transaction
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import PositiveIntegerField
from django.db.models.functions import Cast
from django.contrib.auth.hashers import make_password

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.utils import has_permission
from main.utils.function.utils import get_menu_unit

from rest_framework.filters import SearchFilter

from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import remove_key_from_dict, json_load, json_dumps, override_get_queryset, str2bool, null_to_none
from main.utils.file import remove_folder
import json

from lms.models import Complaint_Answer
from lms.models import Complaint_unit
from lms.models import Complaint
from lms.models import StudentRequestTutor
from lms.models import StudentCorrespondLessons
from lms.models import LessonStandart
from lms.models import Correspond_Answer
from lms.models import StudentRequestVolunteer
from lms.models import Student
from lms.models import Club
from lms.models import ClubFile
from lms.models import StudentRequestClub
from lms.models import ScoreRegister
from lms.models import StudentLogin
from lms.models import Group
from lms.models import StudentRegister
from lms.models import StudentLeaveRequest
from lms.models import LeaveRequest_Answer

from core.models import OrgPosition

from lms.models import StudentRoutingSlip
from lms.models import RoutingSlip_Answer, Payment

from .serializers import ComplaintUnitSerializer
from .serializers import ComplaintUnitListSerializer
from .serializers import ComplaintListSerializer
from .serializers import ComplaintAnswerSerializer
from .serializers import StudentCorrespondScore
from .serializers import CorrespondListSerializer
from .serializers import CorrespondLessonSerializer
from .serializers import CorrespondSerializer
from .serializers import Correspond_AnswerSerializer
from .serializers import RequestAnswerVolunteerSerializer
from .serializers import ClubSerializer
from .serializers import ClubListSerializer
from .serializers import StudentRequestClubSerializer
from .serializers import ClubSettingsListSerializer
from .serializers import LeaveRequestAnswerSerializer
from .serializers import LeaveRequestListSerializer
from .serializers import RequestAnswerVolunteerPutSerializer
from .serializers import LeaveRequestPrintSerializer
from .serializers import RoutingSerializer
from .serializers import RoutingSlip_AnswerSerializer
from .serializers import ComplaintRequestPrintSerializer
from .serializers import CorrespondPrintListSerializer
from .serializers import RequestAnswerTutorSerializer
from .serializers import RequestAnswerTutorPutSerializer


@permission_classes([IsAuthenticated])
class ComplaintUnitListAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Хүсэлт шийдвэрлэх нэгж '''

    queryset = Complaint_unit.objects.all().order_by('-created_at')
    serializer_class = ComplaintUnitSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['position__name']

    @has_permission(must_permissions=['lms-decide-unit-read'])
    def get(self, request, pk=None):

        unit = request.query_params.get('unit')

        if unit:
            self.queryset = self.queryset.filter(unit=unit)

        self.serializer_class = ComplaintUnitListSerializer

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request, context={ "request": request }).data

        return request.send_data(return_datas)

    @has_permission(must_permissions=['lms-decide-unit-create'])
    def post(self, request):
        error_obj = []
        request_data = request.data

        positions = request_data.get('position')
        menus = json_dumps(request_data.get('menus'))
        unit_id = request_data.get('unit')

        check_unit_qs = self.queryset.filter(unit=unit_id)
        if check_unit_qs:
            return_error = {
                "field": 'unit',
                "msg": 'Бүртгэгдсэн байна'
            }

            error_obj.append(return_error)
            return request.send_error("ERR_002", error_obj)

        request_data = remove_key_from_dict(request_data, ['position', 'menus'])
        request_data['menus'] = menus

        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    obj = self.create(request).data
                    id = obj.get('id')

                    qs = Complaint_unit.objects.filter(id=id).first()

                    if qs:
                        for position in positions:
                            position_id = position.get('id')

                            position = OrgPosition.objects.get(id=position_id)

                            qs.position.add(position)

                except Exception as e:
                    print(e.__str__())
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            return request.send_error("ERR_003", error_obj)

    @has_permission(must_permissions=['lms-decide-unit-update'])
    def put(self, request, pk=None):

        error_obj = []
        data = request.data
        instance = self.queryset.filter(id=pk).first()
        positions = data.get('position')
        new_unit_id = data.get('unit')
        old_unit_id = instance.unit

        menus = json_dumps(data.get('menus'))

        # Нэгжийг зассан үед бүртгэгдсэн эсэхийг шалгана
        if int(new_unit_id) != old_unit_id:
            check_unit_qs = self.queryset.filter(unit=new_unit_id)
            if check_unit_qs:
                return_error = {
                    "field": 'unit',
                    "msg": 'Бүртгэгдсэн байна'
                }

                error_obj.append(return_error)
                return request.send_error("ERR_002", error_obj)

        data = remove_key_from_dict(data, ['position', 'menus'])

        data['menus'] = menus

        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=True):
            self.perform_update(serializer)

            if instance:
                instance.position.clear()
                for position in positions:
                    position_id = position.get('id')

                    position = OrgPosition.objects.get(id=position_id)

                    instance.position.add(position)

        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")


class ComplaintAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
):
    """ Өргөдөлийн хүсэлт шийдвэрлэх
    """

    queryset = Complaint.objects.all().order_by('is_solved')
    serializer_class = ComplaintListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['body','student__first_name', 'student__code']

    def get(self, request, pk=None):

        solved = request.query_params.get('solved')
        complaint_type_id = request.query_params.get('complaint_type_id')
        school = request.query_params.get('school')

        if school:
            self.queryset = self.queryset.filter(student__school=school)

        if pk:
            self.serializer_class = ComplaintRequestPrintSerializer
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        # Шийдвэрийн төрөл-өөр хайх
        if solved:
            self.queryset = self.queryset.filter(is_solved=solved)

        # Өргөдлийн төрлөөр хайх
        if complaint_type_id:
            self.queryset = self.queryset.filter(complaint_type=complaint_type_id)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


class ComplaintAnswerAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
):
    """ Өргөдөлд хариулах
    """

    queryset = Complaint_Answer.objects
    serializer_class = ComplaintAnswerSerializer

    def post(self, request):

        data = request.data
        error_obj = []

        menu_id = request.query_params.get('menu')

        c_menu_list = get_menu_unit(menu_id)

        data['date'] = datetime.datetime.now().date()

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    obj = self.create(request).data
                    complaint = obj.get('request')

                    if obj.get('is_confirm'):
                        complaint_answer_count = Complaint_Answer.objects.filter(request=complaint).count()
                        if complaint_answer_count == c_menu_list.__len__():
                            complaint = Complaint.objects.get(id=complaint)
                            complaint.is_solved = StudentRequestTutor.ALLOW
                            complaint.save()

                    else:
                        complaint = Complaint.objects.get(id=complaint)
                        complaint.is_solved = StudentRequestTutor.REJECT
                        complaint.save()

                except Exception as e:
                    print(e.__str__())
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            return request.send_error("ERR_003", error_obj)


@permission_classes([IsAuthenticated])
class CorrespondAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """ Дүнгийн дүйцүүлэлт хийлгэх хүсэлт """

    queryset = StudentCorrespondScore.objects.all().order_by('-created_at')
    serializer_class = CorrespondSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register_num', 'profession__name']

    def get(self, request, pk=None):
        self.serializer_class = CorrespondListSerializer

        solved = request.query_params.get('solved')

        if solved:
            self.queryset = self.queryset.filter(correspond_type=solved)

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):

        errors = []
        request_data = request.data
        student = request_data.get('student')

        # өөр сургуулиас орж ирж байгаа оюутан бол
        if student is None:
            request_data = remove_key_from_dict(request_data, 'student')


        file = request.data.get('file')

        if file:
            request_data = request.data.dict()

        c_lessons=  json_load(request_data.get('lessons'))

        request_data = remove_key_from_dict(request_data, ['lessons', 'degree'])

        request_data = null_to_none(request_data)

        serializer = self.serializer_class(data=request_data)

        if serializer.is_valid(raise_exception=True):
             with transaction.atomic():
                try:
                    cdata = self.create(request).data
                    c_id = cdata.get('id')

                    c_obj = get_object_or_404(StudentCorrespondScore, id=c_id)

                    for c_lesson in c_lessons:
                        # улирлын list болгов
                        seasons = json.loads(c_lesson.get('season'))

                        if isinstance(seasons, int):
                            c_lesson['season'] = seasons if seasons else 1
                        if isinstance(seasons, list):
                            c_lesson['season'] = seasons[0] if seasons[0] else 1

                        c_lesson['correspond_id'] = c_obj.id

                        if 'id' in c_lesson:
                            del c_lesson['id']

                        StudentCorrespondLessons.objects.update_or_create(
                            correspond = c_obj,
                            correspond_lesson = c_lesson.get('correspond_lesson'),
                            defaults={
                                **c_lesson
                            }
                        )
                except Exception as e:
                    print(e)
                    return request.send_error('ERR_002')
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info('INF_001')


    def put(self, request, pk=None):

        errors = []
        new_lesson_ids = []

        instance = self.queryset.filter(id=pk).first()

        request_data = request.data

        file = request_data.get('file')

        if file:
            request_data = request_data.dict()
            request_data = null_to_none(request_data)

        c_lessons = json_load(request_data.get('lessons'))

        file_name = request_data.get('file_name')

        old_c_type = instance.correspond_type
        new_c_type = request_data.get('correspond_type')

        request_data = remove_key_from_dict(request_data, ['lessons', 'degree', 'file_name', 'student'])

        # Хуучин файл хадгалсан эсэх
        old_file = instance.file
        if old_file:
            old_file_path = old_file.path

            old_file_name = os.path.basename(old_file_path)
            if file_name != old_file_name:
                remove_path = os.path.join(settings.CORRESPOND, str(pk), old_file_name)
                remove_folder(remove_path)
            else:
                request_data = remove_key_from_dict(request_data, 'file')

        if old_c_type != new_c_type:

            if 'student_group' in request_data:
                del request_data['student_group']

            if 'student_code' in request_data:
                del request_data['student_code']

        serializer = self.serializer_class(instance=instance, data=request_data)

        if serializer.is_valid(raise_exception=True):
             with transaction.atomic():
                try:
                    sid = transaction.savepoint()

                    # Хуучин дүйцүүлэлтийн төрөл солигдсон үед
                    if old_c_type != new_c_type:
                        instance.student_group = None
                        instance.student_code = None
                        instance.save()

                    self.perform_update(serializer)

                    # Хуучин дүйцүүлэлт хийсэн хичээлийн ids
                    old_lessons_ids = StudentCorrespondLessons.objects.filter(correspond_id=pk).values_list('id', flat=True)

                    for c_lesson in c_lessons:
                        c_lesson_id = c_lesson.get('id')
                        new_lesson_ids.append(c_lesson_id)
                        c_lesson_lesson = c_lesson.get('correspond_lesson_id')

                        lesson = get_object_or_404(LessonStandart, id=c_lesson_lesson)

                        c_lesson['correspond'] = instance
                        c_lesson['correspond_lesson'] = lesson

                        obj, created = StudentCorrespondLessons.objects.filter(correspond_id=pk).update_or_create(
                            correspond_lesson = lesson,
                            defaults={
                                **c_lesson
                            }
                        )

                        if c_lesson_id == None:
                            new_lesson_ids.append(obj.id)

                    # Дүйцүүлэлт хийсэн хичээлийн устгасан үед
                    for old_lesson_id in old_lessons_ids:
                        if not (old_lesson_id in  new_lesson_ids):
                            qs_lesson = StudentCorrespondLessons.objects.filter(id=old_lesson_id)

                            if qs_lesson:
                                qs_lesson.delete()

                except Exception as e:
                    print(e)
                    transaction.savepoint_rollback(sid)
                    return request.send_error('ERR_002')
        else:
            for key in serializer.errors:
                    msg = "Хоосон байна"

                    return_error = {
                        "field": key,
                        "msg": msg
                    }

                    errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info("INF_002")


    def delete(self, request, pk=None):

        self.destroy(request, pk)

        return request.send_info("INF_003")


class CorrespondPrintAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """ Дүнгийн дүйцүүлэлт print хэсгийн утга
    """

    queryset = StudentCorrespondScore.objects.all().order_by('-created_at')
    serializer_class = CorrespondPrintListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'register_num', 'profession__name']

    def get(self, request, pk=None):

        if pk:
            datas = self.retrieve(request, pk).data
            return request.send_data(datas)

        all_list = self.list(request).data

        return request.send_data(all_list)


class CorrespondLessonAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Дүйцүүлэх хүсэлтийн дүйцүүлэх хичээлүүдийн жагсаалт """

    queryset = StudentCorrespondLessons.objects.all().annotate(my_season=Cast('season', PositiveIntegerField())).order_by('my_season')
    serializer_class = CorrespondLessonSerializer

    def get(self, request, pk=None):
        self.queryset = self.queryset.filter(correspond_id=pk)

        all_list = self.queryset.values()

        return request.send_data(list(all_list))


class CorrespondAnswerAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin
):

    queryset = Correspond_Answer.objects.all()
    serializer_class = Correspond_AnswerSerializer

    def get(self, request, correspond=None):
        self.queryset = self.queryset.filter(request=correspond)
        c_list = self.list(request).data

        return request.send_data(c_list)

    def post(self, request):

        errors = []
        request_data = request.data
        allow_lesson_ids = request_data.get('c_lesson_ids')

        menu_id = request.query_params.get('menu')
        print("menu_id", menu_id)
        c_menu_list = get_menu_unit(menu_id)

        for i , menu in enumerate(c_menu_list):
            if menu.get('id') == Complaint_unit.BMA:
                del c_menu_list[i]

        request_data = remove_key_from_dict(request_data, ['c_lesson_ids'])

        serializer = self.serializer_class(data=request_data)

        if serializer.is_valid(raise_exception=True):
             with transaction.atomic():
                try:
                    data = self.perform_create(serializer)
                    correspond = data.get('id')

                    if request_data.get('is_confirm'):
                        correspond_answer_count = Correspond_Answer.objects.filter(request=correspond).count()

                        if correspond_answer_count == len(c_menu_list):
                            correspond = StudentCorrespondScore.objects.get(id=correspond)
                            correspond.is_solved = StudentRequestTutor.ALLOW
                            correspond.save()

                    StudentCorrespondLessons.objects.filter(id__in=allow_lesson_ids).update(is_allow=True)
                except Exception as e:
                    print(e)
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            if len(errors) > 0:
                return request.send_error("ERR_003", errors)

        return request.send_info("INF_002")

@permission_classes([IsAuthenticated])
class RequestAnswerVolunteerAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView,
):

    queryset = StudentRequestVolunteer.objects.all().order_by('-created_at')
    serializer_class = RequestAnswerVolunteerSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]

    search_fields = [
        'action__organiser',
        'action__title',
        'action__start',
        'action__end',
        'description',
        # 'student__code',
        # 'student__full_name',

    ]

    def get_queryset(self):
        queryset = self.queryset

        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')

        # Сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school=schoolId)
        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset
    @has_permission(must_permissions=['lms-wish-volunteer-read'])
    def get(self, request, pk=None):
        " оюутны хүсэлтийн шийдвэрийн жагсаалт"

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        self.queryset = self.queryset.filter(lesson_season=lesson_season, lesson_year=lesson_year)

        if pk:
            answer_info = self.retrieve(request).data

            return request.send_data(answer_info)

        req_list = self.list(request).data

        return request.send_data(req_list)

    @has_permission(must_permissions=['lms-wish-volunteer-update'])
    def put(self, request, pk=None):
        """ олон нийтийн ажилд оюутны оролцох хүсэлт шийдвэрлэх засах
            return seraializer.data
        """
        self.serializer_class = RequestAnswerVolunteerPutSerializer
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        self.queryset = self.queryset.filter(lesson_season=lesson_season, lesson_year=lesson_year)
        errors = []
        datas = request.data
        data = null_to_none(datas)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            self.update(serializer, pk).data
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            return request.send_error("ERR_002", errors)
        return request.send_info("INF_015")

@permission_classes([IsAuthenticated])
class ClubListAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Клубын бүртгэл '''

    queryset = Club.objects.all().order_by('-updated_at')
    serializer_class = ClubSerializer

    pagination_class = CustomPagination

    def get_queryset(self):
        return override_get_queryset(self)

    def get(self, request, pk=None):
        self.serializer_class = ClubListSerializer

        type_id = self.request.query_params.get('type_id')

        if type_id:
            self.queryset = self.queryset.filter(type=type_id)

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):
        error_obj = []
        request_data = request.data

        files = request.FILES.getlist('files')
        descriptions = request.POST.getlist('descriptions')

        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    obj = self.create(request).data

                    club_id = obj.get('id')

                    if club_id and descriptions:
                        for idx, description in enumerate(descriptions):
                            obj = ClubFile.objects.create(
                                club=Club.objects.get(id=club_id),
                                description=description,
                                file=files[idx],
                            )

                except Exception as e:
                    print(e.__str__())
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

            error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_info("INF_001")

    def put(self, request, pk=None):

        error_obj = []
        data = request.data.dict()
        data = null_to_none(data)
        files = request.FILES.getlist('files')
        descriptions = request.POST.getlist('descriptions')
        file_change = request.POST.getlist('file_change')
        student_file_ids = request.POST.getlist('file_id')
        delete_file_ids = request.POST.getlist('delete_ids')

        instance = self.queryset.filter(id=pk).first()

        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=False):
            qs = None
            is_success = False
            with transaction.atomic():
                try:
                    self.perform_update(serializer)

                    if delete_file_ids:
                        for delete_id in delete_file_ids:
                            if delete_id:
                                # NOTE: Фолдерыг устгана
                                remove_file = os.path.join(settings.STIPEND, str(delete_id))
                                if remove_file:
                                    remove_folder(remove_file)

                                # Файлыг баазаас устгана
                                qs = ClubFile.objects.filter(id=delete_id)
                                if qs:
                                    qs.delete()

                    if file_change:
                        # NOTE: хавсаргасан файл засах үед
                        for idx, value in enumerate(file_change):
                            change_file = str2bool(value) # Файлыг зассан бол True
                            edit_file_id = student_file_ids[idx]
                            description = descriptions[idx]

                            if edit_file_id:
                                qs = ClubFile.objects.filter(id=edit_file_id)

                            if change_file:
                                file = files[idx]

                                if edit_file_id:
                                    # NOTE: Файл засаж байгаа үед хуучин файлыг устгана
                                    remove_file = os.path.join(settings.CLUB, str(edit_file_id))
                                    if remove_file:
                                        remove_folder(remove_file)

                                    qs.update_or_create(
                                        id=edit_file_id,
                                        defaults={
                                            "description": description,
                                            "file": file,
                                        }
                                    )
                                # Файл нэмж оруулсан үед шинээр файлыг үүсгэнэ
                                else:
                                    ClubFile.objects.create(
                                        club=Club.objects.get(id=pk),
                                        description=description,
                                        file=file,
                                    )

                            elif qs:
                                # NOTE: Файл засаагүй тайлбар зассан үед зөвхөн тайлбарыг update хийнэ
                                qs.update_or_create(
                                    id=edit_file_id,
                                    defaults={
                                        "description": description,
                                    }
                                )

                    else:
                        # NOTE: огт файл байхгүй байсан үед шинээр үүсгэнэ
                        if descriptions:
                            for idx, description in enumerate(descriptions):
                                ClubFile.objects.create(
                                    club=Club.objects.get(id=pk),
                                    description=description,
                                    file=file,
                                )

                    is_success = True

                except Exception as e:
                    print(e.__str__())
                    return request.send_error("ERR_002")

            if is_success:
                return request.send_info("INF_002")

            return request.send_error("ERR_002")
        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

            error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

        return request.send_info("INF_002")


@permission_classes([IsAuthenticated])
class ClubSettingsListAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    ''' Клубын жагсаалт  '''

    queryset = Club.objects.all()
    serializer_class = ClubSettingsListSerializer

    def get(self, request):

        return_datas = self.list(request).data

        return request.send_data(return_datas)


@permission_classes([IsAuthenticated])
class StudentRequestClubAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView,
):
    ''' Клубт бүртгүүлсэн оюутны жагсаалт '''

    queryset = StudentRequestClub.objects.all()
    serializer_class = StudentRequestClubSerializer

    filter_backends = [SearchFilter]
    pagination_class = CustomPagination

    search_fields = [
        'answer',
        'club__type',
        'club__name',
        'description',
        'student__code',
        'student__first_name',
    ]

    def get_queryset(self):
        queryset = self.queryset

        sorting = self.request.query_params.get('sorting')
        club_id = self.request.query_params.get('club')

        if club_id:
            queryset = queryset.filter(club=club_id)

        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    def get(self, request, pk=None):

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    def put(self, request, pk=None):
        request_data = request.data

        answer = request_data.get('answer')
        request_flag = request_data.get('request_flag')

        instance = self.queryset.filter(id=pk)

        if instance:
            is_success = False
            with transaction.atomic():
                try:
                    instance.update(
                        request_flag=request_flag,
                        answer=answer,
                    )
                    is_success = True
                except Exception:
                    raise

            if is_success:
                return request.send_info("INF_002")

        return request.send_error("ERR_002")


class CorrespondApprove(
    generics.GenericAPIView,
):
    """ Дүнгийн дүйцүүлэлтийн хүсэлт сүүлийн байдлаар батлах хэсэг """

    @transaction.atomic
    def post(self, request, pk):

        request_data = request.data
        print("request_data", request_data)
        group = request_data.get('group')
        code = request_data.get('code')
        print("group", group)
        print("code", code)
        correspond = get_object_or_404(StudentCorrespondScore, id=pk)
        group_obj = get_object_or_404(Group, pk=group)
        payment = {}
        school = group_obj.school

        try:
            # Тухайн оюутанд хуучин анги код шинээр бүртгэж байгаа хэсэг
            if group and code:
                correspond.student_code = code
                correspond.student_group = group_obj
                correspond.save()
            else:
                # TODO errors буцаана
                return request.send_error('ERR_002', )
            print("pk", pk)
            main_datas = StudentCorrespondScore.objects.filter(id=pk).values('first_name', 'last_name', 'register_num', 'phone', 'student_group', 'student_code')

            # Оюутан суралцаж буй төлөвт шилжүүлэх
            # qs_register_status = StudentRegister.objects.filter(name__iexact='Суралцаж буй').last()
            qs_register_status = StudentRegister.objects.filter(name__iexact='Шилжсэн').last()

            for data in main_datas:
                c_code = data.get('student_code')
                c_group = data.get('student_group')
                c_group_obj = get_object_or_404(Group, pk=c_group)

                data['group'] = c_group_obj
                data['code'] = c_code
                data['status'] = qs_register_status
                data['school'] = school

                data = remove_key_from_dict(data, ['student_group', 'student_code'])

            # Оюутны мэдээллийг шинэчлэх болон үүсгэх хэсэг хуучин оюутан байвал ангийг нь сольж байгаа
            if not Student.objects.filter(code=c_code):

                obj, new = Student.objects.create(
                    code=code,
                    defaults={
                        **main_datas[0]
                    }
                )
            else:
                obj, old = Student.objects.filter(code=code).update(
                    **main_datas[0]
                )

            # төлбөр
            payment = Payment.objects.filter(student=obj).first()
            if payment:
                payment.student=obj
                payment.save()


            # Оюутан үүсгээд дүйцүүлэлтийн хэсэгт оюутанг үүсгээд хадгалах
            correspond.student = obj
            correspond.save()

            # Оюутны нэвтрэх хэсгийн мэдээллийг хадгалах
            default_pass = '0123456789'
            StudentLogin.objects.update_or_create(
                student = obj,
                defaults={
                    'username': code,
                    'password': make_password(default_pass)
                }
            )

            # Дүйцүүлсэн хичээл бүрээр дүнгийн мэдээлэл оруулах
            c_lessons = StudentCorrespondLessons.objects.filter(correspond=correspond, is_allow=True).values('correspond_lesson', 'score')
            for clesson in c_lessons:
                lesson = clesson.get('correspond_lesson')
                score = clesson.get('score')

                create_datas = {
                    'lesson_year': correspond.lesson_year,
                    'lesson_season': correspond.lesson_season,
                    'student': correspond.student,
                    'status': ScoreRegister.CORRESPOND,
                    'exam_score': score,
                    'lesson_id': lesson
                }

                ScoreRegister.objects.create(
                    **create_datas
                )

            # Бүх мэдээллийг хадгалсаны дараа хүсэлтийн төрлийг зөвшөөрсөн төрөлтэй.
            correspond.is_solved = StudentRequestTutor.ALLOW
            correspond.save()

        except Exception as e:
            print(e)
            return request.send_error('ERR_002', )


        return request.send_info('INF_001')
class LeaveAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
):
    """ Өргөдөлийн хүсэлт шийдвэрлэх
    """

    queryset = StudentLeaveRequest.objects.all().order_by('is_solved')
    serializer_class = LeaveRequestListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['cause','student__first_name', 'student__code']

    def get(self, request, pk=None):
        school = request.query_params.get('school')

        if school:
            self.queryset = self.queryset.filter(student__school=school)

        if pk:
            self.serializer_class = LeaveRequestPrintSerializer
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        leave_type_id = self.request.query_params.get('leave_type_id')

        # Чөлөөний төрөл-өөр хайх
        if leave_type_id:
            self.queryset = self.queryset.filter(leave_type=leave_type_id)

        return_datas = self.list(request).data

        return request.send_data(return_datas)


class LeaveAnswerAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
):
    """ Чөлөөний хүсэлтэнд хариулах
    """

    queryset = LeaveRequest_Answer.objects
    serializer_class = LeaveRequestAnswerSerializer

    def post(self, request):

        data = request.data
        error_obj = []

        menu_id = request.query_params.get('menu')

        c_menu_list = get_menu_unit(menu_id)

        data['date'] = datetime.datetime.now().date()

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    obj = self.create(request).data
                    leave = obj.get('request')

                    if obj.get('is_confirm'):
                        leave_answer_count = LeaveRequest_Answer.objects.filter(request=leave).count()
                        if leave_answer_count == c_menu_list.__len__():
                            leave = StudentLeaveRequest.objects.get(id=leave)
                            leave.is_solved = StudentRequestTutor.ALLOW
                            leave.save()

                    else:
                        leave = StudentLeaveRequest.objects.get(id=leave)
                        leave.is_solved = StudentRequestTutor.REJECT
                        leave.save()

                except Exception as e:
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            return request.send_error("ERR_003", error_obj)


class RoutingAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin
):
    """ Тойрох хуудас шийдвэрлэх """

    queryset = StudentRoutingSlip.objects.all().order_by('-created_at')
    serializer_class = RoutingSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name', 'student__last_name', 'title' ]

    def get(self, request, pk=None):

        stype = request.query_params.get('type')
        if stype:
            self.queryset = self.queryset.filter(routingslip_type=stype)

        if pk:
            data = self.retrieve(request, pk).data
            return request.send_data(data)

        data = self.list(request).data

        return request.send_data(data)


class RoutingAnswerAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
):
    """ Тойрох хуудасны хүсэлтэнд хариулах
    """

    queryset = RoutingSlip_Answer.objects.all()
    serializer_class = RoutingSlip_AnswerSerializer

    def post(self, request):

        data = request.data
        unit = data.get('unit')

        error_obj = []

        menu_id = request.query_params.get('menu')

        c_menu_list = get_menu_unit(menu_id)

        data['date'] = datetime.datetime.now().date()

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    obj = self.create(request).data
                    routing = obj.get('request')

                    if obj.get('is_confirm'):
                        routing_answer = RoutingSlip_Answer.objects.filter(request=routing)
                        routing_answer_count = routing_answer.count()
                        routing_answer_values = routing_answer.values_list('is_confirm', flat=True)
                        is_confirm = True
                        if False in routing_answer_values:
                            is_confirm = False

                        if routing_answer_count == len(c_menu_list):
                            routing = StudentRoutingSlip.objects.get(id=routing)
                            routing.is_solved = StudentRequestTutor.ALLOW
                            routing.save()

                            student = routing.student

                            student_obj = Student.objects.filter(id=student).first()

                            state = routing.routingslip_type

                            # Бүртгэл мэдээллийн ажилтан оюутнб мэдээллийг батлах үед оюутны төлөв өөрчлөгдөнө
                            if unit == Complaint_unit.BMA and student_obj and is_confirm:
                                qs_sregister = StudentRegister.objects.all()
                                if state == StudentRoutingSlip.RS_1:
                                    st_state = qs_sregister.filter(name__icontains='Шилжсэн').first()
                                if state == StudentRoutingSlip.RS_2:
                                    st_state = qs_sregister.filter(name__icontains='Сургуулиас гарсан').first()
                                if state == StudentRoutingSlip.RS_3:
                                    st_state = qs_sregister.filter(name__icontains='Төгссөн').first()

                                student_obj.status = st_state

                                student_obj.save()

                except Exception as e:
                    print(e)
                    return request.send_error("ERR_002")

            return request.send_info("INF_001")

        else:
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            return request.send_error("ERR_003", error_obj)


@permission_classes([IsAuthenticated])
class RequestAnswerTutorAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView,
):

    "Багшийн туслахаар ажиллах хүсэлт шийдвэрлэх"

    queryset = StudentRequestTutor.objects.all().order_by('-created_at')
    serializer_class = RequestAnswerTutorSerializer
    pagination_class = CustomPagination
    filter_backends = [SearchFilter]

    search_fields = [
        'lesson__code',
        'lesson__name',
        'description',
        # 'student__code',
        # 'student__first_name',
    ]

    def get_queryset(self):
        queryset = self.queryset

        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')

        # Сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school=schoolId)
        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            queryset = queryset.order_by(sorting)

        return queryset

    @has_permission(must_permissions=['lms-wish-tutor-read'])
    def get(self, request, pk=None):
        " Багшийн туслахаар ажиллах хүсэлт шийдвэрлэх жагсаалт"

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        self.queryset = self.queryset.filter(lesson_season=lesson_season, lesson_year=lesson_year)

        if pk:
            answer_info = self.retrieve(request).data

            return request.send_data(answer_info)

        req_list = self.list(request).data

        return request.send_data(req_list)

    @has_permission(must_permissions=['lms-wish-tutor-update'])
    def put(self, request, pk=None):
        """ Багшийн туслахаар ажиллах хүсэлт шийдвэрлэх засах
            return seraializer.data
        """
        self.serializer_class = RequestAnswerTutorPutSerializer
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        self.queryset = self.queryset.filter(lesson_season=lesson_season, lesson_year=lesson_year)
        errors = []
        datas = request.data
        data = null_to_none(datas)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            self.update(serializer, pk).data
        else:
            for key in serializer.errors:
                msg = "хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                errors.append(return_error)

            return request.send_error("ERR_002", errors)
        return request.send_info("INF_015")
