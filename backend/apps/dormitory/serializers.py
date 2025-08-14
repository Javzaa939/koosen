import os
from rest_framework import serializers
from django.conf import settings
from main.utils.file import split_root_path
from django.db.models.fields.files import ImageFieldFile


import json
import calendar
from dateutil import relativedelta

from datetime import date

from django.db.models import Sum

from main.utils.function.utils import fix_format_date

# Create your tests here.
from lms.models import DormitoryRoom
from lms.models import DormitoryStudent
from lms.models import DormitoryPayment
from lms.models import DormitoryRoomType
from lms.models import DormitoryRoomFile
from lms.models import DormitoryOtherStudent
from lms.models import DormitoryFamilyContract
from lms.models import DormitoryEstimationFamily
from lms.models import Employee
from lms.models import OtherStudentInformation

from lms.models import DormitoryEstimationFamily, Payment

from core.models import Teachers
from core.models import User

from core.serializers import TeacherListSerializer

from student.serializers import StudentInfoSerializer


# Дотуур байрны төлбөрийн тохиргоо
class DormitoryPaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = DormitoryPayment
        fields = "__all__"


# Дотуур байрны өрөөний төрөл
class DormitoryRoomTypeSerializer(serializers.ModelSerializer):
    files = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = DormitoryRoomType
        fields = "__all__"

    def get_files(self, obj):

        id = obj.id
        files = []

        if settings.DEBUG:
            base_url = 'http://localhost:8000/files/'
        else:
            # TODO: domain
            base_url = 'http://student.utilitysolution.mn/files/'

        qs_list = DormitoryRoomFile.objects.filter(request=id)
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
                    'description': qs.description,
                    'file': path
                }

                files.append(data)

        return files

# Дотуур байрны өрөөний төрөл жагсаалт
class DormitoryRoomTypeListSerializer(serializers.ModelSerializer):
    rent_type_name = serializers.SerializerMethodField(read_only=True)
    # payment_room = DormitoryPaymentSerializer(many=False)
    payment_room = serializers.SerializerMethodField()

    class Meta:
        model = DormitoryRoomType
        exclude = "created_at", "updated_at"

    def get_rent_type_name(self, obj):
        rent_type_name = obj.get_rent_type_display()
        return rent_type_name

    def get_payment_room(self, obj):

        payment = DormitoryPayment.objects.all().filter(room_type=obj.id, is_ourstudent=True).values_list('payment', flat=True ).last()
        ransom = DormitoryPayment.objects.all().filter(room_type=obj.id).values_list('ransom', flat=True).last()

        payment = {
            'payment': payment,
            'ransom': ransom
        }

        return payment


# Өрөөний бүртгэлийн жагсаалт
class DormitoryRoomListSerializer(serializers.ModelSerializer):
    room_type = DormitoryRoomTypeListSerializer(many=False)

    class Meta:
        model = DormitoryRoom
        fields = "__all__"


# Өрөөний бүртгэл
class DormitoryRoomSerializer(serializers.ModelSerializer):

    class Meta:
        model = DormitoryRoom
        fields = "__all__"


# Амьдрах хүсэлт шийдвэрлэх
class DormitoryStudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = DormitoryStudent
        fields = "__all__"


class DormitoryStudentListSerializer(serializers.ModelSerializer):
    student = StudentInfoSerializer(many=False)
    room_type_name = serializers.CharField(source="room_type.name", default='')
    room_name = serializers.CharField(source="room.room_number", default='')
    solved_flag_name = serializers.SerializerMethodField()
    full_name = serializers.CharField(source="student.full_name", default='')
    school_name = serializers.CharField(source="student.school.name", default='')

    class Meta:
        model = DormitoryStudent
        fields = "__all__"

    def get_solved_flag_name(self, obj):

        solved_flag_name = obj.get_solved_flag_display()

        return solved_flag_name

class DormitoryOtherStudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = DormitoryOtherStudent
        fields = "__all__"


