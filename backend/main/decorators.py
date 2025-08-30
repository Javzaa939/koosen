import json
from functools import wraps
from django.apps import apps

from rest_framework import exceptions

from django.http import (
    Http404,
    JsonResponse,
    HttpResponseBadRequest,
)


def ajax_required(f):

    @wraps(f)
    def inner(request, *args, **kwargs):

        if request.method != "POST":
            return JsonResponse({
                "success": False,
                "error": "Malformed data!"
            })

        try:
            payload = json.loads(request.body)
        except Exception:
            pass
        else:
            args = [payload, *args]

        try:
            return f(request, *args, **kwargs)
        except Http404:
            return HttpResponseBadRequest('{"success": false}')

    return inner


def login_required():
    ''' Хэрэглэгчийг нэвтэрсэн эсэхийг шалгах нь
    '''
    def decorator(view_func):

        def wrap(self, request, *args, **kwargs):
            userModel = userModel = apps.get_model('core', 'User')

            # region Оюутан нэвтэрсэн эсэхийг шалгана
            # True бол оюутан гэж тооцсон
            is_student = request.session.get('_is_student') or False

            if is_student:
                userModel = apps.get_model('lms', 'StudentLogin')
            # endregion

            user_id = request.session.get('_auth_user_id')

            # NOTE why get user object if DRF already is getting it automatically i do not know.
            user = userModel.objects.filter(id=user_id).first()
            if user_id:
                request.user = user
            else:
                raise exceptions.AuthenticationFailed('unauthenticated')

            return view_func(self, request, *args, **kwargs)

        return wrap

    return decorator