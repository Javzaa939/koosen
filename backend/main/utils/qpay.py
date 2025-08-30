import json
import requests
from datetime import datetime, timedelta

from django.conf import settings
from django.apps import apps

from main.utils.function.utils import qpay_settings, discord_notif


TOKEN_EXPIRED_AFTER_SECONDS = 1200              # Токены идэвхитэй байх хугацаа


class Qpay():
    """
        QPay төлбөр төлөлтийн ерөнхий class"""
    """
        Заавал өгөх талбар:
            unique_id => Байгууллагаас үүсгэж буй unique_id /string/ байна!
            amount => төлбөрийн дүн /integer/ байна!

            Хэрвээ callback_url-ийг өөрчилж бусад газар хэрэглэх бол өөрийн api-д тохируулж ашиглана уу!!!

        Санамж:
            1. Бид QPAY руу дахин давтагдахгүй код /id/ өгөх ёстой!
            # TODO QPay class байгуулж түүндээ qpay рүү илгээсэн unique_id гаа хадгалдаг байх!
            2. QPay class-д unique_id-нуудаа хадгална!

    """

    def __init__(
        self,
        unique_id=None,
        school=None,
        amount=0,
        invoice_description='Анагаахын Шинжлэх Ухааны Үндэсний Их Сургууль',
    ):

        qpay_api_url, qpay_api_username, qpay_api_password, qpay_api_call, qpay_api_invoice_code = qpay_settings(school)

        if not qpay_api_url and not settings.DEBUG:
            discord_notif('Qpay тохиргоо оруулна уу', unique_id, False)

        self.base_url = qpay_api_url                               # API-руу хандах токен авахад ашиглана

        if qpay_api_url:
            # NOTE доорх тохиргоонууд qpay талаас авч байгаа url-ууд болно!
            # Token urls
            self.token_url = qpay_api_url + 'auth/token'           # API-руу хандах токен авахад ашиглана
            self.refresh_url = qpay_api_url + 'auth/refresh'       # Access Token-ий хугацаа дуусахад хугацааг дахин сунгахад ашиглана

            # invoice urls
            self.create_url = qpay_api_url + 'invoice'             # Нэхэмжлэл үүсгэхэд ашиглана
            self.inv_cancel_url = qpay_api_url + 'invoice/'        # Нэхэмжлэлийг цуцлахад ашиглана

            # check urls
            self.get_payment_url = qpay_api_url + 'payment'        # Төлбөрийн мэдээлэл авахад ашиглана
            self.check_url = qpay_api_url + 'payment/check'        # Төлбөр төлөгдсөн эсэхийг шалгахад ашиглана

            # cancel urls
            self.cancel_url = qpay_api_url + 'payment/cancel'      # Төлбөрийг буцаах, цуцлах үед ашиглана. /Картын гүйлгээний үед л буцаах боломжтой/
            self.rebund = qpay_api_url + 'payment/refund'          # Төлбөрийг буцаах, цуцлах үед ашиглана. /Картын гүйлгээний үед л буцаах боломжтой/

            # Нэмэлт url
            self.payment_list_url = qpay_api_url + 'payment/list'  # Төлбөрийн жагсаалтыг авахад ашиглана
            self.ebarimt_url = qpay_api_url + 'ebarimt/create'     # И баримт үүсгэх

        # NOTE заавал өгөх шаардлагтай талбарууд!
        self.unique_id = unique_id
        self.amount = amount
        self.callback_url = qpay_api_call
        self.invoice_code = qpay_api_invoice_code
        self.invoice_receiver_code = qpay_api_invoice_code
        self.qpay_api_username = qpay_api_username
        self.qpay_api_password = qpay_api_password
        self.invoice_description = invoice_description

    def authenticate(self):
        """
            Access token авах функц
        """

        QPayToken = apps.get_model("lms", "QPayToken")

        headers = {
            'Authorization': 'Basic',
        }

        AUTH = requests.auth.HTTPBasicAuth(
            self.qpay_api_username,
            self.qpay_api_password,
        )

        is_token_created = True

        if not self.base_url:
            return False, "Салбар сургуулийн санхүүгийн албанд хандана уу. Төлбөр төлөх боломжгүй байна"

        # Token авах хүсэлтийн response
        response = requests.post(self.token_url, headers=headers, auth=AUTH)

        # NOTE QPay тал дээр алдаа гарсан гэсэн үг!
        if response.status_code != 200:
            is_token_created = False
            msg = 'Access Token үүсгэхэд алдаа гарлаа!'

        # ямар нэгэн алдаа гарсан үед
        if not is_token_created:
            return is_token_created, msg

        response_data = response.json()

        # Access token авах хэсэг
        access_token = response_data['access_token']
        refresh_token = response_data['refresh_token']

        # Токены идэвхитэй байх хугацаа
        access_token_expires_in = response_data['expires_in']

        # Access token дуусах огноо
        active_token_time = datetime.now() + timedelta(seconds=TOKEN_EXPIRED_AFTER_SECONDS)

        # Token-той холбоотой мэдээллийг хадгална
        QPayToken.objects.create(
            token=access_token,
            refresh_token=refresh_token,
            expire_date=active_token_time,
        )

        return is_token_created, access_token

    def refresh_token(self):
        """
            token-ий хугацаа дууссан эсэхийг шалгана
            Дууссан байвал шинээр токен авна
        """

        access_token = None
        qpay_user_token = None
        is_token_created = True
        QPayToken = apps.get_model("lms", "QPayToken")

        try:
            qpay_user_token = QPayToken.objects.order_by("-expire_date").first()
            access_token = qpay_user_token.token if qpay_user_token else None
            refresh_token = qpay_user_token.refresh_token if qpay_user_token else None

            if qpay_user_token:
                # Токений хугацаа дууссан эсэхийг шалгана
                # True байвал дууссан гэж үзнэ
                is_expired = qpay_user_token.expire_date < datetime.now()

                # TODO: ямарч үед шинээр үүсгэхээр болсон expires_in худлаа байгаад байгаа
                if is_expired:
                    # Дууссан байвал устгаад дахиад шинээр үүсгэнэ
                    qpay_user_token.delete()
                    is_token_created, access_token = self.authenticate()
                else:
                    qpay_user_token.delete()
                    is_token_created, access_token = self.authenticate()

            else:
                # Token шинээр үүсгэнэ
                is_token_created, access_token = self.authenticate()

        except QPayToken.DoesNotExist:
            # Token шинээр үүсгэнэ
            is_token_created, access_token = self.authenticate()

        return is_token_created, access_token

    def create(self):
        """
            Нэхэмжлэл үүсгэх функц
        """

        is_token_created, data = self.refresh_token()

        if not is_token_created:
            return False, data

        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer %s' % data
        }

        body = json.dumps(
            {
                "invoice_code": self.invoice_code,
                "sender_invoice_no": self.unique_id,
                "invoice_receiver_code": self.invoice_receiver_code,
                "invoice_description": self.invoice_description,
                "amount": self.amount,
                "callback_url": "{callback_url}{uniq}".format(callback_url=self.callback_url, uniq=self.unique_id),
            }
        )

        rsp = requests.post(self.create_url, data=body, headers=headers)

        if rsp.status_code != 200:
            print('rsp.text', rsp.text)
            # NOTE: QPay тал дээр алдаа гарсан гэсэн үг!
            return False, 'Нэхэмжлэл үүсгэхэд алдаа гарлаа!'

        return True, rsp.json()

    def inv_cancel(self, invoice_id):
        """
            Нэхэмжлэлийг цуцлах функц
        """
        """
            Санамж:
                Тухайн хүсэлтийг үүсгэсэхэд ашигласан invoice_id байна!!!
        """

        is_token_created, access_token = self.refresh_token()

        if not is_token_created:
            return False, access_token

        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        url = self.inv_cancel_url + invoice_id
        payload = {}

        rsp = requests.delete(url, headers=headers, data=payload)
        rsp_data = rsp.json()

        # INVOICE_PAID - Төлөгдсөн
        # INVOICE_NOTFOUND - Нэхэмжлэл олдоогүй
        # INVOICE_ALREADY_CANCELED - Нэмэмжлэх цуцлагдсан

        if rsp.status_code != 200 and rsp_data.get("error") != "INVOICE_ALREADY_CANCELED":
            # NOTE QPay тал дээр алдаа гарсан гэсэн үг!
            return False, 'Нэхэмжлэлийг цуцлахад алдаа гарлаа!'

        return True, rsp.json()

    def check(self, invoice_id):
        """
            Төлбөр төлөгдсөн эсэхийг шалгахад функц
        """

        is_token_created, data = self.refresh_token()

        if not is_token_created:
            return False, data

        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer %s' % data
        }

        body = json.dumps(
            {
                "object_type": "INVOICE",
                "object_id": invoice_id,
                "offset": {
                    "page_number": 1,
                    "page_limit": 100
                }
            }
        )

        rsp = requests.post(self.check_url, data=body, headers=headers)

        if rsp.status_code != 200:
            # NOTE QPay тал дээр алдаа гарсан гэсэн үг!
            return False, 'Төлбөр төлөгдсөн эсэхийг шалгахад алдаа гарлаа!'

        return True, rsp.json()

    def get_payment(self):
        """
            Төлбөрийн мэдээлэл авах функц
        """
        # TODO хийх

        return False

    def cancel(self):
        """
            Төлбөрийг буцаах, цуцлах үед ашиглана.
            -Картын гүйлгээний үед л буцаах боломжтой!!!
        """
        # TODO хийх

        return False

    def refund(self):
        """
            Төлбөрийг буцаах, цуцлах үед ашиглана.
            -Картын гүйлгээний үед л буцаах боломжтой!!!
        """

        return False

    def payment_lists(self, page_number=1, page_limit=100, start_date=None, end_date=None):
        """
            Төлбөрийн жагсаалтыг авах функц
        """

        """
            Заавал өгөх талбар:
                start_date => Эхлэх хугацаа байна. Жишээ нь: '24/05/2022 00:00:00'
                end_date => Эхлэх хугацаа байна. Жишээ нь: '24/05/2022 23:59:59'
        """

        is_today = False

        # NOTE Анхны утгаар нь өнөөдрийн гүйлгээний жагсаалтыг авхааар хийлээ!
        if not start_date or not end_date:
            is_today = True

        if is_today:
            now = datetime.now()
            today = now.strftime("%Y-%m-%d %H:%M:%S")

            start_date = now.strftime("%Y-%m-%d") + ' ' + '00:00:00'
            end_date = today

        is_token_created, data = self.refresh_token()

        if not is_token_created:
            return False, data

        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer %s' % data
        }

        payload = json.dumps({
            'object_type': "INVOICE",
            "object_id": self.invoice_code,
            'start_date': start_date,
            'end_date': end_date,
            "offset": {
                "page_number": page_number,
                "page_limit": page_limit
            }
        })

        rsp = requests.post(self.payment_list_url, data=payload, headers=headers)

        if rsp.status_code != 200:
            # NOTE QPay тал дээр алдаа гарсан гэсэн үг!
            return False, 'Төлбөр төлөгдсөн эсэхийг шалгахад алдаа гарлаа!'

        return True, rsp.json()
