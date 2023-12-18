from rest_framework import serializers

from lms.models import Student
from lms.models import TimeTable
from lms.models import LessonStandart
from lms.models import Lesson_to_teacher
from lms.models import PermissionsTeacherScore
from lms.models import PermissionsOtherInterval
from lms.models import PermissionsStudentChoice
from lms.models import Lesson_teacher_scoretype
from lms.models import Crontab

from request.serializers import TeacherSerializer
from request.serializers import StudentSerializer
from main.utils.function.utils import fix_format_date, json_load

# --------------- Зөвхөн 1 багшийн дүн оруулах хандах эрх -----------------------

class PermissionsTeacherScoreSerializer(serializers.ModelSerializer):
    " Багшийн дүн оруулах эрх шинээр үүсгэх serializer"

    class Meta:
        model = PermissionsTeacherScore
        fields = "__all__"


class LessonSerializer(serializers.ModelSerializer):
    " Хичээлийн жагсаалт "

    class Meta:
        model = LessonStandart
        fields = ["id", "code", "name"]

class Lesson_to_teacherSerializer(serializers.ModelSerializer):
    " Хичээл , багш жагсаалт"

    teacher = TeacherSerializer(many=False)
    lesson = LessonSerializer(many=False)

    class Meta:
        model = Lesson_to_teacher
        fields = "__all__"


class Lesson_to_TeacherSerializer(serializers.ModelSerializer):
    "Тухайн хичээлийн хуваарьт байгаа багш ,хичээл хамаарах дүгнэх хэлбэрүүдийг авах жагсаалт "

    lesson_teacher = Lesson_to_teacherSerializer(many=False)
    score_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Lesson_teacher_scoretype
        fields = "__all__"

    def get_score_type_name(self, obj):
        """ Багшийн дүгнэх хэлбэрийн нэр авах """

        score_type_name = obj.get_score_type_display()
        return score_type_name


class PermissionsTeacherScoreListSerializer(serializers.ModelSerializer):
    " Багшийн дүн оруулах хандах эрхийг харуулах жагсаалт "

    teacher_scoretype = Lesson_to_TeacherSerializer(many=False)
    finish_date = serializers.SerializerMethodField(read_only=True)
    start_date = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = PermissionsTeacherScore
        fields = "__all__"


    def get_start_date(self, obj):
        " эхлэх хугацаа "

        start_date = ""
        start_date = obj.start_date
        start_time = fix_format_date(start_date)
        return start_time

    def get_finish_date(self, obj):
        "дуусах хугацаа"

        finish_date = obj.finish_date
        finish_time = fix_format_date(finish_date)
        return finish_time


class TimetableSerializer(serializers.ModelSerializer):
    " Хичээлийн хуваарьт байгаа багшийн жагсаалт "
    teacher = TeacherSerializer(many=False)

    class Meta:
        model = TimeTable
        fields = "__all__"


class LessonStandartSerializer(serializers.ModelSerializer):
    " Хичээлийн хуваарьт байгаа багшийн заах хичээлийн жагсаалт "

    class Meta:
        model = LessonStandart
        fields = "id", "code_name"


class Lesson_teacher_scoretypeSerializer(serializers.ModelSerializer):
    " Багшийн заах хичээлүүдээс хамаарч зөвхөн дүгнэх хэлбэрийг харуулах жагсаалт "

    score_type_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson_teacher_scoretype
        fields = "__all__"

    def get_score_type_name(self, obj):
        """ Багшийн дүгнэх хэлбэрийн нэр авах """

        score_type_name = obj.get_score_type_display()
        return score_type_name


# --------------------- Бусад хандах эрх -----------------

class PermissionsOtherIntervalSerializer(serializers.ModelSerializer):
    "Бусад хандах эрх post put үйлдэл ашиглах serializer "


    class Meta:
        model = PermissionsOtherInterval
        fields = "__all__"


class PermissionsOtherIntervaTypeSerializer(serializers.ModelSerializer):
    " хандах эрхийн нэр авах "

    class Meta:
        model = PermissionsOtherInterval
        fields = ["id", "permission_type", "lesson_year", "lesson_season"]


class PermissionsOtherIntervalListSerializer(serializers.ModelSerializer):
    " Бусад хандах эрх жагсаалт "

    permission_type_name = serializers.SerializerMethodField(read_only=True)
    finish_date = serializers.SerializerMethodField(read_only=True)
    start_date = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = PermissionsOtherInterval
        fields = "id", "permission_type", "lesson_year", "lesson_season","start_date", "finish_date", "permission_type_name"

    def get_permission_type_name(self, obj):
        """ хандах эрхийн нэр авах """

        permission_type_names = obj.get_permission_type_display()
        return permission_type_names

    def get_start_date(self, obj):
        " эхлэх хугацаа "

        start_date = ""
        start_date = obj.start_date
        start_time = fix_format_date(start_date)
        return start_time

    def get_finish_date(self, obj):
        "дуусах хугацаа"

        finish_date = obj.finish_date
        finish_time = fix_format_date(finish_date)
        return finish_time


#-----------------------Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх------------------

class PermissionsStudentChoiceSerializer(serializers.ModelSerializer):
    " Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх жагсаалт "
    # student = StudentSerializer(many=False)


    class Meta:
        model = PermissionsStudentChoice
        fields = "__all__"


class PermissionsStudentChoiceListSerializer(serializers.ModelSerializer):
    " Багшийн дүн оруулах хандах эрхийг харуулах жагсаалт "

    student = StudentSerializer(many=False)
    finish_date = serializers.SerializerMethodField(read_only=True)
    start_date = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = PermissionsStudentChoice
        fields = "__all__"

    def get_start_date(self, obj):
        " эхлэх хугацаа "

        start_date = ""
        start_date = obj.start_date
        start_time = fix_format_date(start_date)
        return start_time

    def get_finish_date(self, obj):
        "дуусах хугацаа"

        finish_date = obj.finish_date
        finish_time = fix_format_date(finish_date)
        return finish_time


class PermissionsStudentSerializer(serializers.ModelSerializer):
    " Оюутны жагсаалт "

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "code", "full_name"]

    def get_full_name(self, obj):
        " Оюутны нэр хамт "
        code_and_name = ""

        full_name = obj.full_name()
        code = obj.code
        code_and_name = code + " " + full_name

        return code_and_name


class CrontabSerializer(serializers.ModelSerializer):
    ctiming = serializers.SerializerMethodField()

    class Meta:
        model = Crontab
        fields = '__all__'

    def get_ctiming(self, obj):

        timing = json_load(obj.timing)

        return timing