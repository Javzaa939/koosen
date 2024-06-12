from rest_framework import serializers
from django.db.models import Q, Func,F, IntegerField, CharField
from django.db.models.functions import Cast
from datetime import datetime

from lms.models import  (
    AdmissionRegister,
    AdmissionRegisterProfession,
    AdmissionIndicator,
    AdmissionXyanaltToo,
    AdmissionBottomScore,
    ProfessionalDegree
)

from elselt.models import (
    ContactInfo,
    AdmissionUserProfession,
    ElseltUser,
    UserInfo,
    MessageInfo,
    EmailInfo,
    HealthUser,
    HealthUpUser,
    PhysqueUser,
    UserScore
)

from surgalt.serializers import (
    ProfessionDefinitionSerializer
)

class AdmissionSerializer(serializers.ModelSerializer):
    degree_name = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionRegister
        fields = '__all__'

    def get_degree_name(self, obj):
        degrees = obj.degrees
        degree_names = ''

        if degrees:
            names = ProfessionalDegree.objects.filter(id__in=degrees).values_list('degree_name', flat=True)
            degree_names = ', '.join(names)

        return degree_names

class AdmissionPostSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionRegister
        fields = '__all__'


class ElseltSysInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = ContactInfo
        fields = '__all__'

class AdmissionProfessionSerializer(serializers.ModelSerializer):
    shalguur_ids = serializers.SerializerMethodField()
    nas = serializers.SerializerMethodField()
    hynalt_too = serializers.SerializerMethodField()
    class Meta:
        model = AdmissionRegisterProfession
        fields = '__all__'

    def get_shalguur_ids(self, obj):
        value_ids = AdmissionIndicator.objects.filter(admission_prof=obj).values_list('value', flat=True)

        return list(value_ids)

    def get_nas(self, obj):
        indicator = AdmissionIndicator.objects.filter(admission_prof=obj, value=AdmissionIndicator.NAS).first()
        return {
            'limit_min': indicator.limit_min if indicator else '',
            'limit_mах': indicator.limit_mах if indicator else '',
        }

    def get_hynalt_too(self, obj):
        indicator = AdmissionIndicator.objects.filter(admission_prof=obj, value=AdmissionIndicator.XYANALTIIN_TOO).first()
        hynalt_too = AdmissionXyanaltToo.objects.filter(indicator=indicator).first()
        return {
            'norm_all': hynalt_too.norm_all if hynalt_too else '',
            'norm1': hynalt_too.norm1 if hynalt_too else '',
            'norm2': hynalt_too.norm2 if hynalt_too else '',
        }


class AdmissionActiveProfession(serializers.ModelSerializer):

    prof_id = serializers.CharField(source="profession.id")
    name = serializers.CharField(source="profession.name")

    class Meta:
        model = AdmissionRegisterProfession
        fields = 'id', 'prof_id', 'name'


class UserinfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserInfo
        fields = "__all__"

class ElseltUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = ElseltUser
        exclude = ['password']


class UserScoreSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserScore
        fields = "__all__"


