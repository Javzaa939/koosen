import uuid

from django.conf import settings

from django.utils.html import strip_tags
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

# from lms.models import UserValidationEmail


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
        'org_name': "Админ",
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
