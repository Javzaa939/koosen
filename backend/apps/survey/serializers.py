import os

from rest_framework import serializers

from core.models import Employee

from lms.models import (
    SurveyQuestions,
    QuestionChoices,
    Survey,
    Pollee,
    Salbars,
    SubOrgs,
    Teachers,
    ProfessionDefinition,
    Group,
    Student,
    SurveyChoices
)

from django.db.models import Count
from django.db.models.functions import Cast
from django.db.models import IntegerField

from django.db.models import F
from django.db.models import Case
from django.db.models import When
from django.db.models import Value

from user.serializers import UserListSerializer

from main.utils.function.utils import fix_format_date

# Судалгааны асуултын хариултын сонголт
class QuestionChoicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionChoices
        fields = '__all__'


# Судалгаа бөглөх сауулт
class BoglohQuestionSerializer(serializers.ModelSerializer):
    choices = QuestionChoicesSerializer(many=True)

    class Meta:
        model = SurveyQuestions
        fields = "__all__"


class EmployeeQuestionsSerializer(serializers.ModelSerializer):

    user = UserListSerializer()

    class Meta:
        model = Employee
        fields = '__all__'

class SurveyChoicesSerializer(serializers.ModelSerializer):
    imageName = serializers.SerializerMethodField()

    class Meta:
        model = SurveyChoices
        fields = '__all__'

    def get_imageName(self, obj):
        image_name = ''
        image = obj.image
        if image:
            image = image.path if image else ''
            image_name = os.path.basename(image)

        return image_name


class SurveyQuestionsListSerializer(serializers.ModelSerializer):
    """ Сургалтын алба судалгааны асуултууд
    """

    kind_name = serializers.SerializerMethodField()
    choices = SurveyChoicesSerializer(read_only=True, many=True)
    created_by = EmployeeQuestionsSerializer(read_only=True)
    imageName = serializers.SerializerMethodField()

    class Meta:
        model = SurveyQuestions
        fields = '__all__'

    def get_kind_name(self, obj):
        return obj.get_kind_display()

    def get_imageName(self, obj):
        image_name = ''
        image = obj.image
        if image:
            image = image.path if image else ''
            image_name = os.path.basename(image)

        return image_name


#-------------------------------------Судалгааны жагсаалт------------------------------------------
class SurveyListPolleeSerializer(serializers.ModelSerializer):
    questions = SurveyQuestionsListSerializer(many=True)
    class Meta:
        model = Survey
        fields = "__all__"


class SurveyPolleeDetailSerializers(serializers.ModelSerializer):
    " Оюутны мэдээлэл"

    class Meta:
        model = Student
        fields = "__all__"

class SurveyPolleeGetDepartmentSerializer(serializers.ModelSerializer):
    " Багшыг филтэрдэх үед түүнийг дагаад Тэнхимийг дуудах serializer. Өөр газар ашиглахад боломжтой."

    class Meta:
        model = Salbars
        fields = "id", "name"

class SurveyPolleeTeacherSerializers(serializers.ModelSerializer):
    " Багшын мэдээлэл"
    salbar = serializers.SerializerMethodField()

    def get_salbar(self, obj):
        if obj.salbar:
            salbar_id = obj.salbar.id
            teachers_data = Salbars.objects.get(id=salbar_id)
            serializer = SurveyPolleeGetDepartmentSerializer(teachers_data)
            return serializer.data
        else:
            return []

    class Meta:
        model = Teachers
        fields = "__all__"

class SurveyListSerializer(serializers.ModelSerializer):
    """Судалгааны жагсаалт"""

    questions = SurveyQuestionsListSerializer(many=True)
    created_by = EmployeeQuestionsSerializer(many=False)
    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()
    scope = serializers.SerializerMethodField()
    oyutans = serializers.SerializerMethodField()
    teachers = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()


    def get_start_date(self, obj):

        fixed_date = fix_format_date(obj.start_date)
        return fixed_date

    def get_end_date(self, obj):

        fixed_date = fix_format_date(obj.end_date)
        return fixed_date

    def get_created_at(self, obj):

        fixed_date = fix_format_date(obj.created_at)
        return fixed_date

    def get_scope(self, obj):
        return obj.get_scope_kind_display()

    def get_oyutans(self, obj):

        oyutan_ids = obj.oyutans if obj.oyutans is not None else []

        oyutans_data = Student.objects.filter(id__in=oyutan_ids)
        serializer = SurveyPolleeDetailSerializers(oyutans_data, many=True)
        return serializer.data

    def get_teachers(self, obj):

        teacher_ids = obj.teachers if obj.teachers is not None else []

        teachers_data = Teachers.objects.filter(id__in=teacher_ids)

        serializer = SurveyPolleeTeacherSerializers(teachers_data, many=True)
        return serializer.data


    class Meta:
        model = Survey
        fields = "__all__"


class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = "__all__"

# ------------------------------------------ Судалгааны асуулт бөглөх ------------------------------------------------------------
has_choice_kinds = [SurveyQuestions.KIND_MULTI_CHOICE, SurveyQuestions.KIND_ONE_CHOICE]

