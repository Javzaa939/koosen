import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
student: Yup.string()
    .trim()
    .required('Хоосон байна.'),
lesson: Yup.string()
    .trim()
    .required('Хоосон байна.'),
teach_score: Yup.string()
    .trim()
    .required('Хоосон байна.'),
exam_score: Yup.string()
    .trim()
    .required('Хоосон байна.'),
});
