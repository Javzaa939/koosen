import * as Yup from 'yup';
import { t } from 'i18next';

export const validateSchema = Yup.object().shape({
    member: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    last_name: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    first_name: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
    register_num: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
})

