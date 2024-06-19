import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    state: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
