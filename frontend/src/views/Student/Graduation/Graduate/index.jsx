// ** React imports
import React, { Fragment, useState, useEffect, useMemo } from 'react'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { t } from 'i18next'

import { AlertTriangle } from "react-feather";
import DataTable from 'react-data-table-component';
import { useForm, Controller } from "react-hook-form";
import { convertDefaultValue } from '@utils'

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
    Badge,
	ModalBody,
	ModalHeader,
    Spinner,
    UncontrolledTooltip
} from "reactstrap";

function getColumns() {
    const columns = [
		{
			name: "№",
			selector: (row, index) => index + 1,
			maxWidth: "30px",
		},
		{
			header: 'code',
			name: `${t("Оюутны код")}`,
			selector: (row) => (row?.code),
			center: true,
			minwidth: '130px'
		},
		{
			header: 'last_name',
			name: `${t("Овог ")}`,
			selector: (row) => row?.last_name,
			center: true,
		},
        {
			header: 'first_name',
			name: `${t("Нэр")}`,
			selector: (row) => row?.first_name,
			center: true,
		},
	]

    return columns
}

const CreateModal = ({ open, handleModal, refreshDatas, group }) => {

    const { control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm();

    const [is_change, setIsChange] = useState(false);
    const [studentOption, setStudentOption] = useState([])
    const [studentLen, setStudentLen] = useState(studentOption.length)

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const studentApi = useApi().student

    async function getStudentOption() {
        const { success, data } = await fetchData(studentApi.getGraduate({
            group: group
        }))
        if(success) {
            setStudentOption(data?.results)
        }
    }

    useEffect(()=>{
        getStudentOption()
    },[])


    // Төгсөгчдийг  анги ангиар нь үүсгэх
    const handleGraduate = async(cdata) => {

        var selected_students = is_change ? studentOption.filter((c) => c.is_selected) : studentOption

        cdata['students'] = selected_students
        cdata['group'] = group
        cdata = convertDefaultValue(cdata)

        const { success } = await fetchData(studentApi.postGraduate(cdata))
        if (success)
        {
            refreshDatas()
            handleModal()
        }
    }

    // Төгсөх оюутнуудыг check хийх
    function onSelectedRowsChange(state) {
        var selected_rows = []
        var selectedRows = state.selectedRows
        setIsChange(true)

        for (let i in studentOption) {
            if(!selectedRows.includes(studentOption[i])) {
                studentOption[i].is_selected = false
            }
            else {
                studentOption[i].is_selected = true
                if(!selected_rows.includes(studentOption[i].id)) {
                    selected_rows.push(studentOption[i].id)
                }
            }
        }

        setStudentLen(selectedRows.length)
    }

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-xl" onClosed={handleModal}>
                {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Төгсөлтийн ажил үүсгэх')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(handleGraduate)}>
                        <Col sm={6} md={4}>
                            <Label className="form-label" for="decision_date">
                                {t('Шийдвэрийн огноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="decision_date"
                                name="decision_date"
                                render={({ field }) => (
                                    <Input
                                        id ="decision_date"
                                        bsSize="sm"
                                        placeholder={t('Шийдвэрийн огноо')}
                                        {...field}
                                        type="date"
                                    />
                                )}
                            />
                        </Col>
                        <Col  sm={6} md={4}>
                            <Label className="form-label" for="graduation_date">
                                {t('Тушаалын огноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="graduation_date"
                                name="graduation_date"
                                render={({ field }) => (
                                    <Input
                                        id ="graduation_date"
                                        bsSize="sm"
                                        placeholder={t('Тушаалын огноо')}
                                        {...field}
                                        type="date"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={4} sm={6}>
                            <Label className="form-label" for="graduation_number">
                                {t('Тушаалын дугаар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="graduation_number"
                                name="graduation_number"
                                render={({ field }) => (
                                    <Input
                                        id ="graduation_number"
                                        bsSize="sm"
                                        placeholder={t('Тушаалын дугаар')}
                                        {...field}
                                        type="text"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                    <Row className='mt-1'>
                        <p>{`Нийт ${studentLen} оюутан сонгогдсон байна`}</p>
                        {
                            studentOption && studentOption.length > 0
                            ?
                                <div>
                                    <DataTable
                                        noHeader
                                        pagination={false}
                                        className="react-dataTable"
                                        columns={getColumns()}
                                        data={studentOption}
                                        fixedHeader
                                        fixedHeaderScrollHeight="62vh"
                                        selectableRows
                                        onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                                        selectableRowSelected={row => is_change ? row?.is_selected && row?.is_selected : true}
                                    />
                                </div>
                            :
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px'}}>
                                    <Badge className="d-flex align-items-center p-50 text-wrap" id='tooltip-studentlist' style={{ fontSize: 14, userSelect:'none' }} pill color="light-warning">
                                        <AlertTriangle className='me-50' style={{ height: 20, width: 20}}/> Уучлаарай өгөгдөл олдсонгүй
                                    </Badge>
                                    <UncontrolledTooltip
                                        target="tooltip-studentlist"
                                        style={{ userSelect:'none' }}
                                    >
                                        Тухайн хичээлийн хуваарьд оюутан шивэгдээгүй байж болзошгүй
                                    </UncontrolledTooltip>
                                </div>
                        }
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default CreateModal;
