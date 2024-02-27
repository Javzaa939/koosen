from rest_framework import serializers

from lms.models import  (
    AdmissionRegister
)

class AdmissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionRegister
        fields = '__all__'