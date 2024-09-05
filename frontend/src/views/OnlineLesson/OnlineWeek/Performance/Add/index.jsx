import useLoader from "@src/utility/hooks/useLoader";
import { convertDefaultValue } from '@src/utility/Utils';
import { ReactSelectStyles } from '@utils';
import classnames from "classnames";
import { Fragment, useContext, useEffect } from "react";
import { X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { useState }	from "react";
import AuthContext from "@src/utility/context/AuthContext";
import {
	Button,
	Col,
	Form,
	FormFeedback,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row
} from "reactstrap";

function Add({ open, handleModal , refreshDatas}) {
	const CloseBtn = (
		<X className="cursor-pointer" size={15} onClick={handleModal} />
	)

	const [students, setStudents] = useState([]);

	// hooks
	const { fetchData } = useLoader({ isFullScreen: true })
	const { t } = useTranslation();

	// context
	const { userDetail } = useContext(AuthContext)
	const user = userDetail;

	const {
		control,
		formState: { errors },
		handleSubmit,
		setValue,
		reset,
	} = useForm({
		defaultValues: {

		},
	});

	async function onSubmit(cdata) {
		cdata.plan = description;
		console.log(cdata)
		cdata = convertDefaultValue(cdata);
		const { success, data } = await fetchData(OnlineLessonAPI.lessonRegister(cdata));
		if (success) {
			reset();
			toggle();
			refreshDatas();
		}
	}

	useEffect(() => {
	}, [])

	useEffect(() => {
		if (user) {
			setValue("teacher", user.id);
		}
	}, [user, setValue]);

	return (
		<Fragment>
			<Modal toggle={handleModal} isOpen={open} className="modal-dialog-centered modal-lg">
				<ModalHeader
					toggle={handleModal}
					close={CloseBtn}
					tag="div"
				>
					<h5 className="modal-title">{t('Оюутан нэмэх')}</h5>
				</ModalHeader>
				<ModalBody className="row margin_fix">
					<Form onSubmit={handleSubmit(onSubmit)}>
						<Row tag="div">
							<Col md={12}>
									<Label for="group">Анги</Label>
									<Controller
										name="group"
										control={control}
										defaultValue={[]}
										render={({ field: { value, onChange } }) => {
										return (
											<Select
												name="group"
												id="group"
												classNamePrefix="select"
												isClearable
												isMulti
												className={classnames('react-select', { 'is-invalid': errors.lesson })}
												placeholder={`-- Сонгоно уу --`}
												options={students || []}
												value={students.filter((c) => value.includes(c.id))}
												noOptionsMessage={() => 'Хоосон байна'}
												onChange={(selectedOptions) => {
													onChange(selectedOptions.map(option => option.id))
												}}
												styles={ReactSelectStyles}
												getOptionValue={(option) => option.id}
												getOptionLabel={(option) => option.name}
												/>
										);
										}}
									/>
									{errors.lesson && (
										<FormFeedback className="d-block">
										{t(errors.lesson.message)}
										</FormFeedback>
									)}
							</Col>
						</Row>
						<ModalFooter>
							<Button color="primary" type="submit">
								{t('Хадгалах')}
							</Button>
							<Button color="secondary" onClick={handleModal}>
								{t('Болих')}
							</Button>
						</ModalFooter>
					</Form>
				</ModalBody>
			</Modal>
		</Fragment>
	)
}

export default Add