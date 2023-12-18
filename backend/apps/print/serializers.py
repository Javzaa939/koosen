from rest_framework import serializers
from lms.models import ScoreRegister
from lms.models import Score, Student
from lms.models import LessonStandart
from lms.models import GraduationWork
from lms.models import Group


from student.serializers import StudentListSerializer
from surgalt.serializers import LessonStandartSerialzier
from core.serializers import TeacherNameSerializer
from settings.serializers import SeasonSerailizer
from student.serializers import StudentListWithGroupSerializer

# Дүнгийн жагсаалт
class ScoreRegisterSerializer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    lesson = LessonStandartSerialzier(many=False)
    volume_kr = serializers.SerializerMethodField()
    teacher = TeacherNameSerializer(many=False)
    lesson_season = SeasonSerailizer(many=False)
    assessment = serializers.SerializerMethodField()

    class Meta:
        model = ScoreRegister
        fields = "id", "student", "lesson","teacher","teach_score", "exam_score", "score_total" , "assessment" ,"volume_kr", "lesson_year", "lesson_season"

    def get_volume_kr(self, obj):
        lesson_id = obj.lesson.id

        prof_vol = LessonStandart.objects.get(id=lesson_id).kredit
        return prof_vol



    def get_assessment(self, obj):
        " Үнэлгээ "

        score_obj = Score.objects.filter(score_max__gte=obj.score_total, score_min__lte=obj.score_total).values_list("assesment").first()
        return score_obj


class ScoreRegisterlolSerializer(serializers.ModelSerializer):

    # student = StudentListWithGroupSerializer(many=False)
    total_scores = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ScoreRegister
        # fields = "__all__"
        fields = ["id", "lesson", "student","exam_score", "teach_score", "status", "teacher", "lesson_season", "lesson_year", "total_scores"]

    def get_total_scores(self, obj):
        "нийт тоо"
        total = ''
        exam = obj.exam_score
        teach = obj.teach_score
        total = exam + teach
        return total



class LessonListSerializer(serializers.ModelSerializer):
    '''  Хичээлийн жагсаалт '''

    class Meta:
        model = LessonStandart
        fields = "code", "name"


class StudentistSerializer(serializers.ModelSerializer):
    ''' Оюутаны жагсаалт '''

    class Meta:
        model = Student
        fields = "id", "first_name", "code", "register_num"


class GraduationWorkListSerializer(serializers.ModelSerializer):
    lesson = LessonListSerializer(many=False, read_only=True)
    student = StudentistSerializer(many=False, read_only=True)
    mergejil_code = serializers.CharField(source="student.group.profession.code", default='')
    mergejil_name = serializers.CharField(source="student.group.profession.name", default='')

    class Meta:
        model = GraduationWork
        fields = "leader", "diplom_topic", "graduation_number", "graduation_date", "student", "mergejil_code", 'lesson', "mergejil_name"


class AdmissionListSerializer(serializers.ModelSerializer):
    mergejil_code = serializers.CharField(source="group.profession.code", default='')
    mergejil_name = serializers.CharField(source="group.profession.name", default='')

    class Meta:
        model = Student
        fields ="id", "first_name", "last_name", "code", "register_num", "admission_date", "admission_number", "mergejil_code", "mergejil_name"


class GroupListFilterSubSchoolSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = '__all__'

