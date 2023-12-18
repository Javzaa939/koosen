import { useEffect } from 'react';

// ** Third Party Components
import { X } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

import useApi from '@hooks/useApi';
import useToast from "@hooks/useToast";
import useLoader from '@hooks/useLoader';

import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import { Button, Modal, ModalHeader, ModalBody, Label, Input, Form, FormFeedback } from 'reactstrap'

import { validate } from '@utils'

import { validateSchema } from './validateSchema';

const AddEventSidebar = props => {
    // ** Props
    const {
        open,
        dates,
        roomId,
        refreshDatas,
        handleEventsClear,
        handleAddEventSidebar
    } = props

    // ** Vars & Hooks
    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm(validate(validateSchema))

    const { t } = useTranslation()
    const addToast = useToast()

    const { fetchData } = useLoader({})

    // Api
    const sportApi = useApi().order.sports

    async function onSubmit(cdatas) {
        cdatas['dates'] = dates
        cdatas['room'] = roomId
        const { success } = await fetchData(sportApi.post(cdatas))
        if(success) {
            reset()
            refreshDatas()
            handleEventsClear()
            handleAddEventSidebar()
        }
    }

    useEffect(() => {
        if(open) {
            if(!roomId) {
                addToast(
                    {
                        type: 'warning',
                        text: 'Та заал сонгоно уу !!!'
                    }
                )
            } else if(dates && dates.length === 0) {
                addToast(
                    {
                        type: 'warning',
                        text: 'Та цаг аа оруулна уу !!!'
                    }
                )
            }

        }
    },[open, dates])

    // ** Close BTN
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleAddEventSidebar} />

    return (
        <Modal
            isOpen={open}
            className='sidebar-lg'
            toggle={handleAddEventSidebar}
            contentClassName='p-0 overflow-hidden'
            modalClassName='modal-slide-in event-sidebar'
        >
        <ModalHeader className='mb-1' toggle={handleAddEventSidebar} close={CloseBtn} tag='div'>
            <h5 className='modal-title'>
                Цаг бүртгэх
            </h5>
        </ModalHeader>
        <PerfectScrollbar options={{ wheelPropagation: false }}>
            <ModalBody className='flex-grow-1 pb-sm-0 pb-3'>
                <Form onSubmit={handleSubmit(onSubmit)} >
                    <div className='mb-1'>
                        <Label className='form-label' for='time_payment'>
                            Та 1 цагт оноогдох төлбөрөө оруулна уу
                        </Label>
                        <Controller
                            name='time_payment'
                            control={control}
                            defaultValue=''
                            render={({ field }) => {
                                return (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='time_payment'
                                        id='time_payment'
                                        bsSize="sm"
                                        invalid={errors.time_payment && true}
                                        placeholder='Та 1 цагт оноогдох төлбөрөө оруулна уу'
                                    />
                                )
                            }}
                        />
                        {errors.time_payment && <FormFeedback className='d-block'>{t(errors.time_payment.message)}</FormFeedback>}
                    </div>
                    <div className='d-flex mb-1'>
                        <Button className='me-1' type='submit' color='primary' disabled={!roomId || dates.length === 0}>
                            {t('Бүртгэх')}
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </PerfectScrollbar>
        </Modal>
    )
}

export default AddEventSidebar
