import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    student:Yup.string()
        .trim()
        .required('Хоосон байна'),
    lesson:Yup.string()
        .trim()
        .required('Хоосон байна'),
    status:Yup.string()
        .trim()
        .required('Хоосон байна'),
})
