import datetime as dt

from rest_framework import mixins
from rest_framework import generics

from core.models import (
    AimagHot,
    SumDuureg,
    Zone,
    Schools,
    EducationalInstitutionCategory,
    PropertyType,
    Employee,
    OrgPosition,
    MainPosition,
    User,
    Teachers,
    UserProfessionInfo
)

from .serializers import (
    SchoolsSerializer,
    DB4Serializer,
    DB3Serializer,
)

from lms.models import (
    Student,
    SubOrgs,
    GraduationWork,
    Learning,
    ProfessionalDegree,
    ProfessionDefinition,
    Country,
    DormitoryStudent,
    StudentGrade,
    Score,
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.utils import get_active_year_season, calculate_age

from django.db import models, transaction
from django.db.models import Count, Q, F, IntegerField
from django.db.models.functions import Cast

from django.core.cache import cache

@permission_classes([IsAuthenticated])
class StatisticAPIView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    generics.GenericAPIView
):

    """ Статистик мэдээ"""

    queryset = Schools.objects
    serializer_class = SchoolsSerializer

    def get(self, request):
        " А-ДБ-1 жагсаалт "

        header = []
        header_key_start = 1

        header.append(
            {
                'name': 'Нийт сургалтын байгууллага'
            },
        )

        # Өмчийн хэлбэр
        prop_types = PropertyType.objects.all().values_list('name', flat=True)
        props = []

        header.append(
            {
                'name': 'Өмчийн хэлбэр',
                'child': []
            },
        )

        for prop_type in prop_types:
            header_key_start += 1
            if '(' in prop_type:
                parent_split = prop_type.split("(")
                parent = parent_split[len(parent_split)-1].replace(")", "")  if len(parent_split) > 0 else ''
                child = parent_split[0]

                search_obj = next((m for m in props if m.get('name')==parent), None)
                if search_obj:
                    for m in props:
                        if m.get('name') == parent:
                            childs = m.get('child')
                            childs.append(
                                {
                                    'name': child
                                }
                            )
                            m['child'] = childs
                            break
                else:
                    props.append(
                        {
                            'name': parent,
                            'child': [
                                {
                                    'name': child
                                }
                            ]
                        }
                    )
            else:
                header.append(
                    {
                        'name': prop_type,
                    }
                )

        for head in header:
            if head.get('name') == 'Өмчийн хэлбэр':
                head['child'] = props
                break

        # Сургалтын байгууллагын ангилал
        edu_values = EducationalInstitutionCategory.objects.values_list('name', flat=True)
        childs = []
        for edu in edu_values:
            header_key_start += 1
            childs.append(
                {
                    'name': edu,
                }
            )

        header.append({
            'name': 'Сургалтын байгууллагын ангилал',
            'child': childs
        })

        # Үндсэн дата бэлдэх хэсэг
        zone_data = []

        all_org = Schools.objects.count()
        prop_type_ids = PropertyType.objects.values_list('id', flat=True)
        edu_ids = EducationalInstitutionCategory.objects.values_list('id', flat=True)
        prop_objs = {}

        all_count = 1

        for prop_id in prop_type_ids:
            count = Schools.objects.filter(property_type=prop_id).count()
            all_count += 1
            prop_objs['{}'.format(all_count)] = count

        for edu in edu_ids:
            count = Schools.objects.filter(educational_institution_category=prop_id).count()
            all_count += 1
            prop_objs['{}'.format(all_count)] = count

        zone_data.append(
            {
                "name":"Бүгд",
                "aimag": [],
                '1': all_org,
                **prop_objs
            }
        )

        for item in Zone.objects.values('id', 'name'):
            aimags = []

            zone_obj = {}
            zone_obj['name'] = item.get('name')

            if 'Улаанбаатар'in item.get('name'):
                aimag = AimagHot.objects.filter(buschlel=item.get('id')).first()
                aimags = list(SumDuureg.objects.filter(unit1=aimag).values("name", 'unit1', 'id'))
            else:
                aimags = list(AimagHot.objects.filter(buschlel=item.get('id')).values( "name", 'id'))

            all_bus_count = {}
            for aimag in aimags:
                if aimag.get('unit1'):
                    school_queryset = Schools.objects.filter(unit2__id=aimag.get('id'))
                    all_school_count = school_queryset.count()
                else:
                    school_queryset = Schools.objects.filter(unit1__id=aimag.get('id'))
                    all_school_count = school_queryset.count()

                start_count = 1
                aimag['1'] = all_school_count

                for prop_id in prop_type_ids:
                    count = school_queryset.filter(property_type=prop_id).count()
                    start_count += 1
                    aimag['{}'.format(start_count)] = count

                for edu in edu_ids:
                    count = school_queryset.filter(educational_institution_category=prop_id).count()
                    start_count += 1
                    aimag['{}'.format(start_count)] = count

            zone_obj['aimag'] = aimags

            for aimag in aimags:
                for key, value in aimag.items():
                    if key.isnumeric():
                        if key not in all_bus_count:
                            all_bus_count[key] = value
                        else:
                            all_bus_count[key] = all_bus_count[key] + value

            zone_obj.update(all_bus_count)

            zone_data.append(zone_obj)

        return_datas = {
            'header': header,
            'header_count': header_key_start,
            'datas': zone_data
        }

        return request.send_data(return_datas)

