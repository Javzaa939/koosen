import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	first_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	last_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	register_num: Yup.string()
		.trim()
		.required('Хоосон байна'),
    correspond_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
    profession: Yup.string()
		.trim()
		.required('Хоосон байна'),
});
