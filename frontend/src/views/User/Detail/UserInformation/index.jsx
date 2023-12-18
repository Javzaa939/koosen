import React, { Fragment, useState, useEffect } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    Badge,
    Button,
} from "reactstrap";

import { useParams, useNavigate } from "react-router-dom";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import EditModal from './Edit'

// ** Custom Components
import Avatar from '@components/avatar'

const roleColors = {
    true: 'light-success',
    false: 'light-primary'
}

const UserInfo = ({ isAdmin }) => {
	const { userID } = useParams()
	const navigate = useNavigate()

	const [userData, setData] = useState([])
    const [modal, setModal] = useState(false)

	// Loader
	const { fetchData } = useLoader({});

	// API
	const userApi = useApi().user

    useEffect(() => {
		getData()
	}, [])

	async function getData() {
		if (userID) {
			const {success, data} = await fetchData(userApi.getOne(userID))
			if (success) {
				setData(data)
			}
        } else {
            navigate('/user')
        }
	}

	const handleModal = () => {
        setModal(!modal)
		getData()
    }

    // ** render user img
    const renderUserImg = () => {
        if (userData !== null && userData.avatar) {
            return (
                <img
                    height = '110'
                    width = '110'
                    alt = 'user-avatar'
                    src = {userData.avatar}
                    className = 'img-fluid rounded mt-3 mb-2'
                />
            )
        } else {
            return (
                <Avatar
                    initials
                    color = {'light-success'}
                    className = 'rounded mt-3 mb-2'
                    content = {userData.last_name + ' ' + userData.first_name }
                    contentStyles = {{
                        borderRadius: 0,
                        fontSize: 'calc(48px)',
                        width: '100%',
                        height: '100%'
                    }}
                    style = {{
                        height: '110px',
                        width: '110px'
                    }}
                />
            )
        }
    }

	const goBack = () => {
        navigate('/user')
	}

	return (
		<Fragment>
			<Card>
				<CardBody  className="ms-0 mb-0">
					<div className='user-avatar-section mb-20'>
						<div className='d-flex align-items-center flex-column'>
                            {renderUserImg()}
                            <div className='d-flex flex-column align-items-center text-center'>
                                <div className='user-info'>
                                    {
                                        userData &&
                                            <>
                                                <h4>
                                                    {userData.last_name + ' ' + userData.first_name}
                                                </h4>
                                                <Badge color={roleColors[userData.is_superuser]} className='text-capitalize'>
                                                    {userData.is_superuser? 'Админ': 'Хэрэглэгч'}
                                                </Badge>
                                            </>
                                    }
                                </div>
                            </div>
						</div>
					</div>
					<div className='d-flex justify-content-around my-2 pt-75'></div>
					<h4 className='fw-bolder border-bottom pb-50 mb-1'>Хэрэглэгчийн мэдээлэл</h4>
					<div className='info-container'>
						<Col xl="12" xs="12">
							<Row tag="dl">
								<Col tag="dt" sm="6" className="fw-bolder mb-1">
									Нэвтрэх нэр :
								</Col>
								<Col tag="dd" sm="6" >
									{userData &&  userData.username}
								</Col>
								<Col tag="dt" sm="6" className="fw-bolder mb-1">
									Хэрэглэгчийн овог :
								</Col>
								<Col tag="dd" sm="6" className="mb-1 ">
									{userData &&  userData.last_name }
								</Col>

								<Col tag="dt" sm="6" className="fw-bolder mb-1">
									Хэрэглэгчийн нэр :
								</Col>
								<Col tag="dd" sm="6" >
									{userData &&  userData.first_name}
								</Col>

								<Col tag="dt" sm="6" className="fw-bolder mb-2">
									Регистрийн дугаар :
								</Col>
								<Col tag="dd" sm="6" className="mb-1 text-dark">
									{ userData &&  userData.register }
								</Col>

								<Col tag="dt" sm="6" className="fw-bolder mb-2">
									И-мэйл :
								</Col>
								<Col tag="dd" sm="6" className="mb-1 text-dark">
									{userData &&  userData.email }
								</Col>
								<Col tag="dt" sm="6" className="fw-bolder mb-1">
									Утасны дугаар :
								</Col>
								<Col tag="dd" sm="6" className="mb-1 text-dark">
									{ userData &&  userData.phone_number }
								</Col>
								<Col tag="dt" sm="6" className="fw-bolder mb-1">
									Админ эсэх:
								</Col>
								<Col tag="dd" sm="6" className="mb-1 text-dark">
									{
										userData &&  userData.is_superuser
										?
											<Badge color="light-success" pill>
												Тийм
											</Badge>
										:
											<Badge color="light-danger" pill>
												Үгүй
											</Badge>
									}
								</Col>
								<Col tag="dt" sm="6" className="fw-bolder mb-1">
									Идэвхтэй эсэх:
								</Col>
								<Col tag="dd" sm="6" className="mb-1 text-dark">
									{
										userData &&  userData.is_active
										?
											<Badge color="light-success" pill>
												Идэвхтэй
											</Badge>
										:
											<Badge color="light-danger" pill>
												Идэвхгүй
											</Badge>
									}
								</Col>
								<Col tag="dt" sm="6" className="fw-bolder mb-1">
									Бүртгэгдсэн огноо :
								</Col>
								<Col tag="dd" sm="6" className="mb-1 text-dark">
									{ userData &&  userData.date_joined }
								</Col>
							</Row>
						</Col>
					</div>
					<div className='d-flex justify-content-center pt-2'>
						<Button color='primary' onClick={() => handleModal(modal)}>
						    Засах
						</Button>
						<Button className='ms-1' color='secondary' outline  onClick={() => goBack()}>
						    Буцах
						</Button>
					</div>
				</CardBody>
			</Card>

            {modal && <EditModal show={modal} userData={userData} handleModal={handleModal} isAdmin={isAdmin} />}
		</Fragment>
	);
};

export default UserInfo;