@permission_classes([IsAuthenticated])
class StatisticDB3APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-3"""
    queryset = Schools.objects
    serializer_class = DB3Serializer

    def get(self, request):

        headers = list()
        types = list()
        group = list()
        headers_grouped = list()
        property_name = list(PropertyType.objects.all().values("name", "id"))

        for key in property_name:

            if "(" in key["name"]:
                first = key["name"].find("(")
                last = key["name"].find(")")
                headers.append(dict(id = key["id"],type = key["name"][first+1:last], name = key["name"]))
                types.append(key["name"][first+1:last])

            else:
                headers.append(dict(id = key["id"],type = key["name"], name = key["name"]))
                types.append(key["name"])

        types = list(dict.fromkeys(types))

        for names in types:
            group = list()
            for keys in headers:
                if names in keys["name"]:
                    group.append(keys)
            headers_grouped.append(group)

        ranges = range(-1, len(headers_grouped))
        range_pro = range(0, len(ProfessionalDegree.objects.all())+1)
        development_difficulty = Student.DEVELOPMENT_DIFFICULTY
        development_difficulty = ((0, "Бүгд"), *development_difficulty)

        key_all_data = list()

        student_qs = Student.objects.all()
        year, season = get_active_year_season()
        graduate = GraduationWork.objects.filter(lesson_year=year).values_list("student", flat=True)

        for key in ranges:      # Өмчийн хэлбэрийн төрлөөр гүйлгэх (range)
            key_data = list()
            if key == -1:  # -1 үед Өмчийн хэлбэрийн бүх төрөл дэх сурагчийг тооцно
                for idx in range_pro:       # Өмчийн хэлбэр дотор боловсролын зэргээр гүйлгэх
                    key_obj = list()
                    if idx == 0 :       # 0 үед Өмчийн хэлбэрийн төрөл доторх бүх сурагчийг тооцно
                        all_data = list()
                        false_mental = student_qs#.filter(is_mental=False) # (student_qs__false_mental)
                        men = len(false_mental.filter(gender=1))
                        women = len(false_mental.filter(gender=2))
                        all = men + women

                        all_data_dict = {
                            "merged_name": "Нийт сурагчдийн тоо",
                            "info_name": "Бүгд",
                            "all": all,
                            "men": men,
                            "women": women,
                        }
                        key_obj.append(all_data_dict)

                        all_data = list()
                        for keys in development_difficulty:     # Хөгжлийн бэрхшээлийн төрлөөр гүйлгэх
                            if keys[0]==0:      # 0 үед тухайн төрлийн бүх сурагчийг авах
                                true_mental = student_qs.filter(is_mental = True)  # (student_qs__true_mental)
                                men = len(true_mental.filter(gender=1))
                                women = len(true_mental.filter(gender=2))
                                all = men + women

                                true_mental_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(true_mental_obj)     #  (key_data__key_obj__true_mental_obj)
                            else:
                                dis_qs = true_mental.filter(mental_type = keys[0])      # Хөгжлийн бэрхшээлийн төрлөөр filter-лэх  (student_qs__true_mental__dis_qs)
                                men = len(dis_qs.filter(gender=1))
                                women = len(dis_qs.filter(gender=2))
                                all = men + women

                                dis_qs_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(dis_qs_obj)      #  (key_data__key_obj__dis_qs_obj)
                        all_data_dis_dict = {
                            "merged_name": "Хөгжлийн бэрхшээлийн төрлүүд",
                            "dis_student": all_data
                        }


                        key_obj.append(all_data_dis_dict)
                        graduate_qs = student_qs.filter(id__in=graduate)
                        men = len(graduate_qs.filter(gender=1))
                        women = len(graduate_qs.filter(gender=2))
                        all = men + women

                        graduate_qs_obj = {
                            "info_name": "Төгсөх ангийн суралцагчид",
                            "all": all,
                            "men": men,
                            "women": women
                        }
                        key_obj.append(graduate_qs_obj)

                    else:
                        all_data = list()
                        false_mental_deg = false_mental.filter(group__degree = idx)     # (student_qs__false_mental__false_mental_deg)
                        men = len(false_mental_deg.filter(gender=1))
                        women = len(false_mental_deg.filter(gender=2))
                        all = men + women

                        all_pro_dict = {
                            "merged_name": "Нийт сурагчдийн тоо",
                            "info_id": 0,
                            "info_name": "Бүгд",
                            "all": all,
                            "men": men,
                            "women": women,
                        }
                        key_obj.append(all_pro_dict)

                        true_mental_deg = true_mental.filter(group__degree = idx)       # (student_qs__true_mental__true_mental_deg)
                        all_data = list()
                        for keys in development_difficulty:
                            if keys[0]==0:
                                men = len(true_mental_deg.filter(gender=1))
                                women = len(true_mental_deg.filter(gender=2))
                                all = men + women

                                true_mental_deg_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(true_mental_deg_obj)     # (key_data__key_obj__false_mental_deg_obj)
                            else:
                                true_mental_deg_dis_type = true_mental_deg.filter(mental_type = keys[0]) # (student_qs__true_mental__true_mental_deg__true_mental_deg_dis_type)
                                men = len(true_mental_deg_dis_type.filter(gender=1))
                                women = len(true_mental_deg_dis_type.filter(gender=2))
                                all = men + women

                                true_mental_deg_dis_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(true_mental_deg_dis_obj)     # (key_data__key_obj__false_mental_deg_obj)
                        all_pro_dict = {
                            "merged_name": "Хөгжлийн бэрхшээлийн төрлүүд",
                            "dis_student": all_data
                        }
                        key_obj.append(all_pro_dict)


                        graduate_qs = false_mental_deg.filter(id__in=graduate)
                        men = len(graduate_qs.filter(gender=1))
                        women = len(graduate_qs.filter(gender=2))
                        all = men + women

                        graduate_qs_obj = {
                            "info_name": "Төгсөх ангийн суралцагчид",
                            "all": all,
                            "men": men,
                            "women": women
                        }
                        key_obj.append(graduate_qs_obj)
                    degree_dict ={
                        "degree_id": idx ,
                        "degree_code":  'All' if idx==0 else ProfessionalDegree.objects.filter(id=idx).first().degree_code,
                        "degree_name": "Бүгд" if idx==0 else ProfessionalDegree.objects.filter(id=idx).first().degree_name,
                        "degree_obj": key_obj
                    }
                    key_data.append(degree_dict)        # (key_data__key_obj)
                key_all_data_dict = {
                    "property_type": "Бүгд",
                    "data": key_data
                }
            else:
                filter_data = list()
                id_data = 0
                for datax in headers_grouped:
                    if types[key] in datax[0]["name"]:
                        break
                    id_data+=1

                for datax in headers_grouped[id_data]:
                    filter_data.append(datax["id"])

                property_data = Schools.objects.filter(property_type__in=filter_data).values_list("id", flat=True)
                sub_school = SubOrgs.objects.filter(org__in=property_data)
                student_qs = Student.objects.filter(school__in=sub_school)
                for idx in range_pro:       # Өмчийн хэлбэр дотор боловсролын зэргээр гүйлгэх
                    key_obj = list()
                    if idx == 0 :       # 0 үед Өмчийн хэлбэрийн төрөл доторх бүх сурагчийг тооцно
                        all_data = list()
                        false_mental = student_qs.filter(is_mental=False) # (student_qs__false_mental)
                        men = len(false_mental.filter(gender=1))
                        women = len(false_mental.filter(gender=2))
                        all = men + women

                        all_data_dict = {
                            "merged_name": "Нийт сурагчдийн тоо",
                            "info_name": "Бүгд",
                            "all": all,
                            "men": men,
                            "women": women,
                        }
                        key_obj.append(all_data_dict)

                        all_data = list()
                        for keys in development_difficulty:     # Хөгжлийн бэрхшээлийн төрлөөр гүйлгэх
                            if keys[0]==0:      # 0 үед тухайн төрлийн бүх сурагчийг авах
                                true_mental = student_qs.filter(is_mental = True)  # (student_qs__true_mental)
                                men = len(true_mental.filter(gender=1))
                                women = len(true_mental.filter(gender=2))
                                all = men + women

                                true_mental_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(true_mental_obj)     #  (key_data__key_obj__true_mental_obj)
                            else:
                                dis_qs = true_mental.filter(mental_type = keys[0])      # Хөгжлийн бэрхшээлийн төрлөөр filter-лэх  (student_qs__true_mental__dis_qs)
                                men = len(dis_qs.filter(gender=1))
                                women = len(dis_qs.filter(gender=2))
                                all = men + women

                                dis_qs_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(dis_qs_obj)      #  (key_data__key_obj__dis_qs_obj)
                        all_data_dis_dict = {
                            "merged_name": "Хөгжлийн бэрхшээлийн төрлүүд",
                            "dis_student": all_data
                        }
                        key_obj.append(all_data_dis_dict)


                        graduate_qs = student_qs.filter(id__in=graduate)
                        men = len(graduate_qs.filter(gender=1))
                        women = len(graduate_qs.filter(gender=2))
                        all = men + women

                        graduate_qs_obj = {
                            "info_name": "Төгсөх ангийн суралцагчид",
                            "all": all,
                            "men": men,
                            "women": women
                        }
                        key_obj.append(graduate_qs_obj)

                    else:
                        all_data = list()
                        false_mental_deg = false_mental.filter(group__degree = idx)     # (student_qs__false_mental__false_mental_deg)
                        men = len(false_mental_deg.filter(gender=1))
                        women = len(false_mental_deg.filter(gender=2))
                        all = men + women

                        all_pro_dict = {
                            "merged_name": "Нийт сурагчдийн тоо",
                            "info_id": 0,
                            "info_name": "Бүгд",
                            "all": all,
                            "men": men,
                            "women": women,
                        }
                        key_obj.append(all_pro_dict)


                        true_mental_deg = true_mental.filter(group__degree = idx)       # (student_qs__true_mental__true_mental_deg)
                        all_data = list()
                        for keys in development_difficulty:
                            if keys[0]==0:
                                men = len(true_mental_deg.filter(gender=1))
                                women = len(true_mental_deg.filter(gender=2))
                                all = men + women

                                true_mental_deg_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(true_mental_deg_obj)     # (key_data__key_obj__false_mental_deg_obj)
                            else:
                                true_mental_deg_dis_type = true_mental_deg.filter(mental_type = keys[0]) # (student_qs__true_mental__true_mental_deg__true_mental_deg_dis_type)
                                men = len(true_mental_deg_dis_type.filter(gender=1))
                                women = len(true_mental_deg_dis_type.filter(gender=2))
                                all = men + women

                                true_mental_deg_dis_obj = {
                                    "info_id": keys[0],
                                    "info_name": keys[1],
                                    "all": all,
                                    "men": men,
                                    "women": women
                                }
                                all_data.append(true_mental_deg_dis_obj)     # (key_data__key_obj__false_mental_deg_obj)
                        all_pro_dict = {
                            "merged_name": "Хөгжлийн бэрхшээлийн төрлүүд",
                            "dis_student": all_data
                        }
                        key_obj.append(all_pro_dict)


                        graduate_qs = student_qs.filter(id__in=graduate)
                        men = len(graduate_qs.filter(gender=1))
                        women = len(graduate_qs.filter(gender=2))
                        all = men + women

                        graduate_qs_obj = {
                            "info_name": "Төгсөх ангийн суралцагчид",
                            "all": all,
                            "men": men,
                            "women": women
                        }
                        key_obj.append(graduate_qs_obj)


                    degree_dict ={
                        "degree_id": idx,
                        "degree_code":  'All' if idx==0 else ProfessionalDegree.objects.filter(id=idx).first().degree_code,
                        "degree_name": "Бүгд" if idx==0 else ProfessionalDegree.objects.filter(id=idx).first().degree_name,
                        "degree_obj": key_obj
                    }
                    key_data.append(degree_dict)
                key_all_data_dict = {
                    "property_type": types[key],
                    "data": key_data
                }
            key_all_data.append(key_all_data_dict)
        return request.send_data(key_all_data)


class StatisticDB4APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):

    """ А-ДБ-4 """
    queryset = Student.objects.all()
    serializer_class = DB4Serializer

    def get(self, request):
        qs = self.queryset
        male = Student.GENDER_MALE
        female = Student.GENDER_FEMALE

        header_key = 1

        degree_obj = {}
        zone_data = []

        degrees = range(len(ProfessionalDegree.objects.all())+1)
        for key in degrees:
            header_key += 1
            if key == 0:
                stud_male = qs.filter(gender=male).count()
                stud_female = qs.filter(gender=female).count()
                all_stud = stud_female + stud_male

                degree_obj["niit_eregtei"] = stud_male
                degree_obj["niit_emegtei"] = stud_female
                degree_obj["niit_suragchid"] = all_stud

            else:

                degree_code_c = qs.filter(group__degree__degree_code="C")
                # diplom
                stud_male = degree_code_c.filter(gender=male).count()
                stud_female = degree_code_c.filter(gender=female).count()
                all_stud = stud_male + stud_female

                degree_obj["diplom_emegtei"] = stud_female
                degree_obj["diplom_eregtei"] = stud_male
                degree_obj["diplom_niit"] = all_stud

                degree_code_e = qs.filter(group__degree__degree_code="E")

                # magistr
                stud_male = degree_code_e.filter(gender=male).count()
                stud_female = degree_code_e.filter(gender=female).count()
                all_stud = stud_male + stud_female

                degree_obj["magistr_em"] = stud_female
                degree_obj["magistr_er"] = stud_male
                degree_obj["magistr_niit"] = all_stud

                # bakalavr
                degree_code_d = qs.filter(group__degree__degree_code="D")
                stud_male = degree_code_d.filter(gender=male).count()
                stud_female = degree_code_d.filter(gender=female).count()
                all_stud = stud_male + stud_female

                degree_obj["bakalavr_em"]=stud_female
                degree_obj["bakalavr_er"]=stud_male
                degree_obj["bakalavr_niit"]=all_stud

                # doktor
                degree_code_f = qs.filter(group__degree__degree_code__contains="F")
                stud_male = degree_code_f.filter(gender=male).count()
                stud_female = degree_code_f.filter(gender=female).count()
                all_stud = stud_male + stud_female

                degree_obj["doktor_em"]=stud_female
                degree_obj["doktor_er"]=stud_male
                degree_obj["doktor_niit"]=all_stud

        zone_data.append({
            "name":"Бүгд",
            "aimag":[],
            **degree_obj
        })

        # бүс
        for keys in Zone.objects.values("id", "code", "name"):
            zone_obj = {}
            zone_obj["name"]=keys.get("name")
            zone_obj["code"]=keys.get("code")
            aimags = []

            degrees = range(len(ProfessionalDegree.objects.all())+1)
            for key in degrees:
                if key == 0:
                    if 'Улаанбаатар'in keys.get('name'):
                        aimag = AimagHot.objects.filter(name__contains='Улаанбаатар').first()
                        stud_male = qs.filter(unit1=aimag, gender=male).count()
                        stud_female = qs.filter(unit1=aimag, gender=female).count()
                    else:
                        stud_male = qs.filter(unit1__buschlel__id=keys.get("id"), gender=male).count()
                        stud_female = qs.filter(unit1__buschlel__id=keys.get("id"), gender=female).count()

                    all_stud = stud_female + stud_male

                    zone_obj["niit_eregtei"]=stud_male
                    zone_obj["niit_emegtei"]=stud_female
                    zone_obj["niit_suragchid"]=all_stud
                else:
                    # diplom
                    degree_code_c = qs.filter( unit1__buschlel__id=keys.get("id"),group__degree__degree_code__contains="C")
                    stud_male = degree_code_c.filter(gender=male).count()
                    stud_female = degree_code_c.filter(gender=female).count()
                    all_stud = degree_code_c.count()

                    zone_obj["diplom_emegtei"]=stud_female
                    zone_obj["diplom_eregtei"]=stud_male
                    zone_obj["diplom_niit"]=all_stud

                    # magister
                    degree_code_e = qs.filter(unit1__buschlel__code=keys.get("code"),group__degree__degree_code__contains="E")
                    stud_male = degree_code_e.filter(gender=male).count()
                    stud_female = degree_code_e.filter(gender=female).count()
                    all_stud = stud_male + stud_female

                    zone_obj["magistr_em"]=stud_female
                    zone_obj["magistr_er"]=stud_male
                    zone_obj["magistr_niit"]=all_stud

                    degree_code_d = qs.filter(unit1__buschlel__code=keys.get("code"), group__degree__degree_code__contains="D")
                    # bakalavr
                    stud_male = degree_code_d.filter(gender=male).count()
                    stud_female = degree_code_d.filter(gender=female).count()
                    all_stud = stud_male + stud_female

                    zone_obj["bakalavr_em"]=stud_female
                    zone_obj["bakalavr_er"]=stud_male
                    zone_obj["bakalavr_niit"]=all_stud

                    degree_code_f = qs.filter(unit1__buschlel__code=keys.get("code"), group__degree__degree_code__contains="F")
                    # doktor
                    stud_male = degree_code_f.filter(gender=male).count()
                    stud_female = degree_code_f.filter(gender=female).count()
                    all_stud = stud_male + stud_female

                    zone_obj["doktor_em"]=stud_female
                    zone_obj["doktor_er"]=stud_male
                    zone_obj["doktor_niit"]=all_stud


            if 'Улаанбаатар'in keys.get('name'):
                aimag = AimagHot.objects.filter(buschlel=keys.get('id')).first()
                aimags = list(SumDuureg.objects.filter(unit1=aimag).values('id',"name", 'unit1'))
            else:
                aimags = list(AimagHot.objects.filter(buschlel=keys.get('id')).values( "name", 'id'))

            all_bus_count = {}
            for aimag in aimags:
                degree_range = range(len(ProfessionalDegree.objects.all())+1)

                # Дүүрэг, сум
                if aimag.get("unit1"):
                    for key in degree_range:
                        if key==0:
                            stud_male = qs.filter(unit2=aimag.get("id"),gender=male).count()
                            stud_female = qs.filter(unit2=aimag.get("id"),gender=female).count()
                            all_stud = stud_female + stud_male

                        aimag["niit_suragchid"]=all_stud
                        aimag["niit_emegtei"]=stud_female
                        aimag["niit_eregtei"]=stud_male

                        degree_code_c = qs.filter(unit2=aimag.get("id"), group__degree__degree_code__contains="C")
                        # diplom
                        stud_male = degree_code_c.filter(gender=male).count()
                        stud_female = degree_code_c.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["diplom_emegtei"]=stud_female
                        aimag["diplom_eregtei"]=stud_male
                        aimag["diplom_niit"]=all_stud

                        degree_code_e = qs.filter(unit2=aimag.get("id"),group__degree__degree_code__contains="E")
                        # magister
                        stud_male = degree_code_e.filter(gender=male).count()
                        stud_female = degree_code_e.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["magistr_em"]=stud_female
                        aimag["magistr_er"]=stud_male
                        aimag["magistr_niit"]=all_stud

                        degree_code_d = qs.filter(unit2=aimag.get("id"), group__degree__degree_code__contains="D")
                        # bakalavr
                        stud_male = degree_code_d.filter(gender=male).count()
                        stud_female = degree_code_d.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["bakalavr_em"]=stud_female
                        aimag["bakalavr_er"]=stud_male
                        aimag["bakalavr_niit"]=all_stud

                        degree_code_f = qs.filter(unit2=aimag.get("id"), group__degree__degree_code__contains="F")
                        # doktor
                        stud_male = degree_code_f.filter(gender=male).count()
                        stud_female = degree_code_f.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["doktor_em"]=stud_female
                        aimag["doktor_er"]=stud_male
                        aimag["doktor_niit"]=all_stud

                # аймгуудын суралцагчдын мэдээлэл
                else:
                    for key in degree_range:
                        if key==0:
                            stud_male = qs.filter(unit1=aimag.get("id"),gender=male).count()
                            stud_female = qs.filter(unit1=aimag.get("id"),gender=female).count()
                            all_stud = stud_female + stud_male

                            aimag["niit_suragchid"]=all_stud
                            aimag["niit_emegtei"]=stud_female
                            aimag["niit_eregtei"]=stud_male

                        degree_code_c = qs.filter(unit1=aimag.get("id"), group__degree__degree_code__contains="C")
                        # diplom
                        stud_male = degree_code_c.filter(gender=male).count()
                        stud_female = degree_code_c.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["diplom_emegtei"]=stud_female
                        aimag["diplom_eregtei"]=stud_male
                        aimag["diplom_niit"]=all_stud

                        degree_code_e = qs.filter(unit1__name__contains=aimag.get("name"),group__degree__degree_code__contains="E")
                        # magister
                        stud_male = degree_code_e.filter(gender=male).count()
                        stud_female = degree_code_e.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["magistr_em"]=stud_female
                        aimag["magistr_er"]=stud_male
                        aimag["magistr_niit"]=all_stud

                        degree_code_d = qs.filter(unit1__name__contains=aimag.get("name"), group__degree__degree_code__contains="D")
                        # bakalavr
                        stud_male = degree_code_d.filter(gender=male).count()
                        stud_female = degree_code_d.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["bakalavr_em"]=stud_female
                        aimag["bakalavr_er"]=stud_male
                        aimag["bakalavr_niit"]=all_stud

                        degree_code_f = qs.filter(unit1__name__contains=aimag.get("name"), group__degree__degree_code__contains="F")
                        # doktor
                        stud_male = degree_code_f.filter(gender=male).count()
                        stud_female = degree_code_f.filter(gender=female).count()
                        all_stud = stud_male + stud_female

                        aimag["doktor_em"]=stud_female
                        aimag["doktor_er"]=stud_male
                        aimag["doktor_niit"]=all_stud

            zone_obj['aimag'] = aimags

            for aimag in aimags:
                for key, value in aimag.items():
                    if key.isnumeric():
                        if key not in all_bus_count:
                            all_bus_count[key] = value
                        else:
                            all_bus_count[key] = all_bus_count[key] + value

            zone_obj.update(all_bus_count)

            zone_data.append(zone_obj)


        return_datas={
            "datas":zone_data,
        }

        return request.send_data(return_datas)

@permission_classes([IsAuthenticated])
class StatisticDB6APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-6"""
    queryset = Student.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):

        user = request.user     # user data авах хэсэг
        queryset = self.queryset

        school_id = Employee.objects.filter(user=user).first()

        if not school_id.org:
            return request.send_error("ERR_002")

        school_id = school_id.org   # Байгууллагийн ID авах хэсэг

        sub_school_ids = SubOrgs.objects.filter(org=school_id).values_list("id", flat=True)
        queryset = queryset.filter(school__in=sub_school_ids)   # Тухайн байгууллагийн сурагчдийг авах хэсэг

        range_pro = range(0, ProfessionalDegree.objects.all().count() + 1)   # Мэргэжлийн тоо хэмжээ
        range_study_type = range(0, Learning.objects.all().count() + 1)  # Суралцах хэлбэрийн тоо хэмжээ
        range_level = range(0, 7)   # Дамжааны тоо хэмжээ

        all_data = list()

        for key in range_pro:   # Мэргэжлийн зэргийн тоогоор гүйлгэх

            if key==0:
                study_type_dict = dict()

                for id in range_study_type:     # Суралцах хэлбэрээр гүйлгэх
                    naming_study_type = "type_study_name_" + str(id)    # Суралцах хэлбэрийн unique key авах
                    level_dict = dict()

                    if id==0:

                        for ids in range_level:     # Дамжаагаар гүйлгэх
                            naming_level = "level_name_" + str(ids)     # Дамжааны unique key авах

                            if ids==0:
                                all = {
                                    "all_" + naming_level: queryset.count(),
                                    "men_" + naming_level: queryset.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: queryset.filter(gender=Student.GENDER_FEMALE).count()
                                }

                            else:
                                level_qs = queryset.filter(group__level=ids)    # Дамжаагаар шүүх
                                all = {
                                    "all_" + naming_level: level_qs.count(),
                                    "men_" + naming_level: level_qs.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: level_qs.filter(gender=Student.GENDER_FEMALE).count()
                                }

                            level_dict.update(all)      # Дамжааны мэдээллийг нэгтгэх

                    else:
                        study_type_qs = queryset.filter(group__learning_status=id)      # Суралцах хэлбэрээр шүүх

                        for ids in range_level:      # Дамжаагаар гүйлгэх
                            naming_level = "level_name_" + str(ids)     # Дамжааны unique key авах

                            if ids==0:
                                all = {
                                    "all_" + naming_level: study_type_qs.count(),
                                    "men_" + naming_level: study_type_qs.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: study_type_qs.filter(gender=Student.GENDER_FEMALE).count()
                                }
                            else:
                                level_qs = study_type_qs.filter(group__level=ids)       # Дамжаагаар шүүх
                                all = {
                                    "all_" + naming_level: study_type_qs.count(),
                                    "men_" + naming_level: study_type_qs.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: study_type_qs.filter(gender=Student.GENDER_FEMALE).count()
                                }

                            level_dict.update(all)      # Дамжааны мэдээллийг нэгтгэх

                    all_level_dict = {
                        "name": "Бүгд" if id==0 else Learning.objects.filter(id=id).first().learn_name,
                        "data": level_dict
                    }

                    study_type_dict.update({naming_study_type: all_level_dict})     # Суралцах хэлбэрүүдийг нэгтгэх

            else:
                pro_qs = queryset.filter(group__degree=key)     # Мэргэжлийн зэргээр шүүх
                study_type_dict = dict()

                for id in range_study_type:
                    naming_study_type = "type_study_name_" + str(id)    # Суралцах хэлбэрийн unique key авах
                    level_dict = dict()

                    if id==0:

                        for ids in range_level:      # Дамжаагаар гүйлгэх
                            naming_level = "level_name_" + str(ids)      # Дамжааны unique key авах

                            if ids==0:
                                all = {
                                    "all_" + naming_level: pro_qs.count(),
                                    "men_" + naming_level: pro_qs.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: pro_qs.filter(gender=Student.GENDER_FEMALE).count()
                                }

                            else:
                                level_qs = pro_qs.filter(group__level=ids)      # Дамжаагаар шүүх
                                all = {
                                    "all_" + naming_level: level_qs.count(),
                                    "men_" + naming_level: level_qs.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: level_qs.filter(gender=Student.GENDER_FEMALE).count()
                                }

                            level_dict.update(all)      # Дамжааны мэдээллийг нэгтгэх

                    else:
                        study_type_qs = pro_qs.filter(group__learning_status=id)    # Суралцах хэлбэрээр шүүх

                        for ids in range_level:
                            naming_level = "level_name_" + str(ids)     # Дамжааны unique key авах

                            if ids==0:
                                all = {
                                    "all_" + naming_level: study_type_qs.count(),
                                    "men_" + naming_level: study_type_qs.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: study_type_qs.filter(gender=Student.GENDER_FEMALE).count()
                                }

                            else:
                                level_qs = study_type_qs.filter(group__level=ids)   # Дамжаагаар шүүх
                                all = {
                                    "all_" + naming_level: study_type_qs.count(),
                                    "men_" + naming_level: study_type_qs.filter(gender=Student.GENDER_MALE).count(),
                                    "women_" + naming_level: study_type_qs.filter(gender=Student.GENDER_FEMALE).count()
                                }

                            level_dict.update(all)     # Дамжааны мэдээллийг нэгтгэх

                    all_level_dict = {
                        "name": "Бүгд" if id==0 else Learning.objects.filter(id=id).first().learn_name,
                        "data": level_dict
                    }

                    study_type_dict.update({naming_study_type: all_level_dict})     # Суралцах хэлбэрийн мэдээллийг нэгтгэх

            all_study_type_dict = {
                "name": "Бүгд" if key==0 else ProfessionalDegree.objects.filter(id=key).first().degree_name,
                "data": study_type_dict
            }

            all_data.append(all_study_type_dict)    # Суралцах хэлбэрийн dict мэдээллийг array-т нэгтгэх

        return request.send_data(all_data)

