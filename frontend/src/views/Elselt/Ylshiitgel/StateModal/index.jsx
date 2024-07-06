import React, { Fragment, useState } from 'react';

import { Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Popover, PopoverBody, PopoverHeader, UncontrolledPopover, UncontrolledTooltip } from 'reactstrap';
import { validate } from '@utils';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { Controller, useForm } from 'react-hook-form'
import { validateSchema } from './validateSchema';

function StateModal({ stateModalHandler ,stateModal,selectedStudents, stateop, getDatas}) {

    const { formState: { errors }, handleSubmit, control, reset, watch, setValue} = useForm(validate(validateSchema));
    const { fetchData } = useLoader({isFullScreen: true});

    const [displayPopover, setDisplayPopover] = useState(false)
    const justiceStateChangeApi = useApi().elselt.justice;

    async function onSubmit(cdata){
        cdata['students'] = selectedStudents.map(val => val?.id) || [];
        const { success } = await fetchData(justiceStateChangeApi.put(cdata));
        if (success) {
            reset();
            stateModalHandler();
            getDatas();
        };
    };

    function popoverHandler() {
        setDisplayPopover(!displayPopover)
    }
    return (
        <Modal centered toggle={stateModalHandler} isOpen={stateModal}>
            <ModalHeader toggle={stateModalHandler}>
                Төлөв
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
                                                name="justice_state"
                                                render={({ field: { value, onChange } }) => {
                                                    return(
                                                        <Input
                                                            type='radio'
                                                            name='justice_state'
                                                            // id={`radio${idx}`}
                                                            value={data?.id}
                                                            checked={value === data?.id}
                                                            onChange={(e) => {
                                                                onChange(Number(data?.id) || '');
                                                                if(data?.id ===1 )
                                                                {
                                                                    setValue('justice_description', " ")

                                                                }else if(data?.id === 2 ){
                                                                    setValue('justice_description', " ")

                                                                }else if (data?.id === 3 ){
                                                                    setValue('justice_description', "Ял шийтгэлтэй улмаас тэнцсэнгүй")
                                                                }
                                                            }}
                                                            className='m-50 p-50'
                                                            invalid={errors?.justice_state}
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
                        {errors?.justice_state && <FormFeedback className='d-block'>{errors?.justice_state?.message}</FormFeedback>}
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
                            name="justice_description"
                            render={({ field: { value, onChange } }) => {
                                return(
                                    <Input
                                        type='textarea'
                                        id="justice_description"
                                        name='justice_description'
                                        invalid={errors?.justice_description}
                                        value={value}
                                        onChange={(e) => {
                                            onChange(e.target.value || '');

                                          }
                                        }
                                        style={{ minHeight: 100 }}
                                    />
                                )
                            }}
                        />
                    {errors?.justice_description && <FormFeedback className='d-block'>{errors?.state_description?.message}</FormFeedback>}
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
