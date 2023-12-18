import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required('Хоосон байна'),
    position_name: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
