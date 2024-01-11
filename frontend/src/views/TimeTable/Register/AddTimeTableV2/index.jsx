// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import { X } from "react-feather";

import {
	Modal,
	ModalBody,
	ModalHeader,
    TabContent, Nav, NavItem, NavLink,
    Spinner
} from "reactstrap";

import { useTranslation } from 'react-i18next';

import Simple from './Simple';
import Block from './Block';
import Kurats from './Kurats';

import { RoomAdd } from './roomAdd';

import  '../Add/style.css'

const AddModalV2 = ({ open, handleModal, refreshDatas, editValues }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { t } = useTranslation()

    const [roomModal, setRoomModal] = useState(false)
    const [is_loading, setLoader] = useState(false)

    const handleRoomModal = () => {
        setRoomModal(!roomModal)
    }

    const nav_menus = [
        {
            active_id: 1,
            name: 'Энгийн',
            component: <Simple handleRoomModal={handleRoomModal}  handleModal={handleModal} editValues={editValues} refreshDatas={refreshDatas} roomModal={roomModal} setLoader={setLoader} is_loading={is_loading}/>
        },
        {
            active_id: 2,
            name: 'Блок',
            component: <Block handleRoomModal={handleRoomModal}  handleModal={handleModal} editValues={editValues} refreshDatas={refreshDatas} roomModal={roomModal} setLoader={setLoader} is_loading={is_loading}/>
        },
        {
            active_id: 3,
            name: 'Кураци',
            component: <Kurats handleRoomModal={handleRoomModal}  handleModal={handleModal} editValues={editValues} refreshDatas={refreshDatas} roomModal={roomModal} setLoader={setLoader} is_loading={is_loading}/>
        },
    ]

    const [active, setActive] = useState('1')
    const [component, setComponent] = useState('')

    const toggle = tab => {
        if (active !== tab) {
            setActive(tab)
        }
    }

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    },[active, roomModal])

	return (
        <Fragment>
            {
            is_loading &&
                <div className='fallback-spinner'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t("Түр хүлээнэ үү...")}</span>
                </div>
            }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl custom-80'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                fullscreen='xl'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t("Хичээлийн хуваарь нэмэх")}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Nav tabs fill={true}>
                        {
                            nav_menus.map((menu, idx) => {
                                return(
                                    <NavItem key={idx} className="border-bottom border-end" >
                                        <NavLink
                                            active={active == menu.active_id}
                                            onClick={() => {
                                                toggle(menu.active_id)
                                            }}
                                        >
                                            {menu.name}
                                        </NavLink>
                                    </NavItem>
                                )
                            })
                        }
                    </Nav>
                    <TabContent className='py-50' activeTab={active} >
                        {
                            component && component
                        }
                    </TabContent>
                </ModalBody>
            </Modal>
            {roomModal &&
                <Modal isOpen={roomModal} toggle={handleRoomModal} className="modal-dialog-centered modal-md">
                    <ModalHeader toggle={handleRoomModal}>{t('Өрөө бүртгэх')}</ModalHeader>
                    <ModalBody>
                        <RoomAdd handleModal={handleRoomModal}/>
                    </ModalBody>
                </Modal>
            }
        </Fragment>
	);
};
export default AddModalV2;
