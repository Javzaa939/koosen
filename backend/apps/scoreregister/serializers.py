from datetime import datetime
from rest_framework import serializers

from main.utils.function.utils import get_active_year_season
from lms.models import Lesson_teacher_scoretype, Lesson_to_teacher, PermissionsOtherInterval, ScoreRegister, TeacherScore
from lms.models import Student
from lms.models import Teachers
from lms.models import Score
from lms.models import Exam_repeat
from lms.models import LessonStandart
from lms.models import Group
from core.models import SubOrgs

from surgalt.serializers import GroupListSerializer, LessonStandartSerialzier
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


class StudentListPrintSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    lesson_name = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()
    lesson = serializers.SerializerMethodField()
    type_score = serializers.SerializerMethodField()
    insert_time = serializers.SerializerMethodField()
    total_score = serializers.SerializerMethodField()
    import_exam_score = serializers.SerializerMethodField()
    group = GroupListSerializer(many=False)
    lesson_year = serializers.CharField(read_only=True)
    lesson_season = serializers.CharField(read_only=True)
    lesson_kredit = serializers.FloatField(read_only=True)
    teacher_name = serializers.CharField(read_only=True)
    teacher_org_position = serializers.CharField(read_only=True)
    teacher_score_updated_at = serializers.DateTimeField(read_only=True)
    exam_committee = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = 'id', "code", 'full_name', 'first_name', 'last_name', 'score', 'lesson_name', 'lesson', 'type_score', 'insert_time', 'total_score', 'import_exam_score', 'group', 'lesson_year', 'lesson_season', 'lesson_kredit', 'teacher_name', 'teacher_org_position', 'teacher_score_updated_at', 'exam_committee'

    def get_full_name(self, obj):

        return obj.full_name()

    def get_lesson_name(self, obj):

        lesson_name = ''
        request = self.context.get("request")

        lesson = request.query_params.get('lesson')

        if lesson:
            lesson_obj = LessonStandart.objects.filter(id=lesson).first()

            if lesson_obj:
                lesson_name = lesson_obj.code_name

        return lesson_name

    def get_lesson(self, obj):

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')

        if lesson:
            lesson = int(lesson)

        return lesson

    def get_score(self, obj):
        student = obj.id
        score = ''

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year, season = get_active_year_season()

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        score_type = request.query_params.get('scoretype')

        if lesson:
            lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher).first()

            if score_type:
                score_type = Lesson_teacher_scoretype.objects.filter(lesson_teacher=lesson_teacher, score_type=score_type).first()

            score_obj_list = TeacherScore.objects.filter(student=student)

            if year:
                score_obj_list = score_obj_list.filter(lesson_year=year)

            if season:
                score_obj_list = score_obj_list.filter(lesson_season=season)

            # Дүнгийн задаргааны төрөл
            if score_type:
                score_obj_list = score_obj_list.filter(score_type=score_type)

            if score_obj_list:
                score = score_obj_list.first().score

        return score

    def get_type_score(self, obj):
        """ Тухайн дүнгийн задаргааны төрлийн дүгнэх оноо """

        score = ''

        request = self.context.get("request")

        lesson = request.query_params.get('lesson')

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        score_type = request.query_params.get('scoretype')

        if lesson and score_type:

            lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher).first()
            scoretype = Lesson_teacher_scoretype.objects.filter(lesson_teacher=lesson_teacher, score_type=score_type).first()

            # Дүнгийн задаргааны төрөл
            if scoretype:
                score = scoretype.score

        return score

    def get_insert_time(self, obj):
        """ Дүнгийн задаргааны дүн оруулах хугацааг шалгах """

        ptype= ''
        request = self.context.get("request")
        score_type = int(request.query_params.get('scoretype')) if request.query_params.get('scoretype') else ''

        insert_time = False

        # Сорил 1
        if score_type == Lesson_teacher_scoretype.QUIZ1:
            ptype = PermissionsOtherInterval.QUIZ1

        # Сорил 2
        elif score_type == Lesson_teacher_scoretype.QUIZ2:
            ptype = PermissionsOtherInterval.QUIZ2

        elif score_type == Lesson_teacher_scoretype.BUSAD:
            ptype = PermissionsOtherInterval.TEACHERSCORE

        if ptype:
            permission_times = PermissionsOtherInterval.objects.filter(permission_type=ptype).last()
            if permission_times:
                start  = permission_times.start_date
                finish_date  = permission_times.finish_date

                today = datetime.now()

                if start <= today and today <= finish_date:
                    insert_time = True

        return insert_time

    def get_total_score(self, obj):
        """ Багшаас нийт авсан оноо """

        total_score = 0
        student = obj.id

        request = self.context.get("request")
        lesson = request.query_params.get('lesson')
        year = request.query_params.get('year')
        season = request.query_params.get('season')

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        if lesson:

            lesson_teacher = Lesson_to_teacher.objects.filter(lesson=lesson, teacher=teacher).first()
            scoretypes = Lesson_teacher_scoretype.objects.filter(lesson_teacher=lesson_teacher).values_list('id', flat=True)

            # Дүнгийн задаргааны төрөл
            for stype in scoretypes:
                score_obj = TeacherScore.objects.filter(lesson_year=year, lesson_season=season, student=student, score_type=stype).first()

                if score_obj:
                    total_score += score_obj.score

        return total_score

    def get_import_exam_score(self, obj):
        """ Дүнгийн задаргааны дүн оруулах хугацааг шалгах """

        import_exam_score = False
        request = self.context.get("request")

        lesson = request.query_params.get('lesson')
        year = request.query_params.get('year')
        season = request.query_params.get('season')

        user = request.user
        teacher = Teachers.objects.filter(user_id=user).first()

        score = ScoreRegister.objects.filter(lesson_year=year, lesson_season=season, student=obj.id, lesson=lesson, teacher=teacher).first()

        exam_score = score.exam_score if score else ''

        if exam_score:
            import_exam_score = True

        return import_exam_score

    def get_exam_committee(self, obj):

        return self.context.get('exam_committee', [])

