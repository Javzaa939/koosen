from django.db.models import Sum
from rest_framework import serializers

from lms.models import Lesson_teacher_scoretype, ScoreRegister, TeacherScore
from lms.models import Student
from lms.models import Teachers
from lms.models import Score
from lms.models import Exam_repeat
from lms.models import LessonStandart
from lms.models import Group
from core.models import SubOrgs

from surgalt.serializers import LessonStandartSerialzier
from settings.serializers import ScoreSerailizer
from student.serializers import StudentListSerializer


# ---------------- Дүйцүүлсэн дүн ----------------

class CorrespondSerailizer(serializers.ModelSerializer):

    class Meta:
        model = ScoreRegister
        fields = "__all__"

# Улирлын дүн
class ScoreRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = ScoreRegister
        fields = "__all__"


# Дүнгийн бүртгэлийн жагсаалт
class ScoreRegisterListSerializer(serializers.ModelSerializer):

    student = StudentListSerializer(many=False)
    assessment = ScoreSerailizer(many=False)
    total_score = serializers.SerializerMethodField()

    class Meta:
        model = ScoreRegister
        fields = "__all__"

    def get_total_score(self, obj):
        return obj.score_total


# Дүйцүүлсэн дүнгийн жагсаалт
class CorrespondListSerailizer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    assessment = ScoreSerailizer(many=False)
    lesson = LessonStandartSerialzier(many=False)

    class Meta:
        model = ScoreRegister
        fields = "id", "student","lesson", "teach_score", "exam_score", "assessment", "status", "lesson_year", "lesson_season", "school"


# Дахин шалгалтын дүн
class ReScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = ScoreRegister
        # fields = "__all__"
        fields = "id", "student"

# Дахин шалгалтын дүнгийн жагсаалт
class ReScoreListSerializer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    lesson = LessonStandartSerialzier(many=False)
    score = serializers.SerializerMethodField(read_only=True)
    before_score = serializers.SerializerMethodField(read_only=True)
    status_name = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Exam_repeat
        fields = "id", "student", "lesson", "status", "lesson_year", "lesson_season", "school", "score", "before_score", "status_name"

    def get_score(self, obj):

        obj_status=int(obj.status) + 4
        score_list = ScoreRegister.objects.filter(status=obj_status, lesson=obj.lesson, student=obj.student,lesson_year=obj.lesson_year, lesson_season=obj.lesson_season).values().last()
        teach_score = 0
        exam_score = 0
        if score_list:
            if score_list['teach_score']:
                teach_score = score_list['teach_score']
            if score_list['exam_score']:
                exam_score = score_list['exam_score']
            score_list['total_score'] = teach_score + exam_score
            total_score = round((teach_score + exam_score), 2)
            assess = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('assesment').first()
            if assess:
                score_list['assessment'] = assess['assesment']

        return score_list

    def get_before_score(self, obj):

        score_list = ScoreRegister.objects.filter(lesson=obj.lesson, student=obj.student).exclude(lesson_year=obj.lesson_year, lesson_season=obj.lesson_season).values().last()

        return score_list
    def get_status_name(self, obj):

        name = obj.get_status_display()

        return name


class StudentScoreListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    lesson_name = serializers.SerializerMethodField()
    teach_score = serializers.SerializerMethodField()
    exam_score = serializers.SerializerMethodField()
    lesson = serializers.SerializerMethodField()
    assessment = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = 'id', "code", 'full_name', 'teach_score', 'lesson_name', 'lesson', 'exam_score', 'assessment'

    def get_full_name(self, obj):

        return obj.full_name()

    def get_lesson_name(self, obj):

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')

        lesson_obj = LessonStandart.objects.filter(id=lesson).first()

        lesson_name = lesson_obj.code_name if lesson_obj else ''

        return lesson_name

    def get_lesson(self, obj):

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')

        if lesson:
            lesson = int(lesson)

        return lesson

    def get_teach_score(self, obj):
        student = obj.id
        score = ''

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year = request.query_params.get('lesson_year')
        season = request.query_params.get('lesson_season')

        teacher = request.query_params.get('teacher')

        if teacher:
            teacher = Teachers.objects.filter(id=teacher).first()

        score_obj = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, student=student, lesson=lesson, teacher=teacher).last()

        if score_obj:
            score = score_obj.teach_score

        return score

    def get_exam_score(self, obj):

        score = ''
        student = obj.id

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year = request.query_params.get('lesson_year')
        season = request.query_params.get('lesson_season')

        score_obj = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, student=student, lesson=lesson).last()

        if score_obj:
            score = score_obj.exam_score

        return score

    def get_assessment(self, obj):
        student = obj.id

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year = request.query_params.get('lesson_year')
        season = request.query_params.get('lesson_season')

        score_obj = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, student=student, lesson=lesson).last()

        assessment = score_obj.assessment.assesment if score_obj else ''

        return assessment

" ---------------------- Дүн хэвлэх ---------------------------"
class StudentSerializer(serializers.ModelSerializer):
    " Оюутан "
    stud_group_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "code", "register_num", "last_name", "first_name", "group","stud_group_info"]

    def get_stud_group_info(self, obj):
        "анги, мэргэжил, цол"

        data =[]
        group_id = obj.group.id
        group_obj = Group.objects.filter(id=group_id).first()
        prof_name = group_obj.profession.name
        level = group_obj.level
        degree_name = group_obj.degree.degree_name
        data ={
            'prof_name':prof_name,
            'degree_name':degree_name,
            'level':level
        }
        return data



class LessonStandartSerializer(serializers.ModelSerializer):
    "Хичээл"

    class Meta:
        model = LessonStandart
        fields =[ "id", "code", "name", "kredit"]

class SubSchoolsSerializer(serializers.ModelSerializer):
    "Сургууль"

    class Meta:
        model = SubOrgs
        fields = ["name"]

class TeachersSerializer(serializers.ModelSerializer):
    "Багш"

    class Meta:
        model = Teachers
        fields = ["full_name"]

class ScoreSerializer(serializers.ModelSerializer):
    "Дүн"

    class Meta:
        model = Score
        fields = "__all__"

# дүн хэвлэх
class ScoreRegisterPrintSerializer(serializers.ModelSerializer):
    student = StudentSerializer(many=False)
    lesson = LessonStandartSerializer(many=False)
    teacher = TeachersSerializer(many=False)
    assessment = ScoreSerailizer(many=False)
    # school = serializers.CharField(source='subschools__name', default='')

    class Meta:
        model = ScoreRegister
        fields = "__all__"


class TeacherScoreSerializer(serializers.ModelSerializer):
    student_code = serializers.CharField(read_only=True)
    student_full_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(read_only=True)
    teach_score = serializers.SerializerMethodField()
    exam_score = serializers.SerializerMethodField()
    assessment = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherScore
        fields = "student_code", "student_full_name", "group_name", "teach_score", "exam_score", "assessment", "teacher_name"

    def get_student_full_name(self, obj):

        return obj.student.full_name()

    def get_teach_score(self, obj):
        score = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson, score_type__score_type=Lesson_teacher_scoretype.BUSAD).exclude(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total')
        return score

    def get_exam_score(self, obj):
        score = 0
        score_obj = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson, score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).first()
        if score_obj:
            score = score_obj.score

        return round(score, 1)

    def get_assessment(self, obj):
        assessment = ''
        teacher_score = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson).exclude(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total') or 0
        exam_score = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson).filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total') or 0
        total_score = teacher_score + exam_score
        if not exam_score:
            return 'W'
        if teacher_score < 42:
            assessment = 'WF'
        elif exam_score < 18:
            assessment = 'W'
        else:
            assess = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('assesment').first()
            assessment = assess['assesment']
        return assessment

    def get_teacher_name(self, obj):

        return obj.score_type.lesson_teacher.teacher.full_name

class TeacherScoreListPrintSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    lesson_name = serializers.SerializerMethodField()
    lesson_season = serializers.SerializerMethodField()
    lesson_kredit = serializers.FloatField(read_only=True)
    teacher_name = serializers.CharField(read_only=True)
    teacher_org_position = serializers.CharField(read_only=True)
    teacher_score_updated_at = serializers.DateTimeField(read_only=True)
    exam_committee = serializers.SerializerMethodField()
    score_type = serializers.SerializerMethodField()
    teacher_score = serializers.SerializerMethodField()
    exam_score = serializers.SerializerMethodField()
    grade_letter = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = TeacherScore
        fields = 'id', 'full_name', 'score', 'lesson_name', 'lesson_year', 'lesson_season', 'lesson_kredit', 'teacher_name', 'teacher_org_position', 'teacher_score_updated_at', 'exam_committee', 'score_type', 'teacher_score', 'exam_score', 'grade_letter', 'total'

    def get_full_name(self, obj):

        return obj.student.full_name()

    def get_lesson_name(self, obj):
        lesson_name = ''

        if obj.score_type and obj.score_type.lesson_teacher:
            lesson_obj = obj.score_type.lesson_teacher.lesson

            if lesson_obj:
                lesson_name = lesson_obj.code_name

        return lesson_name

    def get_exam_committee(self, obj):

        return self.context.get('exam_committee', [])

    def get_score_type(self, obj):
        score_type = ''

        if obj.score_type:
            score_type = obj.score_type.score_type

        return score_type

    def get_lesson_season(self, obj):
        lesson_season = ''

        if obj.lesson_season:
            lesson_season = obj.lesson_season.season_name

        return lesson_season

    def get_teacher_score(self, obj):
        teach_qs = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson)
        if len(teach_qs) > 2:
            teach_qs = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson, score_type__lesson_teacher=obj.score_type.lesson_teacher, score_type__score_type=Lesson_teacher_scoretype.BUSAD)

        score = teach_qs.exclude(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total')

        return score

    def get_exam_score(self, obj):
        score = 0
        score_obj = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson, score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).first()
        if score_obj:
            score = score_obj.score

        return round(score, 1)

    def get_grade_letter(self, obj):
        assessment = ''
        teach_qs = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson)
        if len(teach_qs) > 2:
            teach_qs = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson, score_type__lesson_teacher=obj.score_type.lesson_teacher)

        teacher_score = teach_qs.exclude(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total') or 0
        exam_score = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson).filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total') or 0
        exam_obj = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson).filter(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).first()

        total_score = teacher_score + exam_score
        if not exam_score:
            return 'W'

        # Үсгэн үнэлгээ авсан бол
        if exam_obj.grade_letter:
            return exam_obj.grade_letter.letter or ''

        if teacher_score < 42:
            assessment = 'WF'
        elif exam_score < 18:
            assessment = 'W'
        else:
            assess = Score.objects.filter(score_max__gte=total_score,score_min__lte=total_score).values('assesment').first()
            assessment = assess['assesment']
        return assessment

    def get_total(self, obj):
        teach_qs = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson)
        if len(teach_qs) > 2:
            teach_qs = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson, score_type__lesson_teacher=obj.score_type.lesson_teacher)

        teacher_score =teach_qs.exclude(score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total') or 0
        exam_score = TeacherScore.objects.filter(student=obj.student, score_type__lesson_teacher__lesson=obj.score_type.lesson_teacher.lesson, score_type__score_type=Lesson_teacher_scoretype.SHALGALT_ONOO).aggregate(total=Sum('score')).get('total') or 0

        total_score = teacher_score + exam_score

        if teacher_score and teacher_score < 42:
            total_score = 0
        elif exam_score and exam_score < 18:
            total_score = 0
        return round(total_score, 1)