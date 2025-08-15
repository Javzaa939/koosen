from django.apps import apps

from django.db import models, transaction
from django.db.models.functions import Concat
from django.db.models import Value, CharField
from django.db.models.functions import Substr
from django.db.models.functions import Upper

from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):

    def full_name(self):
        UserInfo = apps.get_model("core", "UserInfo")
        return self.filter(
            userinfo__action_status=UserInfo.APPROVED,
            userinfo__action_status_type=UserInfo.ACTION_TYPE_ALL
        ).annotate(full_name=Concat(Upper(Substr("userinfo__last_name", 1, 1)), Value(". "), "userinfo__first_name"))

    def create_user(self, email, password=None):

        if not email:
            raise ValueError("Хэрэглэгч заавал и-мэйл байна.")
        if not password:
            raise ValueError("Хэрэглэгч заавал нууц үг байна.")

        user = self.model(
            email = self.normalize_email(email)
        )
        user.set_password(password)
        user.is_admin = False
        user.is_staff = False
        user.is_superuser = False
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None):
        if not email:
            raise ValueError("Хэрэглэгч заавал и-мэйл байна.")
        if not password:
            raise ValueError("Хэрэглэгч заавал нууц үг байна.")

        user = self.model(
            email = self.normalize_email(email)
        )
        user.set_password(password)
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class Unit2Manager(models.Manager):

    def full_name(self):
        return self.annotate(full_name=Concat("unit1__name", Value(", "), "name"))


class Unit3Manager(models.Manager):

    def full_name(self):
        return self.annotate(full_name=Concat("unit2__unit1__name", Value(", "), "unit2__name", Value(", "), "name"))


class SalbarManager(models.Manager):

    @staticmethod
    def get_filters(request):
        """ Салбарын filter ийг авах нь """

        filters = {**request.org_filter}
        if request.org_filter.get("salbar"):
            filters['id'] = request.org_filter.get("salbar").id
            del filters['salbar']

        if request.org_filter.get("sub_org"):
            filters['sub_orgs'] = request.org_filter.get("sub_org")
            del filters['sub_org']

        return filters


class SubOrgManager(models.Manager):

    @staticmethod
    def get_filters(request):
        """ Салбар сургуулийн filter ийг авах нь """

        filters = {**request.org_filter}

        return filters


class EmployeeManager(models.Manager):

    def filter(self, *args, **kwargs):

        value = False

        if 'check_super' in kwargs:
            value = kwargs['check_super']
            del kwargs['check_super']

        kwargs["user__is_superuser"] = value

        return super().filter(*args, **kwargs)

    def get(self, *args, **kwargs):

        value = False

        if 'check_super' in kwargs:
            value = kwargs['check_super']
            del kwargs['check_super']

        kwargs["user__is_superuser"] = value

        return super().get(*args, **kwargs)
