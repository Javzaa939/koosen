import { React, useState, useEffect } from 'react'
import { Button, Form, FormFeedback, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import Select from 'react-select'

import { ReactSelectStyles } from '@utils'
import { validate} from "@utils"

import * as yup from 'yup'
import { Controller, useForm } from 'react-hook-form'
import { AlertTriangle, FileText } from 'react-feather'
import classnames from "classnames";
import useApi from '@src/utility/hooks/useApi'
import useLoader from "@hooks/useLoader";

const validateSchema = yup.object().shape({
    chosen_prof: yup.string().required('Хувилах мэргэжил сонгоно уу.'),
})


function CopyPlan({ copyModal, copyModalHandler, selectedProf, datas, refreshDatas }) {

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm(validate(validateSchema))

    const { Loader, isLoading, fetchData } = useLoader({});
    const [profession, setProfession] = useState([]);

    const copyApi = useApi().study

    async function getProfession(){
        const { success, data } = await fetchData(copyApi.professionDefinition.getjustProfession())
        if(success){
            setProfession(data)
        }
    }

    async function onSubmit(cdata) {
        cdata['copying_prof'] = selectedProf?.id ? Number(selectedProf?.id) : ''
        cdata['chosen_prof'] = parseInt(cdata['chosen_prof'])

        const { success, error } = await fetchData(copyApi.plan.putCopyProfession(cdata))
        if (success) {
            reset();
            copyModalHandler();
            refreshDatas();
        }
    }

    useEffect(() => {
        getProfession()
    }, [])

    return (
        <Modal centered isOpen={copyModal} toggle={copyModalHandler}>
            <ModalHeader toggle={copyModalHandler}>
                Сургалтын төлөвлөгөө хувилах
            </ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className='border p-1 my-1 rounded-3'>
                        <div>
                            Сургалтын төлөвлөгөө хувилах мэргэжил
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>
                            {selectedProf?.name}
                        </div>
                    </div>
                    <div className='p-1 my-1 bg-light-warning rounded-3'>
                        <div className='text-center'>
                            <AlertTriangle/>
                        </div>
                        <div>
                            Энэ үйлдлийг буцаах боломжгүй ба сургалтын төлөвлөгөөг хувилснаар хуучин төлөвлөгөөг бүхэлд нь устгахыг анхаарна уу.
                        </div>
                    </div>
                    <div className='border p-1 my-1 rounded-3'>
                        <Label className="form-label" for="chosen_prof">
                            Мэргэжил
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="chosen_prof"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="chosen_prof"
                                        id="chosen_prof"
                                        classNamePrefix='select'
                                        className={classnames('react-select ms', { 'is-invalid': errors.chosen_prof })}
                                        isClearable
                                        placeholder='-- Сонгоно уу --'
                                        options={profession || []}
                                        value={profession.find((c) => c.id === value)}
                                        noOptionsMessage='Хоосон байна.'
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option?.id}
                                        getOptionLabel={(option) => option?.full_name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.chosen_prof && <FormFeedback className="d-block">{errors.chosen_prof.message}</FormFeedback>}
                    </div>
                    <Button color='primary' type='submit'>
                        <FileText size={16}/> Хувилах
                    </Button>
                </Form>
            </ModalBody>
        </Modal>
    )
}

export default CopyPlan
