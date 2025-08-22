import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	description: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// permissions: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
});
