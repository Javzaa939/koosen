import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	lesson: Yup.string()
        .trim()
        .required('Хоосон байна'),
});
