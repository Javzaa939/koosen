import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	time_payment: Yup.string()
		.trim()
		.required('Хоосон байна'),
});