class DormitoryOtherStudentListSerializer(serializers.ModelSerializer):
    student = TeacherListSerializer(many=False)
    room_type_name = serializers.CharField(source="room_type.name", default='')
    room_name = serializers.CharField(source="room.room_number", default='')
    solved_flag_name = serializers.SerializerMethodField()
    full_name = serializers.CharField(source="student.full_name", default='')
    school_name = serializers.CharField(source="student.school.name", default='')

    class Meta:
        model = DormitoryOtherStudent
        fields = "__all__"

    def get_solved_flag_name(self, obj):

        solved_flag_name = obj.get_solved_flag_display()

        return solved_flag_name



class DormitoryPaymentListSerializer(serializers.ModelSerializer):
    room_type = DormitoryRoomTypeListSerializer(many=False)

    class Meta:
        model = DormitoryPayment
        fields = "__all__"


class TeacherSerializer(serializers.ModelSerializer):

    class Meta:
        model = Teachers
        fields = ['id', "full_name", "register"]


#  ---------------- Төлбөрийн тооцоо ----------------
class DormitoryStudentEstimateSerializer(serializers.ModelSerializer):
    student = StudentInfoSerializer(many=False)
    lastuld = serializers.SerializerMethodField()
    first_uld = serializers.SerializerMethodField()
    room_type_name = serializers.CharField(source="room_type.name", default='')
    room_name = serializers.CharField(source="room.room_number", default='')
    full_name = serializers.CharField(source="student.full_name", default='')

    class Meta:
        model = DormitoryStudent
        fields = "__all__"

    # Эцсийн үлдэгдэл
    def get_lastuld(self, obj):
        last_uldegdel = 0
        in_balance = obj.in_balance or 0            # Төлсөн төлбөр
        payment = obj.payment or 0                  # Төлөх төлбөрийн хэмжээ
        ransom = obj.ransom or 0                    # Барьцаа төлбөрийн хэмжээ
        out_balance = obj.out_balance or 0          # Буцаасан төлбөр
        out_payment = obj.out_payment or 0          # Буцаах төлбөр

        last_uldegdel = (payment + ransom) - out_payment
        last_uldegdel = in_balance - last_uldegdel - out_balance

        return last_uldegdel

    def get_first_uld(self, obj):
        last_uldegdel = 0
        first_uld = 0
        in_balance = obj.in_balance or 0            # Төлсөн төлбөр
        payment = obj.payment or 0                  # Төлөх төлбөрийн хэмжээ
        ransom = obj.ransom or 0                    # Барьцаа төлбөрийн хэмжээ
        out_balance = obj.out_balance or 0          # Буцаасан төлбөр

        last_uldegdel = in_balance - (payment + ransom) - out_balance

        if last_uldegdel > 0:
            first_uld = last_uldegdel

        return first_uld


# Гадны оюутан
class DormitoryOtherStudentEstimateSerializer(serializers.ModelSerializer):
    student = TeacherSerializer(many=False)
    room_type_name = serializers.CharField(source="room_type.name", default='')
    room_name = serializers.CharField(source="room.room_number", default='')
    lastuld = serializers.SerializerMethodField()
    total_out_payment = serializers.SerializerMethodField()

    class Meta:
        model = DormitoryOtherStudent
        fields = "__all__"

    # Эцсийн үлдэгдэл
    def get_lastuld(self, obj):
        last_uldegdel = 0
        in_balance = obj.in_balance or 0            # Төлсөн төлбөр
        payment = obj.payment or 0                  # Төлөх төлбөрийн хэмжээ
        ransom = obj.ransom or 0                    # Барьцаа төлбөрийн хэмжээ
        out_balance = obj.out_balance or 0          # Буцаасан төлбөр
        out_payment = obj.out_payment or 0          # Буцаах төлбөр

        last_uldegdel = (payment + ransom) - out_payment                # Нийт төлөх төлбөр
        last_uldegdel = in_balance - last_uldegdel - out_balance

        return last_uldegdel

    # Буцаах төлбөрийн хэмжээ
    def get_total_out_payment(self, obj):
        last_uldegdel = 0
        total_out_payment = 0
        in_balance = obj.in_balance or 0            # Төлсөн төлбөр
        payment = obj.payment or 0                  # Төлөх төлбөрийн хэмжээ
        ransom = obj.ransom or 0                    # Барьцаа төлбөрийн хэмжээ
        out_balance = obj.out_balance or 0          # Буцаасан төлбөр

        last_uldegdel = in_balance - (payment + ransom)

        if last_uldegdel > 0:
            total_out_payment = last_uldegdel

        return total_out_payment


