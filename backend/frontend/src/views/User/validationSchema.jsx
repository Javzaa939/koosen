import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	username: Yup.string()
		.trim()
		.required('Хоосон байна'),
	first_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	last_name: Yup.string()
		.trim()
		.required('Хоосон байна'),
	email: Yup.string()
        .trim()
        .email('И-мэйл хаяг алдаатай байна')
        .required('Хоосон байна.'),
	phone_number: Yup.string()
		.trim()
		.max(8, '8-с илүүгүй урттай утга оруулна уу.')
		.matches(/[1-9]{1}[0-9]{7}/, {
			excludeEmptyString: true,
			message: 'Утасны дугаараа зөв оруулна уу.',
        }),
	register: Yup.string()
        .trim()
        .required('Хоосон байна.')
        .max(10, '10-с илүүгүй урттай утга оруулна уу.')
        .matches(/[А-Яа-я]{2}[0-9]{8}/, `Регистерийн дугаараа зөв оруулна уу.`),
});
