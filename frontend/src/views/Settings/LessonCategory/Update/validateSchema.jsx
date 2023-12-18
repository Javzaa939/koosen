import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    category_code: Yup.string()
        .trim()
        .required('Хоосон байна'),
    category_name: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
