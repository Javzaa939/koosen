import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	group: Yup.string()
		.trim()
		.required('Хэвлэхээс өмнө анги сонгоно уу.'),

});
