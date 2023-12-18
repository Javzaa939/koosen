from rest_framework import mixins
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from django.db import transaction
from lms_package.notif import create_notif

from django.db.models import F, Func, Value, CharField, Count
from django.db.models.functions import TruncDay

from lms.models import (
    SurveyQuestions,
    QuestionChoices,
    Employee,
    Survey,
    Pollee,
    Student,
    SubSchools,
    Departments,
    ProfessionDefinition,
    Group,
    Notification,
    SurveyChoices
)

from core.models import (
    Teachers
)

from .serializers import (
    SurveyQuestionsListSerializer,
    SurveyListSerializer,
    PolleeSerializer,
    DepartmentSerializer,
    SurveySchoolSerializer,
    SurveySchoolStudentSerializer,
    DepartmentStudentSerializer,
    ProfessionDefinitionStudentSerializer,
    GroupStudentSerializer,
    StudentSurveySerializer,
    TeacherSerializer,
    SurveySerializer,
    SurveyOroltsogchidNerSerializer,
    SurveyPolleeSerializer
)

from lms.models import get_choice_survey_image_path
from lms.models import get_image_survey_path

from main.utils.function.utils import remove_key_from_dict, json_load, null_to_none, has_permission, get_active_student, str2bool
from main.utils.function.pagination import CustomPagination

from main.utils.file import save_file_question, remove_folder

