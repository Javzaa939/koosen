import React, { Fragment } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { validate } from '@utils';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { validateSchema } from './validateSchema';

function StateModal({ stateModalHandler, stateModal, selectedStudents, stateop, getDatas }) {

    const { formState: { errors }, handleSubmit, control, reset } = useForm(validate(validateSchema));
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true});

    const admissionStateChangeApi = useApi().elselt.admissionuserdata.all;

    var students_list = selectedStudents.map(val => val?.id);

    async function onSubmit(cdata){
        cdata['students'] = students_list;
        const { success } = await fetchData(admissionStateChangeApi.put(cdata));
        if (success) {
            reset();
            stateModalHandler();
            getDatas();
        };
    };

    return (
        <Modal centered toggle={stateModalHandler} isOpen={stateModal}>
            <ModalHeader toggle={stateModalHandler}>
                Төлөв солих
            </ModalHeader>
            <ModalBody>
                <Form className='' onSubmit={handleSubmit(onSubmit)}>
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
                        <Button color='primary' type='submit'>Хадгалах</Button>
                        <Button onClick={() => stateModalHandler()}>Гарах</Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    )
}

export default StateModal
