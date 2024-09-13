import React from 'react';
import {
    Row,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    Button,
    Input,
    FormFeedback,
    Label, Col,
} from 'reactstrap';
import { Controller, useForm } from "react-hook-form";
import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";
import { useTranslation } from 'react-i18next';

const StudentModal = ({ open, handleModal, studentData, refresh }) => {
    // Translation hook
    const { t } = useTranslation();

    const studentApi = useApi().sent_home_work;
    const { fetchData } = useLoader({});

    // React Hook Form setup
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: { score: studentData?.score || '', description: studentData?.description || '' }
    });

    // Handle form submission
    const onSubmit = async (data) => {
        const payload = {
            studentId: studentData?.student?.id,
            score: data.score,
            description: data.description
        };
        const { success } = await fetchData(studentApi.put(studentData?.homework?.id, payload));
        if (success) {
            refresh();
            handleModal();
        }
    };

    // Remove path from URL function
    const handleUrl = (url) => {
        const lastIndexOfUrl = url.lastIndexOf('/') + 1;
        return url.substring(lastIndexOfUrl, url.length);
    };

    // Determine modal class based on file type
    const modalClass = ['pdf', 'PDF'].includes(studentData?.send_file?.split('.').pop()) || ['pptx', 'PPTX'].includes(studentData?.send_file?.split('.').pop()) ? 'modal-xl' : 'modal-lg';

    return (
        <Modal isOpen={open} toggle={handleModal} className={`modal-dialog-centered ${modalClass}`} onClosed={handleModal}  backdrop='static'>
            <ModalHeader className='bg-transparent pb-0' toggle={handleModal}>
                <div className='d-flex gap-2 align-items-center'>
                    <h4>{studentData?.student?.fullName}</h4>
                    <h5>{studentData?.student?.code}</h5>
                </div>
            </ModalHeader>
            <ModalBody className="px-4 pt-2 pb-1">
                <div >
                    <p>Суралцагчын файл татах</p>
                    {
                        ['pdf', 'PDF'].includes(studentData?.send_file?.split('.').pop()) ?
                            <div className="text-end">
                                <iframe src={studentData?.send_file} width="100%" height="530px" className='border border-secondary'></iframe>
                            </div>
                            :
                            ['pptx', 'PPTX'].includes(studentData?.send_file?.split('.').pop())
                            ?
                                <iframe
                                    title='Office-Viewer'
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${studentData?.send_file}`}
                                    frameBorder={0}
                                    width="100%"
                                    height="600px"
                                ></iframe>
                            :
                                <div>
                                    <a href={studentData?.send_file} download className="btn btn-outline-primary">
                                        {handleUrl(studentData?.send_file)}
                                    </a>
                                </div>
                    }
                </div>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className='mt-1' >
                        <Col md={9}>
                            <Label for="description">{t('Тайлбар')}</Label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={3}>
                            <Label for="score" >{t('Дүгнэх оноо:')}</Label>
                            <div className='d-flex align-items-center'>
                                <Controller
                                    name="score"
                                    control={control}
                                    rules={{
                                        required: 'Оноо заавал оруулна уу',
                                        min: { value: 0, message: t('Оноо 0-ээс бага байж болохгүй') },
                                        max: { value: studentData?.homework?.score, message: `Оноо ${studentData?.homework?.score}-с их байж болохгүй` }
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            min="0"
                                            max={studentData?.homework?.score}
                                        />
                                    )}
                                />
                                <span className="ms-2">/{studentData?.homework?.score}</span>
                            </div>
                            {errors.score && <FormFeedback>{errors.score.message}</FormFeedback>}
                        </Col>
                    </Row>
                    <div className='d-flex gap-2 mt-1 justify-content-end'>
                        <Button color='secondary' onClick={handleModal}>
                            {t('Буцах')}
                        </Button>
                        <Button color='primary' type="submit">
                            {t('Хадгалах')}
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default StudentModal;
