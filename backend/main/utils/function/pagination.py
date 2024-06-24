from rest_framework import pagination


class CustomPagination(pagination.PageNumberPagination):
    """
        page_size: 1 хуудсан дахь өгөгдлийн тоо
        max_page_size: Хамгийн ихдээ 1 хуудсанд 50 өгөгдөл байна
        page_size_query_param: URL -ээс хуудсанд дахь лимитийн авах param-ын нэр
        page_query_param: URL -ээс хэд дэхь хуудасыг авах param-ын нэр

        URL : http://127.0.0.1:8000/road/passport/list/?limit=10&page=1&sorting=-ro102025 query parametr ашиглаж хүсэлт илгээнэ
    """

    page_size = 10
    page_size_query_param = 'limit'
    page_query_param = 'page'

    # sorting хоосон үед _check_object_list_is_ordered функцыг override хийсэн.
    def paginate_queryset(self, queryset, request, view=None):

        request.query_params._mutable = True

        count = queryset.count()

        page = int(request.query_params.get('page'))
        limit = request.query_params.get('limit')

        if limit == 'Бүгд':
            limit = int(count)
            request.query_params['limit'] = limit
        else:
            limit = int(limit)

            check_page = int(count / limit)
            float_page = count % limit

            if float_page != 0:
                check_page += 1

            if check_page < page:
                request.query_params['page'] = '1'

        self.django_paginator_class._check_object_list_is_ordered = lambda s: None
        return super().paginate_queryset(queryset, request, view=view)