@permission_classes([IsAuthenticated])
class SurveyQuestionsAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Сургалтын алба судалгааны асуултууд """
    queryset = SurveyQuestions.objects.all().order_by('-created_at')
    serializer_class = SurveyQuestionsListSerializer

    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['question']

    @has_permission(must_permissions=['lms-survey-question-read'])
    def get(self, request, pk=None):

        self.queryset = self.queryset.filter(is_rate_teacher=True)
        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)

    @has_permission(must_permissions=['lms-survey-question-create'])
    def post(self, request, pk=None):
        """ Асуулт шинээр үүсгэх """

        # DICTIONARY -ээс value авахдаа get ашиглана
        user = request.user

        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        created_by = Employee.objects.get(user_id=user)
        teacher = Teachers.objects.filter(user=user).first()

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    qkind = question.get("kind")
                    image_name = question.get('imageName')

                    question['created_by'] = created_by
                    question['is_rate_teacher'] = True

                    question_img = None

                    # Асуултын сонголтууд
                    choices = question.get('choices')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj = SurveyQuestions.objects.create(
                        **question
                    )

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_survey_path(question_obj)

                        file_path = save_file_question(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:

                        for choice in choices:

                            # choice['created_by'] = teacher

                            img_name = choice.get('imageName')

                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj = SurveyChoices.objects.create(
                                **choice
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_survey_image_path(choice_obj)

                                file_path = save_file_question(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

            return request.send_info("INF_001")

    @has_permission(must_permissions=['lms-survey-question-update'])
    def put(self, request, pk=None):

        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        user = request.user
        created_by = Employee.objects.get(user_id=user)

        teacher = Teachers.objects.filter(user=user).first()

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    qkind = question.get("kind")
                    image_name = question.get('imageName')

                    question['created_by'] = created_by

                    question_img = None

                    # Асуултын сонголтууд
                    choices = question.get('choices')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if 'kind_name' in question:
                        del question['kind_name']

                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj, created = SurveyQuestions.objects.update_or_create(
                        id=pk,
                        defaults={
                            **question
                        }
                    )

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_survey_path(question_obj)

                        file_path = save_file_question(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()
                    else:
                        old_image = question_obj.image

                        # Хуучин зураг засах үедээ устгасан бол файл устгана.
                        if old_image and not image_name:
                            remove_folder(str(old_image))

                            question_obj.image = None
                            question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:

                        for choice in choices:
                            choice['created_by'] = teacher
                            img_name = choice.get('imageName')

                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj, created = QuestionChoices.objects.update_or_create(
                                id=choice.get('id'),
                                defaults={
                                    **choice
                                }
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_survey_image_path(choice_obj)

                                file_path = save_file_question(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()
                            else:
                                choice_old_image = choice_obj.image

                                # Хуучин зураг засах үедээ устгасан бол файл устгана.
                                if choice_old_image and not img_name:
                                    remove_folder(str(choice_old_image))

                                    choice_obj.image = None
                                    choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

            return request.send_info('INF_002')

    @has_permission(must_permissions=['lms-survey-question-delete'])
    def delete(self, request, pk=None):

        question = self.queryset.filter(id=pk).first()
        try:
            question_img = question.image

            if question_img:
                remove_folder(str(question_img))

                if question:
                    choices = question.choices.all()

                    for choice in choices:
                        img = choice.image

                        # Хэрвээ хариултын хэсэгт зураг байвал устгана
                        if img:
                            remove_folder(str(img))

                        choice.delete()

                    # Хариултын хэсгийг устгах хэсэг
                    question.choices.clear()

            question.delete()

        except Exception as e:
            print(e)
            return request.send_error("ERR_002")

        return request.send_info("INF_003")

# @permission_classes([IsAuthenticated])
class PolleeApiView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    """ Судалгааны асуултанд хариулах
    """

    queryset = Pollee.objects.all().order_by('created_at')
    serializer_class = PolleeSerializer

    def get(self, request, pk):
        survey = Survey.objects.get(id=pk)
        datas = SurveyPolleeSerializer(survey, many=False).data

        pollees = survey.pollee_set \
                .values('created_at') \
                .annotate(name=Func(
                    TruncDay('created_at'),
                    Value('yyyy-MM-dd'),
                    function='to_char',
                    output_field=CharField()
                )) \
                .values("name") \
                .annotate(count=Count("name")) \
                .order_by("name")

        poll_users = list()
        if not survey.is_hide_employees:

            group_field = "student"
            if Notification.FROM_KIND_EMPLOYEE == survey.scope_kind:
                group_field = "teacher"

            qs = survey.pollee_set \
                .values(group_field) \
                .annotate(count=Count(group_field)) \
                .values("count", name=F(group_field)) \
                .order_by("-count")

            poll_users = SurveyOroltsogchidNerSerializer(qs, many=True, context={ "group_field": group_field }).data

        return request.send_data(
            {
                "questions": datas,
                "pollees": list(pollees),
                "poll_users": poll_users
            }
        )


@permission_classes([IsAuthenticated])
class SurveyListAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):
    queryset = Survey.objects.all()
    serializer_class = SurveyListSerializer

    filter_backends = [SearchFilter]
    search_fields = ['start_date','end_date', 'title']

    pagination_class = CustomPagination

    @has_permission(must_permissions=['lms-survey-list-read'])
    def get(self, request, pk=None):

        time_type = self.request.query_params.get('time_type')
        user = request.user
        worker = Employee.objects.filter(user=user).first()

        self.queryset = self.queryset.filter(created_by=worker)

        if time_type:
            state_filters = Survey.get_state_filter(time_type)

            self.queryset = self.queryset.filter(**state_filters)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


@permission_classes([IsAuthenticated])
class SurveyRangeAPIView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView
):

    # queryset = Teachers.objects.all()
    # serializer_class = SurveyRangeSerializer

    def get(self, request, pk=None):

        types = request.query_params.get('types')
        selected_value = request.query_params.get('selected_value')

        c_queryset = []

        # Багш үед
        if types == 'teacher':
            # Салбарын жагсаалт
            if selected_value == 'is_org':
                c_queryset = SubSchools.objects.filter(is_school=True)
                all_data = SurveySchoolSerializer(c_queryset, many=True).data

                return request.send_data(all_data)

            # Тэнхимийн жагсаалт
            if selected_value == 'is_dep':
                c_queryset = Departments.objects.all()
                all_data = DepartmentSerializer(c_queryset, many=True).data

                return request.send_data(all_data)

            # Багш нарын жагсаалт
            if selected_value == 'is_teacher':
                c_queryset = Teachers.objects.all()
                all_data = TeacherSerializer(c_queryset, many=True).data

                return request.send_data(all_data)

        # Оюутан үед
        if types == 'student':

            # Салбарын жагсаалт
            if selected_value == 'is_org':
                c_queryset = SubSchools.objects.filter(is_school=True)
                all_data = SurveySchoolStudentSerializer(c_queryset, many=True).data

                return request.send_data(all_data)

            # Тэнхимийн жагсаалт
            if selected_value == 'is_dep':
                c_queryset = Departments.objects.all()
                all_data = DepartmentStudentSerializer(c_queryset, many=True).data

                return request.send_data(all_data)

            # Мэргэжлүүдийн жагсаалт
            if selected_value == 'is_pro':
                c_queryset = ProfessionDefinition.objects.all()
                all_data = ProfessionDefinitionStudentSerializer(c_queryset, many=True).data

                return request.send_data(all_data)

            # Ангиудын жагсаалт
            if selected_value == 'is_group':
                c_queryset = Group.objects.all()
                all_data = GroupStudentSerializer(c_queryset, many=True).data

                return request.send_data(all_data)

            # Оюутнуудын жагсаалт
            if selected_value == 'is_student':
                c_queryset = Student.objects.all()
                all_data = StudentSurveySerializer(c_queryset, many=True).data

                return request.send_data(all_data)

        return request.send_data(list(c_queryset))


@permission_classes([IsAuthenticated])
class SurveyAPIView(
    generics.GenericAPIView,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin
):
    """ Судалгаа үүсгэх """

    queryset = Survey.objects.all().order_by('-created_at')
    serializer_class = SurveySerializer

    filter_backends = [SearchFilter]
    search_fields = ['start_date','end_date', 'title']

    pagination_class = CustomPagination

    def get(self, request, pk=None):
        self.serializer_class = SurveyListSerializer

        time_type = self.request.query_params.get('time_type')
        user = request.user
        worker = Employee.objects.filter(user=user).first()

        self.queryset = self.queryset.filter(created_by=worker)

        if time_type:
            state_filters = Survey.get_state_filter(time_type)

            self.queryset = self.queryset.filter(**state_filters)

        if pk:
            row_data = self.retrieve(request, pk).data
            return request.send_data(row_data)

        all_list = self.list(request).data

        return request.send_data(all_list)


    def post(self, request):
        datas = request.data.dict()

        user = request.user
        array_key = 'oyutans'

        worker = Employee.objects.filter(user=user).first()

        # МҮИС хэмжээнд авах судалгаа
        is_all = datas.get('is_all')

        # Хамрах хүрээний сонгогдсон ids
        selected_ids = request.POST.getlist('selected_id')

        # Бүх оюутнууд эсэх
        isAllStudent = datas.get('isAllStudent')

        # Бүх багш эсэх
        isAllTeacher = datas.get('isAllTeacher')

        # Багш оюутан альнаас судалгаа авч байгааг ялгах
        is_teacher = datas.get('is_teacher')

        # Судалгааны хамрах хүрээний төлөв
        scope_kind = Notification.SCOPE_KIND_OYUTAN

        if is_all and str2bool(is_all):
            scope_kind = Notification.SCOPE_KIND_ALL

        if is_teacher and (str2bool(is_teacher) or (isAllTeacher and str2bool(isAllTeacher))):
            array_key = 'teachers'
            scope_kind = Notification.SCOPE_KIND_EMPLOYEE

        # Бүх суралцаж буй оюутнууд
        if isAllStudent and str2bool(isAllStudent):
            qs_student = get_active_student()
            selected_ids = qs_student.values_list('id', flat=True)

        if isAllTeacher and str2bool(isAllTeacher):
            array_key = 'teachers'
            worker_user_ids = Employee.objects.filter(state=Employee.STATE_WORKING, org_position__is_teacher=True).values_list('user', flat=True)
            selected_ids = Teachers.objects.filter(user__in=worker_user_ids).values_list('id', flat=True)

        # Асуултын хэсэг хадгалах хэсэг
        quesion_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        datas = remove_key_from_dict(datas, ['question'])

        # Хэрэггүй хэсгийг хасах
        if 'selected_id' in datas:
            del datas['selected_id']

        if 'isAllStudent' in datas:
            del datas['isAllStudent']

        if 'isAllTeacher' in datas:
            del datas['isAllTeacher']

        if 'is_teacher' in datas:
            del datas['is_teacher']

        if 'questionImg' in datas:
            del datas['questionImg']

        if 'choiceImg' in datas:
            del datas['choiceImg']

        datas['scope_kind'] = scope_kind
        datas['created_by'] = worker.id

        title = datas.get('title')
        end_date = datas.get('end_date').split('T')[0]

        if not is_all:
            datas[array_key] = selected_ids

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                question_ids = list()

                # Асуултыг хадгалах хэсэг
                for question in questions:
                    question = json_load(question)

                    question['is_rate_teacher'] = False
                    question['created_by'] = worker

                    qkind = question.get("kind")
                    image_name = question.get('imageName')

                    question_img = None

                        # Асуултын сонголтууд
                    choices = question.get('choices')

                    # Асуултын зураг хадгалах хэсэг
                    for img in quesion_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if not question.get('max_choice_count'):
                        question['max_choice_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    # else:
                    #     question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj = SurveyQuestions.objects.create(
                        **question
                    )

                    question_ids.append(question_obj.id)

                    # Асуултанд зураг байвал хадгалах хэсэг
                    if question_img:
                        question_img_path = get_image_survey_path(question_obj)

                        file_path = save_file_question(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()

                    choice_ids = list()

                    # Асуултын сонголтуудыг үүсгэх нь
                    if int(qkind) in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:
                        for choice in choices:

                            img_name = choice.get('imageName')

                            choice_img = None

                            # Хариултын зураг хадгалах хэсэг
                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj = SurveyChoices.objects.create(
                                **choice
                            )

                            # Асуултанд зураг байвал хадгалах хэсэг
                            if choice_img:
                                choice_img_path = get_choice_survey_image_path(choice_obj)

                                file_path = save_file_question(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

                # Судалгаа ерөнхий мэдээлэл үүсгэх хэсэг
                datas['questions'] = question_ids

                serializer = self.get_serializer(data=datas)

                serializer.is_valid(raise_exception=False)

                serializer.save()

                data = serializer.data
                survey_id = data.get('id')

                survey_obj = self.queryset.filter(id=survey_id).first()

                survey_obj.questions.set(question_ids)

                if scope_kind == Notification.SCOPE_KIND_OYUTAN:
                    scope_ids = [int(item) for item in selected_ids if isinstance(item, str) and item.isnumeric()]
                elif scope_kind == Notification.SCOPE_KIND_EMPLOYEE:
                    user_ids = Teachers.objects.filter(id__in=selected_ids).values_list('user', flat=True)
                    employees_ids = Employee.objects.filter(user__in=user_ids).values_list('id', flat=True)
                    scope_ids = employees_ids
                else:
                    scope_ids = []

                # TODO үсрэх url оруулах
                # Notification илгээх~

                create_notif(
                    request,
                    scope_ids,
                    "{title} судалгааны мэдээллийг хүргэж байна.".format(title=title),
                    "Судалгаа {end_date} дуусахыг анхаарна уу".format(end_date=end_date),
                    Notification.FROM_KIND_USER,
                    scope_kind,
                    'important' if survey_obj.is_required else 'normal'
                )

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def put(self, request, pk=None):
        datas = request.data.dict()

        user = request.user
        array_key = 'oyutans'

        worker = Employee.objects.filter(user=user).first()

        is_all = datas.get('is_all')

        selected_ids = request.POST.getlist('selected_id')

        isAllStudent = datas.get('isAllStudent')

        isAllTeacher = datas.get('isAllTeacher')

        is_teacher = datas.get('is_teacher')

        scope_kind = Notification.SCOPE_KIND_OYUTAN

        if is_all and str2bool(is_all):
            scope_kind = Notification.SCOPE_KIND_ALL

        if is_teacher and (str2bool(is_teacher) or (isAllTeacher and str2bool(isAllTeacher))):
            array_key = 'teachers'
            scope_kind = Notification.SCOPE_KIND_EMPLOYEE

        if isAllStudent and str2bool(isAllStudent):
            qs_student = get_active_student()
            selected_ids = qs_student.values_list('id', flat=True)

        if isAllTeacher and str2bool(isAllTeacher):
            array_key = 'teachers'
            worker_user_ids = Employee.objects.filter(state=Employee.STATE_WORKING, org_position__is_teachers=True).values_list('user', flat=True)
            selected_ids = Teachers.objects.filter(user__in=worker_user_ids).values_list('id', flat=True)

        question_imgs = request.FILES.getlist('questionImg')
        choice_imgs = request.FILES.getlist('choiceImg')

        questions = request.POST.getlist('question')

        datas = remove_key_from_dict(datas, ['questions'])

        if 'selected_id' in datas:
            del datas['selected_id']

        if 'isAllStudent' in datas:
            del datas['isAllStudent']

        if 'isAllTeacher' in datas:
            del datas['isAllTeacher']

        if 'is_teacher' in datas:
            del datas['is_teacher']

        if 'questionImg' in datas:
            del datas['questionImg']

        if 'choiceImg' in datas:
            del datas['choicesImg']

        datas['scope_kind'] = scope_kind
        datas['created_by'] = worker.id

        title = datas.get('title')
        end_date = datas.get('end_date').split('T')[0]

        if not is_all:
            datas[array_key] = selected_ids

        with transaction.atomic():
            sid = transaction.savepoint()
            try:
                question_ids = list()

                for question in questions:
                    question = json_load(question)

                    question['is_rate_teacher'] = False
                    question['created_by'] = worker

                    qkind = question.get('kind')
                    image_name = question.get('imageName')

                    question_img = None

                    choices = question.get('choices')

                    for img in question_imgs:
                        if image_name == img.name:
                            question_img = img
                            break

                    question = remove_key_from_dict(question, [ 'image', 'choices'])

                    if 'imageName' in question:
                        del question['imageName']

                    if 'imageUrl' in question:
                        del question['imageUrl']

                    if not question.get('max_choices'):
                        question['rating_max_count'] = 0

                    if not question.get('rating_max_count'):
                        question['rating_max_count'] = 0
                    else:
                        question['rating_max_count'] = 5

                    question = null_to_none(question)

                    question_obj = SurveyQuestions.objects.create(**question)

                    question_ids.apped(question_obj.id)

                    if question_img:
                        question_img_path = get_image_survey_path(question_obj)

                        file_path = save_file_question(question_img, question_img_path)[0]

                        question_obj.image = file_path
                        question_obj.save()

                    choice_ids = list()

                    if int(qkind) in [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]:
                        for choice in choices:
                            img_name = choice.get('imageName')
                            choice_img = None

                            for cimg in choice_imgs:
                                if img_name == cimg.name:
                                    choice_img = cimg
                                    break

                            choice = remove_key_from_dict(choice, ['image'])

                            if 'imageName' in choice:
                                del choice['imageName']

                            if 'imageUrl' in choice:
                                del choice['imageUrl']

                            choice_obj = SurveyChoices.objects.create(**choices)

                            if choice_img:
                                choice_img_path = get_choice_survey_image_path(choice_obj)
                                file_path = save_file_question(choice_img, choice_img_path)[0]

                                choice_obj.image = file_path
                                choice_obj.save()

                            choice_ids.append(choice_obj.id)

                    question_obj.choices.set(choice_ids)

                datas['questions'] = question_ids

                serializer = self.get_serializer(data=datas)

                serializer.is_valid(raise_exception=False)

                serializer.save()

                data = serializer.data

                survey_id = data.get('id')

                survey_obj = self.queryset.filter(id=survey_id).first()

                survey_obj.questions.set(question_ids)

                if scope_kind == Notification.SCOPE_KIND_OYUTAN:
                    scope_ids = [int(item) for item in selected_ids if isinstance(item, str) and item.isnumeric()]
                elif scope_kind == Notification.SCOPE_KIND_EMPLOYEE:
                    user_ids = Teachers.objects.filter(id__in=selected_ids).values_list('user', flat=True)
                    employees_ids = Employee.objects.filter(user__in=user_ids).values_list('id', flat=True)
                    scope_ids = employees_ids
                else:
                    scope_ids = []

                create_notif(request,
                            scope_ids,
                            "{title} судалгааны мэдээллийг хүргэж байна.".format(title=title),
                            "Судалгаа {end_date} дуусахыг анхаарна уу".format(end_date=end_date),
                            Notification.FROM_KIND_USER,
                            scope_kind,
                            'important' if survey_obj.is_required else 'normal'
                )

            except Exception as e:
                print(e)
                transaction.savepoint_rollback(sid)

                return request.send_error('ERR_002')

        return request.send_info('INF_001')

    def delete(self, request, pk=None):

        survey = self.get_object()
        questions = survey.questions.all()

        with transaction.atomic():
            try:
                for question in questions:

                    # Хэрвээ асуултанд зураг байвал устгана
                    question_img = question.image

                    if question_img:
                        remove_folder(str(question_img))

                        if question:
                            choices = question.choices.all()

                            for choice in choices:
                                img = choice.image

                                # Хэрвээ хариултын хэсэгт зураг байвал устгана
                                if img:
                                    remove_folder(str(img))

                                choice.delete()

                            # Хариултын хэсгийг устгах хэсэг
                            question.choices.clear()
                    question.delete()

                survey.questions.clear()

                self.destroy(request, pk)
            except Exception as e:
                return request.send_error("ERR_002")

        return request.send_info("INF_003")


class SurveyAllListAPIView(
    generics.GenericAPIView,
    mixins.ListModelMixin
):
    """ Бүх лист авах """

    queryset = Survey.objects.all().order_by('-created_at')
    serializer_class = SurveySerializer
    filter_backends = [SearchFilter]
    search_fields = ['title', 'description']

    def get(self, request):

        bogloson_sudalgaa_ids = Pollee.objects.values_list('survey', flat=True)

        self.queryset = self.queryset.filter(id__in=bogloson_sudalgaa_ids)

        all_data = self.list(request).data

        return request.send_data(all_data)