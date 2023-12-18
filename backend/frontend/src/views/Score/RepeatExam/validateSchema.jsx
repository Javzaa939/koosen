import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
    exam_score: Yup.number()
    .max(30, 'Хамгийн ихдээ 30 байх ёстой')
    .min(0, 'Хамгийн багадаа 0 байх ёстой')
    .transform(value => (isNaN(value) ? undefined : value)),
})
