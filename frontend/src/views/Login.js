import { useContext } from "react"
import { useSkin } from "@hooks/useSkin"

import { Link, useNavigate } from "react-router-dom"
import InputPasswordToggle from "@components/input-password-toggle"

import {
	Row,
	Col,
	Form,
	Label,
	Input,
	Button,
	FormFeedback
} from "reactstrap"

import "@styles/react/pages/page-authentication.scss"

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useForm, Controller } from 'react-hook-form'

import SchoolContext from '@context/SchoolContext'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'

const HomeRoute = '/calendar'

const Login = () => {
	const { skin } = useSkin()
	const navigate = useNavigate()
    const { setUser } = useContext(AuthContext)

	const illustration = skin === "dark" ? "login-v2-dark.svg" : "login-v2.svg",
	source = require(`@src/assets/images/pages/${illustration}`)
	const logo = require("@src/assets/images/logo/dxis_logo.png")

	const userApi = useApi().user
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

	const { setSchool } = useContext(SchoolContext)

	const SignupSchema = yup.object().shape({
		email: yup.string().required('И-мэйл хаяг эсвэл хэрэглэгчийн нэрээ оруулна уу'),
		password: yup.string().required("Нууц үг оруулна уу"),
	})

	const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({ mode: 'onChange', resolver: yupResolver(SignupSchema) })

    async function onSubmit (datas) {
      const { success, data } = await fetchData(userApi.login(datas))
        if (success) {
			setSchool(data.school_id)
            setUser(data)
            navigate(HomeRoute)
        }
    }

	return (
		<div className="auth-wrapper auth-cover">
			<Row className="auth-inner m-0">
			{isLoading && Loader}
			<div className="brand-logo start-0 align-items-center " >
				<img
					src={logo}
					alt="logo"
					style={{objectFit: 'cover'}}
					height="40px"
					width="40px"
				/>
				<h2 className="brand-text text-primary ms-2 ">Сургалтын удирдлагын систем</h2>
			</div>
			<Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
				<div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
				<img className="img-fluid" src={source} alt="Login Cover" />
				</div>
			</Col>
			<Col
				className="d-flex align-items-center auth-bg px-2 p-lg-5"
				lg="4"
				sm="12"
			>
				<Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
					<Form
						className="auth-login-form mt-2"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="mb-1">
                            <Label className="form-label" for="email">
                                Имэйл/Хэрэглэгчийн нэр
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='email'
                                name='email'
                                render={({ field }) => <Input id="email" placeholder='Имэйл хаяг' invalid={errors.email && true} autoComplete="username" {...field} />}
                            />
							{errors.email && <FormFeedback>{errors.email.message}</FormFeedback>}
                        </div>
                        <div className="mb-1">
                            <div className="d-flex justify-content-between">
                                <Label className="form-label" for="password">
                                    Нууц үг
                                </Label>
                                <Link to="/forgot-password" tabIndex={'-1'} >
                                    <small>Нууц үгээ мартсан?</small>
                                </Link>
                            </div>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='password'
                                name='password'
                                render={({ field }) => <InputPasswordToggle className="input-group-merge" invalid={errors.password && true} {...field}/>}
                            />
							{errors.password && <FormFeedback>{errors.password.message}</FormFeedback>}
                        </div>
						<Button color="primary" block type="submit" >
							Нэвтрэх
						</Button>
					</Form>
				</Col>
			</Col>
			</Row>
		</div>
	)
}

export default Login
