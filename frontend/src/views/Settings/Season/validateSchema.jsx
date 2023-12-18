import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    season_code: Yup.string()
        .trim()
        .required('Хоосон байна'),
    season_name: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
