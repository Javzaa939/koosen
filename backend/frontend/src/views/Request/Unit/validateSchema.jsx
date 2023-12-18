import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    unit: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
