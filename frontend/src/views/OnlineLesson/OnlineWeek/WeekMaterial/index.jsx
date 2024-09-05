import { useState, useContext, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, Form, Row, Input, Col, Label, FormFeedback, Button, Alert, Badge } from "reactstrap";
import AuthContext from "@src/utility/context/AuthContext";
import { Controller, useForm } from "react-hook-form";
import classnames from "classnames"
import Select from 'react-select'
import { t } from "i18next";
import { ReactSelectStyles } from '@utils'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useModal from "@hooks/useModal";

import { X } from "react-feather";

function WeekMaterial({ week, refresh}) {
	// ирж буй path-ийн урд талийг арилгах function
	const handleUrl = (url) => {
		const lastIndexOfUrl = url.lastIndexOf('/') + 1;
		return url.substring(lastIndexOfUrl, url.length);
	}

	const [isMaterial, setIsMaterial] = useState(false)
	const [lektsFile, setFile] = useState(null)
	const [materialOption, setMaterialOption] = useState([])

	const [modal, setModal] = useState(false);
	const toggle = () => setModal(!modal);
	const { showWarning } = useModal();

	const { userDetail :user } = useContext(AuthContext)
	const { fetchData, isLoading } = useLoader({})

	const {
		control,
		formState: { errors },
		handleSubmit,
		reset,
	} = useForm();

	const materialApi = useApi().material
	const lektsApi = useApi().online_lesson.lekts_material

	async function getMaterial() {
		const { success, data } = await fetchData(materialApi.get(1))
		if (success) {
			if(data.length > 0) {
				setMaterialOption(data[0]?.file?.files)
			}
		}
	}

	async function onSubmit(cdata) {
		cdata['created_user'] = user.id
		cdata['id'] = week?.id
		var formData = new FormData()
		if(lektsFile) {
			formData.append('lekts_file', lektsFile)
			formData.append('is_new', true)
		} else {
			formData.append('is_new', false)
		}

		for (let key in cdata) {
			formData.append(key, cdata[key])
		}

		const { success, data } = await fetchData(lektsApi.post(formData))
		if (success) {
			toggle()
			reset()
			refresh()
		}
	}

	// delete api
	const handleDelete = async () => {
		const { success } = await fetchData(lektsApi.delete(week?.id));
		if (success) {
			refresh()
		}
	};

	useEffect(
		() =>
		{
			getMaterial()
		},
		[]
	)

	return (
		<div className="w-100">
			<div className="d-flex flex-row justify-content-end align-items-center w-100">
				{
					!week?.lekts_path
					&&
					<Button size='sm' color="primary" onClick={toggle}>
						Оруулах
					</Button>
				}
			</div>
			{
				week?.lekts_path &&
				<>
					<div>
						{week?.description || ''}
					</div>
					<div>
						{
							['pdf', 'PDF'].includes(week?.lekts_path?.split('.').pop())
							?
								<div className="text-end">
									<iframe src={week?.lekts_path} width="100%" height="400px" className='border'></iframe>
									<Button
										size="sm"
										color="danger"
										className="ms-1"
										onClick={() =>
											showWarning({
												header: {
													title: t(`Лекцийн материал`),
												},
												question: t(`Лекцийн материал устгах уу?`),
												onClick: () => handleDelete(week.id),
												btnText: t("Устгах"),
											})
										}
									>
										Устгах
									</Button>
								</div>
							:
								['pptx', 'PPTX'].includes(week?.lekts_path?.split('.').pop())
								?
								<iframe
									title={'PDF-Viewer'}
									src={`https://view.officeapps.live.com/op/embed.aspx?src=[${week?.lekts_path}]`}
									frameBorder={0}
								></iframe>
							:
								<div>
									<a href={week?.lekts_path} download>
										{handleUrl(week?.lekts_path)}
									</a>
									<a
										className="ms-1"
										role="button"
										onClick={() =>
											showWarning({
												header: {
													title: t(`Лекцийн материал`),
												},
												question: t(`Лекцийн материал устгах уу?`),
												onClick: () => handleDelete(week.id),
												btnText: t("Устгах"),
											})
										}
										id={`complaintListDatatableCancel${week?.id}`}
									>
										<Badge color="light-danger" pill>
											<X width={18} />
										</Badge>
									</a>
								</div>
						}
					</div>
				</>
			}
			{
				modal &&
					<Modal
						className="modal-dialog-centered modal-md"
						contentClassName="pt-0"
						backdrop="static"
						isOpen={modal}
						toggle={toggle}
					>
						<ModalHeader toggle={toggle}>Хичээлийн лекц оруулах</ModalHeader>
						<ModalBody className="row">
							<Form onSubmit={handleSubmit(onSubmit)}>
								<Row className="">
									<Col md={12}>
										<Label className="form-label" for="description">
											{'Лекцийн тайлбар'}
										</Label>
										<Controller
											defaultValue=''
											control={control}
											id="description"
											name="description"
											render={({ field }) => (
												<Input
													{...field}
													id="description"
													bsSize="sm"
													placeholder={'Лекцийн тайлбар'}
													type="textarea"
													invalid={errors.description && true}
												/>
											)}
										/>
										{errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
									</Col>
									<hr/>
									<Col md={12}>
										<Alert color={'primary'} className={'p-50'}>
											Оруулсан хичээлийн материалын файлаас сонгох эсвэл шинээр файл оруулахыг анхаарна уу.
										</Alert>
									</Col>
									<Col md={12} className={'mt-25'}>
										<Label className="form-label" for="lekts_file">
											Хичээлийн материалын файлаас сонгож оруулах
										</Label>
										<Controller
											defaultValue=''
											control={control}
											id="lekts_file"
											name="lekts_file"
											render={({ field: { value, onChange } }) => {
												return (
													<Select
														name="lekts_file"
														id="lekts_file"
														classNamePrefix="select"
														isClearable
														className={classnames("react-select")}
														isLoading={isLoading}
														placeholder={t("-- Сонгоно уу --")}
														options={materialOption || []}
														value={materialOption.find((c) => c.id === value)}
														noOptionsMessage={() =>t("Хоосон байна")}
														onChange={(val) => {
															onChange(val?.id || "");
															setIsMaterial(true)
															if (!val) {
																setIsMaterial(false)
															}
														}}
														styles={ReactSelectStyles}
														getOptionValue={(option) => option.id}
														getOptionLabel={(option) => handleUrl(option?.path)}
													/>
												);
											}}
										/>
									</Col>
									{
										!isMaterial
										&&
										<Col md={12} className={'mt-1'}>
											<Label className="form-label" for="lekts_file">
												эсвэл Шинээр файл оруулах
											</Label>
											<Input
												type='file'
												onChange={(e) => {
													setFile(e.target.files?.[0] ?? null)
												}}
											/>
											{
												lektsFile
												&&
												<div className='p-50 d-flex justify-content-between file_style'>
													<div className='text-truncate fw-bold'>
														{typeof lektsFile == 'string' ? ftext(lektsFile) :
															lektsFile?.name?.length > 30 ?
															`${lektsFile?.name?.substring(0, 27)}...${lektsFile?.name?.substring(lektsFile?.name?.length - 4)}` :
															lektsFile?.name
														}
													</div>
													<div>
														<X color='red' onClick={(e) => {setFile(null)}} size={16} role='button'/>
													</div>
												</div>
											}
										</Col>
									}
									<Col md={12}  className={'d-flex justify-content-between mt-1'}>
										<Button type="submit" color="primary">
											Хадгалах
										</Button>
										<Button type="reset" color="secondary" onClick={() => setModal(false)}>
											Буцах
										</Button>
									</Col>
								</Row>
							</Form>
						</ModalBody>
					</Modal>
			}
		</div>
	);
}

export default WeekMaterial;
