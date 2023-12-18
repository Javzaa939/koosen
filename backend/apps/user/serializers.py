from rest_framework import serializers

from core.models import User
from core.models import Employee
from core.models import Permissions
from core.models import Teachers
from core.models import SubSchools

class UserListSerializer(serializers.ModelSerializer):
    """ Хэрэглэгчийн жагсаалтыг харуулах serializer """

    class Meta:
        model = User
        fields = "id", "username", "last_name", "first_name", "is_superuser", "date_joined"


class UserInfoSerializer(serializers.ModelSerializer):
    """ Хэрэглэгчийн дэлгэрэнгүйг харуулах serializer"""

    school_id = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()
    position_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "real_photo", "username", "email", "is_active", "is_superuser", "phone_number", "school_id", "permissions", "full_name", "position", "position_id"]#

    def get_full_name(self, obj):

        full_name = obj.first_name
        user_id = obj.id
        user_info = Teachers.objects.filter(user=user_id, action_status=Teachers.APPROVED).first()

        if user_info:
            full_name = user_info.last_name.upper()[0] + '. ' + user_info.first_name

        return full_name

    def get_position(self, obj):
        position_name = ''
        user_id = obj.id

        org = Employee.objects.filter(user=user_id, state=Employee.STATE_WORKING).first()

        if org and org.org_position:
            position_name = org.org_position.name

        return position_name

    def get_position_id(self, obj):

        position_id = 0

        user_id = obj.id
        org = Employee.objects.filter(user=user_id, state=Employee.STATE_WORKING).first()

        if org and org.org_position:
            position_id = org.org_position.id

        return position_id

    def get_school_id(self, obj):

        school = ''
        user_id = obj.id
        emp_list = Employee.objects.filter(user=user_id, state=Employee.STATE_WORKING).first()
        if emp_list and emp_list.sub_org:
            school = emp_list.sub_org.id
        if school:
            school_info = SubSchools.objects.filter(id=school, is_school=False).first()
            if school_info:
                school = ''

        return school

    def get_permissions(self, obj):

        user_id = obj.id
        emp_list = Employee.objects.filter(user=user_id, state=Employee.STATE_WORKING).first()

        permissions = []

        if emp_list:
            if obj.is_superuser:
                permissions = list(Permissions.objects.all().filter(name__startswith='lms').values_list('name', flat=True))

            #  super user биш үед л эрх ашиглана
            else:
                permissions = list(emp_list.org_position.roles.values_list("permissions__name", flat=True))
                removed_perms = list(emp_list.org_position.removed_perms.values_list("name", flat=True))
                permissions = permissions + list(emp_list.org_position.permissions.values_list("name", flat=True))

                removed_perms = set(removed_perms)
                permissions = set(permissions)
                permissions = permissions.difference(removed_perms)

        return list(permissions)


