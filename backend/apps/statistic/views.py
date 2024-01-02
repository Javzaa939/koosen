from rest_framework import mixins
from rest_framework import generics

from core.models import AimagHot
from core.models import SumDuureg
from core.models import Zone
from core.models import Schools
from core.models import EducationalInstitutionCategory
from core.models import PropertyType
from lms.models import (
    Student,
    SubOrgs,
    GraduationWork
)
from lms.models import ProfessionalDegree

from .serializers import SchoolsSerializer
from .serializers import DB3Serializer

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from main.utils.function.utils import get_active_year_season

from operator import itemgetter

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



