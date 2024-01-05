
from googletrans import Translator

translator = Translator()

def post_put_action(self, request, crud, data, pk=None):

    if crud == 'post':

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            serializer.save()
            return request.send_info("INF_001")
        else:
            error_fields = []
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": translator.translate(serializer.errors[key][0], dest='mn').text
                }
                error_fields.append(return_error)

            return request.send_error_valid(error_fields)

    elif crud == 'put':
        qs = self.queryset.filter(id=pk).get()

        serializer = self.get_serializer(qs, data=data, partial=True)

        if serializer.is_valid(raise_exception=False):
            self.perform_update(serializer)
            return request.send_info("INF_002")
        else:
            error_fields = []
            for key in serializer.errors:
                return_error = {
                    "field": key,
                    "msg": translator.translate(serializer.errors[key][0], dest='mn').text
                }
                error_fields.append(return_error)
            return request.send_error_valid(error_fields)
