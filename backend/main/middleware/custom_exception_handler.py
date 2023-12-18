from rest_framework.views import exception_handler
from django.http import JsonResponse

def custom_exception_handler(exc, context):

    response = exception_handler(exc, context)

    if response is not None:
        response.data['status_code'] = response.status_code

    return response

def handler404(request, exception):

    message = "Not Found"

    response = JsonResponse(
        data = {
            "message": message,
            "status_code": 404
        }
    )
    response.status_code = 404
    return response