class AdmissionUserInfoSerializer(serializers.ModelSerializer):
    # user = ElseltUserSerializer(many=False, read_only=True)
    user = serializers.SerializerMethodField()
    userinfo = serializers.SerializerMethodField()
    user_score = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    profession = serializers.CharField(source='profession.profession.name', default='')
    degree_code = serializers.CharField(source='profession.profession.degree.degree_code', default='')
    degree_name = serializers.CharField(source='profession.profession.degree.degree_name', default='')
    gender_name = serializers.SerializerMethodField()
    state_name = serializers.SerializerMethodField()
    admission = serializers.IntegerField(source='profession.admission.id', default='')
    # Элсэлтийн мэргэжлийн төрөл
    profession_state = serializers.IntegerField(source='profession.state', default='')
    user_age = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'

    def get_user(self, obj):

        data = ElseltUser.objects.filter(id=obj.user.id).first()
        userinfo_data = ElseltUserSerializer(data).data

        return userinfo_data

    def get_user_score(self, obj):

        all_datas = []
        user_score_qs = UserScore.objects.filter(user=obj.user.id)

        # ЭЕШ оноогүй хэрэглэгчид хоосон дата буцаав
        if len(user_score_qs) == 0:
            return all_datas

        # Элсэгчийн ЭЕШ-н оноог он улирлаар нь груп хийв
        user_scores_year = user_score_qs.annotate(
            cyear=Func(
                Cast(F('year'), output_field=CharField()),
                function='LEFT',
                template="%(function)s(%(expressions)s, 4)"
            )
        ).distinct('cyear', 'semester').order_by('cyear', 'semester').values('cyear', 'semester')

        # Элсэгчийн ЭЕШ-н он оноор нь хичээлүүдийн оноог авах
        for score_year in list(user_scores_year):
            year = score_year.get('cyear')      # ЭЕШ өгсөн он
            season = score_year.get('semester') # ЭЕШ өгсөн улирал
            lessons = user_score_qs.filter(year__contains=year, semester=season).values('lesson_name', 'scaledScore', 'raw_score').order_by('-scaledScore')
            all_datas.append(
                {
                    'year': year,
                    'season_name': season,
                    'scores': list(lessons)
                }
            )

        return all_datas

    def get_userinfo(self, obj):

        data = UserInfo.objects.filter(user=obj.user.id).first()
        userinfo_data = UserinfoSerializer(data).data

        return userinfo_data

    def get_gender_name(self, obj):

        gender = obj.gender

        if gender.isnumeric():
            if (int(obj.gender)%2) != 0:
                return 'Эрэгтэй'
            return 'Эмэгтэй'
        return ''


    def get_state_name(self, obj):

        state_name = ''
        state_op = [*AdmissionUserProfession.STATE]
        for state in state_op:
            if state[0] == obj.state:
                state_name = state[1]
                return state_name
        return state_name

    # Насыг олж насны шалгуурт тэнцсэн эсэх
    def get_user_age(self, obj):
        register = obj.user.register
        birth_year = int(register[2:4])
        current_year = datetime.now().year

        # насыг тухайн жилээс төрсөн оныг нь хасаж тооцсон
        user_age = current_year - (1900 + birth_year if birth_year > current_year % 100 else 2000 + birth_year)

        # Тухайн сургуулийн насны шалгуурыг олох
        indicator = AdmissionIndicator.objects.filter(admission_prof=obj.profession, value=AdmissionIndicator.NAS).first()
        if indicator:
            if indicator.limit_min < user_age < indicator.limit_mах:
                obj.age_state = 2
                obj.state = 2
                obj.age_description = None
            else:
                obj.age_state = 3
                obj.state = 3
                obj.age_description = "НАС шалгуурын болзолыг хангаагүй улмаас тэнцсэнгүй"
        else:
            obj.age_state = 2
            obj.age_description = None
        obj.save()

        return user_age

class AdmissionUserProfessionSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'


class EmailInfoSerializer(serializers.ModelSerializer):
    user = ElseltUserSerializer(many=False, read_only=True)
    state_name = serializers.SerializerMethodField()
    gender_name = serializers.SerializerMethodField()
    userinfo = serializers.SerializerMethodField()

    class Meta:
        model = EmailInfo
        fields = '__all__'

    def get_state_name(self, obj):

        user_id = obj.user
        state_data = AdmissionUserProfession.objects.filter(user=user_id).first()

        state_name = ''
        state_op = [*AdmissionUserProfession.STATE]
        for state in state_op:
            if state[0] == state_data.state:
                state_name = state

        admission_id = state_data.profession.admission.id if state_data.profession.admission else ''
        profession_name = state_data.profession.profession.name if state_data.profession.profession else ''

        data = {
            'state': state_name[0],
            'state_name': state_name[1],
            'admission_id': admission_id,
            'profession_name': profession_name
        }

        return data


    def get_gender_name(self, obj):

        gender = obj.gender

        if gender.isnumeric():
            if (int(obj.gender)%2) != 0:
                return 'Эрэгтэй'
            return 'Эмэгтэй'
        return ''


    def get_userinfo(self, obj):

        data = UserInfo.objects.filter(user=obj.user.id).first()
        userinfo_data = UserinfoSerializer(data).data

        return userinfo_data


class HealthUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = HealthUser
        fields = '__all__'


class HealthUserDataSerializer(serializers.ModelSerializer):
    user_register = serializers.CharField(source='user.register', default='', read_only=True)
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    gender_name = serializers.SerializerMethodField()
    health_user_data = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'


    def get_gender_name(self, obj):

        gender = obj.gender

        if gender.isnumeric():
            if (int(obj.gender)%2) != 0:
                return 'Эрэгтэй'
            return 'Эмэгтэй'
        return ''


    def get_health_user_data(self, obj):

        health_user_data = None

        user_data = HealthUser.objects.filter(user=obj.user).first()

        if user_data:
            health_user_data = HealthUserSerializer(user_data).data

        return health_user_data


class HealthUpUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = HealthUpUser
        fields = '__all__'


class HealthUpUserInfoSerializer(serializers.ModelSerializer):
    user_register = serializers.CharField(source='user.register', default='', read_only=True)
    user = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    gender_name = serializers.SerializerMethodField()
    health_up_user_data = serializers.SerializerMethodField()

    class Meta:
        model = HealthUser
        fields = '__all__'

    def get_user(self, obj):

        data = ElseltUser.objects.filter(id=obj.user.id).first()
        userinfo_data = ElseltUserSerializer(data).data

        return userinfo_data

    def get_gender_name(self, obj):

        gender = obj.gender

        if gender.isnumeric():
            if (int(obj.gender)%2) != 0:
                return 'Эрэгтэй'
            return 'Эмэгтэй'
        return ''


    def get_health_up_user_data(self, obj):

        health_user_data = None

        user_data = HealthUpUser.objects.filter(user=obj.user).first()

        if user_data:
            health_user_data = HealthUpUserSerializer(user_data).data

        return health_user_data

class PhysqueUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = PhysqueUser
        fields = '__all__'


class HealthPhysicalUserInfoSerializer(serializers.ModelSerializer):
    user_register = serializers.CharField(source='user.register', default='', read_only=True)
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    gender_name = serializers.SerializerMethodField()
    health_up_user_data = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'


    def get_gender_name(self, obj):

        gender = obj.gender

        if gender.isnumeric():
            if (int(obj.gender)%2) != 0:
                return 'Эрэгтэй'
            return 'Эмэгтэй'
        return ''


    def get_health_up_user_data(self, obj):

        health_user_data = None

        user_data = PhysqueUser.objects.filter(user=obj.user).first()

        if user_data:
            health_user_data = PhysqueUserSerializer(user_data).data

        return health_user_data


class AdmissionRegisterProfessionSerializer(serializers.ModelSerializer):
    ""
    profession = ProfessionDefinitionSerializer(many=False)

    class Meta:
        model = AdmissionRegisterProfession
        fields = '__all__'

class ElseltApproveSerializer(serializers.ModelSerializer):
    " тэнцсэн элсэгчид авах "

    profession = AdmissionRegisterProfessionSerializer(many=False)
    user = ElseltUserSerializer(many=False)

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'


class GpaCheckUserInfoSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    userinfo = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    profession = serializers.CharField(source='profession.profession.name', default='')
    admission = serializers.IntegerField(source='profession.admission.id', default='')
    # Элсэлтийн мэргэжлийн төрөл
    profession_state = serializers.IntegerField(source='profession.state', default='')

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'

    def get_user(self, obj):

        data = ElseltUser.objects.filter(id=obj.user.id).first()
        userinfo_data = ElseltUserSerializer(data).data

        return userinfo_data

    def get_userinfo(self, obj):

        data = UserInfo.objects.filter(user=obj.user.id).first()
        userinfo_data = UserinfoSerializer(data).data

        return userinfo_data

class GpaCheckConfirmUserInfoSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    userinfo = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    profession = serializers.CharField(source='profession.profession.name', default='')
    admission = serializers.IntegerField(source='profession.admission.id', default='')
    # Элсэлтийн мэргэжлийн төрөл
    profession_state = serializers.IntegerField(source='profession.state', default='')

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'

    def get_user(self, obj):

        data = ElseltUser.objects.filter(id=obj.user.id).first()
        userinfo_data = ElseltUserSerializer(data).data

        return userinfo_data

    def get_userinfo(self, obj):

        data = UserInfo.objects.filter(user=obj.user.id).first()
        userinfo_data = UserinfoSerializer(data).data

        return userinfo_data


class EyeshCheckUserInfoSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()
    userinfo = serializers.SerializerMethodField()
    user_score = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    profession = serializers.CharField(source='profession.profession.name', default='')
    admission = serializers.IntegerField(source='profession.admission.id', default='')
    # Элсэлтийн мэргэжлийн төрөл
    profession_state = serializers.IntegerField(source='profession.state', default='')
    eesh_check = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'

    def get_user(self, obj):

        data = ElseltUser.objects.filter(id=obj.user.id).first()
        userinfo_data = ElseltUserSerializer(data).data

        return userinfo_data

    def get_user_score(self, obj):

        all_datas = []
        user_score_qs = UserScore.objects.filter(user=obj.user.id)

        # ЭЕШ оноогүй хэрэглэгчид хоосон дата буцаав
        if len(user_score_qs) == 0:
            return all_datas

        # Элсэгчийн ЭЕШ-н оноог он улирлаар нь груп хийв
        user_scores_year = user_score_qs.annotate(
            cyear=Func(
                Cast(F('year'), output_field=CharField()),
                function='LEFT',
                template="%(function)s(%(expressions)s, 4)"
            )
        ).distinct('cyear', 'semester').order_by('cyear', 'semester').values('cyear', 'semester')

        # Элсэгчийн ЭЕШ-н он оноор нь хичээлүүдийн оноог авах
        for score_year in list(user_scores_year):
            year = score_year.get('cyear')      # ЭЕШ өгсөн он
            season = score_year.get('semester') # ЭЕШ өгсөн улирал
            lessons = user_score_qs.filter(year__contains=year, semester=season).values('lesson_name', 'scaledScore', 'raw_score').order_by('-scaledScore')
            all_datas.append(
                {
                    'year': year,
                    'season_name': season,
                    'scores': list(lessons)
                }
            )

        return all_datas

    def get_userinfo(self, obj):

        data = UserInfo.objects.filter(user=obj.user.id).first()
        userinfo_data = UserinfoSerializer(data).data

        return userinfo_data

    # ЭЕШ ийн оноо босго оноо давсанг шалгах
    # NOTE ЭЕШ оноо хадгалж байгаа модел өөрчлөгдөх үел дахин сайжруулах
    def get_eesh_check(self, obj):
        check_score_query = AdmissionBottomScore.objects.filter(profession=obj.profession_id).values('bottom_score')

        # Тухайн сургуулийн босго оноо
        check_score = check_score_query[0]['bottom_score'] if check_score_query.exists() else 400

        # Бүртгүүлэгчийн ЭЕШ ийн оноо
        user_scores = self.get_user_score(obj)
        avg_scaled_score = []

        # NOTE Тухайн элсэгч нэг хичээлээр олон ЭШ өгсөн бол Хамгийн өндөр оноогоор шалгах
        # Одоогийн бодолт нь буруу
        # Тухайн мэргэжлийн суурь шалгалтын хичээлээр нь оноог нь шалгах
        if user_scores:
            sum_scaled_scores = 0
            count_scores = 0
            for scores in user_scores:
                for score in scores['scores']:
                    sum_scaled_scores += score['scaledScore']
                    count_scores += 1

            # Дундаж оноо
            avg_scaled_score = sum_scaled_scores / count_scores if count_scores > 0 else 0

            # Төлөв өөрчлөх
            if avg_scaled_score <= check_score:
                    obj.gpa_state = 3
                    obj.gpa_definition = 'ЭЕШ ийн оноо босго оноонд хүрэхгүй байна'
                    obj.state = 3
            else:
                    obj.gpa_state = 2
                    obj.gpa_definition = None
            obj.save()

        return avg_scaled_score or 0