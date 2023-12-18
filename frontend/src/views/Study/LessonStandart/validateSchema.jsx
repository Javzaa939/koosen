import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	department: Yup.string()
		.trim()
		.required('Хоосон байна'),
	code: Yup.string()
		.trim()
		.required('Хоосон байна'),
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	kredit: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
