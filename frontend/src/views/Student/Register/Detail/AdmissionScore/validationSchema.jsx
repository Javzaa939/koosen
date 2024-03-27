import * as Yup from 'yup';
import { t } from 'i18next';

export const validateSchema = Yup.object().shape({
    confirmation_num: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    admission_lesson: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    score: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    perform: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    exam_year: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    exam_location: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
})

