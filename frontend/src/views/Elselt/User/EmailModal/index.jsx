import React from 'react'
import { validate } from '@utils';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Popover, PopoverBody, PopoverHeader, UncontrolledPopover, UncontrolledTooltip } from 'reactstrap';
import { validateSchema } from './validateSchema';
import { AlertTriangle } from 'react-feather';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

function EmailModal({ emailModalHandler, emailModal, selectedStudents, getDatas }) {

    const { formState: { errors }, handleSubmit, control, reset } = useForm(validate(validateSchema));
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true});
    const admissionStateChangeApi = useApi().elselt.admissionuserdata.email;

    async function onSubmit(cdata) {
        cdata['students'] = selectedStudents.map(val => val?.user?.id) || [];
        cdata['email_list'] = selectedStudents.map(val => val?.user?.email) || [];
        console.log(cdata);
        const { success } = await fetchData(admissionStateChangeApi.post(cdata));
        if (success) {
            reset();
            emailModalHandler();
            getDatas();
        };
    }

    const state1 = selectedStudents.filter(data => data?.state === 1).length
    const state2 = selectedStudents.filter(data => data?.state === 2).length
    const state3 = selectedStudents.filter(data => data?.state === 3).length

    return (
        <Modal centered toggle={emailModalHandler} isOpen={emailModal}>
            <ModalHeader toggle={emailModalHandler}>
                Оюутнуудруу Имейл илгээх
            </ModalHeader>
            <ModalBody className='d-flex flex-column justify-content-between' style={{ minHeight: 300 }} tag={Form} onSubmit={handleSubmit(onSubmit)}>
                <div>
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
                    <div className='rounded-3 mx-25'>
                        <Label className='p-50' htmlFor='description'>
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
                                        id='description'
                                        invalid={errors?.description}
                                        value={value}
                                        onChange={(e) => {
                                            onChange(e.target.value || '')
                                        }}
                                        style={{ minHeight: 100 }}
                                    />
                                )
                            }}
                        />
                        {errors?.description && <FormFeedback className='d-block'>{errors?.description?.message}</FormFeedback>}
                    </div>
                </div>
                <div className='text-center my-50'>
                    <Button className='m-50' color='primary' type='submit'>Хадгалах</Button>
                    <Button className='m-50 ' onClick={() => emailModalHandler()}>Гарах</Button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default EmailModal
