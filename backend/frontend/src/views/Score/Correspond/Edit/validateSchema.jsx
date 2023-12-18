import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	teach_score: Yup.number()
        .max(100, 'Хамгийн ихдээ 100 байх ёстой')
        .min(0, 'Хамгийн багадаа 0 байх ёстой')
        .transform(value => (isNaN(value) ? undefined : value)),
    exam_score: Yup.number()
        .max(100, 'Хамгийн ихдээ 100 байх ёстой')
        .min(0, 'Хамгийн багадаа 0 байх ёстой')
        .transform(value => (isNaN(value) ? undefined : value)),
});
