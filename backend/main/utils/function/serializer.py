
from googletrans import Translator
from rest_framework import serializers

translator = Translator()

# TODO: yuki get_res=True үед serializer validation-г даваагүй үеийн result-г


def post_put_action(self, request, crud, data, pk=None, get_res=False):

    if crud == 'post':

        serializer = self.get_serializer(data=data)

        if serializer.is_valid(raise_exception=False):
            saved_qs = serializer.save()
            if get_res:
                return saved_qs

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
            saved_qs = serializer.save()
            if get_res:
                return saved_qs
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


def dynamic_serializer(c_model, c_fields, c_depth=0):

    c_depth = int(c_depth)
    assert c_depth >= 0

    class CustomSerializer(serializers.ModelSerializer):

        class Meta:
            model = c_model
            fields = c_fields
            depth= c_depth

    return CustomSerializer