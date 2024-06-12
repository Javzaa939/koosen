import React from 'react';

import { Controller, useForm } from 'react-hook-form';
import { AlertTriangle } from 'react-feather';
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Button, Col,ModalFooter, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Popover, PopoverBody, PopoverHeader, Row, UncontrolledPopover, UncontrolledTooltip } from 'reactstrap';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';



function MessageModal({ messageModalHandler, messageModal, selectedStudents, getDatas }) {
    const { formState: { errors },control, handleSubmit,reset } = useForm();
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true, bg: 2 });
    const admissionStateChangeApi = useApi().elselt.admissionuserdata.message;

    async function onSubmit(cdata) {

        cdata['students'] = selectedStudents.map(val => val?.user?.id) || [];
        cdata['message_list'] = selectedStudents.map(val => val?.user?.email) || [];
        const { success } = await fetchData(admissionStateChangeApi.post(cdata));
        if (success) {
            reset();
            messageModalHandler();
            getDatas();
        };
    }

    const state1 = selectedStudents.filter(data => data?.state === 1).length
    const state2 = selectedStudents.filter(data => data?.state === 2).length
    const state3 = selectedStudents.filter(data => data?.state === 3).length
    return (
        <Modal centered toggle={messageModalHandler} isOpen={messageModal}  size='lg'>
            <ModalHeader toggle={messageModalHandler}>
                 Мессеж илгээх
            </ModalHeader>
            <ModalBody className='d-flex flex-column justify-content-between' style={{ minHeight: 300 }} tag={Form} onSubmit={handleSubmit(onSubmit)}>
                <Row className='d-flex '>
                            <div className='mx-25 p-50'>
                            {
                                selectedStudents.length !== 1 &&
                                !(
                                    state1 === selectedStudents.length ||
                                    state2 === selectedStudents.length ||
                                    state3 === selectedStudents.length
                                ) &&
                                    <div className='bg-light-warning p-50 rounded-3 d-flex align-items-center'>
                                        <AlertTriangle className='m-25 me-1' style={{ width: 36 }}/>
                                        <div>
                                            Таны сонгосон оюутнууд өөр өөр төлөвтэй байгааг анхаарна уу !
                                        </div>
                                    </div>
                            }
                        </div>
                        <Col lg={6} md={12} className=''>
                            <div className='rounded-3 mx-25'>
                                <Label className='p-50' htmlFor='message'>
                                    Тайлбар
                                </Label>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="message"
                                    render={({ field: { value, onChange } }) => {
                                        return(
                                            <Input
                                                type='textarea'
                                                name='message'
                                                id='message'
                                                invalid={errors?.message}
                                                value={value}
                                                onChange={(e) => {
                                                    onChange(e.target.value || '')
                                                }}
                                                style={{ minHeight: 100 }}
                                            />
                                        )
                                    }}
                                />
                                {errors?.message && <FormFeedback className='d-block'>{errors?.message}</FormFeedback>}
                            </div>
                        </Col>
                    <Col lg={6} md={12}>
                            <PerfectScrollbar
                                className='border rounded-3 p-75 my-1'
                                style={{ height: 250, overflow: 'auto' }}
                            >
                                <table className='p-1'>
                                    <tbody>
                                    {selectedStudents.map((data, idx) => {
                                        return(
                                            <tr
                                                key={idx}
                                                className='border-bottom'
                                            >
                                                <td className='px-25 py-50'>{idx + 1}.</td>
                                                <td className='px-25 py-50'>{data?.full_name}</td>
                                                <td className='px-25 py-50'>{data?.Professions}</td>
                                                <td className='px-25 py-50'>{data?.degree_name}</td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </PerfectScrollbar>
                        </Col>
                </Row>
                <div className='text-center my-50'>

                <Button className='m-50' color='primary' type='submit' disabled={isLoading} >Илгээх</Button>
                <Button  className='m-50 ' disabled={isLoading} onClick={() => messageModalHandler()}>Буцах</Button>

                </div>
            </ModalBody>
        </Modal>
    );
}

export default MessageModal;