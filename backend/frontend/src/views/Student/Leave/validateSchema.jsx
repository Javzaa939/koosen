import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    student: Yup.string()
        .trim()
        .required('Хоосон байна.'),
	lesson_year: Yup.string()
        .trim()
        .required('Хоосон байна.'),
	lesson_season: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    register_status: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    learn_week: Yup.string()
        .trim()
        .required('Хоосон байна.'),

});
