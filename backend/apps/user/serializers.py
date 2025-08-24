from rest_framework import serializers

from django.db.models import Q

from apps.student.serializers import StudentInfoSerializer
from main.utils.function.utils import student__full_name
from core.models import (
    User,
    Employee,
    Permissions,
    Teachers,
    SubOrgs
)

from lms.models import (
    AccessHistoryLms,
    StudentLogin
)


class UserListSerializer(serializers.ModelSerializer):
    """ Хэрэглэгчийн жагсаалтыг харуулах serializer """

    class Meta:
        model = User
        fields = "id", "username", "last_name", "first_name", "is_superuser", "date_joined"


class UserInfoSerializer(serializers.ModelSerializer):
    """ Хэрэглэгчийн дэлгэрэнгүйг харуулах serializer"""

    school_id = serializers.SerializerMethodField()
    school_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()
    position_id = serializers.SerializerMethodField()
    is_hr = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "real_photo", "username", "email", "is_active", "is_superuser", "phone_number", "school_id", "permissions", "full_name", "position", "position_id", "school_name", "is_hr"]

    def get_is_hr(self, obj):
        employee_qs = Employee.objects.filter(user=obj, state=Employee.STATE_WORKING).first()

        return obj.is_superuser or (employee_qs.org_position.is_hr if employee_qs and employee_qs.org_position else False)

    def get_full_name(self, obj):

        full_name = obj.first_name
        user_id = obj.id
        user_info = Teachers.objects.filter(user=user_id, action_status=Teachers.APPROVED).first()

        if user_info and user_info.last_name:
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
        elif obj.info and obj.info.sub_org:
            school = obj.info.sub_org.id

        if school:
            school_info = SubOrgs.objects.filter(id=school, is_school=False).first()
            if school_info:
                school = ''

        return school

    def get_school_name(self, obj):
        school = ''
        user_id = obj.id
        emp_list = Employee.objects.filter(user=user_id, state=Employee.STATE_WORKING).first()
        if emp_list and emp_list.sub_org and emp_list.sub_org.is_school:
            school = emp_list.sub_org.name
        elif obj.info and obj.info.sub_org and obj.info.sub_org.is_school:
            school = obj.info.sub_org.name

        return school

    def get_permissions(self, obj):

        user_id = obj.id
        emp_list = Employee.objects.filter(user=user_id, state=Employee.STATE_WORKING).first()

        permissions = []

        if obj.is_superuser:
            if not obj.is_staff:
                permissions = list(Permissions.objects.all().filter(Q(name__startswith='lms') | (Q(name='role-read'))).exclude(name__icontains='lms-elselt').values_list('name', flat=True))
            else:
                permissions = list(Permissions.objects.all().filter(Q(name__startswith='lms') | (Q(name='role-read'))).values_list('name', flat=True))

        elif emp_list and not obj.is_superuser:
            permissions = list(emp_list.org_position.roles.values_list("permissions__name", flat=True)) if emp_list.org_position and emp_list.org_position.roles else list()
            removed_perms = list(emp_list.org_position.removed_perms.values_list("name", flat=True)) if emp_list.org_position and emp_list.org_position.removed_perms else list()
            permissions = permissions + list(emp_list.org_position.permissions.values_list("name", flat=True)) if emp_list.org_position and emp_list.org_position.permissions else list()

            removed_perms = set(removed_perms)
            permissions = set(permissions)
            permissions = permissions.difference(removed_perms)

        return list(permissions)


class AccessHistoryLmsSerializer(serializers.ModelSerializer):

    state_display =serializers.CharField(source="get_state_display", read_only=True)
    in_time = serializers.DateTimeField(format=("%Y-%m-%d %H:%M:%S"), read_only=True)
    system_type_name = serializers.SerializerMethodField()

    class Meta:
        model = AccessHistoryLms
        fields = '__all__'

    def get_system_type_name(self, obj):

        for value in AccessHistoryLms.SYSTEM_TYPE:

            if value[0] == obj.system_type:

                return value[1]

        return ''


class AccessHistoryLmsSerializerAll(serializers.ModelSerializer):

    class Meta:
        model = AccessHistoryLms
        fields = ['id', 'device_name', 'device_type', 'ip', 'in_time']


class AccessHistoryLmsStudentSerializer(serializers.ModelSerializer):

    student = serializers.SerializerMethodField()
    device_type = serializers.SerializerMethodField()

    class Meta:
        model = AccessHistoryLms
        fields = '__all__'

    def get_student(self, obj):
        return {
            'id': obj.student_idnum,
            'name': student__full_name(obj.student_last_name,obj.student_first_name),
            'code': obj.student_code
        }

    def get_device_type(self, obj):
            return {
                'id': obj.device_type,
                'name': AccessHistoryLms.DEVICE_TYPE[obj.device_type-1][1]
            }


class StudentLoginSerializer(serializers.ModelSerializer):
	student = StudentInfoSerializer(many=False, read_only=True)

	class Meta:
		model = StudentLogin
		fields = ['id', 'student']
