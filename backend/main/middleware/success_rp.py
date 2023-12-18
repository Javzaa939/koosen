from django.http import JsonResponse

from main.utils.rsp.info import info
from main.utils.rsp.error import errors


def success_rp(get_response):
    """ Амжилттай болох үеийн response """

    def _send_data(data):
        '''
            Амжилттай болсон success датаг буцаах нь
            Parameters:
            * data: any
                Мэдээлэлтэй хамт буцаах дата
        '''

        rsp = {
            "success": True,
            "data": data,
            "error": "",
            "info": ""
        }

        return JsonResponse(rsp)

    def _send_info(info_code, data=[]):
        '''
            Амжилттай болсон success мэдээллийг буцаах нь

            Parameters:
            * ``info_code``: Info мэдээллийн code нь
            * args: str
                info ний мэдээлэлд оноож өгөх үгнүүд
        '''

        rsp = {
            "success": True,
            "data": data,
            "error": "",
            "code": info_code,
            "info": info[info_code]['message']
        }

        return JsonResponse(rsp)

    def _send_error(error_code, msg=''):
        ''' Алдааны мэссэжийг ажиллуулах '''

        error_obj = {
            "success": False,
            "code": error_code,
            "data": [],
            "error": msg if msg else errors[error_code]['message']
        }

        return JsonResponse(error_obj)

    def _send_error_valid(errors):
        '''
            serializer ийн errors ийг буцаана
        '''
        error_obj = {
            "success": False,
            "data": [],
            "error": "",
            "errors": errors,
        }

        return JsonResponse(error_obj)

    def middleware(request):

        # view үүд рүү очих request дотор response буцаах функцийг оноосон нь
        request.send_data = _send_data
        request.send_info = _send_info
        request.send_error = _send_error
        request.send_error_valid = _send_error_valid

        response = get_response(request)

        return response

    return middleware
