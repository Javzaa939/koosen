import * as Yup from 'yup';
import { t } from 'i18next';

export const validateSchema = Yup.object().shape({
	citizenship: Yup.string()
		.trim()
		.required(t('Хоосон байна')),
	department: Yup.string()
		.trim()
		.required(t('Хоосон байна')),
	register_num: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
	// gender: Yup.string()
    //     .trim()
    //     .required(t('Хоосон байна')),
	group: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
	status: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
	pay_type: Yup.string()
        .trim()
        .required(t('Хоосон байна')),
});
