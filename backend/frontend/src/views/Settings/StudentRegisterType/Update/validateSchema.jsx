import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    code: Yup.string()
        .trim()
        .required('Хоосон байна'),
   name: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
