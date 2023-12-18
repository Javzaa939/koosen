import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	student: Yup.string()
		.trim()
		.required('Хоосон байна'),
	first_balance: Yup.string()
		.trim()
		.required('Хоосон байна'),
});
