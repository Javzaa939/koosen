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
    FormFeedback
} from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

const FileModal = ({ isOpen, handleModal, refreshData }) => {

    const defaultExt = ['csv', 'xlsx']
    const [isLoading, setLoader] = useState(false)
    const [file, setFile] = useState('')
    const [fileExt, setFileExt] = useState('')
    const [error, setFileError] = useState('')

    const { fetchData } = useLoader({})
    const fileApi = useApi().challenge.question

    const getFile = (e, action) => {
        if (action == 'Get') {
            var files = e.target.files
            var file_name = files[0]?.name

            if (file_name) {
                var splitted_array = file_name.split('.')
                var ext = splitted_array.pop()
                if (!defaultExt.includes(ext)) {
                    setFileError('Зөвхөн .csv, .xlsx  өргөтгөлтэй файл оруулна уу')
                    setFile('')
                } else {
                    setFile(files[0])
                    setFileError('')
                    setFileExt(ext)
                }
            }
        } else {
            setFile('')
            setFileError('Хоосон байна.')
        }
    }

    async function onSubmit() {
        if (file) {
            setLoader(true)
            const formData = new FormData()
            formData.append('file', file)
            formData.append('ext', fileExt)

            const { success, error }  = await fetchData(fileApi.postExcel(formData))
            if (success) {
                handleModal()
                refreshData()
                setLoader(false)
            }
        } else {
            setFileError('Хоосон байна.')
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered modal-sm">
            <ModalHeader toggle={handleModal}>{t('Асуултууд файлаар оруулах')}</ModalHeader>
            <ModalBody>
                <Label>{t('Файл')}</Label>
                <Input
                    type='file'
                    bsSize='sm'
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={(e) => getFile(e, 'Get')}
                    invalid={error ? true : false}
                />
                {error
                ?
                    <FormFeedback className='d-block'>{t(error)}</FormFeedback>
                :
                    <Col className="ps-0">
                        <AlertCircle color="#28bcf7" size={15}/>
                        <Label className="ms-1">{t('Зөвхөн .csv, .xlsx  өргөтгөлтэй файл оруулна уу.')}</Label>
                    </Col>
                }
                <hr className='mb-0'/>
                <Col md={12} className='mt-50'>
                    {
                        file &&
                            <div style={{ fontSize: '11px'}}>
                                <p className='mb-0'>Файл нэр: {file?.name}</p>
                                <span>Файл хэмжээ: {file?.size}</span>
                                <X className='ms-50' role="button" color="red" size={15} onClick={(e) => getFile(e, 'Delete')}></X>
                            </div>
                    }
                </Col>
                <Col md={12} sm={12} className="mt-2 d-flex justify-content-start mb-0">
                    <Button color="primary" type="submit" onClick={onSubmit}>
                        {isLoading && <i className={`fas fa-spinner-third fa-spin me-2`}></i>}
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
