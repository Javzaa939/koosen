import { useState } from 'react'
import { t } from 'i18next'

import { AlertCircle, X } from 'react-feather'

import {
    Col,
    Input,
    Label,
    Modal,
    Button,
    ModalBody,
    ModalHeader,
    FormFeedback,
    InputGroup,
    InputGroupText
} from 'reactstrap'

const FileModal = (props) => {

    const {
        file,
        setFile,
        isOpen,
        handleModal,
        title,
        isLoading,
        extension,
        fileAccept,
        setFileExt,
        Component,
        onSubmit
    } = props

    const [error, setFileError] = useState('')

    const getFile = (e, action) => {
        if (action == 'Get') {
            var files = e.target.files
            var file_name = files[0]?.name

            if (file_name) {
                var splitted_array = file_name.split('.')
                var ext = splitted_array.pop()

                if (extension && !extension.includes(ext)) {
                    setFileError('Зөв  өргөтгөлтэй файл оруулна уу')
                    setFile('')
                } else {
                    setFile(files[0])
                    setFileError('')
                    if (setFileExt){
                        setFileExt(ext)
                    }
                }
            }
        } else {
            setFile('')
            setFileError('Хоосон байна.')
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered modal-sm">
            <ModalHeader toggle={handleModal}>{t(title ? title : 'Файл оруулах')}</ModalHeader>
            <ModalBody>
                {Component &&
                    <Component {...props}/>
                }
                <Label>{t('Файл')}</Label>
                <InputGroup>
                    <Input
                        type='file'
                        bsSize='sm'
                        accept={fileAccept ? fileAccept : ''}
                        onChange={(e) => getFile(e, 'Get')}
                        invalid={error ? true : false}
                    />
                    <InputGroupText>
                        <X className='' role="button" color="red" size={15} onClick={(e) => getFile(e, 'Delete')}></X>
                    </InputGroupText>
                </InputGroup>
                {error
                ?
                    <FormFeedback className='d-block'>{t(error)}</FormFeedback>
                :
                    <Col className="ps-0">
                        <AlertCircle color="#28bcf7" size={15}/>
                        <Label className="ms-1">{`Зөвхөн ${extension.join(', ')} өргөтгөлтэй файл оруулна уу.`}</Label>
                    </Col>
                }
                <hr className='mb-0'/>
                <Col md={12} className='mt-50'>
                    {
                        file &&
                            <div style={{ fontSize: '11px'}}>
                                <p className='mb-0'>{t('Файл нэр')}: {file?.name}</p>
                                <span>{t('Файл хэмжээ')}: {file?.size}</span>
                            </div>
                    }
                </Col>
                <Col md={12} sm={12} className="mt-2 d-flex justify-content-start mb-0">
                    <Button color="primary" type="submit" onClick={onSubmit} disabled={!file || isLoading}>
                        {isLoading ?  <i className={`fas fa-spinner-third fa-spin me-2`}></i> : <></>}
                        {t('Хадгалах')}
                    </Button>
                    <Button className='ms-1' color="secondary" type="reset" outline  onClick={handleModal}>
                        {t("Буцах")}
                    </Button>
                </Col>

            </ModalBody>
        </Modal>
    )
}

export default FileModal
