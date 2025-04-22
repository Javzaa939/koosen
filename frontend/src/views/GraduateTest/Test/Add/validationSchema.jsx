import * as Yup from "yup";

export const validateSchema = Yup.object().shape({
	title: Yup.string().trim().required("Хоосон байна"),
	description: Yup.string().trim().required("Хоосон байна"),
	duration: Yup.string().trim().required("Хоосон байна"),
});