import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	student: Yup.string()
		.trim()
		.required('Хоосон байна'),
	payment: Yup.string()
		.trim()
		.required('Хоосон байна'),
	in_balance: Yup.string()
		.trim()
		.required('Хоосон байна'),
	out_balance: Yup.string()
		.trim()
		.required('Хоосон байна'),
	last_balance: Yup.string()
		.trim()
		.required('Хоосон байна'),
	first_balance: Yup.string()
		.trim()
		.required('Хоосон байна'),
});