# Сараар түрээслэгч
class DormitoryFamilyContractSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(many=False)

    class Meta:
        model = DormitoryFamilyContract
        fields = "__all__"

class DormitoryFamilyPostContractSerializer(serializers.ModelSerializer):

    class Meta:
        model = DormitoryFamilyContract
        fields = "__all__"


class DormitoryEstimationFamilySerializer(serializers.ModelSerializer):
    contract = DormitoryFamilyContractSerializer(many=False)
    days = serializers.SerializerMethodField()

    class Meta:
        model = DormitoryEstimationFamily
        fields = "__all__"

    def get_days(self, obj):
        days = 0
        cmonth = int(obj.month)
        cyear = int(obj.year)
        contract_id = obj.contract.id

        start_contract_qs = DormitoryFamilyContract.objects.filter(
                id=contract_id,
                solved_start_date__year=cyear,
                solved_start_date__month=cmonth,
            ).first()

        end_contract_qs = DormitoryFamilyContract.objects.filter(
                id=contract_id,
                solved_finish_date__year=cyear,
                solved_finish_date__month=cmonth,
            ).first()

        if start_contract_qs:
            start_date = start_contract_qs.solved_start_date
            end_date = start_contract_qs.solved_finish_date

            # Гэрээ эхлэх болон дуусах хугацаа
            start_day = int(start_date.strftime('%d'))
            end_day = int(end_date.strftime('%d'))

            # Хэдэн сарын гэрээ хийснийг олно
            delta = relativedelta.relativedelta(end_date, start_date)
            res_months = delta.months + (delta.years * 12)
            if res_months == 0:
                # 1 сарын гэрээ хийсэн үед өрөөнд байсан хоногийг тооцож авна
                days = end_day - start_day
            else:
                # Тухайн сарын хоног
                start_day_in_month = calendar.monthrange(int(cyear), int(cmonth))[1]
                days = start_day_in_month - start_day

        elif end_contract_qs:
            end_date = end_contract_qs.solved_finish_date

            # Гэрээ дуусах хугацаа
            days = int(end_date.strftime('%d'))

        else:
            days = calendar.monthrange(int(cyear), int(cmonth))[1]

        return days


class DormitoryFamilyContractsSerializer(serializers.ModelSerializer):

    class Meta:
        model = DormitoryFamilyContract
        fields = "__all__"


class DormitoryFamilyContractListSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(many=False)
    room_type_name = serializers.CharField(source="room_type.name", default='')
    room_name = serializers.CharField(source="room.room_number", default='')
    request_date = serializers.SerializerMethodField()

    class Meta:
        model = DormitoryFamilyContract
        fields = "__all__"

    def get_request_date(self, obj):

        fixed_date = fix_format_date(obj.request_date, format='%Y-%m-%d')
        return fixed_date


class OtherStudentInformationSerializer(serializers.ModelSerializer):

    class Meta:
        model = OtherStudentInformation
        fields = "__all__"


class NormalRegisterUserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teachers
        fields = "id", "last_name", "first_name", "action_status", "action_status_type", "user", "register", "gender"


class NormalRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = "id", "phone_number", "email", "password", "username"


class FamilyRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = "id", "phone_number", "email", "password", "username"

# ----------------------------------Дотуур байрны бараа материалын шаардах хуудас ------------------------------------

class  UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = "__all__"

# Ажилтан && user serializer
class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", default='')
    user = UserSerializer(many=False)

    class Meta:
        model = Employee
        fields = ["id", "user", "full_name", 'register_code', 'state']


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
