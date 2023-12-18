import * as Yup from 'yup'

export const validateSchema = Yup.object().shape({
    active_lesson_year: Yup.string()
        .trim()
        .required('Хоосон байна'),
    prev_lesson_year: Yup.string()
        .trim()
        .required('Хоосон байна'),
    start_date:Yup.string()
        .trim()
        .required('Хоосон байна'),
    finish_date:Yup.string()
        .trim()
        .required('Хоосон байна'),
});
