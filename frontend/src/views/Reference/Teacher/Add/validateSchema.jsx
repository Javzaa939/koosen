import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	register: Yup.string()
		.trim()
		.required('Хоосон байна'),
    org_position: Yup.string()
		.trim()
		.required('Хоосон байна'),
    salbar: Yup.string()
		.trim()
		.required('Хоосон байна'),
	first_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	last_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	email: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// phone_number: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
});