class SurveyBoglohQuestionSerializer(serializers.ModelSerializer):

    pollees = serializers.SerializerMethodField()
    rsp_count = serializers.IntegerField(source="pollee_set.count")

    class Meta:
        model = SurveyQuestions
        fields = "pollees", 'question', 'id', 'rsp_count', 'kind'

    def get_pollees(self, obj):
        if obj.kind in has_choice_kinds:
            objd = obj \
                    .choices \
                    .annotate(count=Count("pollee")) \
                    .values("count", name=F('choices')) \
                    .order_by("id")

            return list(objd)

        elif obj.kind in [SurveyQuestions.KIND_BOOLEAN]:
            objd =  Pollee \
                    .objects \
                    .filter(question=obj) \
                    .values("answer") \
                    .annotate(count=Count("answer")) \
                    .values(
                        "count",
                        name=Case(
                            When(answer="1", then=Value('Тийм')),
                            When(answer="0", then=Value('Үгүй')),
                            default=Value('')
                        )
                    ) \
                    .order_by("-count")

            return list(objd)

        elif SurveyQuestions.KIND_RATING == obj.kind:
            polls = list(
                    Pollee
                        .objects
                        .filter(question=obj)
                        .values("answer")
                        .annotate(count=Count("answer"))
                        .annotate(name=Cast('answer', output_field=IntegerField()))
                        .values("count", 'name')
                        .order_by("answer")
            )

            has_count = [
                poll["name"]
                for poll in polls if poll['name']
            ]

            rates = list(range(1, obj.rating_max_count + 1))

            for remove_rate in has_count:
                rates.remove(int(remove_rate))

            for empty_rate in rates:
                polls.append(
                    {
                        "name": int(empty_rate),
                        "count": 0
                    }
                )

            polls.sort(key=lambda y: int(y['name']))
            return list(polls)

        elif SurveyQuestions.KIND_TEXT == obj.kind:
            plist = Pollee.objects.filter(question=obj).values("answer").annotate(count=Count("answer")).values("count", name=F('answer')).order_by("-count")
            return list(plist)


class SurveyPolleeSerializer(serializers.ModelSerializer):
    questions = SurveyBoglohQuestionSerializer(many=True)
    class Meta:
        model = Survey
        fields = "__all__"


class PolleeAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionChoices
        fields = '__all__'

class ChoosedChoicesSerializer(serializers.ModelSerializer):
    ''' Судалгааны асуултын хариулах хэсгийн сонголтууд '''
    class Meta:
        model = QuestionChoices
        fields = '__all__'


class PolleeSerializer(serializers.ModelSerializer):
    """ Сургалтын алба судалгааны асуултын хариулт
    """
    answers = PolleeAnswerSerializer
    question = BoglohQuestionSerializer(read_only=True)
    choices = QuestionChoicesSerializer(read_only=True, many=True)

    choosed_choices = QuestionChoicesSerializer(read_only=True, many=True)
    class Meta:
        model = Pollee
        fields = '__all__'

#-----------------------------------------Судалгааны хамрах хүрээний жагсаалт авах-------------------------------------------

class TeacherSerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='full_name', default='')

    class Meta:
        model = Teachers
        fields = 'id', 'name'


class DepartmentSerializer(serializers.ModelSerializer):

    children = serializers.SerializerMethodField()

    class Meta:
        model = Salbars
        fields = 'id', 'name', 'children'


    def get_children(self, obj):
        qs_teachers = Teachers.objects.filter(salbar=obj)

        all_list = TeacherSerializer(qs_teachers, many=True).data

        return all_list


class SurveySchoolSerializer(serializers.ModelSerializer):

    children = serializers.SerializerMethodField()

    class Meta:
        model = SubOrgs
        fields = 'id', 'name', 'children'

    def get_children(self, obj):
        qs_department = Salbars.objects.filter(sub_orgs=obj)

        all_list = DepartmentSerializer(qs_department, many=True).data

        return all_list


class StudentSurveySerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='full_name', default='')

    class Meta:
        model = Group
        fields = 'id', 'name'


class GroupStudentSerializer(serializers.ModelSerializer):

    children = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = 'id', 'name', 'children'

    def get_children(self, obj):
        qs_teachers = Student.objects.filter(group=obj)

        all_list = StudentSurveySerializer(qs_teachers, many=True).data

        return all_list


class ProfessionDefinitionStudentSerializer(serializers.ModelSerializer):

    children = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionDefinition
        fields = 'id', 'name', 'children'

    def get_children(self, obj):
        qs_teachers = Group.objects.filter(profession=obj)

        all_list = GroupStudentSerializer(qs_teachers, many=True).data

        return all_list


class DepartmentStudentSerializer(serializers.ModelSerializer):

    children = serializers.SerializerMethodField()

    class Meta:
        model = Salbars
        fields = 'id', 'name', 'children'

    def get_children(self, obj):
        qs_teachers = ProfessionDefinition.objects.filter(department=obj)

        all_list = ProfessionDefinitionStudentSerializer(qs_teachers, many=True).data

        return all_list


class SurveySchoolStudentSerializer(serializers.ModelSerializer):

    children = serializers.SerializerMethodField()

    class Meta:
        model = SubOrgs
        fields = 'id', 'name', 'children'

    def get_children(self, obj):
        qs_department = Salbars.objects.filter(sub_orgs=obj)

        all_list = DepartmentStudentSerializer(qs_department, many=True).data

        return all_list


class SurveyOroltsogchidNerSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()
    count = serializers.SerializerMethodField()

    class Meta:
        model = Pollee
        fields = "user", 'count'

    def get_user(self, obj):
        group_field = self.context.get('group_field')
        id = obj.get("name")
        name = ""
        img = ""

        return_dict = dict()

        if group_field == "student":
            student = Student.objects.get(id=id)
            name = student.full_name()
            img = student.image.url if student.image else ""
        else:
            employee = Teachers.objects.get(id=id)
            name = employee.full_name
            img = employee.user.real_photo.url if employee.user.real_photo else ""

        return_dict["name"] = name
        return_dict["img"] = img
        return return_dict

    def get_count(self, obj):
        return obj.get("count")
