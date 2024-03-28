import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    state: Yup.string()
        .trim()
        .required('Төлөв сонгоно уу.'),
    state_description: Yup.string()
        .trim()
        .required('Тайлбар бичнэ үү.'),
});
