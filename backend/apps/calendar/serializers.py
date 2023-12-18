from rest_framework import serializers

from lms.models import LearningCalendar
from main.utils.function.utils import fix_format_date


class LearningCalendarListeSerializer(serializers.ModelSerializer):
    '''  Сургалтын хуанлийн жагсаалт '''

    class Meta:
        model = LearningCalendar
        fields = "__all__"



class LearningCalVolentoorSerializer(serializers.ModelSerializer):
    '''  Сургалтын хуанлийн жагсаалтын олон нийтийн ажил '''

    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()

    class Meta:
        model = LearningCalendar
        fields = "__all__"

    def get_start(self, obj):

        start_date = fix_format_date(obj.start)
        return start_date

    def get_end(self, obj):

        end_date = fix_format_date(obj.end)
        return end_date
