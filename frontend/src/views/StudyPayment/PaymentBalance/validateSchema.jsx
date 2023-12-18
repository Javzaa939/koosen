import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	student: Yup.string()
		.trim()
		.required('Хоосон байна'),
	balance_date: Yup.string()
		.trim()
		.required('Хоосон байна'),
	balance_amount: Yup.string()
		.trim()
		.required('Хоосон байна'),
	balance_desc: Yup.string()
		.trim()
		.required('Хоосон байна'),
	flag: Yup.string()
		.trim()
		.required('Хоосон байна'),
});