@permission_classes([IsAuthenticated])
class StatisticDB5APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-5"""
    queryset = Student.objects.all().order_by("birth_date")
    serializer_class = DB3Serializer

    def get(self, request):
        # Насны хязгаар
        child_age = 0
        young_age = 15
        mid_age = 35
        old_age = 60
        now = dt.datetime.now()
        qs = self.queryset
        # Бүх оюутны мэдээлэл авах хэсэг
        all_age_dict = {
            "queryset": qs,
            "range_age": "Бүгд",
        }
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах <15
        end_date = now
        start_date = dt.datetime(now.year - young_age, now.month, now.day)
        child_age_qs = qs.filter(birth_date__gt=start_date, birth_date__lte=end_date)
        child_age_dict = {
            "queryset": child_age_qs,
            "range_age": "<" + str(young_age),
        }
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах 15-34
        young_age_list = []
        young_age_next = 0
        while young_age < mid_age:
            young_age_next = young_age + 1
            start_date = dt.datetime(now.year - young_age_next, now.month, now.day)
            end_date = dt.datetime(now.year - young_age, now.month, now.day)
            young_age_qs = qs.filter(birth_date__gt=start_date, birth_date__lte=end_date)
            young_age_dict = {
                "queryset": young_age_qs,
                "range_age": str(young_age),
            }
            young_age_list.append(young_age_dict)
            young_age = young_age_next
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах 35-59
        mid_age_list = []
        mid_age_next = 0
        while mid_age < old_age:
            mid_age_next = mid_age + 5
            start_date = dt.datetime(now.year - mid_age_next, now.month, now.day)
            end_date = dt.datetime(now.year - mid_age, now.month, now.day)
            mid_age_qs = qs.filter(birth_date__gt=start_date, birth_date__lte=end_date)
            mid_age_dict = {
                "queryset": mid_age_qs,
                "range_age": str(mid_age) + "-" + str(mid_age_next - 1)
            }
            mid_age_list.append(mid_age_dict)
            mid_age = mid_age_next
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах 59<
        end_date = now
        end_date = dt.datetime(now.year - old_age, now.month, now.day)
        old_age_qs = qs.filter(birth_date__lte=end_date)
        old_age_dict = {
            "queryset": old_age_qs,
            "range_age": str(old_age - 1) + "<",
        }
        # Бүх мэдээллийг хүснэгтэнд нэгтгэх хэсэг
        all_age_list = [all_age_dict, child_age_dict, *young_age_list, *mid_age_list, old_age_dict]
        # Мэргэжлийн хязгаарын хэмжээг авах
        range_pro = range(0, len(ProfessionalDegree.objects.all()) + 1)
        # Хөгжлийн бэрхшээлийн хязгаарын хэмжээг авах
        range_dis = ((0, "Бүгд"), *Student.DEVELOPMENT_DIFFICULTY)

        all_data = []
        # Нэгтгэсэн мэдээллээр гүйлгэх
        for key in all_age_list:
            age_dict = {}
            all_pro_list = []
            # Насны хязгаар дах оюутнуудын мэдээллээс мэргэжлийн зэргүүдээр хэдэн оюутнууд суралцаж буйг бодох хэсэг
            for pro in range_pro:
                if pro == 0:
                    men = len(key["queryset"].filter(gender=Student.GENDER_MALE))
                    women = len(key["queryset"].filter(gender=Student.GENDER_FEMALE))
                    all = men + women
                    pro_dict = {
                        "all_student": all,
                        "men_student": men,
                        "women_student": women,
                        "all_degree_id": 0,
                        "all_degree_code": "Бүгд",
                        "all_degree_name": "Бүгд"
                    }
                else:
                    pro_qs = key["queryset"].filter(group__degree=pro)
                    men = len(pro_qs.filter(gender=Student.GENDER_MALE))
                    women = len(pro_qs.filter(gender=Student.GENDER_FEMALE))
                    all = men + women
                    naming = ProfessionalDegree.objects.filter(id=pro).first().degree_eng_name
                    pro_dict = {
                        "all_student": all,
                        "men_student": men,
                        "women_student": women,
                        "all_degree_id": pro,
                        "all_degree_code": ProfessionalDegree.objects.filter(id=pro).first().degree_code,
                        "all_degree_name": ProfessionalDegree.objects.filter(id=pro).first().degree_name
                    }
                all_pro_list.append(pro_dict)
            age_dict.update({"degree": all_pro_list})
            # Хөгжлийн бэрхшээлтэй оюутнуудын мэдээллийг бодох хэсэг
            all_dis_list = []
            dis_qs = key["queryset"].filter(is_mental=True)
            for dis in range_dis:
                if dis[0] == 0:
                    men = len(dis_qs.filter(gender=Student.GENDER_MALE))
                    women = len(dis_qs.filter(gender=Student.GENDER_FEMALE))
                    all = men + women
                    dis_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "dis_id": dis[0],
                        "dis_name": dis[1]
                    }

                else:
                    true_dis_qs = dis_qs.filter(mental_type=dis[0])
                    men = len(true_dis_qs.filter(gender=Student.GENDER_MALE))
                    women = len(true_dis_qs.filter(gender=Student.GENDER_FEMALE))
                    all = men + women
                    dis_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "dis_id": dis[0],
                        "dis_name": dis[1]
                    }
                all_dis_list.append(dis_dict)

            age_dict.update({"disability": all_dis_list})
            # Мэдээллийг нэгтгэх хэсэг
            all_data.append({"age_list": age_dict, "range_age": key["range_age"]})

        return request.send_data(all_data)


@permission_classes([IsAuthenticated])
class StatisticDB8APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-8"""
    queryset = Student.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):
        # Насны хязгаар
        child_age = 0
        young_age = 15
        mid_age = 35
        old_age = 60
        now = dt.datetime.now()
        qs = self.queryset.filter(group__level=1)
        # Бүх оюутны мэдээлэл авах хэсэг
        all_age_dict = {
            "queryset": qs,
            "range_age": "Бүгд",
        }
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах <15
        end_date = now
        start_date = dt.datetime(now.year - young_age, now.month, now.day)
        child_age_qs = qs.filter(birth_date__gt=start_date, birth_date__lte=end_date, group__level=1)
        child_age_dict = {
            "queryset": child_age_qs,
            "range_age": "<" + str(young_age),
        }
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах 15-34
        young_age_list = []
        young_age_next = 0
        while young_age < mid_age:
            young_age_next = young_age + 1
            start_date = dt.datetime(now.year - young_age_next, now.month, now.day)
            end_date = dt.datetime(now.year - young_age, now.month, now.day)
            young_age_qs = qs.filter(birth_date__gt=start_date, birth_date__lte=end_date, group__level=1)
            young_age_dict = {
                "queryset": young_age_qs,
                "range_age": str(young_age),
            }
            young_age_list.append(young_age_dict)
            young_age = young_age_next
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах 35-59
        mid_age_list = []
        mid_age_next = 0
        while mid_age < old_age:
            mid_age_next = mid_age + 5
            start_date = dt.datetime(now.year - mid_age_next, now.month, now.day)
            end_date = dt.datetime(now.year - mid_age, now.month, now.day)
            mid_age_qs = qs.filter(birth_date__gt=start_date, birth_date__lte=end_date, group__level=1)
            mid_age_dict = {
                "queryset": mid_age_qs,
                "range_age": str(mid_age) + "-" + str(mid_age_next - 1)
            }
            mid_age_list.append(mid_age_dict)
            mid_age = mid_age_next
        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь оюутнуудын мэдээллийг авах 59<
        end_date = dt.datetime(now.year - old_age, now.month, now.day)
        old_age_qs = qs.filter(birth_date__lte=end_date, group__level=1)
        old_age_dict = {
            "queryset": old_age_qs,
            "range_age": str(old_age - 1) + "<",
        }
        # Бүх мэдээллийг хүснэгтэнд нэгтгэх хэсэг
        all_age_list = [all_age_dict, child_age_dict, *young_age_list, *mid_age_list, old_age_dict]

        # Мэргэжлийн зэргээр хязгаарын хэмжээг авах
        range_pro = range(0, len(ProfessionalDegree.objects.all()) + 1)

        # Хөгжлийн бэрхшээлийн хязгаарын хэмжээг авах
        all_data = []
        # Нэгтгэсэн мэдээллээр гүйлгэх
        for key in all_age_list:
            age_dict = {}
            all_pro_list = []
            # Насны хязгаар дах оюутнуудын мэдээллээс мэргэжлийн зэргүүдээр хэдэн оюутнууд суралцаж буйг бодох хэсэг
            for pro in range_pro:
                if pro == 0:
                    men = len(key["queryset"].filter(gender=Student.GENDER_MALE))
                    women = len(key["queryset"].filter(gender=Student.GENDER_FEMALE))
                    all = men + women
                    pro_dict = {
                        "all_student": all,
                        "men_student": men,
                        "women_student": women,
                        "all_degree_id": 0,
                        "all_degree_code": "Бүгд",
                        "all_degree_name": "Бүгд"
                    }
                else:
                    pro_qs = key["queryset"].filter(group__degree=pro)
                    men = len(pro_qs.filter(gender=Student.GENDER_MALE))
                    women = len(pro_qs.filter(gender=Student.GENDER_FEMALE))
                    all = men + women
                    pro_dict = {
                        "all_student": all,
                        "men_student": men,
                        "women_student": women,
                        "all_degree_id": pro,
                        "all_degree_code": ProfessionalDegree.objects.filter(id=pro).first().degree_code,
                        "all_degree_name": ProfessionalDegree.objects.filter(id=pro).first().degree_name
                    }
                all_pro_list.append(pro_dict)
            age_dict.update({"degree": all_pro_list})
            # Хөгжлийн бэрхшээлтэй оюутнуудын мэдээллийг бодох хэсэг
            all_adm_list = [
                {
                    "id": 1,
                    "name": "12-р ангиас",
                    "men": 0,
                    "women": 0,
                    "all": 0
                },
                {
                    "id": 2,
                    "name": "Өөр хэлбэрийн сургуулиас",
                    "men": 0,
                    "women": 0,
                    "all": 0
                },
                {
                    "id": 3,
                    "name": "Тухайн жилд бакалаврын боловсрол эзэмшигчдээс",
                    "men": 0,
                    "women": 0,
                    "all": 0
                },
                {
                    "id": 4,
                    "name": "Ажиллагсадаас",
                    "men": 0,
                    "women": 0,
                    "all": 0
                },
                {
                    "id": 5,
                    "name": "Ажилгүйчүүдээс",
                    "men": 0,
                    "women": 0,
                    "all": 0
                },
                {
                    "id": 6,
                    "name": "Бусад",
                    "men": 0,
                    "women": 0,
                    "all": 0
                },
            ]
            men = 0
            women = 0
            all = 0
            for admission in key["queryset"]:
                adm = admission.admission_before
                if adm:
                    if "12-р ангиас" in adm:
                        if admission.gender == Student.GENDER_MALE:
                            all_adm_list[0]["men"] += 1
                        elif admission.gender == Student.GENDER_FEMALE:
                            all_adm_list[0]["women"] += 1
                        all_adm_list[0]["all"] += 1

                    elif "Өөр хэлбэрийн сургуулиас" in adm:
                        if admission.gender == Student.GENDER_MALE:
                            all_adm_list[1]["men"] += 1
                        elif admission.gender == Student.GENDER_FEMALE:
                            all_adm_list[1]["women"] += 1
                        all_adm_list[1]["all"] += 1

                    elif "Тухайн жилд бакалаврын боловсрол эзэмшигчдээс" in adm:
                        if admission.gender == Student.GENDER_MALE:
                            all_adm_list[2]["men"] += 1
                        elif admission.gender == Student.GENDER_FEMALE:
                            all_adm_list[2]["women"] += 1
                        all_adm_list[2]["all"] += 1

                    elif "Ажиллагсадаас" in adm:
                        if admission.gender == Student.GENDER_MALE:
                            all_adm_list[3]["men"] += 1
                        elif admission.gender == Student.GENDER_FEMALE:
                            all_adm_list[3]["women"] += 1
                        all_adm_list[3]["all"] += 1

                    elif "Ажилгүйчүүдээс" in adm:
                        if admission.gender == Student.GENDER_MALE:
                            all_adm_list[4]["men"] += 1
                        elif admission.gender == Student.GENDER_FEMALE:
                            all_adm_list[4]["women"] += 1
                        all_adm_list[4]["all"] += 1

                    else:
                        if admission.gender == Student.GENDER_MALE:
                            all_adm_list[5]["men"] += 1
                        elif admission.gender == Student.GENDER_FEMALE:
                            all_adm_list[5]["women"] += 1
                        all_adm_list[5]["all"] += 1

            age_dict.update({"admission": all_adm_list})
            # Мэдээллийг нэгтгэх хэсэг
            all_data.append({"age_list": age_dict, "range_age": key["range_age"]})

        return request.send_data(all_data)


