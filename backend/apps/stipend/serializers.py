import os

from datetime import date

from django.conf import settings

from django.db.models.fields.files import ImageFieldFile

from main.utils.file import split_root_path

from rest_framework import serializers

from lms.models import Stipend
from lms.models import StipentStudent
from lms.models import StipentStudentFile
from lms.models import DiscountType
from lms.models import Student

from ..student.serializers import StudentListSerializer


# --------------------- Тэтгэлэг төрөл ----------------------
class DiscountTypeListSerializer(serializers.ModelSerializer):

    class Meta:

        model = DiscountType
        fields = "id", "name", "code"


# --------------------- Тэтгэлэг бүртгэл ----------------------
class StipendSerializer(serializers.ModelSerializer):

    class Meta:
        model = Stipend
        fields = "__all__"


class StipendListSerializer(serializers.ModelSerializer):

    stipend_type = DiscountTypeListSerializer(many=False, read_only=True)

    class Meta:
        model = Stipend
        fields = "__all__"


class StipendStudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = StipentStudent
        fields = "__all__"


class StipendStudentListSerializer(serializers.ModelSerializer):

    stipent = StipendListSerializer(many=False)
    check_stipend = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField(read_only=True)
    student = StudentListSerializer(many=False, read_only=True)

    class Meta:
        model = StipentStudent
        fields = "__all__"

    def get_check_stipend(self, obj):
        " Тэтгэлгийн хугацаа дууссан эсэх "

        stipent_id = obj.stipent.id
        now_date = date.today()

        check_stipend = True

        qs = Stipend.objects.filter(
            id=stipent_id,
            start_date__lte=now_date,
            finish_date__gte=now_date,
            is_open=True
        )

        if not qs:
            check_stipend = False

        return check_stipend

    def get_files(self, obj):

        id = obj.id
        files = []

        if settings.DEBUG:
            base_url = 'http://localhost:8000/files/'
        else:
            # TODO: domain
            base_url = 'http://student.utilitysolution.mn/files/'

        qs_list = StipentStudentFile.objects.filter(request=id)
        if qs_list:
            for qs in qs_list:
                if isinstance(qs.file, ImageFieldFile):
                    try:
                        path = split_root_path(qs.file.path)
                        path = os.path.join(base_url, path)

                    except ValueError:
                        return files

                data = {
                    'id': qs.id,
                    'file': path
                }

                files.append(data)

        return files


class StatisticsInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Student
        fields = "__all__"
