from rest_framework import serializers

from lms.models import  (
    AdmissionRegister,
    AdmissionRegisterProfession,
    AdmissionIndicator,
    AdmissionXyanaltToo,
    ProfessionalDegree
)

from elselt.models import (
    ContactInfo,
    AdmissionUserProfession,
    ElseltUser,
    UserInfo,
    EmailInfo,
    HealthUser
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


class AdmissionUserInfoSerializer(serializers.ModelSerializer):
    user = ElseltUserSerializer(many=False, read_only=True)
    userinfo = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='user.full_name', default='', read_only=True)
    profession = serializers.CharField(source='profession.profession.name', default='')
    degree_code = serializers.CharField(source='profession.profession.degree.degree_code', default='')
    degree_name = serializers.CharField(source='profession.profession.degree.degree_name', default='')
    gender_name = serializers.SerializerMethodField()
    state_name = serializers.SerializerMethodField()
    admission = serializers.IntegerField(source='profession.admission.id', default='')

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'


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
    user = ElseltUserSerializer(many=False, read_only=True)

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
