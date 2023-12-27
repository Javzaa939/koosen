import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	register: Yup.string()
		.trim()
		.required('Хоосон байна'),
    state: Yup.string()
		.trim()
		.required('Хоосон байна'),
    org_position: Yup.string()
		.trim()
		.required('Хоосон байна'),
    salbar: Yup.string()
		.trim()
		.required('Хоосон байна'),
	register_code: Yup.string()
		.trim()
		.required('Хоосон байна'),
});
