import React, { Fragment, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Popover, PopoverBody, PopoverHeader, UncontrolledPopover, UncontrolledTooltip } from 'reactstrap';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';


function StateModal({ stateModalHandler, stateModal, selectedStudents, stateop, getDatas }) {

    const { formState: { errors }, handleSubmit, control, reset } = useForm();
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true});

    const [displayPopover, setDisplayPopover] = useState(false)

    const interview = useApi().elselt.interview;

    console.log(selectedStudents, "PSDAAAA AAHAHAA")


    async function onSubmit(cdata) {
        cdata['students'] = selectedStudents.map(val => val?.user?.id) || [];
        console.log("consoleLog",cdata)

        const interviewId = cdata.students;
        console.log("Cdata--------------->",cdata)
        // const updateData = {
        //     state: cdata.state,
        //     description: cdata.description,
        //     interview: cdata.students
        // };
        const { success } = await fetchData(interview.put(interviewId, cdata));
        if (success) {
            reset();
            stateModalHandler();
            getDatas();
        };
    }

    function popoverHandler() {
        setDisplayPopover(!displayPopover)
    }

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
                            name="description"
                            render={({ field: { value, onChange } }) => {
                                return(
                                    <Input
                                        type='textarea'
                                        name='description'
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
