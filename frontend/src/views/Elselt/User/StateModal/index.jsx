import React, { Fragment, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Popover, PopoverBody, PopoverHeader, UncontrolledPopover, UncontrolledTooltip } from 'reactstrap';
import { validate } from '@utils';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { validateSchema } from './validateSchema';

function StateModal({ stateModalHandler, stateModal, selectedStudents, stateop, getDatas, first_state=false }) {

    const { formState: { errors }, handleSubmit, control, reset } = useForm(validate(validateSchema));
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true});

    const [displayPopover, setDisplayPopover] = useState(false)

    const admissionStateChangeApi = useApi().elselt.admissionuserdata.all;

    async function onSubmit(cdata){
        cdata['students'] = selectedStudents.map(val => val?.id) || [];
        cdata['first_state'] = first_state
        const { success } = await fetchData(admissionStateChangeApi.put(cdata));
        if (success) {
            reset();
            stateModalHandler();
            getDatas();
        };
    };

    function popoverHandler() {
        setDisplayPopover(!displayPopover)
    }

    // const state1 = selectedStudents.filter(data => data?.state === 1).length
    // const state2 = selectedStudents.filter(data => data?.state === 2).length
    // const state3 = selectedStudents.filter(data => data?.state === 3).length

    return (
        <Modal centered toggle={stateModalHandler} isOpen={stateModal}>
            <ModalHeader toggle={stateModalHandler}>
                Төлөв солих
            </ModalHeader>
            <ModalBody>
                <Form className='' onSubmit={handleSubmit(onSubmit)}>
                    <div className='d-flex justify-content-between'>
                        <div>
                        {
                            stateop.map((data, idx) => {
                                return(
                                    <Fragment key={idx}>
                                        <div className='d-flex align-items-center'>
                                            <Controller
                                                control={control}
                                                defaultValue=''
                                                name="state"
                                                render={({ field: { value, onChange } }) => {
                                                    return(
                                                        <Input
                                                            type='radio'
                                                            name='state'
                                                            id={`radio${idx}`}
                                                            value={data?.id}
                                                            checked={value === data?.id}
                                                            onChange={(e) => {
                                                                onChange(Number(data?.id) || '')
                                                            }}
                                                            className='m-50 p-50'
                                                            invalid={errors?.state}
                                                        >
                                                        </Input>
                                                    )
                                                }}
                                            />
                                            <Label for={`radio${idx}`} className='mt-25'>
                                                {data?.name}
                                            </Label>
                                        </div>
                                    </Fragment>
                                )
                            })
                        }
                        {errors?.state && <FormFeedback className='d-block'>{errors?.state?.message}</FormFeedback>}
                        </div>
                        <div>
                            {
                                selectedStudents.length > 0 &&
                                <>
                                    <div
                                        className='bg-light-info p-50 rounded-3'
                                        id='students_tooltip'
                                        onMouseEnter={() => setDisplayPopover(true)}
                                        onMouseLeave={() => setDisplayPopover(false)}
                                        onClick={() => popoverHandler()}
                                        style={{ cursor:'help' }}
                                    >
                                        Сонгогдсон элсэгчдийн тоо: <b>{selectedStudents.length}</b>
                                    </div>
                                    {/* <Popover
                                        // isOpen={true}
                                        isOpen={displayPopover}
                                        placement='auto'
                                        target={"students_tooltip" || ""}
                                        toggle={popoverHandler}
                                    >
                                        <PopoverHeader>
                                            <h5>Сонгогдсон элсэгчдийн нэрс</h5>
                                        </PopoverHeader>
                                        <PopoverBody
                                            className='overflow-hidden'
                                            style={{ maxHeight: 150 }}
                                        >
                                            <div className='m-25 px-1 p-25' style={{ borderLeft: `8px solid ${'#4287f5'}`, borderTop: '5px solid transparent', borderBottom: '5px solid transparent' }}>
                                                Бүртгүүлсэн: <b>{state1}</b>
                                            </div>
                                            <div className='m-25 px-1 p-25' style={{ borderLeft: `8px solid ${'rgba(40,199,11, 1)'}`, borderTop: '5px solid transparent', borderBottom: '5px solid transparent' }}>
                                                Тэнцсэн: <b>{state2}</b>
                                            </div>
                                            <div className='m-25 px-1 p-25' style={{ borderLeft: `8px solid ${'#EA5455'}`, borderTop: '5px solid transparent', borderBottom: '5px solid transparent' }}>
                                                Тэнцээгүй: <b>{state3}</b>
                                            </div>
                                        </PopoverBody>
                                    </Popover> */}
                                </>
                            }
                        </div>
                    </div>
                    <div className='shadow border rounded-3 m-1 mx-25 p-1'>
                        <Label className='p-50'>
                            Тайлбар
                        </Label>

                        <Controller
                            control={control}
                            defaultValue=''
                            name="state_description"
                            render={({ field: { value, onChange } }) => {
                                return(
                                    <Input
                                        type='textarea'
                                        name='state_description'
                                        invalid={errors?.state_description}
                                        value={value}
                                        onChange={(e) => {
                                            onChange(e.target.value || '')
                                        }}
                                        style={{ minHeight: 100 }}
                                    />
                                )
                            }}
                        />
                    {errors?.state_description && <FormFeedback className='d-block'>{errors?.state_description?.message}</FormFeedback>}
                    </div>
                    <div className='text-center my-50'>
                        <Button className='m-50' color='primary' type='submit'>Хадгалах</Button>
                        <Button className='m-50 ' onClick={() => stateModalHandler()}>Гарах</Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    )
}

export default StateModal
