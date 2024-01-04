import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    title: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
