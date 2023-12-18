import datetime
from rest_framework import serializers

from lms.models import PaymentSettings
from lms.models import PaymentBalance
from lms.models import PaymentBeginBalance
from lms.models import PaymentEstimate
from lms.models import PaymentDiscount
from lms.models import PaymentSeasonClosing

from core.serializers import SubschoolSerailizer
from apps.settings.serializers import SeasonSerailizer
from apps.student.serializers import StudentListSerializer
from apps.student.serializers import GroupListSerializer
from student.serializers import StudentListSerializer
from settings.serializers import DiscountTypeListSerializer


class BeginBalanceSerializer(serializers.ModelSerializer):
    # Сургалтын төлбөрийн эхний үлдэгдэл

    class Meta:
        model = PaymentBeginBalance
        fields = "__all__"


class BeginBalanceListSerializer(serializers.ModelSerializer):
    # Сургалтын төлбөрийн эхний үлдэгдэл жагсаалт

    lesson_season = SeasonSerailizer(many=False, read_only=True)
    student = StudentListSerializer(many=False, read_only=True)
    first_balance_iluu = serializers.SerializerMethodField()
    first_balance_dutuu = serializers.SerializerMethodField()

    class Meta:
        model = PaymentBeginBalance
        fields = "id", "student", "first_balance_iluu", "lesson_year", "lesson_season", "first_balance_dutuu", "first_balance"

    def get_first_balance_iluu(self,obj):

        first_uld = 0
        if obj.first_balance:
            if obj.first_balance>0:
                first_uld = obj.first_balance

        return first_uld

    def get_first_balance_dutuu(self,obj):

        first_uld = 0
        if obj.first_balance:
            if obj.first_balance < 0:
                first_uld = obj.first_balance

        return first_uld
class PaymentBalanceSerializer(serializers.ModelSerializer):
    # Сургалтын төлбөрийн гүйлгээ

    class Meta:
        model = PaymentBalance
        fields = "__all__"


class PaymentBalanceListSerializer(serializers.ModelSerializer):
    # Сургалтын төлбөрийн гүйлгээ жагсаалт

    student = StudentListSerializer(many=False, read_only=True)

    class Meta:
        model = PaymentBalance
        fields = "id", "student", "balance_amount", "balance_date", "balance_desc", "flag"


# --------------------- PaymentSetting -------------------

# Сургалтын төлбөрийн тохиргоо
class PaymentSettingSerializer(serializers.ModelSerializer):
    # is_closed = serializers.SerializerMethodField()

    class Meta:
        model = PaymentSettings
        fields = '__all__'


# Сургалтын төлбөрийн тохиргоо жагсаалт
class PaymentSettingListSerializer(serializers.ModelSerializer):
    group = GroupListSerializer(many=False, read_only=True)
    lesson_season = SeasonSerailizer(many=False, read_only=True)
    school = SubschoolSerailizer(many=False, read_only=True)

    class Meta:
        model = PaymentSettings
        fields = "id", "group", "lesson_season", "payment","school", "created_user", "updated_user", "lesson_year"


    def get_lesson_year(self, obj):
        less_year = obj.lesson_year

        year = datetime.datetime.strftime(less_year, "%Y")
        return str(year)


# Сургалтын төлбөрийн тооцоо жагсаалт
class PaymentEstimateListSerializer(serializers.ModelSerializer):

    student = StudentListSerializer(many=False, read_only=True)
    first_balance_iluu = serializers.SerializerMethodField()
    first_balance_dutuu = serializers.SerializerMethodField()
    last_balance_iluu = serializers.SerializerMethodField()
    last_balance_dutuu = serializers.SerializerMethodField()

    class Meta:
        model = PaymentEstimate
        fields = "id", "student", "kredit", "first_balance", "payment", "discount", "in_balance", "out_balance", "last_balance", "first_balance_iluu", "first_balance_dutuu", "last_balance_iluu", "last_balance_dutuu"

    def get_first_balance_iluu(self, obj):

        first_uld = 0
        if obj.first_balance:
            if obj.first_balance > 0:
                first_uld = obj.first_balance

        return first_uld

    def get_first_balance_dutuu(self, obj):

        first_uld = 0
        if obj.first_balance:
            if obj.first_balance < 0:
                first_uld = obj.first_balance

        return first_uld

    def get_last_balance_iluu(self, obj):

        last_uld_iluu = 0
        if obj.last_balance:
            if obj.last_balance > 0:
                last_uld_iluu = obj.last_balance

        return last_uld_iluu

    def get_last_balance_dutuu(self, obj):

        last_uld_dutuu = 0
        if obj.last_balance:
            if obj.last_balance < 0:
                last_uld_dutuu = obj.last_balance

        return last_uld_dutuu

# Төлбөрийн хөнгөлөлт
class PaymentDiscountSerializer(serializers.ModelSerializer):

    class Meta:
        model = PaymentDiscount
        fields = "__all__"

class PaymentDiscountListSerializer(serializers.ModelSerializer):
    student = StudentListSerializer(many=False)
    stipent_type = DiscountTypeListSerializer(many=False)

    class Meta:
        model = PaymentDiscount
        fields = [ "id", "student", "stipent_type", "discount"]
