import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required('Хоосон байна'),
    volume: Yup.string()
        .trim()
        .required('Хоосон байна'),
    rent_type: Yup.string()
        .trim()
        .required('Түрээслэх хэлбэрийг сонгоно уу'),
});
