from django.db import connection
from rest_framework import pagination

from main.utils.function import utils


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


class RawQueryCustomPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'

    def paginate_queryset(self, query, request, view=None):
        # to get total count for default django pagination response adaptation
        count_query = f"SELECT COUNT(*) FROM ({query}) AS count_query"
        total_count = 0

        with connection.cursor() as cursor:
            cursor.execute(count_query)
            total_count = cursor.fetchone()[0]

        limit = request.query_params.get('limit')
        request.query_params._mutable = True

        if limit == 'Бүгд' or not limit:
            limit = total_count
            request.query_params['limit'] = limit

        else:
            limit = int(limit)

        # to avoid error: "ZeroDivisionError: division by zero"
        if limit == 0:
            limit = 1

        page_count = int(total_count / limit)

        float_page_count = total_count % limit

        if float_page_count != 0:
            page_count += 1

        page = request.query_params.get('page')

        if not page:
            page = 1
        else:
            page = int(page)

        if page_count <= page:
            page = 1
            request.query_params['page'] = '1'

        # to get OFFSET
        offset = (page - 1) * limit

        # to add LIMIT and OFFSET to query
        paginated_query = f"{query} LIMIT {limit} OFFSET {offset}"

        with connection.cursor() as cursor:
            cursor.execute(paginated_query)
            results = list(utils.dict_fetchall(cursor))

        self.django_paginator_class._check_object_list_is_ordered = lambda s: None

        # to make django RF paginator use proper total count value. Because without this, it will use len() so current limit value will be used instead
        class IterableWithTotalCountField:
            def __init__(self, data, count):
                self.data = data
                self._total_count = count

            def __iter__(self):
                for item in self.data:

                    yield item

            def __len__(self):

                return len(self.data)

            def __getitem__(self, idx):

                return self.data[idx]

            def count(self):

                return self._total_count

        results_with_total_count = IterableWithTotalCountField(results, total_count)

        # to fill default paginator class properties e.g.: next page, prev page, etc
        super().paginate_queryset(results_with_total_count, request, view=view)

        # to return partial results because we already got it. So if we use result from super().paginate_queryset then it will be empty in pages after first page because data already paginated so it is not full so no data to paginate for super()
        return results

