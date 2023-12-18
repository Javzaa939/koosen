import zeep
import urllib3
import datetime
# from django.conf import settings

from requests import Session

from .XypSign import XypSign
from main.utils.function.utils import json_load

this_year = int(datetime.datetime.now().strftime('%Y'))
previous_year = this_year - 1

SUCCESS = 0
KEY_PATH = '/etc/openvpn/mnun.key'

class Service():

    def __init__(self, wsdl, pkey_path=None):
        """
        param: wsdl - wsdl зам
        param: pkey_path - VPN сүлжээнд холбогдоход өгсөн хувийн түлхүүрийн файлын зам.
        """

        self.__accessToken = '33135f96de913be2132771f19d0d1835'
        self.__toBeSigned, self.__signature = XypSign(pkey_path).sign(self.__accessToken)

        session = Session()

        session.verify = False

        transport = zeep.Transport(session=session)
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        self.client = zeep.Client(wsdl, transport=transport)

        self.client.transport.session.headers.update({
            'accessToken': self.__accessToken,
            'timeStamp' : self.__toBeSigned['timeStamp'],
            'signature' : self.__signature
        })


    def dump(self, operation, params=None):
        try:
            if params:
                response = self.client.service[operation](params)
                print(response)
                return response
            else:
                print(self.client.service[operation]())
        except Exception as e:
            print( operation, str(e))


def custom_rsp(request_rsp):
    """ Хэрэглэгчид зориулсан return """

    return_data = None
    resultCode = request_rsp.get('resultCode')
    responseData = request_rsp.get('response')

    if resultCode == SUCCESS and responseData:
        return_data = responseData

    return return_data

def citizen_regnum(register):
    """ Хэрэглэгчийн иргэний үнэмлэхний дугаараар мэдээлэл авах
        input: регистрийн дугаар
        output: dict
        pkey_path: 'Хувийн түлхүүр'
    """

    datas = None
    # регистрийн дугаар param
    params_register = {
        'regnum': register
    }

    # Иргэний мэдээлэл
    citizen1 = Service('https://xyp.gov.mn/citizen-1.3.0/ws?WSDL', pkey_path=KEY_PATH)

    # -------------- Иргэний иргэний үнэмлэхний мэдээлэл авах хэсэг--------------------------
    rsp_datas = citizen1.dump('WS100101_getCitizenIDCardInfo', params_register)


    if rsp_datas:
        datas = json_load(rsp_datas)
        datas = rsp_datas['response']

    return datas


def highschool_regnum(register):
    """ Бүрэн дунд боловсролын гэрчилгээний мэдээлэл дуудах сервис
        input: регистрийн дугаар
        output: dict
        pkey_path: 'Хувийн түлхүүр'
    """

    datas = None

    # регистрийн дугаар param
    params_register = {
        'regnum': register
    }

    # Иргэний мэдээлэл
    highschool = Service('https://xyp.gov.mn/citizen-1.3.0/ws?WSDL', pkey_path=KEY_PATH)

    # -------------- Бүрэн дунд боловсролын гэрчилгээний мэдээлэл дуудах сервис --------------------------
    rsp_datas = highschool.dump('WS100130_getCitizenHighSchoolInfo', params_register)

    if rsp_datas:
        datas = json_load(rsp_datas)
        datas = rsp_datas['response']

    return datas