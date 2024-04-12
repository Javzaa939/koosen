import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    flexible: Yup.string()
        .trim()
        .required('Хоосон байна'),
    total_score: Yup.string()
        .trim()
        .required('Хоосон байна'),
    patience_1000m: Yup.string()
        .trim()
        .required('Хоосон байна'),
    speed_100m: Yup.string()
        .trim()
        .required('Хоосон байна'),
    quickness: Yup.string()
        .trim()
        .required('Хоосон байна'),
    turnik: Yup.string()
        .trim()
        .required('Хоосон байна'),
    belly_draught: Yup.string()
        .trim()
        .required('Хоосон байна'),
    description: Yup.string()
        .trim()
        .required('Хоосон байна'),
    state: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
