import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	score_code: Yup.string()
		.trim()
		.required('Хоосон байна')
		.matches(/[0-9]/, `Тоо оруулна уу`),
	score_max: Yup.number()
        .max(100, 'Хамгийн ихдээ 100 байх ёстой')
        .min(0, 'Хамгийн багадаа 0 байх ёстой')
        .transform(value => (isNaN(value) ? undefined : value))
        .required('Хоосон байна'),
	score_min: Yup.number()
        .max(100, 'Хамгийн ихдээ 100 байх ёстой')
        .min(0, 'Хамгийн багадаа 0 байх ёстой')
        .transform(value => (isNaN(value) ? undefined : value))
        .required('Хоосон байна'),
	assesment: Yup.string()
		.trim()
		.required('Хоосон байна')
		.matches(/[A-Za-z]{1}/, `Зөв утга оруулна уу`),
	gpa: Yup.number()
		.max(100, 'Хамгийн ихдээ 100 байх ёстой')
		.min(0, 'Хамгийн багадаа 0 байх ёстой')
		.transform(value => (isNaN(value) ? undefined : value))
		.required('Хоосон байна'),
});
