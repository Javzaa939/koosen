import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	exam_date: Yup.string()
		.trim()
		.required('Хоосон байна'),
	begin_time: Yup.string()
		.trim()
		.required('Хоосон байна'),
	teacher: Yup.string()
		.trim()
		.required('Багш сонгоно уу.'),
	room: Yup.string()
        .trim()
		.test('required', 'Өрөө сонгоно уу', val => {
			if(document.getElementById('is_online').checked) return true
			else return val
		}),
	end_time: Yup
        .mixed()
        .test(
            "hoosn", "Хоосон байна", (value, context) => {
                return value
            })
        .test(
            "min", "Эхлэх цагаас их байх ёстой", (value, context) => {
                return value > context?.parent?.begin_time
            },
        )
});
