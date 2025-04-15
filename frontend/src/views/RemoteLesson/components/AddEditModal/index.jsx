import { convertDefaultValue } from "@utils";
import { t } from 'i18next';
import { Fragment, useEffect } from 'react';
import { useForm } from "react-hook-form";

import {
    Button,
    Col,
    Form,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import Elearn from '../Elearn';

const AddEditModal = ({ open, handleModal: handleModalOriginal, refreshDatas, editData }) => {
    const { control, handleSubmit, setError, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            is_end_exam: false,
            is_certificate: false,
            start_date: '',
            end_date: '',
            image: '',
        }
    })

    const handleModal = () => {
        reset()
        handleModalOriginal()
    }

    const { fetchData, isLoading, Loader } = useLoader({ isFullScreen: true });
    const remoteApi = useApi().remote

    useEffect(() => {
        if (editData) {
            const { students, ...editDataCleaned } = editData

            for (let key in editDataCleaned) {
                if (editDataCleaned[key] !== null && editDataCleaned[key] !== undefined) {
                    let finalValue = editDataCleaned[key]
                    if (['start_date', 'end_date'].includes(key)) finalValue = typeof editDataCleaned[key] === 'string' ? editDataCleaned[key].split('T')[0] : ''
                    if (key == 'image' && editData['image_path']) finalValue = editData['image_path']
                    setValue(key, finalValue)
                } else setValue(key, '')
            }
        }
    }, [editData]);

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const formData = new FormData()

        for (let key in cdata) {
            if (key === 'image' && cdata[key] && typeof cdata[key] !== 'string') {
                formData.append(key, cdata[key][0])
            } else formData.append(key, JSON.stringify(cdata[key]))
        }

        let apiFunc = null
        if (editData) apiFunc = () => remoteApi.put(formData, editData.id)
        else apiFunc = () => remoteApi.post(formData)

        const { success, errors } = await fetchData(apiFunc())

        if (success) {
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессеж */
            for (let key in errors) {
                setError(key, { type: 'custom', message: errors[key][0] });
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered"
                contentClassName="pt-0"
                fade={true}
                backdrop='static'
            >
                <ModalHeader toggle={handleModal}></ModalHeader>
                {
                    editData !== undefined
                        ?
                        <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <h4>{t('Зайн сургалт засах')}</h4>
                        </ModalHeader>
                        :
                        <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <h4>{t('Зайн сургалт нэмэх')}</h4>
                        </ModalHeader>
                }
                <ModalBody className="flex-grow-50 mb-3 t-0">
                    {isLoading && Loader}
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Elearn
                                t={t}
                                control={control}
                                errors={errors}
                                setValue={setValue}
                            />
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={() => handleModal()}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default AddEditModal