import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    learn_code: Yup.string()
        .trim()
        .required('Хоосон байна'),
    learn_name: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
