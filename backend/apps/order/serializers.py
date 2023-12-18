from rest_framework import serializers

from main.utils.function.utils import time_tango, get_fullName

from lms.models import StudentOrderSport
from lms.models import Student
from lms.models import GymPaymentSettings
from lms.models import StudentGym
from lms.models import StudentOnlinePayment

from lms.models import StudentOrderLibrary

from lms.models import StudentOrderHospital


# Спорт заалны цаг
class StudentOrderSportSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentOrderSport
        fields = "__all__"


class StudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "code", 'full_name']

    def get_full_name(self, obj):

        first_name = obj.first_name
        last_name = obj.last_name
        full_name = get_fullName(last_name, first_name, is_strim_first=True)

        return full_name


class StudentOrderSportListSerializer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    eventId = serializers.CharField(source='id', default='')
    start = serializers.SerializerMethodField(read_only=True)
    end = serializers.SerializerMethodField(read_only=True)
    color = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StudentOrderSport
        fields = "__all__"

    def get_start(self, obj):
        start = ''
        day = obj.day
        starttime = obj.starttime

        start = time_tango(day, starttime)

        return start

    def get_end(self, obj):
        end = ''
        day = obj.day
        endtime = obj.endtime

        end = time_tango(day, endtime)

        return end

    def get_color(self, obj):
        color = '#3399ff'
        order_flag = obj.order_flag

        if order_flag == StudentOrderSport.ORDERED:
            color = '#ff3300'
        elif order_flag == StudentOrderSport.COMFIRM:
            color = '#33cc33'
        return color


# -------------------- Эмнэлэг -------------------------
class StudentOrderHospitalSerializer(serializers.ModelSerializer):
    ''' Эмнэлэгт цаг захиалсан оюутны жагсаалт '''

    student = StudentListSerializer(many=False)

    class Meta:
        model = StudentOrderHospital
        fields = "__all__"


# ------------------------ Бялдаржуулах төв --------------------------

class GymPaymentSettingsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = GymPaymentSettings
        fields = ["id", "name", 'payment']


class GymPaymentSettingsSerializer(serializers.ModelSerializer):
    ''' Фитнесийн төлбөрийн тохиргоо '''

    class Meta:
        model = GymPaymentSettings
        fields = "__all__"


class StudentGymSerializer(serializers.ModelSerializer):
    ''' Фитнест бүртгүүлсэн оюутны жагсаалт '''
    student = StudentListSerializer(many=False)
    gym_payment = GymPaymentSettingsListSerializer(many=False)
    payment = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StudentGym
        fields = "__all__"

    def get_payment(self, obj):
        return_datas = ''

        qs = StudentOnlinePayment.objects.filter(
            student=obj.student,
            dedication=StudentOnlinePayment.GYM
        ).first()

        if qs:
            return_datas = qs.payment

        return return_datas


# -------------- Номын сан ------------------
class StudentOrderLibrarySerializer(serializers.ModelSerializer):
    ''' Номын санд цаг захиалсан оюутны жагсаалт '''

    student = StudentListSerializer(many=False)
    room_name = serializers.CharField(source="room.name", default='')

    class Meta:
        model = StudentOrderLibrary
        fields = "__all__"