class StatisticDB7APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-7"""
    queryset = Student.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):

        # Мэргэжлийн ерөнхий чиглэлийн төрөл
        range_gen = ((0, "Бүгд"), *ProfessionDefinition.GENERAL_DIRECT_TYPE)
        range_pro = range(0, len(ProfessionalDegree.objects.all()) + 1)
        qs = self.queryset.filter(group__is_finish=False)

        # Бүх мэдээллийг нэгтгэх хүснэгт
        all_list = []

        # Бүх мэдээллийн queryset-г нэгтгэх хүснэгт
        all_list_qs = []

        # Мэргэжлийн ерөнхий чиглэлийн төрлийн дагуу queryset-г хуваах хэсэг
        length_dict = {}
        for gen in range_gen:
            if gen[0] == 0:
                gen_dict = {
                    "queryset": qs,
                    "type": gen,
                    "profession": "Бүгд",
                    "profession_more": "Бүгд"
                }
                all_list_qs.append(gen_dict)
                length_dict.update({gen[1]: 1})

            else:
                gen_qs = qs.filter(group__profession__gen_direct_type=gen[0])
                if gen_qs.count() != 0:
                    length = 0
                    gen_qs_pro = gen_qs.distinct('group__profession')
                    gen_dict = {
                        "queryset": gen_qs,
                        "type": gen,
                        "profession": "Бүгд",
                        "profession_more": "Бүгд"
                    }
                    length += 1
                    all_list_qs.append(gen_dict)
                    for key in gen_qs_pro:
                        gen_qs_filter = gen_qs.filter(group__profession = key.group.profession)
                        if gen_qs_filter.count() != 0:
                            gen_dict = {
                                "queryset": gen_qs_filter,
                                "type": gen,
                                "profession": key.group.profession.name,
                                "profession_more": key.group.profession.dep_name
                            }
                            all_list_qs.append(gen_dict)
                            length += 1
                            length_dict.update({gen[1]: length})

        # Хуваасан queryset-г баганы дагуу бодох хэсэг
        for index, data in enumerate(all_list_qs):
            all_list_dict = {}
            pro_list = []

            # Мэргэжлийн дагуу бодох хэсэг
            for pro in range_pro:
                if pro == 0:
                    men = len(data["queryset"].filter(gender=Student.GENDER_MALE))
                    women = len(data["queryset"].filter(gender=Student.GENDER_FEMALE))
                    all = men + women

                    gen_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "degree_id": 0,
                        "degree_code": "Бүгд",
                        "degree_name": "Бүгд"
                    }

                else:
                    # Мэргэжлээр гүйлгэх хэсэг
                    pro_qs = data["queryset"].filter(group__degree=pro)
                    men = len(pro_qs.filter(gender=Student.GENDER_MALE))
                    women = len(pro_qs.filter(gender=Student.GENDER_FEMALE))
                    all = men + women

                    gen_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "degree_id": pro,
                        "degree_code": ProfessionalDegree.objects.filter(id=pro).first().degree_code,
                        "degree_name": ProfessionalDegree.objects.filter(id=pro).first().degree_name
                    }

                pro_list.append(gen_dict)

            # Мэдээллийг нэгтгэх dict үүсгэх хэсэг
            all_list_dict = {
                "degree_list": pro_list,
                "pro_name": data["profession"],
                "pro_name_more": data["profession_more"],
                "gen_id": data["type"][0],
                "gen_name": data["type"][1],
                "index": index,
                "length": length_dict[data["type"][1]]
            }

            # Мэдээллийг үндсэн хүснэгт рүү нэмэх
            all_list.append(all_list_dict)

        return request.send_data({"all_list": all_list, "length_dict": length_dict})


class StatisticDB9APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-9"""
    queryset = Student.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):

        # Мэргэжлийн ерөнхий чиглэлийн төрөл
        range_gen = ((0, "Бүгд"), *ProfessionDefinition.GENERAL_DIRECT_TYPE)
        range_pro = range(0, len(ProfessionalDegree.objects.all()) + 1)
        qs = self.queryset.filter(group__level=1)

        # Бүх мэдээллийг нэгтгэх хүснэгт
        all_list = []

        # Бүх мэдээллийн queryset-г нэгтгэх хүснэгт
        all_list_qs = []

        # Мэргэжлийн ерөнхий чиглэлийн төрлийн дагуу queryset-г хуваах хэсэг
        length_dict = {}
        for gen in range_gen:
            if gen[0] == 0:
                gen_dict = {
                    "queryset": qs,
                    "type": gen,
                    "profession": "Бүгд",
                    "profession_more": "Бүгд"
                }
                all_list_qs.append(gen_dict)
                length_dict.update({gen[1]: 1})

            else:
                gen_qs = qs.filter(group__profession__gen_direct_type=gen[0])
                if gen_qs.count() != 0:
                    length = 0
                    gen_qs_pro = gen_qs.distinct('group__profession')
                    gen_dict = {
                        "queryset": gen_qs,
                        "type": gen,
                        "profession": "Бүгд",
                        "profession_more": "Бүгд"
                    }
                    length += 1
                    all_list_qs.append(gen_dict)
                    for key in gen_qs_pro:
                        gen_qs_filter = gen_qs.filter(group__profession = key.group.profession)
                        if gen_qs_filter.count() != 0:
                            gen_dict = {
                                "queryset": gen_qs_filter,
                                "type": gen,
                                "profession": key.group.profession.name,
                                "profession_more": key.group.profession.dep_name
                            }
                            all_list_qs.append(gen_dict)
                            length += 1
                            length_dict.update({gen[1]: length})

        # Хуваасан queryset-г баганы дагуу бодох хэсэг
        for index, data in enumerate(all_list_qs):
            all_list_dict = {}
            pro_list = []

            # Мэргэжлийн дагуу бодох хэсэг
            for pro in range_pro:
                if pro == 0:
                    men = len(data["queryset"].filter(gender=Student.GENDER_MALE))
                    women = len(data["queryset"].filter(gender=Student.GENDER_FEMALE))
                    all = men + women

                    gen_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "degree_id": 0,
                        "degree_code": "Бүгд",
                        "degree_name": "Бүгд"
                    }

                else:
                    # Мэргэжлээр гүйлгэх хэсэг
                    pro_qs = data["queryset"].filter(group__degree=pro)
                    men = len(pro_qs.filter(gender=Student.GENDER_MALE))
                    women = len(pro_qs.filter(gender=Student.GENDER_FEMALE))
                    all = men + women

                    gen_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "degree_id": pro,
                        "degree_code": ProfessionalDegree.objects.filter(id=pro).first().degree_code,
                        "degree_name": ProfessionalDegree.objects.filter(id=pro).first().degree_name
                    }

                pro_list.append(gen_dict)

            # Мэдээллийг нэгтгэх dict үүсгэх хэсэг
            all_list_dict = {
                "degree_list": pro_list,
                "pro_name": data["profession"],
                "pro_name_more": data["profession_more"],
                "gen_id": data["type"][0],
                "gen_name": data["type"][1],
                "index": index,
                "length": length_dict[data["type"][1]]
            }

            # Мэдээллийг үндсэн хүснэгт рүү нэмэх
            all_list.append(all_list_dict)

        return request.send_data({"all_list": all_list, "length_dict": length_dict})


