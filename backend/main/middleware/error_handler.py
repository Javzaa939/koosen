import json
import traceback

from django.http import JsonResponse

from main.utils.rsp.error import errors

class ErrorHandlerMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    # Терминал дээр алдааг харууах
    def __get_message__(self, request, exception):
        message = "**{url}**\n\n{error}\n\n````{tb}````".format(
                url=request.build_absolute_uri(),
                error=repr(exception),
                tb=traceback.format_exc()
            )

        return message

    def process_exception(self, request, exception):
        """ Сервер дээр алдаа гарах үед алдааг барих функц. """

        message = str(exception)
        status_code = 500
        args = None
        try:
            error_dict = json.loads(message)
            message = error_dict['code']
            args = error_dict['args']
        except:
            message = message

        error_obj = None
        if message in errors.keys():
            error_obj = errors[message]

            errors[message]['message'] = errors[message]['message'].format(*args)
            status_code = errors[message]['status_code'] or status_code
        else:
            error_obj = errors['ERR_002']

        error_msg = self.__get_message__(request, exception)
        print(error_msg)

        return JsonResponse(
            {
                "success": False,
                "data": [],
                "error": error_obj,
                "status": status_code
            },
            status=status_code
        )
