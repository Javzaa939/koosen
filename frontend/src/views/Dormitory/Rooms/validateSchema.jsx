import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    room_type: Yup.string()
        .trim()
        .required('Хоосон байна'),
    room_number: Yup.string()
        .trim()
        .required('Хоосон байна'),
    gateway: Yup.string()
        .trim()
        .required('Хоосон байна'),
    floor: Yup.string()
        .trim()
        .required('Хоосон байна'),
    gender: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