class StatisticDB10APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-10"""
    queryset = Student.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):

        qs = self.queryset
        range_continent = ((0, "Бүгд"), *Country.CONTINENT_TYPE)    # Тивийн төрлүүдийг авах хэсэг
        range_degree = range(0, ProfessionalDegree.objects.all().count() + 1)   # Боловсролын зэргийн хэмжээний хязгаарыг авах хэсэг
        range_study_type = Student.PAY_TYPE # Төлбөрийн төрөлүүдийг авах хэсэг
        continent_group_list = [] # Тивийн мэдээллийг хадгалах хүснэгт
        all_data_list = []  # Бүх мэдээллийг хадгалах хүснэгт
        range_study_type_grouped = []
        group = []
        for id, study_type in enumerate(range_study_type):
            if id + 1 >= 1 and id + 1 <=4:
                group.append(study_type[0])
            else:
                range_study_type_grouped.append(study_type)
        range_study_type_grouped.insert(0, group)

        for continent in range_continent:   # Тивүүдээр гүйлгэх хэсэг
            continent_list = []
            if continent[0] == 0:
                continent_dict = {
                    "queryset": qs,
                    "continent": continent[1],
                    "country_name": "Бүгд"
                }
                continent_list.append(continent_dict)
                continent_group_list.append(continent_list)  # Тухайн мөрийн queryset датаг бүхэлд нь авч хүснэгт рүү хийх (Бүх тив)
            else:
                continent_qs = qs.filter(citizenship__continent=continent[0])
                if continent_qs.count() != 0:
                    continent_country = continent_qs.distinct("citizenship")
                    continent_dict = {
                        "queryset": continent_qs,
                        "continent": continent[1],
                        "country_name": "Бүгд"
                    }
                    continent_list.append(continent_dict)   # Тухайн мөрийн queryset датаг бүхэлд нь авч хүснэгт рүү хийх (Тухайн тивийн бүх улсаар)
                    for country in continent_country:
                        continent_pro_qs = continent_qs.filter(citizenship=country.citizenship.id)
                        if continent_pro_qs.count() != 0:
                            continent_dict = {
                                "queryset": continent_pro_qs,
                                "continent": continent[1],
                                "country_name": country.citizenship.name
                            }
                            continent_list.append(continent_dict)   # Тухайн мөрийн queryset датаг бүхэлд нь авч хүснэгт рүү хийх (Улсаар)
                    continent_group_list.append(continent_list)

        for con_group_qs in continent_group_list:   # Ангилсан датагаар гүйлгэх
            group_data = []
            for con_qs in con_group_qs:
                degree_list = []
                for degree in range_degree: # Мэргэжлийн зэргээр гүйлгэх
                    if degree == 0:
                        men = con_qs["queryset"].filter(gender=Student.GENDER_MALE).count()
                        women = con_qs["queryset"].filter(gender=Student.GENDER_FEMALE).count()
                        all = men + women
                        degree_dict = {
                            "all": all,
                            "men": men,
                            "women": women,
                            "degree_name": "Бүгд",
                            "degree_code": "Бүгд"
                        }
                    else:
                        degree_qs = con_qs["queryset"].filter(group__degree=degree) # Мэргэжлийн зэргээр хайлт хийх
                        men = degree_qs.filter(gender=Student.GENDER_MALE).count()
                        women = degree_qs.filter(gender=Student.GENDER_FEMALE).count()
                        all = men + women
                        degree_dict = {
                            "all": all,
                            "men": men,
                            "women": women,
                            "degree_name": ProfessionalDegree.objects.filter(id=degree).first().degree_name if ProfessionalDegree.objects.filter(id=degree).first() != None else "",
                            "degree_code": ProfessionalDegree.objects.filter(id=degree).first().degree_code if ProfessionalDegree.objects.filter(id=degree).first() != None else ""
                        }
                    degree_list.append(degree_dict)

                study_type_list = []
                for study_type in range_study_type_grouped: # Төлбөрийн төрлөөр гүйлгэх
                    if type(study_type) == type([]):
                        type_count = con_qs["queryset"].filter(pay_type__in=study_type).count()  # Төлбөрийн төрлөөр хайлт хийх
                        study_type_list.append({
                            "pay_type": "Монгол Улсын Засгийн газрын тэтгэлэг",
                            "student": type_count
                        })
                    else:
                        type_count = con_qs["queryset"].filter(pay_type=study_type[0]).count()  # Төлбөрийн төрлөөр хайлт хийх
                        study_type_list.append({
                            "pay_type": study_type[1],
                            "student": type_count
                        })

                all_data_dict = {
                    "degree": degree_list,
                    "study_type": study_type_list,
                    "continent": con_qs["continent"],
                    "country_name": con_qs["country_name"]
                }
                group_data.append(all_data_dict)
            all_data_list.append(group_data) # Мөрийн бүх мэдээллийг нэгтгэн хүснэгтэнд оруулах

        return request.send_data(all_data_list)


class StatisticDB12APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-12"""
    queryset = DormitoryStudent.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):

        dorm_data = self.queryset
        range_ins = range(1, EducationalInstitutionCategory.objects.all().count() + 1)
        all_qs_data = []
        all_data = []


        # Өмчийн төрлийг А-ДБ-д тохируулан бүлэглэх хэсэг
        headers = list()
        types = list()
        group = list()
        headers_grouped = list()
        property_name = list(PropertyType.objects.all().values("name", "id"))

        # Өмчийн хэлбэрийн хаалтан доторх нэрийг авч хадгалан хэлбэр болгонд оруулж өгсөн хүснэгт байгуулах хэсэг
        for key in property_name:
            if "(" in key["name"]:
                first = key["name"].find("(")
                last = key["name"].find(")")
                headers.append(dict(id = key["id"],type = key["name"][first+1:last], name = key["name"]))
                types.append(key["name"][first+1:last])
            else:
                headers.append(dict(id = key["id"],type = key["name"], name = key["name"]))
                types.append(key["name"])
        types = list(dict.fromkeys(types))

        # Шинээр үүсгэсэн хүснэгтээ хаалтан доторх нэрээр нь бүлэглэх хэсэг
        for names in types:
            group = list()
            for keys in headers:
                if names in keys["name"]:
                    group.append(keys)
            headers_grouped.append(group)
        range_property = range(-1, len(headers_grouped))


        # Мөр болгоны хэрэгтэй датаг хүснэгтэд хийх бүлэглэх хэсэг
        for property in range_property: # Өмчийн төрлөөр гүйлгэх
            # -1 үед бүх датаг хүснэгт рүү хийх
            if property == -1:
                property_dict = {
                    "queryset": dorm_data,
                    "property": "Бүгд",
                    "institution": "Бүгд"
                }
                all_qs_data.append(property_dict)

                # Сургалтын байгууллагуудын ангилалаар гүйлгэх
                for ins in range_ins:
                    ins_qs = dorm_data.filter(student__school__org__educational_institution_category=ins)
                    property_dict = {
                        "queryset": ins_qs,
                        "property": "Бүгд",
                        "institution": EducationalInstitutionCategory.objects.filter(id=ins).first().name
                    }
                    all_qs_data.append(property_dict)
            # Бусад үед өмчийн төрлөөр хайж хүснэгт рүү хийх
            else:
                filter_data = list()
                id_data = 0

                # Бүлэглэсэн өмчийн хэлбэрээс дугаарыг авах хэсэг
                for datax in headers_grouped:
                    if types[property] in datax[0]["name"]:
                        break
                    id_data+=1

                for datax in headers_grouped[id_data]:
                    filter_data.append(datax["id"])

                # Өмчийн төрлөөр хайх хэсэг
                property_qs = dorm_data.filter(student__school__org__property_type__in=filter_data)
                property_dict = {
                    "queryset": property_qs,
                    "property": headers_grouped[property][0]["type"],
                    "institution": "Бүгд"
                }

                all_qs_data.append(property_dict)
                # Сургалтын байгууллагуудын ангилалаар гүйлгэх
                for ins in range_ins:
                    ins_qs = property_qs.filter(student__school__org__educational_institution_category=ins)
                    property_dict = {
                        "queryset": ins_qs,
                        "property": headers_grouped[property][0]["type"],
                        "institution": EducationalInstitutionCategory.objects.filter(id=ins).first().name
                    }
                    all_qs_data.append(property_dict)


        # Мөрийн дагуу мэдээллийг тооцоолж бодох хэсэг
        for data in all_qs_data:
            # Дотуур байрны тоо бодох хэсэг
            dormitory_count = data["queryset"].distinct("student__school__org").count()

            # Дотуур байранд хүсэлт гаргасан оюутнуудыг бодох хэсэг
            request_ = data["queryset"].filter(solved_flag=DormitoryStudent.STUDENT_REQUEST)
            request_men = request_.filter(student__gender=Student.GENDER_MALE).count()
            request_women = request_.filter(student__gender=Student.GENDER_FEMALE).count()
            request_all = request_men + request_women

            # Дотуур байранд амьдардаг бүх оюутнуудыг бодох хэсэг
            living = data["queryset"].filter(solved_flag__in=[DormitoryStudent.CONFIRM, DormitoryStudent.ALLOW])
            living_men = living.filter(student__gender=Student.GENDER_MALE).count()
            living_women = living.filter(student__gender=Student.GENDER_FEMALE).count()
            living_all = living_men + living_women

            # Дотуур байранд амьдардаг бакалаврын оюутнуудыг бодох хэсэг
            living_bac = living.filter(student__group__degree=1)
            living_bac_men = living_bac.filter(student__gender=Student.GENDER_MALE).count()
            living_bac_women = living_bac.filter(student__gender=Student.GENDER_FEMALE).count()
            living_bac_all = living_bac_men + living_bac_women

            # Дотуур байранд амьдардаг дипломын оюутнуудыг бодох хэсэг
            living_dip = living.filter(student__group__degree=4)
            living_dip_men = living_dip.filter(student__gender=Student.GENDER_MALE).count()
            living_dip_women = living_dip.filter(student__gender=Student.GENDER_FEMALE).count()
            living_dip_all = living_dip_men + living_dip_women

            # Дотуур байранд амьдардаг бакалавр болон дипломын оюутнуудаас бусад оюутнуудыг бодох хэсэг
            living_exclude = living.exclude(student__group__degree__in=[1, 4])
            living_exclude_men = living_exclude.filter(student__gender=Student.GENDER_MALE).count()
            living_exclude_women = living_exclude.filter(student__gender=Student.GENDER_FEMALE).count()
            living_exclude_all = living_exclude_men + living_exclude_women

            # Тооцоолсон баганы мэдээллийг хүснэгтэд нэгтгэх хэсэг
            col_data_list = [
                dormitory_count,
                request_all, request_men, request_women,
                living_all, living_men, living_women,
                living_bac_all, living_bac_men, living_bac_women,
                living_dip_all, living_dip_men, living_dip_women,
                living_exclude_all, living_exclude_men, living_exclude_women
            ]

            # Тооцоололыг нэгтгэсэн хүснэгтийг dict-д хийх хэсэг
            col_data_dict = {
                "property": data["property"],
                "institution": data["institution"],
                "col_data_list": col_data_list
            }

            # Dict-г үндсэн хүснэгт рүү нэгтгэх хэсэг
            all_data.append(col_data_dict)

        return request.send_data(all_data)


