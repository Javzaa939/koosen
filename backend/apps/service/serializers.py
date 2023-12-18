from rest_framework import serializers

from lms.models import StudentNotice
from lms.models import Teachers

from main.utils.function.utils import fix_format_date

# Зар мэдээлэл
class StudentNoticeSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentNotice
        fields = "__all__"


class StudentNoticeListSerializer(serializers.ModelSerializer):

    created_at = serializers.SerializerMethodField()
    created_user_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentNotice
        fields = "__all__"

    def get_created_at(self, obj):

        fixed_date = fix_format_date(obj.created_at)
        return fixed_date

    def get_created_user_name(self, obj):

        user_name = ""
        teacher = Teachers.objects.filter(user=obj.created_user).values('first_name', 'last_name').first()
        if teacher:
            last_name = teacher["last_name"]
            if last_name:
                user_name = last_name
            first_name = teacher["first_name"]
            if first_name:
                user_name = user_name + ' ' + first_name
        return user_name

