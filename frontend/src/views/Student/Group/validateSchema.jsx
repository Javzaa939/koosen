import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	department: Yup.string()
		.trim()
		.required('Хоосон байна'),
	degree: Yup.string()
		.trim()
		.required('Хоосон байна'),
	profession: Yup.string()
		.trim()
		.required('Хоосон байна'),
	join_year: Yup.string()
		.trim()
		.required('Хоосон байна'),
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	level: Yup.string()
		.trim()
		.required('Хоосон байна'),
	learning_status: Yup.string()
		.trim()
		.required('Хоосон байна'),
});

