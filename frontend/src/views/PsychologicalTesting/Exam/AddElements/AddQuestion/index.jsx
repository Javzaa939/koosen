import {useState, Fragment, useEffect} from 'react';
import {ReactSelectStyles} from "@utils";
import {useForm} from "react-hook-form";
import {X} from "react-feather";
import {t} from 'i18next';

import {
    Col,
    Row,
    Label,
	Modal,
    Button,
	ModalBody,
    ModalFooter,
	ModalHeader,
} from "reactstrap";

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import Select from 'react-select';


const AddQuestion = ({ open, handleModal, refreshDatas, test_id, refreshQuestionData}) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { setError } = useForm()
	const { fetchData } = useLoader({ isFullScreen: true });

    const [selectetQuestionTitle, setSelectetQuestionTitle] = useState([])
    const [selectData, setSelectDatas] = useState([])

    const testQuestionTitleAPI = useApi().challenge.psychologicalTestQuestion
    const addQuestionAPI = useApi().challenge.psychologicalTestOne

    async function getSelectDatas(){
        const { success, data } = await fetchData(testQuestionTitleAPI.getTitle())
        if(success) {
            setSelectDatas(data)
        }
    }

    useEffect(() => {
        getSelectDatas()
    },[])

    async function onSubmit(){
        const { success, error } = await fetchData(addQuestionAPI.post(selectetQuestionTitle, test_id))
        if(success) {
            handleModal()
            refreshDatas()
            refreshQuestionData()
        }
        else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-sm"
                contentClassName="pt-0"
                fade={true}
            >
                <ModalHeader
                    className='d-flex justify-content-between'
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Асуулт нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1 mb-1">
                    <Row>
                        <Col md={12}>
                            <Label className="form-label" for="questionTitle">
                                {t('Багц асуултууд')}
                            </Label>
                            <Select
                                id="questionTitle"
                                name="questionTitle"
                                isClearable
                                isMulti
                                classNamePrefix='select'
                                className='react-select'
                                placeholder={`-- Сонгоно уу --`}
                                options={selectData || []}
                                value={selectetQuestionTitle.name}
                                noOptionsMessage={() => 'Хоосон байна'}
                                onChange={(val) => {
                                    setSelectetQuestionTitle(val)
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Col md={12} className="text-center">
                        <Button className='me-2' color="primary" type="submit" onClick={onSubmit}>
                            {t('Хадгалах')}
                        </Button>
                        <Button color="secondary" onClick={handleModal}>
                            {t('Буцах')}
                        </Button>
                    </Col>
                </ModalFooter>
            </Modal>
        </Fragment>
    )
}
export default AddQuestion