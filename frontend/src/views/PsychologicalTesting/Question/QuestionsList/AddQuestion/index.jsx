// import {Modal, ModalHeader, ModalBody, } from 'reactstrap'
import { Plus, } from 'react-feather'
import {  FormProvider, useFieldArray, useForm } from 'react-hook-form'
import {
    Button,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Col,
    FormFeedback,
} from 'reactstrap'
import { useTranslation } from 'react-i18next';

import SingleQuestion from './SingleQuestion';
import { validate } from "@utils";
import * as Yup from "yup";
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';

const validateSchema = Yup.object().shape({
    // name: Yup.string().trim().required("Хоосон байна"),
    questions:
        Yup.array()
            .min(1, 'Та асуултаа нэмнэ үү')
            .of(
                Yup.object().shape({
                    kind: Yup.number().typeError("Сонгоно уу").required('Хоосон байна'),
                    level: Yup.number().typeError("Сонгоно уу").required('Хоосон байна'),
                    score: Yup.string().typeError("Сонгоно уу").required('Хоосон байна'),
                    question: Yup.string().typeError("Сонгоно уу").required('Хоосон байна'),
                })
            ),
});

export default function AddQuestion(props) {
    const { open, handleModal, getDatas } = props

    const { t } = useTranslation()

    const methods = useForm(validate(validateSchema))
    const { control, handleSubmit, formState: { errors } } = methods

    const { isLoading, Loader, fetchData } = useLoader({})
    const questionApi = useApi().challenge.psychologicalTest

    const { fields: fieldsQuestions, append: appendQuestions, remove: removeQuestions } = useFieldArray({
        control,
        name: "questions",
    });

    async function onSubmit(datas) {
        let questions = datas.questions
        const formData = new FormData()

        questions.forEach((qValue, index) => {
            for (let key in qValue){
                if(key == 'answers'){
                    qValue[key].forEach((v, aIdx) => {
                        for (let aKey in v){
                            if(aKey == 'image' && v[aKey]){
                                let file = v[aKey]
                                let newFileName = `questions${index}answers${aIdx}`
                                let renamedFile = new File([file], newFileName, { type: file.type });
                                formData.append("files",  renamedFile)
                                v[aKey] = renamedFile['name']
                            }
                        }
                    })
                }
                if(key == 'image' && qValue[key]){
                    let file = qValue[key]
                    let newFileName = `questions${index}`
                    let renamedFile = new File([file], newFileName, { type: file.type });
                    formData.append("files",  renamedFile)
                    qValue[key] = renamedFile['name']
                }
            }

            formData.append("questions", JSON.stringify(qValue))
        })

        const { success, data } = await fetchData(questionApi.post(formData))
        if(success){
            handleModal()
            getDatas()
        }
    }


    function addQuestion() {
        appendQuestions()
    }

    return (
        <>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl'
                modalClassName='modal-slide-in custom-80'
                contentClassName='border-dark p-0'
            >
                <ModalHeader
                    className=""
                    tag="div"
                    style={{ position: "relative" }}
                >
                    <div>
                        <h4 className='mb-0'>Асуулт үүсгэх</h4>
                    </div>
                </ModalHeader>
                <ModalBody className="w-100 h-100 ">
                    <FormProvider {...methods}>
                        <Row className='g-0' tag={Form}>
                            <Col md={12}>
                                <Row className='g-0'>
                                    {
                                        fieldsQuestions.map((item, index) => {
                                            return (
                                                <Col className='mb-2' md={12} key={item.id}>
                                                    <SingleQuestion
                                                        fieldsQuestions={fieldsQuestions}
                                                        fieldIndex={index}
                                                        fieldName={`questions`}
                                                        fieldAppend={appendQuestions}
                                                        fieldRemove={removeQuestions} />
                                                </Col>
                                            )
                                        })
                                    }
                                </Row>
                                <Row className={'g-0 gx-1'}>
                                    <Col md={12} className={'p-0'}>
                                        <Button className='w-100 align-items-center py-50' color='primary' outline size='sm' onClick={() => { addQuestion() }}>
                                            <Plus className='' size={12} />
                                            <span className=''>Асуулт нэмэх</span>
                                        </Button>
                                        {errors.questions && <FormFeedback className='d-block'>{t(errors.questions.message)}</FormFeedback>}
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={12} className={'mt-1'}>
                                <Button color='primary' size='sm' onClick={handleSubmit(onSubmit)}>Хадгалах</Button>
                            </Col>
                        </Row>
                    </FormProvider>

                </ModalBody>
            </Modal>
        </>
    )
};
