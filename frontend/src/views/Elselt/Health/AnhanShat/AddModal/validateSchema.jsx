import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    height: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
