from rest_framework import serializers

from lms.models import  (
    AdmissionRegister,
    ContactInfo
)

class AdmissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionRegister
        fields = '__all__'


class ElseltSysInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = ContactInfo
        fields = '__all__'