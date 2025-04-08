import { convertDefaultValue } from "@utils";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import {
	Button,
	Card,
	CardHeader,
	CardTitle,
	Col,
	Form,
	FormFeedback,
	Row
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import classnames from "classnames";
import ScrollSelectFilter from "../ScrollSelectFilter";


export default function GroupStudentBlock({
	t,
	remoteApi,
	elearnId,
	refreshData
}) {
	const { isLoading, Loader, fetchData } = useLoader({});
	const { control, handleSubmit, setError, formState: { errors }, } = useForm({});
	const [studentFilterRefresh, setStudentFilterRefresh] = useState(() => (pageLocal, searchTextLocal = '', recordsLimitPerPageLocal) => studentApi.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal, '', '', '', '', '', '', '', ''))

	const studentApi = useApi().student

	async function onSubmit(cdata, requestType) {
		cdata.requestType = requestType
		cdata.students = cdata?.students ? cdata.students.map(item => item.id) : null
		cdata.groups = cdata?.groups ? cdata.groups.map(item => item.id) : null
		cdata = convertDefaultValue(cdata)

		const { success, error } = await fetchData(remoteApi.put(elearnId, cdata))

		if (success) {
			refreshData()
		}
		else {
			/** Алдааны мессэжийг input дээр харуулна */
			for (let key in error) {
				setError(error[key].field, { type: 'custom', message: error[key].msg });
			}
		}
	}

	return (
		<Card xs={4} className="bg-white">
			<CardHeader className="rounded border pb-0" style={{ paddingTop: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
				<h5 className='fw-bold'>{t('Суралцагч нэмэх')}</h5>
			</CardHeader>
			{isLoading && Loader}
			<Row className="m-0">
				<Col className="p-0">
					<Form onSubmit={handleSubmit((cdata) => onSubmit(cdata, 'groups'))} className="h-100">
						<div className='added-cards mb-0 text-center h-100'>
							<div className={classnames('cardMaster p-1 rounded border h-100 d-flex flex-column')}>
								<h4>{t('Анги сонгоно уу')}</h4>
								<div className="mt-auto">
									<Controller
										defaultValue=''
										control={control}
										name="groups"
										render={({ field: { ref, ...rest } }) =>
											<ScrollSelectFilter
												{...rest}
												fieldName={rest.name}
												getApi={(pageLocal, searchTextLocal = '', recordsLimitPerPageLocal) => studentApi.group.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal, '', '', '', '', '')}
												getOptionLabel={(option) => `${option.name} (${option.degree?.degree_code})`}
												getOptionValue={(option) => option.id}
												isMulti={true}
												optionValueFieldName={'id'}
												onChange={(val) => {
													rest.onChange(val)
													const vals = val.map(item => item.id)
													setStudentFilterRefresh(() => (pageLocal, searchTextLocal = '', recordsLimitPerPageLocal) => studentApi.get(recordsLimitPerPageLocal, pageLocal, '', searchTextLocal, '', '', '', vals, '', '', '', ''))
												}}
											/>
										}
									/>
									{errors['groups'] && <FormFeedback className='d-block'>{t(errors['groups'].message)}</FormFeedback>}
									<Button
										className="me-0 mt-1"
										color="primary"
										type="submit"
									>
										{t("Хадгалах")}
									</Button>
								</div>
							</div>
						</div>
					</Form>
				</Col>
				<Col className="p-0">
					<Form onSubmit={handleSubmit((cdata) => onSubmit(cdata, 'students'))} className="h-100">
						<div className='added-cards mb-0 text-center h-100'>
							<div className={classnames('cardMaster p-1 rounded border h-100 d-flex flex-column')}>
								<h4>{t('Оюутныг кодоор сонгох')}</h4>
								<div className="mt-auto">
									<Controller
										defaultValue=''
										control={control}
										name="students"
										render={({ field: { ref, ...rest } }) =>
											<ScrollSelectFilter
												{...rest}
												fieldName={rest.name}
												getApi={studentFilterRefresh}
												getOptionLabel={(option) => `${option.code} ${option.last_name?.charAt(0)}. ${option.first_name}`}
												getOptionValue={(option) => option.id}
												isMulti={true}
												optionValueFieldName={'id'}
											/>
										}
									/>
									{errors['students'] && <FormFeedback className='d-block'>{t(errors['students'].message)}</FormFeedback>}
									<Button
										className="me-0 mt-1"
										color="primary"
										type="submit"
									>
										{t("Хадгалах")}
									</Button>
								</div>
							</div>
						</div>
					</Form>
				</Col>
			</Row>
		</Card>
	)
}