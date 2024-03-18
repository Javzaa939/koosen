from rest_framework import mixins
from rest_framework import generics

from django.db import transaction
from django.db.models import Q

from rest_framework.filters import SearchFilter

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.utils import has_permission

from main.utils.function.pagination import CustomPagination

from main.utils.function.utils import get_active_year_season, remove_key_from_dict

from lms.models import TeacherCreditVolumePlan
from lms.models import TeacherCreditVolumePlan_group
from lms.models import Group
from lms.models import SchoolLessonLevelVolume
from lms.models import Student
from lms.models import LearningPlan
from lms.models import LessonStandart
from lms.models import Teachers
from lms.models import TimeEstimateSettings
from lms.models import TeacherCreditEstimationA
from lms.models import TeacherCreditNotChamberEstimationA
from lms.models import Season
from lms.models import TimeTable
from lms.models import Salbars
from lms.models import TimeTable_to_group
from lms.models import TimeTable_to_student
from lms.models import TeacherCreditEstimationA_group, ScoreRegister
from lms.models import Employee, StudentRegister, Lesson_to_teacher

from .serializers import TeacherCreditVolumePlanListSerializer
from .serializers import TeacherCreditVolumePlanSerializer
from .serializers import TeachersSerializer
from .serializers import TimeEstimateSettingsSerializer
from .serializers import TimeEstimateSettingsListSerializer
from .serializers import SchoolLessonLevelVolumeListSerializer
from .serializers import SchoolLessonLevelVolumeSerializer
from .serializers import TeacherAEstimationSerializer
from .serializers import TeacherAEstimationListSerializer
from .serializers import TimeEstimateSettingsListASerializer
from .serializers import TimeTableSerializer
from .serializers import TeacherCreditVolumePrintSerializer

