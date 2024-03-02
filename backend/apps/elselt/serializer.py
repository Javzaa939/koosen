from rest_framework import serializers

from lms.models import  (
    AdmissionRegister,
    AdmissionRegisterProfession,
    AdmissionIndicator,
    AdmissionXyanaltToo
)

from elselt.models import (
    ContactInfo,
    AdmissionUserProfession,
    ElseltUser,
    UserInfo
)

class AdmissionSerializer(serializers.ModelSerializer):
    degree_name = serializers.CharField(source='degree.degree_name', default='')

    class Meta:
        model = AdmissionRegister
        fields = '__all__'

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
    full_name = serializers.CharField(source='user.full_name', default='')
    profession = serializers.CharField(source='profession.profession.name', default='')
    gender_name = serializers.SerializerMethodField()
    state_name = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionUserProfession
        fields = '__all__'


    def get_userinfo(self, obj):

        data = UserInfo.objects.filter(user=obj.user).first()
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