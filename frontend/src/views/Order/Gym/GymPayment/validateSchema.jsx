import * as Yup from 'yup';

export const validateSchema = Yup.object().shape({
	room: Yup.string()
		.trim()
		.required('Хоосон байна'),
	name: Yup.string()
		.trim()
		.required('Хоосон байна'),
    mount_count: Yup.string()
		.trim()
		.required('Хоосон байна'),
    accepted_count: Yup.string()
		.trim()
		.required('Хоосон байна'),
    payment: Yup.string()
		.trim()
		.required('Хоосон байна'),
	start_time: Yup.string()
        .trim()
		.test('required', 'Хоосон байна', val => {
			if(document.getElementById('is_freetime').checked) return true
			else return val
		}),
	finish_time: Yup.string()
        .trim()
		.test('required', 'Хоосон байна', val => {
			if(document.getElementById('is_freetime').checked) return true
			else return val
		}),
});
