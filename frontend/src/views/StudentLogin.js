import { useContext } from 'react'

// ** React Imports
import { Link, useNavigate } from 'react-router-dom'

// ** Custom Components
import InputPasswordToggle from '@components/input-password-toggle'

// ** Reactstrap Imports
import { Card, CardBody, CardText, Form, Label, Input, Button, FormFeedback } from 'reactstrap'

import { useForm, Controller } from 'react-hook-form'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useSkin } from "@hooks/useSkin"

import AuthContext from '@context/AuthContext'

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Styles
import "@styles/react/pages/page-authentication.scss"

import logo from "@src/assets/images/logo/dxis_logo.png";
import whitelogo from "@src/assets/images/logo/dxis_logo.png";

const HomeRoute = '/calendar'

const StudentLogin = () => {
    const { skin } = useSkin()
    const navigate = useNavigate()

	const illustration = skin === "dark" ? "login-v2-dark.svg" : "login-v2.svg",
	source = require(`@src/assets/images/pages/${illustration}`).default

	const userApi = useApi().user
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })

    const { setUser, setIsStudentUser } = useContext(AuthContext)

    const SignupSchema = yup.object().shape({
		username: yup.string().required('Оюутны кодыг оруулна уу!'),
		password: yup.string().required("Нууц үгээ оруулна уу!"),
	})

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
		mode: 'onChange',
		resolver: yupResolver(SignupSchema)
	})

    async function onSubmit(datas) {
        datas['username'] = datas?.username?.trim()
        datas['isStudent'] = true
        const { success, data } = await fetchData(userApi.login(datas))
		if (success) {
            setIsStudentUser(true)
			setUser(data)
            navigate(HomeRoute)
		}
    }

    return (
        <div className='auth-wrapper auth-basic px-2'>
            {isLoading && Loader}
            <div className='auth-inner my-2'>
                <Card className='mb-0'>
                    <CardBody>
                        <Link className='brand-logo' to='/' onClick={e => e.preventDefault()}>
                            <img
								src={skin == 'dark' ? whitelogo : logo}
								alt="logo"
								className="object-fit-cover"
								height={45}
								width={45}
							/>
                            <h2 className='brand-text text-primary ms-1 mt-50'>Оюутнаар нэвтрэх</h2>
                        </Link>
                        <CardText className='mb-2'>
                            Та оюутны код болон нууц үгээр нэвтэрч орохыг анхаарна уу?
                        </CardText>
                        <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
                            <div className='mb-1'>
                                <Label className='form-label' for='username'>
                                    Оюутны код
                                </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id='username'
                                    name='username'
                                    render={({ field }) => <Input id="username" placeholder='Оюутны код' invalid={errors.username && true} autoComplete='username' {...field} />}
                                />
                                {errors.username && <FormFeedback>{errors.username.message}</FormFeedback>}
                            </div>
                            <div className='mb-1'>
                                <div className='d-flex justify-content-between'>
                                    <Label className='form-label' for='login-password'>
                                        Нууц үг
                                    </Label>
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
                            <Button color='primary' block type='submit'>
                                Нэвтрэх
                            </Button>
                        </Form>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

export default StudentLogin
