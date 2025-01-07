import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    letter: Yup.string()
        .trim()
        .required('Хоосон байна'),
    description: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
