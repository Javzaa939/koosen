import React, { Fragment, useState, useEffect } from "react";
import { CardTitle, Row, Col, CardBody, Card,CardHeader,Button,Form,FormFeedback,Label } from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

//import classes
import classnames from "classnames";

import {useForm, Controller } from "react-hook-form"

import { validate, convertDefaultValue} from "@utils"
import { validatePassSchema } from "./validationSchema.jsx"


import { useParams, useNavigate } from "react-router-dom";

import InputPasswordToggle from "@components/input-password-toggle"

const ChangePassword = (props) => {

	const {userID} = useParams()
	const navigate = useNavigate()

    // API
    const userApi = useApi().user

	// ** Hooks
	const { control, setValue, handleSubmit, reset, formState: { errors }} = useForm(validate(validatePassSchema))

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

	async function onSubmit(values) {
		const data = convertDefaultValue(values)
      	const { success } = await fetchData(userApi.changePassword(data, userID))
        if (success) {
			reset()
            navigate('/login')
        }
    }

	return (
		<Fragment>
			<Col>
				<Card>
				<CardBody className=" p-1 " >
					<div className={classnames("p-1")}>
						<CardHeader className="pb-0 pt-0 px-0 mb-1 text-center">
							<CardTitle tag="h4">Хэрэглэгчийн нууц үг солих</CardTitle>
						</CardHeader>
						<Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
							<div className={classnames("cardMaster rounded border p-1")}>
								<Col xs={12} md={12}>
									<Label className="form-label" for="old_password">
										Хуучин нууц үг
									</Label>
									<Controller
										defaultValue=''
										control={control}
										id='old_password'
										name='old_password'
										render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.password && true} {...field} />} />
									{errors.old_password && <FormFeedback>{errors.old_password.message}</FormFeedback>}
									<Label className="form-label" for="password">
										Шинэ нууц үг
									</Label>
									<Controller
										defaultValue=''
										control={control}
										id='password'
										name='password'
										render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.password && true} {...field} />} />
									{errors.password && <FormFeedback>{errors.password.message}</FormFeedback>}
									<Label className="form-label" for="confirm-password">
										Нууц үгээ давтана уу
									</Label>
									<Controller
										defaultValue=''
										control={control}
										id='confirm_password'
										name='confirm_password'
										render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.confirm_password && true} {...field} />} />
									{errors.confirm_password && <FormFeedback>{errors.confirm_password.message}</FormFeedback>}
									<div className="text-center">
										<Button className="mt-1 me-1" color="primary">
											Хадгалах
										</Button>
									</div>
								</Col>
							</div>
						</Row>
					</div>
			</CardBody>
			</Card>
		</Col>
		<Col></Col>
		</Fragment>
	);
};

export default ChangePassword;
