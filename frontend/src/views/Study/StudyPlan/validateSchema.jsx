import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	profession: Yup.string()
		.trim()
		.required('Хоосон байна'),
	lesson: Yup.string()
		.trim()
		.required('Хоосон байна'),
	previous_lesson: Yup.string().notOneOf([Yup.ref("lesson"), null], "Өмнөх холбоос хичээл нь хичээлтэй адилхан байж болохгүй").notRequired(),
});
