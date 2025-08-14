
import os
import datetime
import uuid

from django.conf import settings

from fpdf import FPDF, HTMLMixin

# Хүн болгоны pdf дахин давтагдашгүй байхаар random string үүсгэнэ
uuid_dynamic = uuid.uuid1()

# Өнөөдөр
today = datetime.date.today().strftime("%Y оны %m-р сарын %d-ны өдөр")

class PDF(FPDF, HTMLMixin):

    def header(self):

        # Эхний хуудас дээр хуудаслалтыг харуулахгүй
        if (self.page_no() != 1):

            self.set_font(family='DejaVu', style='', size=8)

            # Title
            self.set_xy(30, 10)
            self.multi_cell(w=120, h=3, markdown=True, txt='**Education Development Project Design**', border=0, align='L')

            self.set_xy(150, 10)
            self.multi_cell(w=30, h=3, markdown=True, txt=f'**Намар 2016 **', border=0, align='R')

            self.set_xy(30, self.get_y() + 1)
            self.multi_cell(w=150, h=3, markdown=True, txt=f'**Kiseok Lee**', border=0, align='L')

            self.set_y(self.get_y() + 8)


    def footer(self):

        # Эхний хуудас дээр хуудаслалтыг харуулахгүй
        if (self.page_no() != 1):

            self.set_y(-15)
            self.set_font(family='DejaVu', style='', size=8)
            self.multi_cell(w=175, h=5, txt=str(self.page_no()), border=0, align='R')


    def chapter(
        self
    ):
        self.set_font(family='DejaVu', style='', size=10)
        self.set_xy(30, self.get_y() + 12)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown = True,
            txt = 'Админ',
            border = 0,
            align = 'L'
        )

        self.set_xy(30, self.get_y())

        self.multi_cell(
            w = 150,
            h = 5,
            markdown = True,
            txt = 'Боловсролын коллеж, Дэлхийн боловсролын хамтын ажиллагаа',
            border = 0,
            align = 'L'
        )

        self.set_font(family='DejaVu', style='', size=11)
        self.set_xy(35, self.get_y() + 4)
        self.multi_cell(
            w = 140,
            h = 5,
            markdown=True,
            txt = f'**Education Development Project Design** __(on-line course)__',
            border = 0,
            align = 'C',
        )

        self.set_font(family='DejaVu', style='', size=10)
        self.set_xy(40, self.get_y())
        self.multi_cell(
            w = 130,
            h = 5,
            markdown=True,
            txt = f'**Fall 2016 (Monday 18:00 – 21:00)**',
            border = 0,
            align = 'C',
        )

        self.set_xy(30, self.get_y() + 15)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'Dr. Ki-Seok Lee',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y())
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'Email: chris012@snu.ac.kr',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y())
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'Tel: 010-4001-2954',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y())
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'Office Hours: Emails or by appointment',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y())
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'Course Number: 743.801',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'**Course Objective**',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'The course is designed to introduce the entire process and ways of designing education development projects. Class participants will learn how to design and plan international education projects. Ways of working with and collaborating with local communities to design international education development projects will be explored. The course is intended to integrate advance writing skills appropriate for international project planning.',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'**Course Objective**',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'The course is designed to introduce the entire process and ways of designing education development projects. Class participants will learn how to design and plan international education projects. Ways of working with and collaborating with local communities to design international education development projects will be explored. The course is intended to integrate advance writing skills appropriate for international project planning.',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'**Course Objective**',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'The course is designed to introduce the entire process and ways of designing education development projects. Class participants will learn how to design and plan international education projects. Ways of working with and collaborating with local communities to design international education development projects will be explored. The course is intended to integrate advance writing skills appropriate for international project planning.',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'**Course Objective**',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'The course is designed to introduce the entire process and ways of designing education development projects. Class participants will learn how to design and plan international education projects. Ways of working with and collaborating with local communities to design international education development projects will be explored. The course is intended to integrate advance writing skills appropriate for international project planning.',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'**Course Objective**',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'The course is designed to introduce the entire process and ways of designing education development projects. Class participants will learn how to design and plan international education projects. Ways of working with and collaborating with local communities to design international education development projects will be explored. The course is intended to integrate advance writing skills appropriate for international project planning.',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'**Course Objective**',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'The course is designed to introduce the entire process and ways of designing education development projects. Class participants will learn how to design and plan international education projects. Ways of working with and collaborating with local communities to design international education development projects will be explored. The course is intended to integrate advance writing skills appropriate for international project planning.',
            border = 0,
            align = 'L',
        )

        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'**Course Objective**',
            border = 0,
            align = 'L',
        )
        self.set_xy(30, self.get_y() + 6)
        self.multi_cell(
            w = 150,
            h = 5,
            markdown=True,
            txt = f'The course is designed to introduce the entire process and ways of designing education development projects. Class participants will learn how to design and plan international education projects. Ways of working with and collaborating with local communities to design international education development projects will be explored. The course is intended to integrate advance writing skills appropriate for international project planning.',
            border = 0,
            align = 'L',
        )

    def print_chapter(self):

        # Font
        self.add_font('DejaVu', fname=f"{os.path.join(settings.STATIC_ROOT, 'pdf_font', 'DejaVuSerif.ttf')}", uni=True)
        self.add_font('DejaVu', fname=f"{os.path.join(settings.STATIC_ROOT, 'pdf_font', 'DejaVuSerif-Bold.ttf')}", uni=True, style='b')
        self.add_font('DejaVu', fname=f"{os.path.join(settings.STATIC_ROOT, 'pdf_font', 'DejaVuSerif-Italic.ttf')}", uni=True, style='i')

        self.add_page()
        self.chapter()


def lesson_pdf(
    lesson_code='aaa'
):
    # PDF нэр үүсгэх
    # pdf_name = f'{lesson_code}{uuid_dynamic.hex}'
    pdf_name = f'{lesson_code}'

    pdf = PDF()
    pdf.print_chapter()
    pdf.output(os.path.join(settings.MEDIA_ROOT, 'pdf', f'{pdf_name}.pdf'), 'F')

# lesson_pdf()
