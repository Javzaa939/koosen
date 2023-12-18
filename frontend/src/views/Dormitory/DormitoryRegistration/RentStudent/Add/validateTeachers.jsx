import * as Yup from 'yup';

export const validateTeachers = Yup.object().shape({
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
	// last_name: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// first_name: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// phone_number: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// email: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
	// register: Yup.string()
	// 	.trim()
	// 	.required('Хоосон байна'),
});
