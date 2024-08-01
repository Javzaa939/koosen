import base64
import uuid

from django.conf import settings

from django.utils.html import strip_tags
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

# from lms.models import UserValidationEmail

# to make user reset token able to expire
from django.core.signing import TimestampSigner, BadSignature
from django.utils import timezone
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

def email_send(user_id, email):
    """
        Нууц үг баталгаажуулах мэйл илгээх
    """
    # TODO: энийг дахин давхардаж байгаа эсэхийг шалгах
    token = uuid.uuid4().hex
    user_valid_email = UserValidationEmail.objects.create(
        user_id=user_id,
        token=token
    )

    if settings.DEBUG:
        verify_url = f'http://localhost:3000/new-password/{token}'
        logo_url = "http://localhost:3000/images/logo.png"
    else:
        # TODO: domain
        verify_url = f'https://zam.utilitysolution.mn/new-password/{token}'
        logo_url = "https://zam.utilitysolution.mn/images/logo.png"

    subject = "Нууц үг баталгаажуулах"
    datas = {
        'org_name': "Дотоод Хэргийн Их Сургууль",
        'logo_url': logo_url,
        'title': "Нууц үг оруулах",
        'body_text1': 'Сургалтын удирдлагын системд таны бүртгэл амжилттай хийгдлээ. Та хэрэглэгчийн нууц үгээ оруулна уу. ',
        'body_text2': 'Таны нууц үг баталгаажуулах хүчинтэй хугацаа:',
        'valid_before': user_valid_email.valid_before.strftime('%Y-%m-%d %H:%M:%S'),
        'verify_url': verify_url
    }
    html_body = render_to_string("mail_body.html", datas)
    text_body = strip_tags(html_body)
    email = EmailMultiAlternatives(subject, text_body, settings.DEFAULT_FROM_EMAIL, [email])
    email.attach_alternative(html_body, "text/html")
    email.send()

# to make user reset-token able to expire
class SignedTokenManager:
    def __init__(self):
        self.signer = TimestampSigner()

    def generate_token(self, user):
        timestamp = timezone.now().isoformat()
        token_data = f"{user.pk}_{timestamp}"
        signed_token = self.signer.sign(token_data)
        encoded_token = urlsafe_base64_encode(force_bytes(signed_token))
        return encoded_token

    def validate_token(self, signed_token, max_age=5*60):
        try:
            decoded_data = force_str(urlsafe_base64_decode(signed_token))
            token_data = self.signer.unsign(decoded_data, max_age=max_age)
            user_id, timestamp = token_data.split('_')
            timestamp = timezone.datetime.fromisoformat(timestamp)

            # Validate max_age
            if max_age:
                age = timezone.now() - timestamp
                if age.total_seconds() > max_age:
                    print('Expired token')
                    return False

            return {'user_id': user_id, 'timestamp': timestamp}
        except BadSignature:
            print('BadSignature')
            return False
        except Exception as e:
            print(f"Error validating token: {e}")
            return False