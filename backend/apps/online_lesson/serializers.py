from rest_framework import serializers
from lms.models import OnlineLesson, LessonMaterial

class OnlineLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineLesson
        fields = '__all__'

class LessonMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonMaterial
        fields = '__all__'
