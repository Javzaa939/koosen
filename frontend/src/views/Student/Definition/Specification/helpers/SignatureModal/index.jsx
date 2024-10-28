import React, { useEffect, useState } from "react";
import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import { ReactSelectStyles } from "@utils";
import useLoader from '@hooks/useLoader';
import classnames from "classnames";
import { useNavigate } from "react-router-dom";

function SignatureModal({ isOpen, handleModal, data, isMon, isTrue=false, isGpa=false, isScore=false }) {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const { control, formState: { errors }, setValue } = useForm();
    const [signatureOption, setSignatureOption] = useState([]);
    const [selectedSignatures, setSelectedSignatures] = useState([]);
    const { isLoading } = useLoader({ isSmall: true, initValue: true });

    useEffect(() => {
        const storedSignatures = JSON.parse(sessionStorage.getItem('signature_data'));
        if (storedSignatures) {
            setSignatureOption(storedSignatures);
        }
    }, []);

    const handleSave = () => {
        sessionStorage.clear()
        sessionStorage.setItem('student_data', JSON.stringify(data));
        sessionStorage.setItem('signature_data', JSON.stringify(selectedSignatures));
        if (isTrue) {
            if(isMon == true){
                window.open('/student/learning-true/')
            }
            if(isMon == false) {
                window.open('/student/learning-true/en/')
            }
        }

        if (isGpa) {
            if (isMon == true) {
                navigate('/student/sum/', { state: { data: data, signatureData: selectedSignatures} })
            }

            if (isMon == false) {
                navigate('/student/sum/en/', { state: {data: data, signatureData: selectedSignatures} })
            }
        }

        if (isScore) {
            console.log(isScore)
            if (isMon == true) {
                navigate('/student/amount-details', { state: { data: data, signatureData: selectedSignatures} })
            }

            if (isMon == false) {
                navigate('/student/amount-details/en', { state: {data: data, signatureData: selectedSignatures} })
            }
        }
    };

    return (
        <Modal size='sm' isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered" onClosed={handleModal}>
            <ModalHeader toggle={handleModal}>
                {t("Гарын үсэг сонгох")}
            </ModalHeader>
            <ModalBody>
                <Label className="form-label" for="signature">
                    {t("Гарын үсэг")}
                </Label>
                <Controller
                    control={control}
                    defaultValue=''
                    name="signature"
                    render={({ field: { value, onChange } }) => {
                        return (
                            <Select
                                name="signature"
                                id="signature"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select', { 'is-invalid': errors.signature })}
                                isLoading={isLoading}
                                isMulti
                                placeholder={t("-- Сонгоно уу --")}
                                options={signatureOption || []}
                                value={selectedSignatures}
                                noOptionsMessage={() => t('Хоосон байна')}
                                onChange={(selectedOptions) => {
                                    const selected = selectedOptions || [];
                                    setSelectedSignatures(selected);
                                    onChange(selected.map(option => option.id));
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => `${option.position_name} - ${option.last_name}, ${option.first_name}`}
                            />
                        )
                    }}
                />
                <div className="d-flex gap-1 justify-content-end">
                    <Button color="primary" size="sm" className="mt-1" onClick={handleSave}>
                        {t("Сонгох")}
                    </Button>
                    <Button onClick={handleModal} size="sm" className="mt-1">
                        {t("Буцах")}
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    );
}

export default SignatureModal;
