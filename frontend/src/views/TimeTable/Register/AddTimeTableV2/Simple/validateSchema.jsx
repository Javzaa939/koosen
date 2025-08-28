import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// st_count: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	odd_even: Yup.string()
		.trim()
		.required('Хоосон байна'),
	study_type: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// room: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// day: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// department: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	lesson: Yup.string()
		.trim()
		.required('Хоосон байна'),
	potok: Yup.string()
		.trim()
		.required('Хоосон байна'),
	// teacher: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
});
