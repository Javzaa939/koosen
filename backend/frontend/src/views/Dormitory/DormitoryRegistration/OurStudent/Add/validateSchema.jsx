import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	student: Yup.string()
		.trim()
		.required('Оюутан сонгоно уу.'),
	room_type: Yup.string()
		.trim()
		.required('Өрөөний төрөл сонгоно уу.'),
	room: Yup.string()
		.trim()
		.required('Өрөө сонгоно уу.'),
	in_balance: Yup.string()
		.trim()
		.required('Төлбөрийн дүн оруулна уу.'),
	solved_flag: Yup.string()
		.trim()
		.required('Шийдвэр сонгоно уу.'),
});
