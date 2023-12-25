import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    // address: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
    // social: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
    // leader: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
});
