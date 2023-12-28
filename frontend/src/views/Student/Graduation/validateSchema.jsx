import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    student: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    // lesson: Yup.string()
    //     .trim()
    //     .required('Хоосон байна.'),
    diplom_topic: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    registration_num: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    lesson: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    diplom_topic_eng: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    diplom_topic_uig: Yup.string()
        .trim()
        .required('Хоосон байна.'),
});
