from rest_framework import serializers


from lms.models import ProfessionalDegree
from lms.models import Learning
from lms.models import StudentRegister
from lms.models import LessonCategory
from lms.models import LessonGroup
from lms.models import LessonLevel
from lms.models import LessonType
from lms.models import Season
from lms.models import Score
from lms.models import SystemSettings
from lms.models import ProfessionDefinition
from lms.models import AdmissionLesson
from lms.models import DiscountType
from lms.models import Country
from lms.models import DefinitionSignature

from core.models import Permissions
from core.models import Roles
from core.models import OrgPosition

from main.utils.function.utils import get_week_num_from_date

# Мэргэжлийн зэргийн serializer
class ProfessionalDegreeSerializer(serializers.ModelSerializer):

    degree_name_code = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProfessionalDegree
        fields = '__all__'

    def get_degree_name_code(self, obj):
        """ Зэргийн код нэр нэгтгэх """

        full_name = ''
        degree_name = obj.degree_name
        degree_code = obj.degree_code
        if degree_name:
            full_name += degree_name

        if degree_code:
            full_name = full_name + '' + '({degree_code})'.format(degree_code=degree_code)

        return full_name

class ProfessionalDegreePutSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfessionalDegree
        fields = '__all__'

# Суралцах хэлбэр serializer
class LearningSerializer(serializers.ModelSerializer):

    class Meta:
        model = Learning
        fields = "__all__"


# Оюутны бүртгэлийн хэлбэр serializer
class StudentRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentRegister
        fields = "__all__"

# Хичээлийн ангилал serializer
class LessonCategorySerializer(serializers.ModelSerializer):
    """ Хичээлийн ангилал """

    class Meta:
        model = LessonCategory
        fields = "__all__"

# Хичээлийн төрөл serializer
class LessonTypeSerailizer(serializers.ModelSerializer):

    class Meta:
        model = LessonType
        fields = "__all__"

# Хичээлийн түвшин serializer
class LessonLevelSerailizer(serializers.ModelSerializer):

    class Meta:
        model = LessonLevel
        fields = "__all__"

# Хичээлийн бүлэг serializer
class LessonGroupSerailizer(serializers.ModelSerializer):

    class Meta:
        model = LessonGroup
        fields = "__all__"


# Улирал serializer
class SeasonSerailizer(serializers.ModelSerializer):

    class Meta:
        model = Season
        fields = "__all__"


# Дүнгийн бүртгэл serializer
class ScoreSerailizer(serializers.ModelSerializer):

    class Meta:
        model = Score
        fields = "__all__"

# Дүнгийн бүртгэл serializer
class SystemSettingsSerailizer(serializers.ModelSerializer):

    active_season_name = serializers.CharField(source="active_lesson_season.season_name", default="")
    prev_season_name = serializers.CharField(source="prev_lesson_season.season_name", default="")

    active_week = serializers.SerializerMethodField()

    class Meta:
        model = SystemSettings
        fields = "__all__"

    def get_active_week(self, obj) :
        active_week = get_week_num_from_date()

        return active_week


# Идэвхитэй жилийн жагсаалт авах serializer
class SystemSettingsActiveYearSerailizer(serializers.ModelSerializer):

    season_name = serializers.CharField(source="active_lesson_season.season_name", default="")

    class Meta:
        model = SystemSettings
        fields = ["id", "active_lesson_year", "active_lesson_season", "season_name"]


# Мэргэжил serializer
class ProfessionalDefinitionListSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfessionDefinition
        fields = "__all__"


# Боловсролын зэргийн serializer
class ProfessionalDegreeListSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfessionalDegree
        fields = "__all__"


# Суралцах хэлбэр serializer
class LearningListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Learning
        fields = "__all__"

# ------------- ЭЕШ-ын хичээл -------------

class AdmissionLessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionLesson
        fields = "__all__"

# ЭЕШ-ын хичээлийн жагсаалт
class AdmissionLessonListSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdmissionLesson
        exclude = "created_at", "updated_at"

# ------------- Төлбөрийн хөнгөлөлтийн төрөл -------------

class DiscountTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = DiscountType
        fields = "__all__"

# Төлбөрийн хөнгөлөлтийн төрлийн жагсаалт
class DiscountTypeListSerializer(serializers.ModelSerializer):

    class Meta:
        model = DiscountType
        exclude = "created_at", "updated_at"


# улсын нэр жагсаалт
class CountrySerializer(serializers.ModelSerializer):

    class Meta:
        model = Country
        fields = "__all__"


class DefinitionSignatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = DefinitionSignature
        fields = "__all__"


class PermissionsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permissions
        fields = "__all__"


class RolesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Roles
        fields = "__all__"


class RolesListSerializer(serializers.ModelSerializer):

    permissions = serializers.SerializerMethodField()
    positions = serializers.SerializerMethodField()

    class Meta:
        model = Roles
        fields = "__all__"

    def get_permissions(self, obj):

        permissions = obj.permissions.filter(name__startswith='lms-').values_list('id', flat=True)
        return list(permissions)

    def get_positions(self, obj):

        org_pos_ids = OrgPosition.objects.filter(roles__in=[obj.id]).values_list('id', flat=True).distinct()

        return list(org_pos_ids)