class StatisticDB16APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """А-ДБ-16"""
    queryset = Student.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):

        # Мэргэжлийн ерөнхий чиглэлийн төрөл
        range_gen = ((0, "Бүгд"), *ProfessionDefinition.GENERAL_DIRECT_TYPE)
        range_pro = range(0, len(ProfessionalDegree.objects.all()) + 1)
        qs = self.queryset.filter(group__is_finish=True)

        # Бүх мэдээллийг нэгтгэх хүснэгт
        all_list = []

        # Бүх мэдээллийн queryset-г нэгтгэх хүснэгт
        all_list_qs = []

        # Мэргэжлийн ерөнхий чиглэлийн төрлийн дагуу queryset-г хуваах хэсэг
        length_dict = {}
        for gen in range_gen:
            if gen[0] == 0:
                gen_dict = {
                    "queryset": qs,
                    "type": gen,
                    "profession": "Бүгд",
                    "profession_more": "Бүгд"
                }
                all_list_qs.append(gen_dict)
                length_dict.update({gen[1]: 1})

            else:
                gen_qs = qs.filter(group__profession__gen_direct_type=gen[0])
                if gen_qs.count() != 0:
                    length = 0
                    gen_qs_pro = gen_qs.distinct('group__profession')
                    gen_dict = {
                        "queryset": gen_qs,
                        "type": gen,
                        "profession": "Бүгд",
                        "profession_more": "Бүгд"
                    }
                    length += 1
                    all_list_qs.append(gen_dict)
                    for key in gen_qs_pro:
                        gen_qs_filter = gen_qs.filter(group__profession = key.group.profession)
                        if gen_qs_filter.count() != 0:
                            gen_dict = {
                                "queryset": gen_qs_filter,
                                "type": gen,
                                "profession": key.group.profession.name,
                                "profession_more": key.group.profession.dep_name
                            }
                            all_list_qs.append(gen_dict)
                            length += 1
                            length_dict.update({gen[1]: length})

        # Хуваасан queryset-г баганы дагуу бодох хэсэг
        for index, data in enumerate(all_list_qs):
            all_list_dict = {}
            pro_list = []

            # Мэргэжлийн дагуу бодох хэсэг
            for pro in range_pro:
                if pro == 0:
                    men = len(data["queryset"].filter(gender=Student.GENDER_MALE))
                    women = len(data["queryset"].filter(gender=Student.GENDER_FEMALE))
                    all = men + women

                    gen_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "degree_id": 0,
                        "degree_code": "Бүгд",
                        "degree_name": "Бүгд"
                    }

                else:
                    # Мэргэжлээр гүйлгэх хэсэг
                    pro_qs = data["queryset"].filter(group__degree=pro)
                    men = len(pro_qs.filter(gender=Student.GENDER_MALE))
                    women = len(pro_qs.filter(gender=Student.GENDER_FEMALE))
                    all = men + women

                    gen_dict = {
                        "all": all,
                        "men": men,
                        "women": women,
                        "degree_id": pro,
                        "degree_code": ProfessionalDegree.objects.filter(id=pro).first().degree_code,
                        "degree_name": ProfessionalDegree.objects.filter(id=pro).first().degree_name
                    }

                pro_list.append(gen_dict)

            # Мэдээллийг нэгтгэх dict үүсгэх хэсэг
            all_list_dict = {
                "degree_list": pro_list,
                "pro_name": data["profession"],
                "pro_name_more": data["profession_more"],
                "gen_id": data["type"][0],
                "gen_name": data["type"][1],
                "index": index,
                "length": length_dict[data["type"][1]]
            }

            # Мэдээллийг үндсэн хүснэгт рүү нэмэх
            all_list.append(all_list_dict)

        return request.send_data({"all_list": all_list, "length_dict": length_dict})


class StatisticDB17APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    queryset = Student.objects.all()
    serializer_class = DB3Serializer
    """А-ДБ-17"""

    def get(self, request):

        qs = self.queryset.filter(group__is_finish=True)
        range_ins = range(1, EducationalInstitutionCategory.objects.all().count() + 1)
        range_degree = range(0, ProfessionalDegree.objects.all().count() + 1)
        all_qs_data = []
        all_data = []


        # Өмчийн төрлийг А-ДБ-д тохируулан бүлэглэх хэсэг
        headers = list()
        types = list()
        group = list()
        headers_grouped = list()
        property_name = list(PropertyType.objects.all().values("name", "id"))

        # Өмчийн хэлбэрийн хаалтан доторх нэрийг авч хадгалан хэлбэр болгонд оруулж өгсөн хүснэгт байгуулах хэсэг
        for key in property_name:
            if "(" in key["name"]:
                first = key["name"].find("(")
                last = key["name"].find(")")
                headers.append(dict(id = key["id"],type = key["name"][first+1:last], name = key["name"]))
                types.append(key["name"][first+1:last])
            else:
                headers.append(dict(id = key["id"],type = key["name"], name = key["name"]))
                types.append(key["name"])
        types = list(dict.fromkeys(types))

        # Шинээр үүсгэсэн хүснэгтээ хаалтан доторх нэрээр нь бүлэглэх хэсэг
        for names in types:
            group = list()
            for keys in headers:
                if names in keys["name"]:
                    group.append(keys)
            headers_grouped.append(group)
        range_property = range(-1, len(headers_grouped))


        # Мөр болгоны хэрэгтэй датаг хүснэгтэд хийх бүлэглэх хэсэг
        for property in range_property: # Өмчийн төрлөөр гүйлгэх
            # -1 үед бүх датаг хүснэгт рүү хийх
            if property == -1:
                property_dict = {
                    "queryset": qs,
                    "property": "Бүгд",
                    "institution": "Бүгд"
                }
                all_qs_data.append(property_dict)

                # Сургалтын байгууллагуудын ангилалаар гүйлгэх
                for ins in range_ins:
                    ins_qs = qs.filter(school__org__educational_institution_category=ins)
                    property_dict = {
                        "queryset": ins_qs,
                        "property": "Бүгд",
                        "institution": EducationalInstitutionCategory.objects.filter(id=ins).first().name
                    }
                    all_qs_data.append(property_dict)
            # Бусад үед өмчийн төрлөөр хайж хүснэгт рүү хийх
            else:
                filter_data = list()
                id_data = 0

                # Бүлэглэсэн өмчийн хэлбэрээс дугаарыг авах хэсэг
                for datax in headers_grouped:
                    if types[property] in datax[0]["name"]:
                        break
                    id_data+=1

                for datax in headers_grouped[id_data]:
                    filter_data.append(datax["id"])

                # Өмчийн төрлөөр хайх хэсэг
                property_qs = qs.filter(school__org__property_type__in=filter_data)
                property_dict = {
                    "queryset": property_qs,
                    "property": headers_grouped[property][0]["type"],
                    "institution": "Бүгд"
                }

                all_qs_data.append(property_dict)
                # Сургалтын байгууллагуудын ангилалаар гүйлгэх
                for ins in range_ins:
                    ins_qs = property_qs.filter(school__org__educational_institution_category=ins)
                    property_dict = {
                        "queryset": ins_qs,
                        "property": headers_grouped[property][0]["type"],
                        "institution": EducationalInstitutionCategory.objects.filter(id=ins).first().name
                    }
                    all_qs_data.append(property_dict)


        # Мөрийн дагуу мэдээллийг тооцоолж бодох хэсэг
        for data in all_qs_data:
            col_data_list = []

            # Мэргэжлийн зэргээр гүйлгэх
            for degree in range_degree:
                # 0 үед тухайн мөрний бүх мэргэжлийн зэргийн сурагчдыг тоог тооцоолох хэсэг
                if degree == 0:
                    men = data["queryset"].filter(gender=Student.GENDER_MALE).count()
                    women = data["queryset"].filter(gender=Student.GENDER_FEMALE).count()
                    all = men + women
                    col_dict = {
                        "degree_name": "Бүгд",
                        "degree_code": "Бүгд",
                        "all": all,
                        "men": men,
                        "women": women
                    }
                # Мэргэжлийн зэргээр нь сурагчдын тоог тооцоолох хэсэг
                else:
                    degree_qs = data["queryset"].filter(group__degree=degree)
                    men = degree_qs.filter(gender=Student.GENDER_MALE).count()
                    women = degree_qs.filter(gender=Student.GENDER_FEMALE).count()
                    all = men + women
                    col_dict = {
                        "degree_name": ProfessionalDegree.objects.filter(id=degree).first().degree_name,
                        "degree_code": ProfessionalDegree.objects.filter(id=degree).first().degree_code,
                        "all": all,
                        "men": men,
                        "women": women
                    }

                # Тооцоолсон мэдээллийг мөрний мэдээлэлийг нэгтгэх хүснэгт рүү хийх хэсэг
                col_data_list.append(col_dict)

            # Тухайн мөрний тооцоолол хийсэн хүснэгтэн мэдээлэлд нэмэлт мэдээллийг оруулах хэсэг үндсэн хүснэгт рүү оруулах
            col_data_dict = {
                "col_list": col_data_list,
                "property": data["property"],
                "institution": data["institution"]
            }
            # Үндсэн хүснэгт рүү мөрний dict-н мэдээллийг нэмэх хэсэг
            all_data.append(col_data_dict)

        return request.send_data(all_data)


