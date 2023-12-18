import React, { Fragment, useState, useEffect } from 'react'

import { Modal, Row, Col, ModalHeader, ModalBody, Nav, NavItem, NavLink, TabContent } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import ClubRegisterStudents from '../../ClubRegisterStudents';

import CDetailModal from './Modal';

const DetailModal = (props) => {

    const { isOpen, editId, handleModal, datas } = props

    const { t } = useTranslation()

    const [active, setActive] = useState(1)
    const [component, setComponent] = useState('')

    const nav_menus = [
        {
            active_id: 1,
            name: datas && t('Дэлгэрэнгүй'),
            component: <CDetailModal {...props} />
        },
        {
            active_id: 2,
            name: t('Бүртгэлтэй оюутнууд'),
            component: <ClubRegisterStudents is_header={false} def_club_id={editId} />
        },
    ]


    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    }, [active])

    const toggle = (active_id) => {
        setActive(active_id)
    }

    return (
        <Fragment>
            <Modal size={active === 1 ? 'lg' : 'lg'} isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered" onClosed={handleModal}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <Row>
                        <Col md={12}>
                            <Nav tabs>
                                {
                                    nav_menus.map((menu, idx) => {
                                        return(
                                            <NavItem key={idx}>
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
                        </Col>
                        <Col md={12}>
                            <TabContent activeTab={''}>
                                {
                                    component && component
                                }
                            </TabContent>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default DetailModal

