import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required('Хоосон байна'),
    is_ourstudent: Yup.string()
        .trim()
        .required('Хоосон байна'),
    payment: Yup.string()
        .trim()
        .required('Хоосон байна'),
    room_type: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