class StatisticDB18APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    queryset = StudentGrade.objects.all()
    serializer_class = DB3Serializer

    def get(self, request):
        """А-ДБ-18"""

        queryset = self.queryset#.filter(student__group__is_finish=True)
        student_id = queryset.distinct("student").values_list("student", flat=True)
        gpa_list = [
            {
                "range_gpa_str": "0-0.5",
                "range_max": 0.5,
                "range_min": 0,
            },
            {
                "range_gpa_str": "0.6-1",
                "range_max": 1,
                "range_min": 0.6,
            },
            {
                "range_gpa_str": "1.1-1.5",
                "range_max": 1.5,
                "range_min": 1.1,
            },
            {
                "range_gpa_str": "1.6-2",
                "range_max": 2,
                "range_min": 1.6,
            },
            {
                "range_gpa_str": "2.1-2.5",
                "range_max": 2.5,
                "range_min": 2.1,
            },
            {
                "range_gpa_str": "2.6-3",
                "range_max": 3,
                "range_min": 2.6,
            },
            {
                "range_gpa_str": "3.1-3.5",
                "range_max": 3.5,
                "range_min": 3.1,
            },
            {
                "range_gpa_str": "3.6-4",
                "range_max": 4,
                "range_min": 3.6,
            },
        ]

        range_institution = range(0, EducationalInstitutionCategory.objects.all().count() + 1)
        range_degree = range(1, ProfessionalDegree.objects.all().count() + 1)
        ins_qs_list = []
        collage_list = []

        # for ins in range_institution:
        #     if ins == 0:
        #         ins_qs_list.append({
        #             "ins_id": ins,
        #             "ins_type": "Бүгд"
        #         })
        #     elif EducationalInstitutionCategory.objects.filter(id=ins).first().name in ["коллеж", "Коллеж"]:
        #         print("lol")
        #         collage_list.append(ins)
        #     else:
        #         ins_qs_list.append({
        #             "ins_id": ins,
        #             "ins_type": EducationalInstitutionCategory.objects.filter(id=ins).first().name if EducationalInstitutionCategory.objects.filter(id=ins).first() else ""
        #         })

        ins_qs_list = [
            {
                "ins_id": 0,
                "ins_type": "Бүгд"
            },
            {
                "ins_id": 1,
                "ins_type": "Их сургууль"
            },
            {
                "ins_id": 2,
                "ins_type": "Дээд сургууль"
            },
            {
                "ins_id": [3, 4],
                "ins_type": "Коллеж"
            }
        ]

        data_structure = []
        for ins in ins_qs_list:
            data = {
                "Байгууллагын ангилал": ins["ins_type"],
                "Нийт төгсөгчид": 0,
                "Эрэгтэй": 0,
                "Эмэгтэй": 0,
            }
            for degree in range_degree:
                degree_name = ProfessionalDegree.objects.get(id=degree).degree_name if ProfessionalDegree.objects.filter(id=degree).exists() else ""
                degree_full_name = degree_name + " төгсөгчид"
                data.update({
                    degree_full_name: 0,
                    "Эрэгтэй" + "#" + degree_name: 0,
                    "Эмэгтэй" + "#" + degree_name: 0,
                })
                for gpa_str in gpa_list:
                    data.update({
                        "Бүгд" + "#" + degree_name + "!" + gpa_str["range_gpa_str"]: 0,
                        "Эрэгтэй" + "#" + degree_name + "!" + gpa_str["range_gpa_str"]: 0,
                        "Эмэгтэй" + "#" + degree_name + "!" + gpa_str["range_gpa_str"]: 0,
                    })

            data_structure.append(data)

        for student in student_id:
            student_grade = queryset.filter(student=student)
            cr_sum = 0
            grade_cr_sum = 0
            total_average = 0

            # Оюутны нийт голч бодох хэсэг
            for grade in student_grade:
                cr = grade.credit if grade.credit else 0
                average = grade.average
                cr_sum += cr
                grade_cr_sum += average * cr

            if grade_cr_sum != 0 and cr_sum != 0:
                total_average = grade_cr_sum / cr_sum
                total_average = format(total_average, '.1f')

            total_average = round(total_average, 2)
            gpa = Score.objects.filter(score_max__gte=total_average, score_min__lte=total_average).first().gpa if Score.objects.filter(score_max__gte=total_average, score_min__lte=total_average) else 300

            student_info = Student.objects.filter(id=student).first()
            gender = False
            gpa_obj = {}
            if student_info.gender == 1:
                gender = True
            degree_name = student_info.group.degree.degree_name
            degree_full_name = degree_name + " төгсөгчид"
            for id, obj in enumerate(gpa_list):
                if obj["range_min"] <= gpa and gpa <= obj["range_max"]:
                    gpa_obj = obj
                    break

            for id, ins in enumerate(ins_qs_list):
                if ins["ins_id"] == 0:
                    data_structure[id]["Нийт төгсөгчид"] += 1
                    data_structure[id][degree_full_name] += 1
                    data_structure[id]["Бүгд" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1

                    if gender:
                        data_structure[id]["Эрэгтэй"] += 1
                        data_structure[id]["Эрэгтэй" + "#" + degree_name] += 1
                        data_structure[id]["Эрэгтэй" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1
                    else:
                        data_structure[id]["Эмэгтэй"] += 1
                        data_structure[id]["Эмэгтэй" + "#" + degree_name] += 1
                        data_structure[id]["Эмэгтэй" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1

                elif ins["ins_id"] == type([]):
                    if student_info.school.org.id in ins["ins_id"]:
                        data_structure[id]["Нийт төгсөгчид"] += 1
                        data_structure[id][degree_full_name] += 1
                        data_structure[id]["Бүгд" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1

                        if gender:
                            data_structure[id]["Эрэгтэй"] += 1
                            data_structure[id]["Эрэгтэй" + "#" + degree_name] += 1
                            data_structure[id]["Эрэгтэй" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1
                        else:
                            data_structure[id]["Эмэгтэй"] += 1
                            data_structure[id]["Эмэгтэй" + "#" + degree_name] += 1
                            data_structure[id]["Эмэгтэй" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1

                else:
                    if student_info.school.org.id == ins["ins_id"]:
                        data_structure[id]["Нийт төгсөгчид"] += 1
                        data_structure[id][degree_full_name] += 1
                        data_structure[id]["Бүгд" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1

                        if gender:
                            data_structure[id]["Эрэгтэй"] += 1
                            data_structure[id]["Эрэгтэй" + "#" + degree_name] += 1
                            data_structure[id]["Эрэгтэй" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1
                        else:
                            data_structure[id]["Эмэгтэй"] += 1
                            data_structure[id]["Эмэгтэй" + "#" + degree_name] += 1
                            data_structure[id]["Эмэгтэй" + "#" + degree_name + "!" + gpa_obj["range_gpa_str"]] += 1

        return request.send_data(data_structure)


class StatisticDB14APIView(
    mixins.ListModelMixin,
    generics.GenericAPIView,
):
    """ДБ-14"""

    queryset = Employee.objects.all()

    def get(self, request):

        # Ажилчдыг шүүлтүүр хийж авах хэсэг
        employee = self.queryset.filter(state=Employee.STATE_WORKING, org_position__main_position__code__in=[2, 3, 4, 5, 6, 7, 11, 39]).distinct("user")
        # Бодогдсон мөрийн мэдээллийг хийх үндсэн хүснэгт
        main_data_list = []

        # Баганы статик мэдээлэл
        col_data_tuple = (
            (0, "Бүгд"),
            ([2], "Захирал"),
            ([3], "Дэд захирал"),
            ([4, 5], "Салбар сургуулийн захирал, дэд захирал"),
            ([6, 7], "Бүрэлдэхүүн сургуулийн захирал, дэд захирал"),
            ([11], "Сургалтын албаны дарга"),
            ([39], "Үндсэн багш")
        )

        # Ажилсан жилийн статик мэдээлэл
        exp_info = [
            {
                "type": "1 жил хүртэлх",
                "range_start": 0,
                "range_end": 1
            },
            {
                "type": "1-5",
                "range_start": 1,
                "range_end": 6
            },
            {
                "type": "6-10",
                "range_start": 6,
                "range_end": 11,
            },
            {
                "type": "11-15",
                "range_start": 11,
                "range_end": 16
            },
            {
                "type": "16-20",
                "range_start": 16,
                "range_end": 21
            },
            {
                "type": "21-25",
                "range_start": 21,
                "range_end": 26
            },
            {
                "type": "26<",
                "range_start": 26,
                "range_end": ""
            },
        ]

        # Мэргэжил дээшлүүлсэн хугацааны статик мэдээлэл
        day_up_info = [
            {
                "type": "1-3 хоног",
                "range_start": 0,
                "range_end": 4,
            },
            {
                "type": "4-10 хоног",
                "range_start": 4,
                "range_end": 11,
            },
            {
                "type": "11-29 хоног",
                "range_start": 11,
                "range_end": 30,
            },
            {
                "type": "1, түүнээс дээш сар",
                "range_start": 30,
                "range_end": "",
            },
        ]

        # Нийт удирдах ажилтан, үндсэн багшаар тооцоолох

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            # 0 үед мөрийн бүх мэдээллээр тоолно
            if index == 0:
                all = employee.count()
                men = Teachers.objects.filter(user__employee__in=employee, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                women = all - men
                # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": all,
                    "men": men,
                    "women": women
                })
            else:
                data_qs = employee.filter(org_position__main_position__code__in=main_pos[0])
                all = data_qs.count()
                men = Teachers.objects.filter(user__employee__in=data_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                women = all - men
                # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                row_data.append({
                    "type": main_pos[1],
                    "type_code": main_pos[0],
                    "all": all,
                    "men": men,
                    "women": women
                })

        # Үндсэн хүснэгтэд мөрийн мэдээллийг хийх хэсэг
        main_data_list.append({
            "type": "Бүгд",
            "data_list": row_data
        })

        # Албан тушаалаар тооцоолох хэсэг

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": "blank",
                    "men": "blank",
                    "women": "blank"
                })
            else:
                row_data.append({
                    "type": main_pos[0],
                    "type_code": main_pos[1],
                    "all": None,
                    "men": None,
                    "women": None
                })

        main_data_list.append({
            "type": "Албан тушаал",
            "data_list": row_data
        })

        for rank in Employee.TEACHER_RANK_TYPE:
            # Мөрийн мэдээлэл хадгалах хүснэгт
            row_data = []
            # Мөрийн мэдээллийг шүүх хэсэг
            rank_qs = employee.filter(teacher_rank_type=rank[0])
            for index, main_pos in enumerate(col_data_tuple):
                # 0 үед мөрийн бүх мэдээллээр тоолно
                if index == 0:
                    all = rank_qs.count()
                    men = Teachers.objects.filter(user__employee__in=rank_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                    row_data.append({
                        "type": "Бүгд",
                        "type_code": 0,
                        "all": all,
                        "men": men,
                        "women": women
                    })
                else:
                    data_qs = rank_qs.filter(org_position__main_position__code__in=main_pos[0])
                    all = data_qs.count()
                    men = Teachers.objects.filter(user__employee__in=data_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                    row_data.append({
                        "type": main_pos[1],
                        "type_code": main_pos[0],
                        "all": all,
                        "men": men,
                        "women": women
                    })

            # Үндсэн хүснэгтэд мөрийн мэдээллийг хийх хэсэг
            main_data_list.append({
                "type": rank[1],
                "data_list": row_data
            })

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": "blank",
                    "men": "blank",
                    "women": "blank"
                })
            else:
                row_data.append({
                    "type": main_pos[0],
                    "type_code": main_pos[1],
                    "all": None,
                    "men": None,
                    "women": None
                })

        main_data_list.append({
            "type": "Боловсролын түвшин",
            "data_list": row_data
        })

        # Боловсролын түвшинээр тооцоолох хэсэг
        for degree in Employee.EDUCATION_LEVEL:
            # Мөрийн мэдээлэл хадгалах хүснэгт
            row_data = []
            # Мөрийн мэдээллийг шүүх хэсэг
            degree_qs = employee.filter(teacher_rank_type=degree[0])
            for index, main_pos in enumerate(col_data_tuple):
                if index == 0:
                    all = degree_qs.count()
                    men = Teachers.objects.filter(user__employee__in=degree_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                    row_data.append({
                        "type": "Бүгд",
                        "type_code": 0,
                        "all": all,
                        "men": men,
                        "women": women
                    })
                else:
                    data_qs = degree_qs.filter(org_position__main_position__code__in=main_pos[0])
                    all = data_qs.count()
                    men = Teachers.objects.filter(user__employee__in=data_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                    row_data.append({
                        "type": main_pos[1],
                        "type_code": main_pos[0],
                        "all": all,
                        "men": men,
                        "women": women
                    })

            # Үндсэн хүснэгтэд мөрийн мэдээллийг хийх хэсэг
            main_data_list.append({
                "type": degree[1],
                "data_list": row_data
            })

        # Эрдмийн зэргээр тооцоолох хэсэг

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": "blank",
                    "men": "blank",
                    "women": "blank"
                })
            else:
                row_data.append({
                    "type": main_pos[0],
                    "type_code": main_pos[1],
                    "all": None,
                    "men": None,
                    "women": None
                })

        main_data_list.append({
            "type": "Эрдмийн зэрэг",
            "data_list": row_data
        })

        for degree_type in Employee.DEGREE_TYPE:
            # Мөрийн мэдээлэл хадгалах хүснэгт
            row_data = []
            # Мөрийн мэдээллийг шүүх хэсэг
            degree_type_qs = employee.filter(degree_type=degree_type[0])
            for index, main_pos in enumerate(col_data_tuple):
                if index == 0:
                    all = degree_type_qs.count()
                    men = Teachers.objects.filter(user__employee__in=degree_type_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                    row_data.append({
                        "type": "Бүгд",
                        "type_code": 0,
                        "all": all,
                        "men": men,
                        "women": women
                    })
                else:
                    data_qs = degree_type_qs.filter(org_position__main_position__code__in=main_pos[0])
                    all = data_qs.count()
                    men = Teachers.objects.filter(user__employee__in=data_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    # Мөрийн мэдээллийг хадгалах хүснэгтэд тоологдсон хэсгийг нэмэх хэсэг
                    row_data.append({
                        "type": main_pos[1],
                        "type_code": main_pos[0],
                        "all": all,
                        "men": men,
                        "women": women
                    })

            # Үндсэн хүснэгтэд мөрийн мэдээллийг хийх хэсэг
            main_data_list.append({
                "type": degree_type[1],
                "data_list": row_data
            })

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": "blank",
                    "men": "blank",
                    "women": "blank"
                })
            else:
                row_data.append({
                    "type": main_pos[0],
                    "type_code": main_pos[1],
                    "all": None,
                    "men": None,
                    "women": None
                })

        main_data_list.append({
            "type": "Ажилласан жил",
            "data_list": row_data
        })

        for exp in exp_info: # Мөрийн мэдээллийг хадгалах өгөгдлийн бүтэцийг үүсгэх хэсэг
            # Мөрийн мэдээлэл хадгалах хүснэгт
            row_data = []
            for index, main_pos in enumerate(col_data_tuple):
                if index == 0:
                    row_data.append({
                        "type": "Бүгд",
                        "type_code": 0,
                        "all": 0,
                        "men": 0,
                        "women": 0
                    })
                else:
                    row_data.append({
                        "type": main_pos[1],
                        "type_code": main_pos[0],
                        "all": 0,
                        "men": 0,
                        "women": 0
                    })
            # Баганы статик мэдээлэл дээр мөрийн хоосон dict нэмэх хэсэг
            exp.update({"data_list": row_data})

        # Өнөөдрийг сар өдрийг авах хэсэг
        now = dt.datetime.now()
        # Ажилтнуудаар гүйлгэх хэсэг
        for emp in employee:
            # Тухайн ажилтны мэдээллийг авах хэсэг
            emp_info = Teachers.objects.filter(user=emp.user, action_status=Teachers.APPROVED).first()
            # Тухайн ажилтны ажилсан жилийн мэдээлэл хадгалагдсан эсэхийг шалгах хэсэг
            if emp_info.experience_mnun_year and emp_info.experience_mnun_year != "":
                # Хадгалагдсан бол мэдээллийг int-рүү хөрвүүлнэ
                with transaction.atomic():
                    try:
                        exp = int(emp_info.experience_mnun_year)
                    except Exception:
                        # Хадгалагдаагүй бол бодож олно
                        duplicated_work_year = Employee.objects.filter(user=emp.user)
                        exp = 0
                        for work_year in duplicated_work_year:
                            if work_year.date_left:
                                work_day = work_year.date_left - work_year.date_joined
                                exp += work_day.days

                            else:
                                work_day = now - work_year.date_joined
                                exp += work_day.days
                            exp = exp // 365
            else:
                # Хадгалагдаагүй бол бодож олно
                duplicated_work_year = Employee.objects.filter(user=emp.user)
                exp = 0
                for work_year in duplicated_work_year:
                    if work_year.date_left:
                        work_day = work_year.date_left - work_year.date_joined
                        exp += work_day.days

                    else:
                        work_day = now - work_year.date_joined
                        exp += work_day.days
                    exp = exp // 365
            # Хоосон өгөгдлийн бүтцээр гүйлгэж тухайн ажилтны харьяалагдах хэсгийг олж нэмэгдүүлэх хэсэг
            for obj in exp_info:
                if obj["range_end"] == "":
                    if obj["range_start"] <= exp:
                        for index, obj_type in enumerate(obj["data_list"]):
                            if index == 0:
                                obj_type["all"] += 1
                                if emp_info.gender == Teachers.GENDER_MALE:
                                    obj_type["men"] += 1
                                else:
                                    obj_type["women"] += 1
                            else:
                                if Employee.objects.filter(id=emp.id, org_position__main_position__code__in=obj_type["type_code"]).exists():
                                    obj_type["all"] += 1
                                    if emp_info.gender == Teachers.GENDER_MALE:
                                        obj_type["men"] += 1
                                    else:
                                        obj_type["women"] += 1
                                    break
                        break
                else:
                    if obj["range_start"] <= exp and exp < obj["range_end"]:
                        for index, obj_type in enumerate(obj["data_list"]):
                            if index == 0:
                                obj_type["all"] += 1
                                if emp_info.gender == Teachers.GENDER_MALE:
                                    obj_type["men"] += 1
                                else:
                                    obj_type["women"] += 1
                            else:
                                if Employee.objects.filter(pk=emp.id, org_position__main_position__code__in=obj_type["type_code"]).exists():
                                    obj_type["all"] += 1
                                    if emp_info.gender == Teachers.GENDER_MALE:
                                        obj_type["men"] += 1
                                    else:
                                        obj_type["women"] += 1
                                    break
                        break

        main_data_list = main_data_list + exp_info

        # Насны бүлгээр тооцоолох хэсэг

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": "blank",
                    "men": "blank",
                    "women": "blank"
                })
            else:
                row_data.append({
                    "type": main_pos[0],
                    "type_code": main_pos[1],
                    "all": None,
                    "men": None,
                    "women": None
                })

        main_data_list.append({
            "type": "Насны бүлэг",
            "data_list": row_data
        })

            # Насны хязгаар
        start_age = 0
        mid_age = 25
        end_age = 70

        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь ажилтнуудын мэдээллийг авах (25 хүртэлх)
        end_date = now
        start_date = dt.datetime(now.year - mid_age, now.month, now.day)
        user_id = employee.values_list("user", flat=True)
        worker_qs = Teachers.objects.filter(user__in=user_id, action_status=Teachers.APPROVED)
        row_data = []
        start_age_qs = worker_qs.filter(birthday__gt=start_date)
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                all = start_age_qs.count()
                men = start_age_qs.filter(gender=Teachers.GENDER_MALE).count()
                women = all - men
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": all,
                    "men": men,
                    "women": women
                })
            else:
                teacher_user_id = start_age_qs.values_list("user", flat=True)
                data_qs = employee.filter(user__in=teacher_user_id, org_position__main_position__code__in=main_pos[0])
                data_qs_id = data_qs.values_list("user", flat=True)
                result_qs = Teachers.objects.filter(user__in=data_qs_id, action_status=Teachers.APPROVED)
                all = result_qs.count()
                men = result_qs.filter(gender=Teachers.GENDER_MALE).count()
                women = all - men
                row_data.append({
                    "type": main_pos[1],
                    "type_code": main_pos[0],
                    "all": all,
                    "men": men,
                    "women": women
                })

        main_data_list.append({
            "type": "25 хүртэлх",
            "data_list": row_data
        })

        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь ажилтнуудын мэдээллийг авах (25-69)
        mid_age_next_next = 0
        while mid_age < end_age:
            mid_age_next = mid_age + 5
            start_date = dt.datetime(now.year - mid_age_next, now.month, now.day)
            end_date = dt.datetime(now.year - mid_age, now.month, now.day)

            row_data = []
            mid_age_qs = worker_qs.filter(birthday__gt=start_date, birthday__lte=end_date)
            for index, main_pos in enumerate(col_data_tuple):
                if index == 0:
                    all = mid_age_qs.count()
                    men = mid_age_qs.filter(gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    row_data.append({
                        "type": "Бүгд",
                        "type_code": 0,
                        "all": all,
                        "men": men,
                        "women": women
                    })
                else:
                    teacher_user_id = start_age_qs.values_list("user", flat=True)
                    data_qs = employee.filter(user__in=teacher_user_id, org_position__main_position__code__in=main_pos[0])
                    data_qs_id = data_qs.values_list("user", flat=True)
                    result_qs = Teachers.objects.filter(user__in=data_qs_id, action_status=Teachers.APPROVED)
                    all = result_qs.count()
                    men = result_qs.filter(gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    row_data.append({
                        "type": main_pos[1],
                        "type_code": main_pos[0],
                        "all": all,
                        "men": men,
                        "women": women
                    })

            main_data_list.append({
                "type": str(mid_age) + "-" + str(mid_age_next - 1),
                "data_list": row_data
            })
            mid_age = mid_age_next

        # Хугацааны хязгаарыг насны хэмжээгээр уялдуулан бодож тухайн хязгаар дахь ажилтнуудын мэдээллийг авах (70<)
        end_date = dt.datetime(now.year - end_age, now.month, now.day)
        row_data = []
        end_age_qs = worker_qs.filter(birthday__lte=end_date)
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                all = end_age_qs.count()
                men = end_age_qs.filter(gender=Teachers.GENDER_MALE).count()
                women = all - men
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": all,
                    "men": men,
                    "women": women
                })
            else:
                teacher_user_id = start_age_qs.values_list("user", flat=True)
                data_qs = employee.filter(user__in=teacher_user_id, org_position__main_position__code__in=main_pos[0])
                data_qs_id = data_qs.values_list("user", flat=True)
                result_qs = Teachers.objects.filter(user__in=data_qs_id, action_status=Teachers.APPROVED)
                all = result_qs.count()
                men = result_qs.filter(gender=Teachers.GENDER_MALE).count()
                women = all - men
                row_data.append({
                    "type": main_pos[1],
                    "type_code": main_pos[0],
                    "all": all,
                    "men": men,
                    "women": women
                })

        main_data_list.append({
            "type": str(end_age) + "<",
            "data_list": row_data
        })

        # Мэргэжил дээшлүүлсэн байдал тооцоолох хэсэг

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": "blank",
                    "men": "blank",
                    "women": "blank"
                })
            else:
                row_data.append({
                    "type": main_pos[0],
                    "type_code": main_pos[1],
                    "all": None,
                    "men": None,
                    "women": None
                })

        main_data_list.append({
            "type": "Мэргэжил дээшлүүлсэн байдал",
            "data_list": row_data
        })

        user_id = employee.values_list("user", flat=True)
        country_qs = UserProfessionInfo.objects.filter(user__in=user_id)

        for country in UserProfessionInfo.WHERE_COUNTRY_TYPE:
            mini_country_qs = country_qs.filter(where_country=country[0]).distinct("user")

            row_data = []
            for index, main_pos in enumerate(col_data_tuple):
                if index == 0:
                    all = mini_country_qs.count()
                    user_ids = mini_country_qs.values_list("user", flat=True)
                    men = Teachers.objects.filter(user__in=user_ids, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    row_data.append({
                        "type": "Бүгд",
                        "type_code": 0,
                        "all": all,
                        "men": men,
                        "women": women
                    })
                else:
                    employee_qs = employee.filter(user__userprofessioninfo__in=user_ids)
                    data_qs = employee_qs.filter(org_position__main_position__code__in=main_pos[0])
                    all = data_qs.count()
                    men = Teachers.objects.filter(user__employee__in=data_qs, action_status=Teachers.APPROVED, gender=Teachers.GENDER_MALE).count()
                    women = all - men
                    row_data.append({
                        "type": main_pos[1],
                        "type_code": main_pos[0],
                        "all": all,
                        "men": men,
                        "women": women
                    })

            main_data_list.append({
                "type": country[1],
                "data_list": row_data
            })

        # Мэргэжил дээшлүүлсэн хугацаа тооцоолох хэсэг

        row_data = [] # Мөрийн мэдээлэл хадгалах хүснэгт
        for index, main_pos in enumerate(col_data_tuple):
            if index == 0:
                row_data.append({
                    "type": "Бүгд",
                    "type_code": 0,
                    "all": "blank",
                    "men": "blank",
                    "women": "blank"
                })
            else:
                row_data.append({
                    "type": main_pos[0],
                    "type_code": main_pos[1],
                    "all": None,
                    "men": None,
                    "women": None
                })

        main_data_list.append({
            "type": "Мэргэжил дээшлүүлсэн хугацаа",
            "data_list": row_data
        })

        for day in day_up_info:
            row_data = []
            for index, main_pos in enumerate(col_data_tuple):
                if index == 0:
                    row_data.append({
                        "type": "Бүгд",
                        "type_code": 0,
                        "all": 0,
                        "men": 0,
                        "women": 0
                    })
                else:
                    row_data.append({
                        "type": main_pos[1],
                        "type_code": main_pos[0],
                        "all": 0,
                        "men": 0,
                        "women": 0
                    })
            day.update({"data_list": row_data})

        user_id = employee.values_list("user", flat=True)
        day_up_qs = UserProfessionInfo.objects.filter(user__in=user_id)
        # Ажилтнуудаар гүйлгэх хэсэг
        for emp in employee:
            # Тухайн ажилтны мэдээллийг авах хэсэг
            emp_info = Teachers.objects.filter(user=emp.user.id, action_status=Teachers.APPROVED).first()
            # Тухайн ажилтны мэргэжил дээшлүүлсэн мэдээллийг авах хэсэг
            day_up_filtered_qs = day_up_qs.filter(user=emp.user.id)
            if day_up_filtered_qs:
                total_day = 0
                for day in day_up_filtered_qs:
                    total_day += day.learned_days
                for obj in day_up_info:
                    if obj["range_end"] == "":
                        if obj["range_start"] <= total_day:
                            for index, obj_type in enumerate(obj["data_list"]):
                                if index == 0:
                                    obj_type["all"] += 1
                                    if emp_info.gender == Teachers.GENDER_MALE:
                                        obj_type["men"] += 1
                                    else:
                                        obj_type["women"] += 1
                                else:
                                    if Employee.objects.filter(id=emp.id, org_position__main_position__code__in=obj_type["type_code"]).exists():
                                        obj_type["all"] += 1
                                        if emp_info.gender == Teachers.GENDER_MALE:
                                            obj_type["men"] += 1
                                        else:
                                            obj_type["women"] += 1
                                        break
                            break
                    else:
                        if obj["range_start"] <= total_day and total_day < obj["range_end"]:
                            for index, obj_type in enumerate(obj["data_list"]):
                                if index == 0:
                                    obj_type["all"] += 1
                                    if emp_info.gender == Teachers.GENDER_MALE:
                                        obj_type["men"] += 1
                                    else:
                                        obj_type["women"] += 1
                                else:
                                    if Employee.objects.filter(pk=emp.id, org_position__main_position__code__in=obj_type["type_code"]).exists():
                                        obj_type["all"] += 1
                                        if emp_info.gender == Teachers.GENDER_MALE:
                                            obj_type["men"] += 1
                                        else:
                                            obj_type["women"] += 1
                                        break
                            break

        # Баганы мэдээллийг хадгалах үндсэн хүснэгтэд мэргэжил дээшлүүлсэн хугацааг тооцоолсон өгөгдлийн бүтцийг нэмэх хэсэг
        main_data_list += day_up_info

        return request.send_data(main_data_list)