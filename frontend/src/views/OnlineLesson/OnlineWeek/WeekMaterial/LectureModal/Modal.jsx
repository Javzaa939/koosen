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
    console.log(studentData)
    const studentApi = useApi().sent_lecture_file;
    const { fetchData } = useLoader({});

    // React Hook Form setup
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
    });

    // Handle form submission
    const onSubmit = async () => {
        const { success } = await fetchData(studentApi.put(studentData?.id));
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
        <Modal isOpen={open} toggle={handleModal} className={`modal-dialog-centered ${modalClass}`} onClosed={handleModal} backdrop='static'>
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
                            ['pptx', 'PPTX'].includes(studentData?.send_file?.split('.').pop()) ?
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
                    <div className='d-flex gap-2 mt-1 justify-content-end'>
                        <Button color='secondary' onClick={handleModal}>
                            {t('Буцах')}
                        </Button>
                        {studentData?.status === 1 ? (
                            <Button color='primary' type="submit">
                                {t('Дүгнэх')}
                            </Button>) : (
                            <Button color='primary' disabled>
                                {t('Дүгнэгдсэн')}
                            </Button>)}

                    </div>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default StudentModal;