# Create your views here.
@permission_classes([IsAuthenticated])
class TeacherCreditVolumePlanAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Багшийн цагийн ачаалал '''

    queryset = TeacherCreditVolumePlan.objects.all().order_by('teacher')
    pagination_class = CustomPagination
    serializer_class = TeacherCreditVolumePlanSerializer

    filter_backends = [SearchFilter]
    search_fields = ['teacher__first_name', 'lesson__name', 'lesson__code']

    def get(self, request, pk=None):
        self.serializer_class = TeacherCreditVolumePlanListSerializer

        school = self.request.query_params.get('school')
        department = self.request.query_params.get('department')
        teacher_id = self.request.query_params.get('teacher')

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)

        if lesson_season:
            self.queryset = self.queryset.filter(lesson_season=lesson_season)

        if school:
            self.queryset = self.queryset.filter(school=school)

        if department:
            self.queryset = self.queryset.filter(department=department)

        if teacher_id:
            self.queryset = self.queryset.filter(teacher=teacher_id)

        self.queryset = self.queryset.distinct('teacher', 'lesson')

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)

    def post(self, request):
        request_data = request.data
        school = request_data.get('school')
        group_data = request_data.get('group')
        lesson = request_data.get('lesson')
        type = request_data.get('type')
        credit = 0

        obj_lesson = LessonStandart.objects.get(id=lesson)
        if type == TimeTable.LECT:
            credit = obj_lesson.lecture_kr
        if type == TimeTable.SEM:
            credit = obj_lesson.seminar_kr
        if type == TimeTable.LAB:
            credit = obj_lesson.laborator_kr
        if type == TimeTable.PRACTIC:
            credit = obj_lesson.practic_kr
        if type == TimeTable.BIY_DAALT:
            credit = obj_lesson.biedaalt_kr

        request_data['credit'] = credit
        if 'group' in request_data:
            del request_data['group']

        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.perform_create(serializer)
                    result_data=serializer.data

                    # Цагийн ачааллын хүснэгтийн id
                    table_id=result_data.get('id')

                    # Цагийн ачааллын ангиуд шивэх хэсэг
                    if group_data:
                        status = StudentRegister.objects.filter(Q(Q(name__contains='Суралцаж буй') | Q(code=1))).first()
                        for row in group_data:
                            group_id = row.get("id")
                            profession = Group.objects.filter(id=group_id).values_list('profession_id',flat=True).first()
                            stcount = Student.objects.filter(group_id=group_id, status=status).count()
                            learningplan = LearningPlan.objects.filter(profession_id=profession, lesson_id=lesson).first()
                            lesson_level = learningplan.lesson_level if learningplan else None

                            if not lesson_level:
                                return request.send_error("ERR_003", row.get("name") + " ангийн сургалтын төлөвлөгөөнд энэ хичээл байхгүй байна")

                            amount = SchoolLessonLevelVolume.objects.filter(school_id=school,lesson_level=lesson_level).first()

                            if not amount:
                                amt = 40
                            else:
                                amt = amount.amount

                            obj = TeacherCreditVolumePlan_group.objects.update_or_create(
                                creditvolume_id=table_id,
                                group_id=group_id,
                                defaults={
                                    'st_count': stcount,
                                    'lesson_level': lesson_level,
                                    'exec_credit_flag': amt
                                }
                            )
                except Exception as e:
                    print(e)
                    return request.send_error("ERR_002")

                return request.send_info("INF_001")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = serializer.errors[key]

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

    def put(self, request, pk=None):

        request_data = request.data
        school = request_data.get('school')
        group_data = request_data.get('groups')
        lesson = request_data.get('lesson')
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            with transaction.atomic():
                try:
                    self.update(request, pk)
                    # Цагийн ачааллын ангиуд шивэх хэсэг
                    group_ids=[]
                    if group_data:
                        for row in group_data:
                            group_id = row.get("id")
                            group_ids.append(group_id)
                            profession = Group.objects.filter(id=group_id).values_list('profession_id',flat=True).first()
                            stcount = Student.objects.filter(group_id=group_id,status__code=1).count()
                            learnplan = LearningPlan.objects.filter(profession_id=profession, lesson_id=lesson).first()
                            if not learnplan:
                                return request.send_error("ERR_003", row.get("name") + " ангийн сургалтын төлөвлөгөөнд энэ хичээл байхгүй байна")

                            lesson_level = learnplan.lesson_level
                            amount = SchoolLessonLevelVolume.objects.filter(school_id=school,lesson_level=lesson_level).values('amount').first()

                            if not amount:
                                amt = 40
                            else:
                                amt = amount['amount']

                            obj = TeacherCreditVolumePlan_group.objects.update_or_create(
                                group_id=group_id,
                                creditvolume_id=pk,
                                defaults={
                                    'st_count': stcount,
                                    'lesson_level': lesson_level,
                                    'exec_credit_flag': amt
                                }
                            )
                    # Байсан анги устсан бол
                    qs = TeacherCreditVolumePlan_group.objects.filter(creditvolume_id=pk).exclude(group_id__in=group_ids)
                    qs.delete()
                except Exception as err:
                    print(err)
                    return request.send_error("ERR_002", str(err))

                return request.send_info("INF_002")

        else:
            error_obj = []
            for key in serializer.errors:
                msg = serializer.errors[key]
                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    def delete(self, request, pk=None):

        instance = self.get_object()
        timetable = TimeTable.objects.filter(lesson_year=instance.lesson_year, lesson=instance.lesson, teacher=instance.teacher, lesson_season=instance.lesson_season, day=0)
        real_timetable = TimeTable.objects.filter(lesson_year=instance.lesson_year, lesson=instance.lesson, teacher=instance.teacher, lesson_season=instance.lesson_season).exclude(day=0)
        with transaction.atomic():
            if len(timetable) > 0:
                timetable.delete()

            if real_timetable:
                return request.send_error('ERR_002', 'Хичээлийн хуваарь үүссэн байна. Устгах боломжгүй')

        self.destroy(request, pk)

        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class TeacherCreditVolumePlanEstimateAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    queryset = TeacherCreditVolumePlan.objects.all()
    serializer_class = TeacherCreditVolumePlanSerializer

    def post(self, request):
        """ Тухайн сонгогдсон хөтөлбөрийн багийн хичээлийн жил, улирлын цагийн ачаалал тооцох """

        schoolId = self.request.query_params.get('schoolId')
        dep_id =  self.request.query_params.get('dep_id')
        lesson_year = self.request.query_params.get('lesson_year')
        season = self.request.query_params.get('season')
        lesson_list = []

        even_i = []
        odd_i = []

        for i in range(1,13):
            if i % 2 == 0:
                even_i.append(i)
            else:
                odd_i.append(i)

        # Хөтөлбөрийн багт байгаа бүх мэргэжлийн хичээлийн төлөвлөгөөнд шивэгдсэн бүх хичээлээр цагийн ачаалал үүсгэх
        if schoolId and dep_id and season:
            own_list_ids = LessonStandart.objects.filter(department=dep_id).values_list('id', flat=True)
            season = Season.objects.get(pk=season)

            season_name = season.season_name

            # Идэвхтэй улиралд байгаа хичээлүүдийг авах
            if season_name == 'Намар':
                lookups = [Q(season__contains=str(value)) for value in odd_i]

                filter_query = Q()
                for lookup in lookups:
                    filter_query |= lookup

            else:
                lookups = [Q(season__contains=str(value)) for value in even_i]

                filter_query = Q()
                for lookup in lookups:
                    filter_query |= lookup

            lesson_ids = LearningPlan.objects.filter(lesson_id__in=own_list_ids).filter(filter_query).values_list('lesson', flat=True)
            lesson_list = LessonStandart.objects.filter(id__in=lesson_ids)

        for lesson in lesson_list:
            with transaction.atomic():

                # Цагийн ачаалал анги тооцох
                def create_groups(credit_obj):
                    for row in groups:
                        group_score_count = ScoreRegister.objects.filter(student__group=row.get('id')).count()
                        if group_score_count == 0:
                            stcount = Student.objects.filter(group_id=row.get('id'),status__code=1).count()
                            learnplan = LearningPlan.objects.filter(profession_id=row.get('profession'), lesson_id=lesson).first()

                            lesson_level = learnplan.lesson_level
                            amount = SchoolLessonLevelVolume.objects.filter(school_id=schoolId,lesson_level=lesson_level).first()

                            if not amount:
                                amt = 40
                            else:
                                amt = amount.amount

                            TeacherCreditVolumePlan_group.objects.update_or_create(
                                group_id=row.get('id'),
                                creditvolume_id=credit_obj.id,
                                defaults={
                                    'st_count': stcount,
                                    'lesson_level': lesson_level,
                                    'exec_credit_flag': amt
                                }
                        )
                try:
                    lesson_to_teacher = Lesson_to_teacher.objects.filter(lesson=lesson).first()
                    teacher = lesson_to_teacher.teacher if lesson_to_teacher else None
                    profession_ids = LearningPlan.objects.filter(lesson=lesson).filter(filter_query).values_list('profession', flat=True)
                    groups = list(Group.objects.filter(profession__in=profession_ids, is_finish=False).values('id','profession'))

                    lecture_kredit = lesson.lecture_kr
                    seminar_kredit = lesson.seminar_kr
                    laborator_kredit = lesson.laborator_kr

                    # 8 кредит цаг байвал charis буюц 2 долоо хоногт 1 удаа орно. Тэгш сондгой хуваарь
                    # 16 32 кредит цаг байвал долоо хоногт 1 удаа орно. Энгийн хуваарь
                    if lecture_kredit:
                        qs =self.queryset.filter(lesson=lesson,lesson_year=lesson_year,type=TimeTable.LECT)
                        if not qs:
                            create_datas = {
                                'lesson': lesson,
                                'lesson_year': lesson_year,
                                "lesson_season": season,
                                'type': TimeTable.LECT,
                                'teacher': teacher,
                                'credit': lecture_kredit,
                                'department_id': dep_id,
                                'school_id': schoolId
                            }

                            if lecture_kredit == 8:
                                create_datas['odd_even'] = TimeTable.ODD

                            obj = self.queryset.create(
                                **create_datas
                            )

                            # Цагийн ачаалал анги холбож үүсгэх
                            if len(groups) and obj:
                                create_groups(obj)

                    # 16 кредит цаг байвал charis буюц 2 долоо хоногт 1 удаа орно. Тэгш сондгой хуваарь
                    # 32 кредит цаг байвал долоо хоногт 1 удаа орно. Энгийн хуваарь
                    # 64 кредит цаг байвал долоо хоногт 2 удаа орно. Энгийн хуваарь
                    if seminar_kredit:
                        qs = self.queryset.filter(lesson=lesson,lesson_year=lesson_year,type=TimeTable.SEM)
                        if not qs:
                            if seminar_kredit >= 32:
                                create_times = int(seminar_kredit / 32)
                            else:
                                create_times = 1

                            create_datas = {
                                'lesson': lesson,
                                'lesson_year': lesson_year,
                                "lesson_season": season,
                                'type': TimeTable.SEM,
                                'teacher': teacher,
                                'credit': seminar_kredit,
                                'department_id': dep_id,
                                'school_id': schoolId
                            }

                            if seminar_kredit == 16:
                                create_datas['odd_even'] = TimeTable.ODD

                            for i in range(create_times):
                                obj = self.queryset.create(
                                    **create_datas
                                )

                                # Цагийн ачаалал анги холбож үүсгэх
                                if len(groups) and obj:
                                    create_groups(obj)

                    # 16 кредит цаг байвал charis буюц 2 долоо хоногт 1 удаа орно. Тэгш сондгой хуваарь
                    # 32 кредит цаг байвал долоо хоногт 1 удаа орно. Энгийн хуваарь
                    # 64 кредит цаг байвал долоо хоногт 2 удаа орно. Энгийн хуваарь
                    if laborator_kredit:
                        qs =self.queryset.filter(lesson=lesson,lesson_year=lesson_year,type=TimeTable.LAB)
                        if not qs:
                            if laborator_kredit >= 32:
                                create_times = int(laborator_kredit / 32)
                            else:
                                create_times = 1

                            create_datas = {
                                'lesson': lesson,
                                'lesson_year': lesson_year,
                                "lesson_season": season,
                                'type': TimeTable.LAB,
                                'teacher': teacher,
                                'credit': laborator_kredit,
                                'department_id': dep_id,
                                'school_id': schoolId
                            }

                            if laborator_kredit == 16:
                                create_datas['odd_even'] = TimeTable.ODD

                            for i in range(create_times):
                                obj = self.queryset.create(
                                    **create_datas
                                )

                                # Цагийн ачаалал анги холбож үүсгэх
                                if len(groups) and obj:
                                    create_groups(obj)

                    if lesson.practic_kr:
                        qs =self.queryset.filter(lesson=lesson,lesson_year=lesson_year,type=TimeTable.PRACTIC)
                        if not qs:
                            obj = self.queryset.create(
                                lesson = lesson,
                                lesson_year=lesson_year,
                                lesson_season=season,
                                type = TimeTable.PRACTIC,
                                teacher=teacher,
                                credit = lesson.practic_kr,
                                department_id=dep_id,
                                school_id = schoolId
                            )

                            if len(groups):
                               create_groups(obj)

                    # elif lesson.biedaalt_kr:
                    #     qs =self.queryset.filter(lesson=lesson,lesson_year=lesson_year,type=TimeTable.BIY_DAALT)
                    #     if not qs:
                    #         self.queryset.create(
                    #             lesson = lesson,
                    #             lesson_year=lesson_year,
                    #             lesson_season=season,
                    #             type = 6,
                    #             credit = lesson.biedaalt_kr,
                    #             department_id=dep_id,
                    #             school_id = schoolId
                    #         )

                except Exception as err:
                    print(err)
                    return request.send_error("ERR_002", str(err))

        return request.send_info("INF_001")


@permission_classes([IsAuthenticated])
class TeacherCreditVolumePlanPrintAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    ''' Багшийн цагийн ачаалал (Print дата)
    '''

    queryset = TeacherCreditVolumePlan.objects

    def get(self, request):

        all_data = list()

        seasons = [
            {
                'season_code': 1,
                'season_name': 'Намар'
            },
            {
                'season_code': 2,
                'season_name': 'Хавар'
            }
        ]

        school = self.request.query_params.get('school')
        lesson_year = self.request.query_params.get('lesson_year')
        department = self.request.query_params.get('department')
        teacher_id = self.request.query_params.get('teacher')

        if teacher_id:
            self.queryset = self.queryset.filter(teacher=teacher_id)
        if school:
            self.queryset = self.queryset.filter(school=school)
        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)
        if department:
            self.queryset = self.queryset.filter(department=department)

        queryset = self.queryset.filter(teacher__isnull=False)

        teacher_ids = queryset.distinct('teacher').values_list('teacher', flat=True)

        for teacher_id in teacher_ids:

            teacher = queryset.filter(teacher=teacher_id)

            teacher_data = TeachersSerializer(Teachers.objects.get(id=teacher_id), many=False).data

            seasons_data = list()

            for season in seasons:

                data = dict()

                season_qs = teacher.filter(lesson_season__season_code = season['season_code'])

                data['season_code'] = season['season_code']
                data['data'] = TeacherCreditVolumePrintSerializer(season_qs, many=True).data

                seasons_data.append(data)

            teacher_data['seasons'] = seasons_data

            all_data.append(teacher_data)

        return request.send_data(all_data)


class CreditSettingsAPIView(
    generics.GenericAPIView,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin
):
    """ Цагийн тооцоо тохиргоо """

    queryset = TimeEstimateSettings.objects.all().order_by('created_at')
    serializer_class = TimeEstimateSettingsSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['name', 'ratio', 'position__name']

    @has_permission(must_permissions=['lms-credit-settings-read'])
    def get(self, request, pk=None):

        self.serializer_class = TimeEstimateSettingsListSerializer

        ctype = request.query_params.get('type')
        if ctype:
            self.queryset = self.queryset.filter(type=int(ctype))

        if pk:
            data = self.retrieve(request, pk).data
            return request.send_data(data)

        all_list = self.list(request).data

        return request.send_data(all_list)

    @has_permission(must_permissions=['lms-credit-settings-create'])
    @transaction.atomic
    def post(self, request):

        sid = transaction.savepoint()
        data = request.data

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-credit-settings-update'])
    @transaction.atomic
    def put(self, request, pk=None):

        data = request.data
        instance = self.get_object()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.update(request).data

        except Exception as e:
            return request.send_error("ERR_002", e.__str__)

        return request.send_info('INF_002')

    @has_permission(must_permissions=['lms-credit-settings-delete'])
    def delete(self, request, pk=None):

        self.destroy(request, pk)

        return request.send_info("INF_003")


class CreditSettingsAllAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
):

    queryset = TimeEstimateSettings.objects.all().order_by('created_at')
    serializer_class = TimeEstimateSettingsListSerializer

    @has_permission(must_permissions=['lms-credit-settings-read'])
    def get(self, request, pk=None):

        ctype = request.query_params.get('type')

        if ctype:
            self.queryset = self.queryset.filter(type=int(ctype))

        all_list = self.list(request).data
        return request.send_data(all_list)


class CreditSettingsPerformancePIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin
):

    queryset = SchoolLessonLevelVolume.objects.all().order_by('created_at')
    serializer_class = SchoolLessonLevelVolumeSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['school__name', 'amount']

    def get(self, request, pk=None):

        self.serializer_class = SchoolLessonLevelVolumeListSerializer
        if pk:
            data = self.retrieve(request, pk).data

            return request.send_data(data)

        all_list = self.list(request).data
        return request.send_data(all_list)

    @transaction.atomic
    def post(self, request):
        sid = transaction.savepoint()
        data = request.data

        try:
            serializer = self.serializer_class(data=data, many=False)
            if not serializer.is_valid():
                transaction.savepoint_rollback(sid)
                return request.send_error_valid(serializer.errors)

            serializer.save()

        except Exception:
            return request.send_error("ERR_002")

        return request.send_info("INF_001")

    @transaction.atomic
    def put(self, request, pk=None):

        data = request.data
        instance = self.get_object()

        try:
            serializer = self.get_serializer(instance, data=data)
            if not serializer.is_valid(raise_exception=False):
                return request.send_error_valid(serializer.errors)

            self.update(request).data

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_002")

    def delete(self, request, pk=None):
        self.destroy(request, pk)

        return request.send_info("INF_003")


class TeacherAEstimationAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    ''' Багшийн А цагийн тооцоо '''

    queryset = TeacherCreditEstimationA.objects.all()
    serializer_class = TeacherAEstimationSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['teacher__first_name','teacher__last_name', 'lesson__name', 'lesson__code']

    def get(self, request, pk=None):

        self.serializer_class = TeacherAEstimationListSerializer

        lesson_year = request.query_params.get('lesson_year')
        department = request.query_params.get('department')
        teacher = request.query_params.get('teacher')
        school = request.query_params.get('school')

        if  not lesson_year:
            lesson_year, lesson_season = get_active_year_season()

        self.queryset = self.queryset.filter(lesson_year=lesson_year)

        if school:
            self.queryset = self.queryset.filter(school=school)

        if department:
            self.queryset = self.queryset.filter(department=department)

        if teacher:
            self.queryset = self.queryset.filter(teacher=teacher)

        teachers = self.queryset.values_list('teacher', flat=True)

        self.queryset = self.queryset.filter(teacher__in=list(teachers)).distinct('teacher')

        if pk:
            return_datas = self.retrieve(request, pk).data
            return request.send_data(return_datas)

        return_datas = self.list(request).data

        return request.send_data(return_datas)



class TeacherAEstimationEstimateAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    """ A цагийн тооцоо бодох хэсэг """

    queryset = TeacherCreditEstimationA.objects.all()
    serializer_class = TeacherAEstimationSerializer

    def post(self, request):

        # Хичээлийн жилийн улирал
        season_value = self.request.query_params.get('season')
        lesson_year = get_active_year_season()[0]

        # Салбар танхим
        department = self.request.query_params.get('department')
        teacher_id = self.request.query_params.get('teacher')

        qs_department = Salbars.objects.get(id=department)

        school = qs_department.sub_orgs

        # Хичээлийн жилийн улирал
        season = Season.objects.all().get(id=season_value)

        # Багшийн сонгосон хичээлийн хуваарийг нь авна
        qs_timetable = TimeTable.objects.all().filter(lesson_year=lesson_year, lesson_season=season_value, teacher__salbar=qs_department, school=school)

        if teacher_id:
            teacher = Teachers.objects.filter(id=teacher_id).first()

            qs_timetable = qs_timetable.filter(teacher=teacher)

        qs_timetables = qs_timetable.distinct('lesson',  'type', 'teacher').values('lesson',  'type', 'teacher')

        # Хичээлийн хуваарь байхгүй бол тооцоо бодох боломжгүй
        if not qs_timetables:
            return request.send_data([])

        for timetable in qs_timetables:
            lesson_id = timetable.get('lesson')
            lesson_type = timetable.get('type')
            teacherId = timetable.get('teacher')

            lesson = LessonStandart.objects.filter(id=lesson_id).first()

            timetable_qs = TimeTable.objects.filter(lesson=lesson_id, type=lesson_type, teacher=teacherId).last()
            timetable_id = timetable_qs.id

            # Тухайн цагийн хуваарьт байгаа ангиуд
            timetables_group_ids = TimeTable_to_group.objects.filter(timetable=timetable_id).values_list('group', flat=True)

            with transaction.atomic():
                try:
                    # Хичээлийн хуваарь дахь хичээлийн төрөл бүрээр A цагийн тооцоо үүсгэх хэсэг
                    obj, created = self.queryset.update_or_create(
                        lesson=lesson,
                        lesson_year=lesson_year,
                        teacher_id=teacherId,
                        defaults={
                            'lesson': lesson,
                            'lesson_year': lesson_year,
                            'department': qs_department,
                            'school': school,
                            'lesson_season': season
                        }
                    )

                    # Хичээлийн төрөлд хамаарах кредит цаг
                    if lesson_type == TimeTable.LAB:
                        kredit = lesson.laborator_kr
                        obj.laborator_kr = kredit
                    elif lesson_type == TimeTable.LECT:
                        kredit = lesson.lecture_kr
                        obj.lecture_kr = kredit
                    elif lesson_type == TimeTable.SEM:
                        kredit = lesson.seminar_kr
                        obj.seminar_kr = kredit
                    elif lesson_type == TimeTable.PRACTIC:
                        kredit = lesson.practic_kr
                        obj.practice_kr = kredit
                    elif lesson_type == TimeTable.BIY_DAALT:
                        kredit = lesson.biedaalt_kr
                        obj.biedaalt_kr = kredit

                    obj.save()

                    estimate_id = obj.id

                    estimate = self.queryset.get(id=estimate_id)

                    # Тухайн хичээлийн хуваарийн үзэж байгаа ангиудыг тодорхойлох
                    for group in timetables_group_ids:
                        qs_group = Group.objects.get(id=group)

                        exclude_students = TimeTable_to_student.objects.filter(timetable_id=timetable_id, add_flag=False).values_list('student', flat=True)

                        student_count = Student.objects.filter(group=group).exclude(id__in=exclude_students).count()

                        obj, created = TeacherCreditEstimationA_group.objects.update_or_create(
                            creditestimation = estimate,
                            group = qs_group,
                            defaults={
                                'creditestimation': estimate,
                                'group': qs_group,
                                'st_count': student_count
                            }
                        )

                except Exception as err:
                    print(err)
                    return request.send_error("ERR_002", str(err))

        return request.send_info("INF_001")


class TeacherAEstimationChamberAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin
):
    """ А цагийн тэнхимийн бус кредитийн төрөл """

    queryset = TimeEstimateSettings.objects.filter(type=TimeEstimateSettings.NOT_CHAMBER).order_by('created_at')
    serializer_class = TimeEstimateSettingsSerializer

    def get(self, request):

        self.serializer_class = TimeEstimateSettingsListASerializer
        all_list = self.list(request).data

        return request.send_data(all_list)

    def post(self, request):

        datas = request.data

        timesettings_id = datas.get('id')
        timeestimatea_id = datas.get('timeestimatea')

        amount = datas.get('amount')

        datas = remove_key_from_dict(datas, ['id', 'type', 'name', 'ratio', 'position', 'exec_kr'])

        timeestimatea = TeacherCreditEstimationA.objects.all().get(id=timeestimatea_id)
        time_estimate_settings = self.queryset.get(id=timesettings_id)

        datas['timeestimatea'] = timeestimatea
        datas['time_estimate_settings'] = time_estimate_settings

        qs_chamber = TeacherCreditNotChamberEstimationA.objects.filter(time_estimate_settings=timesettings_id, timeestimatea=timeestimatea).last()
        with transaction.atomic():
            try:
                if qs_chamber:
                    qs_chamber.amount = float(amount)
                    qs_chamber.save()
                else:
                    TeacherCreditNotChamberEstimationA.objects.create(
                        **datas
                    )
            except Exception as e:
                print(e)

        return request.send_info('INF_013')


class TeacherPartTime(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Тухайн сарын цагийн багшийн тооцооны нэгтгэл татах"""

    queryset = TimeTable.objects.all().order_by('day', 'time')
    serializer_class = TimeTableSerializer

    pagination_class = CustomPagination

    def get(self, request):
        year, season = get_active_year_season()
        school = request.query_params.get('school')

        if school:
            self.queryset = self.queryset.filter(school=school)

        # Гэрээний ажилчдын user ids авах
        user_ids = Employee.objects.filter(worker_type=Employee.WORKER_TYPE_CONTRACT).values_list('user', flat=True)
        teacher_ids  = Teachers.objects.filter(user__id__in=user_ids)

        # Тухайн багшийн хуваарийн өдрүүд
        self.queryset = self.queryset.filter(lesson_year=year, lesson_season=season, teacher__in=teacher_ids).distinct('teacher').order_by('teacher')

        all_data = self.list(request).data

        return request.send_data(all_data)
