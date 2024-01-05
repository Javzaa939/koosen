from rest_framework import mixins
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.pagination import CustomPagination
from main.utils.function.utils import has_permission, get_lesson_choice_student
from rest_framework.filters import SearchFilter

from django.db import transaction
from django.db.models import Sum, Q

from lms.models import PaymentBalance
from lms.models import PaymentSettings
from lms.models import PaymentBeginBalance
from lms.models import PaymentEstimate
from lms.models import TimeTable
from lms.models import TimeTable_to_group
from lms.models import TimeTable_to_student
from lms.models import Student
from lms.models import LessonStandart
from lms.models import PaymentDiscount
from lms.models import PaymentSeasonClosing

from .serializers import BeginBalanceSerializer
from .serializers import BeginBalanceListSerializer
from .serializers import PaymentBalanceSerializer
from .serializers import PaymentBalanceListSerializer
from .serializers import PaymentSettingSerializer
from .serializers import PaymentSettingListSerializer
from .serializers import PaymentEstimateListSerializer
from .serializers import PaymentDiscountSerializer
from .serializers import PaymentDiscountListSerializer


@permission_classes([IsAuthenticated])
class BeginBalanceAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Сургалтын төлбөрийн эхний үлдэгдэл """

    queryset = PaymentBeginBalance.objects.all()
    serializer_class = BeginBalanceSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code','student__last_name', 'student__first_name', 'first_balance']

    @has_permission(must_permissions=['lms-payment-beginbalance-read'])
    def get(self, request, pk=None):
        "Сургалтын төлбөрийн эхний үлдэгдэл"

        self.serializer_class = BeginBalanceListSerializer

        searchValue = self.request.query_params.get('search')
        group = self.request.query_params.get('group')
        degree = self.request.query_params.get('degree')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')
        join_year = self.request.query_params.get('joined_year')
        department = self.request.query_params.get('department')
        is_iluu = self.request.query_params.get('is_iluu')

        # Сургуулиар хайлт хийх
        if schoolId:
            self.queryset = self.queryset.filter(school=schoolId)

        # Тэнхимээр хайлт хийх
        if department:
            self.queryset = self.queryset.filter(student__department=department)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            self.queryset = self.queryset.filter(student__group__degree=degree)

        # Ангиар хайлт хийх
        if group:
            self.queryset = self.queryset.filter(student__group=group)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join_year:
            self.queryset = self.queryset.filter(lesson_year=join_year)

        # Эхний үлдэгдлийг илүү дутуугаар нь ялгаж хайх
        if is_iluu:
            if is_iluu == '1':
                self.queryset = self.queryset.filter(first_balance__gte=0)
            else:
                self.queryset = self.queryset.filter(first_balance__lte=0)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        if pk:
            begin_payment = self.retrieve(request, pk).data
            return request.send_data(begin_payment)

        all_datas = self.list(request).data

        datas = self.queryset.aggregate(
                sum_first_balance_iluu=Sum('first_balance', filter=Q(first_balance__gte=0)),
                sum_first_balance_dutuu=Sum('first_balance', filter=Q(first_balance__lte=0)),
            )

        if searchValue:
            results = all_datas.get('results')
            sum_first_balance_iluu = 0
            sum_first_balance_dutuu = 0
            for result in results:
                sum_first_balance_iluu += result.get('first_balance_iluu')
                sum_first_balance_dutuu += result.get('first_balance_dutuu')

            datas = {
                'sum_first_balance_iluu': sum_first_balance_iluu,
                'sum_first_balance_dutuu': sum_first_balance_dutuu,
            }

        check_datas = {
            'total_pay': datas,
            'return_datas': all_datas,
        }

        return request.send_data(check_datas)

    @has_permission(must_permissions=['lms-payment-beginbalance-create'])
    def post(self, request):
        "Сургалтын төлбөрийн эхний үлдэгдэл үүсгэх "

        request_data = request.data
        student = request_data.get("student")
        lesson_year = request_data.get("lesson_year")
        lesson_season = request_data.get("lesson_season")

        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            if student:
                pay_begin_balance = self.queryset.filter(student=student, lesson_year=lesson_year, lesson_season=lesson_season)
                if pay_begin_balance:
                    return_error = {
                        "field": 'student',
                        "msg": "Тухайн хичээлийн жилд сургалтын төлбөрийн эхний үлдэгдэл энэ оюутан дээр бүртгэгдсэн байна"
                    }

                    error_obj.append(return_error)
                    return request.send_error("ERR_004", error_obj)

            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-payment-beginbalance-update'])
    def put(self, request, pk=None):
        "Сургалтын төлбөрийн эхний үлдэгдэл засах"

        request_data = request.data
        begin_id= request_data.get("id")
        student = request_data.get("student")
        lesson_year = request_data.get("lesson_year")
        lesson_season = request_data.get("lesson_season")

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            if student:
                pay_begin_balance = self.queryset.filter(student=student, lesson_year=lesson_year, lesson_season=lesson_season).exclude(id=begin_id)
                if pay_begin_balance:
                    return_error = {
                        "field": 'student',
                        "msg": "Тухайн оюутан дээр бүртгэгдсэн байна"
                    }

                    error_obj.append(return_error)
                    return request.send_error("ERR_004", error_obj)
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-payment-beginbalance-delete'])
    def delete(self, request, pk=None):
        "Сургалтын төлбөрийн эхний үлдэгдэл устгах"

        self.destroy(request, pk)
        return request.send_info("INF_003")


@permission_classes([IsAuthenticated])
class PaymentBalanceAPIView(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    generics.GenericAPIView
):
    """ Сургалтын төлбөрийн гүйлгээ """

    queryset = PaymentBalance.objects.all()
    serializer_class = PaymentBalanceSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__last_name', 'student__first_name', 'balance_desc', 'balance_amount', 'balance_date']

    @has_permission(must_permissions=['lms-payment-balance-read'])
    def get(self, request, pk=None):
        "Сургалтын төлбөрийн гүйлгээ"

        self.serializer_class = PaymentBalanceListSerializer

        group = self.request.query_params.get('group')
        degree = self.request.query_params.get('degree')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')
        join_year = self.request.query_params.get('joined_year')
        department = self.request.query_params.get('department')
        flag = self.request.query_params.get('flag')
        searchValue = self.request.query_params.get('search')

        # Сургуулиар хайлт хийх
        if schoolId:
            self.queryset = self.queryset.filter(school=schoolId)

        # Тэнхимээр хайлт хийх
        if department:
            self.queryset = self.queryset.filter(student__department=department)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            self.queryset = self.queryset.filter(student__group__degree=degree)

        # Ангиар хайлт хийх
        if group:
            self.queryset = self.queryset.filter(student__group=group)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join_year:
            self.queryset = self.queryset.filter(student__group__join_year=join_year)

        # Гүйлгээний хайлт хийх
        if flag:
            self.queryset = self.queryset.filter(flag=flag)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        if pk:
            begin_payment = self.retrieve(request, pk).data
            return request.send_data(begin_payment)

        all_datas = self.list(request).data

        datas = self.queryset.aggregate(
                sum_balance_amount=Sum('balance_amount'),
            )

        if searchValue:
            results = all_datas.get('results')
            sum_balance_amount = 0
            for result in results:
                sum_balance_amount += result.get('balance_amount')

            datas = {
                'sum_balance_amount': sum_balance_amount,
            }

        check_datas = {
            'total_pay': datas,
            'return_datas': all_datas,
        }

        return request.send_data(check_datas)

    @has_permission(must_permissions=['lms-payment-balance-create'])
    def post(self, request):
        "Сургалтын төлбөрийн гүйлгээ үүсгэх "

        request_data = request.data
        serializer = self.get_serializer(data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            # Олон алдааны мессэж буцаах бол үүнийг ашиглана
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-payment-balance-update'])
    def put(self, request, pk=None):
        "Сургалтын төлбөрийн гүйлгээ засах"

        request_data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request_data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request).data
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

            return request.send_error("ERR_002")

    @has_permission(must_permissions=['lms-payment-balance-delete'])
    def delete(self, request, pk=None):
        "Сургалтын төлбөрийн гүйлгээ устгах"

        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class PaymentSettingsAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView,
    mixins.RetrieveModelMixin
):
    """ Сургалтын төлбөрийн тохиргоо """

    queryset = PaymentSettings.objects.all()
    serializer_class = PaymentSettingSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['group__name', 'payment']

    def get_queryset(self):
        queryset = self.queryset
        degree = self.request.query_params.get('degree')
        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')
        search_value = self.request.query_params.get('search')
        join_year = self.request.query_params.get('join_year')

        # Сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school=schoolId)

        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        #Боловсролын зэргээр хайлт хийх
        if degree:
            queryset = queryset.filter(group__degree=degree)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join_year:
            queryset = queryset.filter(group__join_year=join_year)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)
            queryset = queryset.order_by(sorting)

        return queryset

    @permission_classes(["lms-payment-settings-read"])
    def get(self, request, pk=None):
        " Сургалтын төлбөрийн тохиргоо жагсаалт "
        self.serializer_class = PaymentSettingListSerializer

        if pk:
            begin_payment = self.retrieve(request, pk).data
            return request.send_data(begin_payment)

        payment_set = self.list(request).data
        return request.send_data(payment_set)

    @permission_classes(["lms-payment-settings-create"])
    def post(self, request):
        " Сургалтын төлбөрийн тохиргоо шинээр үүсгэх "

        data = request.data
        group_id = data.get("group")
        pay_lesson_season= data.get("lesson_season")
        pay_lesson_year= data.get("lesson_year")

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            error_obj = []
            if group_id:
                paysetting_info = self.queryset.filter(group=group_id, lesson_season=pay_lesson_season, lesson_year=pay_lesson_year)
                if paysetting_info:
                    return_error = {
                        "field": 'group',
                        "msg": "Анги бүртгэгдсэн байна"
                    }

                    error_obj.append(return_error)
                    return request.send_error("ERR_004", error_obj)

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)


    @permission_classes(["lms-payment-settings-update"])
    def put(self, request, pk=None):
        "  Сургалтын төлбөрийн тохиргоо засах "

        data = request.data
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=data)

        error_obj = []
        pay_id= data.get("id")
        pay_lesson_season= data.get("lesson_season")
        pay_lesson_year= data.get("lesson_year")
        pay_group = data.get("group")

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request, pk)
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_002")
            return request.send_error("ERR_002")
        else:
            if pay_group:
                paysetting_id= self.queryset.filter(group=pay_group, lesson_season=pay_lesson_season, lesson_year=pay_lesson_year).exclude(id=pay_id)
                if paysetting_id:
                    return_error = {
                        "field": "group",
                        "msg": "Энэ хичээлийн жилд тухайн ангид төлбөрийн тохиргоо бүртгэгдсэн байна"
                    }
                    error_obj.append(return_error)
                    return request.send_error("ERR_004", error_obj)

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

    @permission_classes(["lms-payment-settings-delete"])
    def delete(self, request, pk=None):
        " Сургалтын төлбөрийн тохиргоо устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")

@permission_classes([IsAuthenticated])
class PaymentEstimateAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    generics.GenericAPIView
):
    """ Сургалтын төлбөрийн тооцоо """

    queryset = PaymentEstimate.objects.all()
    serializer_class = PaymentEstimateListSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__last_name', 'student__first_name', 'first_balance', 'payment', 'last_balance', 'last_balance', 'in_balance', 'payment', 'out_balance']

    @has_permission(must_permissions=['lms-payment-estimate-read'])
    def get(self, request, pk=None):
        " Сургалтын төлбөрийн тооцоо жагсаалт "

        group = self.request.query_params.get('group')
        degree = self.request.query_params.get('degree')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')
        searchValue = self.request.query_params.get('search')
        join_year = self.request.query_params.get('joined_year')
        department = self.request.query_params.get('department')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        first_balance = self.request.query_params.get('first_balance')

        # Сургуулиар хайлт хийх
        if schoolId:
            self.queryset = self.queryset.filter(school=schoolId)

        # Идэвхтэй хичээлийн жилээр хайлт хийх
        if lesson_year:
            self.queryset = self.queryset.filter(lesson_year=lesson_year)

        # Идэвхтэй улирлаар хайлт хийх
        if lesson_season:
            self.queryset = self.queryset.filter(lesson_season=lesson_season)

        # Тэнхимээр хайлт хийх
        if department:
            self.queryset = self.queryset.filter(student__department=department)

        # Боловсролын зэргээр хайлт хийх
        if degree:
            self.queryset = self.queryset.filter(student__group__degree=degree)

        # Ангиар хайлт хийх
        if group:
            self.queryset = self.queryset.filter(student__group=group)

        # Элссэн хичээлийн жилээр хайлт хийх
        if join_year:
            self.queryset = self.queryset.filter(student__group__join_year=join_year)

        # Эхний үлдэгдэл
        if first_balance:
            self.queryset = self.queryset.filter(first_balance=first_balance)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        all_datas = self.list(request).data

        datas = self.queryset.aggregate(
                sum_payment=Sum('payment'),
                sum_discount=Sum('discount'),
                sum_in_balance=Sum('in_balance'),
                sum_out_balance=Sum('out_balance'),
                sum_last_balance_iluu=Sum('last_balance', filter=Q(last_balance__gte=0)),
                sum_last_balance_dutuu=Sum('last_balance', filter=Q(last_balance__lte=0)),
                sum_first_balance_iluu=Sum('first_balance', filter=Q(first_balance__gte=0)),
                sum_first_balance_dutuu=Sum('first_balance', filter=Q(first_balance__lte=0)),
            )

        if searchValue:
            results = all_datas.get('results')
            sum_first_balance_iluu = 0
            sum_first_balance_dutuu = 0
            sum_in_balance = 0
            sum_payment = 0
            sum_discount = 0
            sum_out_balance = 0
            sum_last_balance_iluu = 0
            sum_last_balance_dutuu = 0
            for result in results:
                sum_payment += result.get('payment')
                sum_discount += result.get('discount')
                sum_in_balance += result.get('in_balance')
                sum_out_balance += result.get('out_balance')
                sum_last_balance_iluu += result.get('last_balance_iluu')
                sum_last_balance_dutuu += result.get('last_balance_dutuu')
                sum_first_balance_iluu += result.get('first_balance_iluu')
                sum_first_balance_dutuu += result.get('first_balance_dutuu')

            datas = {
                'sum_payment': sum_payment,
                'sum_discount': sum_discount,
                'sum_in_balance': sum_in_balance,
                'sum_out_balance': sum_out_balance,
                'sum_last_balance_iluu': sum_last_balance_iluu,
                'sum_last_balance_dutuu': sum_last_balance_dutuu,
                'sum_first_balance_iluu': sum_first_balance_iluu,
                'sum_first_balance_dutuu': sum_first_balance_dutuu,
            }


        check_datas = {
            'total_pay': datas,
            'return_datas': all_datas,
        }

        return request.send_data(check_datas)

    @has_permission(must_permissions=['lms-payment-estimate-create'])
    def post(self, request):
        " Сургалтын төлбөрийн бодолт хийх "

        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')
        school_id = self.request.query_params.get('school')
        user_id = self.request.user.id

        if not school_id:
            return request.send_error("ERR_002", "Сургуулиа сонгоно уу")

        if not lesson_season or not lesson_year:
            return request.send_error("ERR_002", "Төлбөр бодох хичээлийн жил улирал тодорхойгүй байна.")

        timetable = TimeTable.objects.filter(lesson_year=lesson_year,lesson_season=lesson_season,school=school_id)
        timetable_id = timetable.values_list('id',flat=True)

        timetable_group = TimeTable_to_group.objects.filter(timetable__in = timetable_id)
        timetable_group_id = timetable_group.values_list('group', flat=True)

        timetable_student1 = TimeTable_to_student.objects.filter(timetable__in = timetable, add_flag=True)
        timetable_student1_id = timetable_student1.values_list('student', flat=True)
        timetable_student2 = TimeTable_to_student.objects.filter(timetable__in = timetable, add_flag=False)
        timetable_student2_id = timetable_student2.values_list('student', flat=True)

        group_student = Student.objects.filter(Q(group__in = timetable_group_id, school=school_id) | Q(id__in=timetable_student1_id, school=school_id))

        choice_student = group_student.exclude(id__in =timetable_student2_id)
        choice_student_id = choice_student.values_list("id", flat=True)

        st_begin_balance = PaymentBeginBalance.objects.filter(lesson_year=lesson_year,lesson_season=lesson_season,school=school_id).values_list('student',flat=True)
        st_balance =  PaymentBalance.objects.filter(lesson_year=lesson_year,lesson_season=lesson_season,school=school_id).values_list('student',flat=True)
        st_discount =  PaymentDiscount.objects.filter(lesson_year=lesson_year,lesson_season=lesson_season,school=school_id).values_list('student',flat=True)
        all_student = Student.objects.filter(Q(id__in = choice_student_id, school=school_id) | Q(id__in=st_begin_balance, school=school_id) | Q(id__in=st_balance, school=school_id) | Q(id__in=st_discount, school=school_id))
        all_student_id = all_student.values_list("id",flat=True)

        delete_payment=PaymentEstimate.objects.filter(lesson_year=lesson_year,lesson_season=lesson_season,school=school_id)
        try:
            with transaction.atomic():
                if delete_payment:
                    delete_payment.delete()
                for st_id in all_student_id:

                    student = Student.objects.filter(id=st_id).first()
                    st_timetable1 = timetable_group.filter(group = student.group).values_list('timetable', flat=True)
                    st_timetable2 = timetable_student1.filter(student = st_id).values_list('timetable', flat=True)
                    st_timetable3 = timetable_student2.filter(student = st_id).values_list('timetable', flat=True)
                    all_timetable = st_timetable1.exclude(id__in=st_timetable3).union(st_timetable2, all=False)
                    all_lesson = timetable.filter( id__in = all_timetable).values_list('lesson', flat=True)
                    lesson_kr = []
                    lesson_kr = LessonStandart.objects.filter(id__in=all_lesson).aggregate(kr=Sum('kredit'))
                    kr_unelgee = []
                    kr_unelgee = PaymentSettings.objects.filter(group=student.group,lesson_year=lesson_year,lesson_season=lesson_season,school=school_id).values('payment').first()
                    begin_balance = []
                    begin_balance = PaymentBeginBalance.objects.filter(student=st_id,lesson_year=lesson_year,lesson_season=lesson_season,school=school_id).values('first_balance').first()
                    in_balance = []
                    in_balance =  PaymentBalance.objects.filter(student=st_id,lesson_year=lesson_year,lesson_season=lesson_season,school=school_id,flag=PaymentBalance.ORLOGO).aggregate(amount=Sum('balance_amount'))
                    discount = []
                    discount =  PaymentDiscount.objects.filter(student=st_id,lesson_year=lesson_year,lesson_season=lesson_season,school=school_id).aggregate(percent=Sum('discount'))
                    out_balance = []
                    out_balance =  PaymentBalance.objects.filter(student=st_id,lesson_year=lesson_year,lesson_season=lesson_season,school=school_id,flag=PaymentBalance.ZARLAGA).aggregate(amount=Sum('balance_amount'))

                    kr = 0
                    unelgee = 0
                    begin_uld = 0
                    in_guilgee = 0
                    out_guilgee = 0
                    discount_per = 0

                    if lesson_kr['kr']:
                        kr = lesson_kr['kr']
                    if kr_unelgee:
                        unelgee = kr_unelgee['payment']
                    if begin_balance:
                        begin_uld = begin_balance['first_balance']
                    if in_balance['amount']:
                        in_guilgee = in_balance['amount']
                    if out_balance['amount']:
                        out_guilgee = out_balance['amount']
                    if discount['percent']:
                        discount_per = discount['percent']
                    payment_est=PaymentEstimate.objects.filter(student=student,lesson_year=lesson_year,lesson_season=lesson_season,school=school_id)
                    if payment_est:
                        with transaction.atomic():
                            obj = payment_est.update(
                                # student = student,
                                # lesson_year = lesson_year,
                                # lesson_season_id = int(lesson_season),
                                first_balance = begin_uld,
                                kredit = kr,
                                payment = kr * unelgee,
                                discount = kr * unelgee * discount_per / 100,
                                in_balance = in_guilgee,
                                out_balance = out_guilgee,
                                # school_id = school_id,
                                last_balance = begin_uld - kr * unelgee + kr * unelgee * discount_per / 100 + in_guilgee - out_guilgee,
                                # created_user_id = user_id,
                                updated_user_id = user_id
                            )
                    else:
                        with transaction.atomic():
                            obj = PaymentEstimate.objects.create(
                                student = student,
                                lesson_year = lesson_year,
                                lesson_season_id = int(lesson_season),
                                first_balance = begin_uld,
                                kredit = kr,
                                payment = kr * unelgee,
                                discount = kr * unelgee * discount_per / 100,
                                in_balance = in_guilgee,
                                out_balance = out_guilgee,
                                school_id = school_id,
                                last_balance = begin_uld - kr * unelgee + kr * unelgee * discount_per / 100 + in_guilgee - out_guilgee,
                                created_user_id = user_id,
                                updated_user_id = user_id
                            )
        except Exception as e:
            print(e.__str__())
            return request.send_error("ERR_002", "Сургалтын төлбөрийн бодолт хийхэд алдаа гарлаа.")


        return request.send_info("INF_001")


@permission_classes([IsAuthenticated])
class PaymentDiscountAPIView(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):
    """ Төлбөрийн хөнгөлөлт """

    queryset = PaymentDiscount.objects.all()
    serializer_class = PaymentDiscountSerializer
    pagination_class = CustomPagination

    filter_backends = [SearchFilter]
    search_fields = ['student__code', 'student__first_name', 'student__last_name', 'stipent_type__name']

    def get_queryset(self):

        queryset = self.queryset
        lesson_season = self.request.query_params.get('lesson_season')
        lesson_year = self.request.query_params.get('lesson_year')
        schoolId = self.request.query_params.get('school')
        sorting = self.request.query_params.get('sorting')

        # Сургуулиар хайлт хийх
        if schoolId:
            queryset = queryset.filter(school=schoolId)

        # Хичээлийн улиралаар хайлт хийх
        if lesson_season:
            queryset = queryset.filter(lesson_season=lesson_season)

        # Хичээлийн жилээр хайлт хийх
        if lesson_year:
            queryset = queryset.filter(lesson_year=lesson_year)

        # Sort хийх үед ажиллана
        if sorting:
            if not isinstance(sorting, str):
                sorting = str(sorting)

            self.queryset = self.queryset.order_by(sorting)

        return queryset


    @permission_classes(["lms-payment-discount-read"])
    def get(self, request, pk=None):
        " Төлбөрийн хөнгөлөлт жагсаалт "

        self.serializer_class = PaymentDiscountListSerializer
        if pk:
            discount_data = self.retrieve(request, pk).data
            return request.send_data(discount_data)

        discount_list = self.list(request).data
        return request.send_data(discount_list)

    @permission_classes(["lms-payment-discount-create"])
    def post(self, request):
        " Төлбөрийн хөнгөлөлт шинээр үүсгэх "

        error_obj = []
        data = request.data
        student = data.get("student")
        dis_lesson_season = data.get("lesson_season")
        stipent_type = data.get("stipent_type")
        dis_lesson_year = data.get("lesson_year")
        dis_school = data.get("school")
        serializer = self.get_serializer(data=data)
        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.create(request).data

                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_001")

            return request.send_error("ERR_002")
        else:
            if student:
                pay_discount_info = self.queryset.filter(student=student,stipent_type=stipent_type, lesson_season=dis_lesson_season, lesson_year=dis_lesson_year, school=dis_school)
                if pay_discount_info:
                    return_error = {
                        "field": 'stipent_type',
                        "msg": "Тухайн хичээлийн жилд сургалтын хөнгөлөлтөнд энэ бүртгэгдсэн байна"
                    }

                    error_obj.append(return_error)
                    return request.send_error("ERR_004", error_obj)

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

    @permission_classes(["lms-payment-discount-update"])
    def put(self, request, pk=None):
        "Төлбөрийн хөнгөлөлт засах "

        data = request.data
        student = data.get("student")
        pay_id= data.get("id")
        stipent_type = data.get("stipent_type")

        dis_lesson_season= data.get("lesson_season")
        dis_lesson_year= data.get("lesson_year")
        school = data.get("school")
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data)

        if serializer.is_valid(raise_exception=False):
            is_success = False
            with transaction.atomic():
                try:
                    self.update(request, pk)
                    is_success = True
                except Exception:
                    raise
            if is_success:
                return request.send_info("INF_002")
            return request.send_error("ERR_002")
        else:
            error_obj = []
            if student:
                pay_discount_info = self.queryset.filter(student=student, lesson_season=dis_lesson_season, lesson_year=dis_lesson_year, school=school,stipent_type=stipent_type).exclude(id=pay_id)
                if pay_discount_info:
                    return_error = {
                        "field":"stipent_type",
                        "msg":"Энэ ${lesson_year} сургалтын төлбөрийн хөнгөлөлт ${student} бүртгэгдсэн байна"
                    }
                    error_obj.append(return_error)
                    return request.send_error("ERR_004", error_obj)

            for key in serializer.errors:
                msg = "Хоосон байна"

                return_error = {
                    "field": key,
                    "msg": msg
                }

                error_obj.append(return_error)

            if len(error_obj) > 0:
                return request.send_error("ERR_003", error_obj)

    @permission_classes(["lms-payment-discount-delete"])
    def delete(self, request, pk=None):
        " Төлбөрийн хөнгөлөлт устгах "

        self.destroy(request, pk)
        return request.send_info("INF_003")


class SeasonClosingAPIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """Сургалтын төлбөрийн улирлын хаалт"""

    def get(self, request):


        schoolId = self.request.query_params.get('school')
        lesson_year = self.request.query_params.get('lesson_year')
        lesson_season = self.request.query_params.get('lesson_season')

        is_closed = False

        if schoolId and lesson_year and lesson_season:
            closing_qs = PaymentSeasonClosing.objects.filter(school=schoolId, lesson_year=lesson_year, lesson_season=lesson_season)

            if closing_qs:
                is_closed = True

        return request.send_data(is_closed)
