// ** React imports
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Col,
    Input,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";

import useApi from "@hooks/useApi";

import GenericDataTable from '../GenericDataTable';

export default function LessonsModal({ open, handleModal, student, group, profession}) {
    // other hooks
    const { t } = useTranslation()

    // #region states
    const [rows_per_page, setRowsPerPage] = useState(10)
    const [search_value, setSearchValue] = useState('')
    const [render_to_search, setRenderToSearch] = useState(false)
    // #endregion

    // Api
    const challengeApi = useApi().challenge

    // #region primitives
    const columns = [
        {
            name: `${t('Хичээл')}`,
            selector: (row) => (<span>{row?.lesson_name}</span>),
            center: true,
            header: 'lesson_name',
            sortable: true,
            minWidth: '300px'
        },
        {
            name: `${t('Дүгнэх хэлбэр')}`,
            selector: (row) => (<span>{row?.lesson_teacher_score_type}</span>),
            center: true,
            header: 'lesson_teacher_score_type',
            sortable: true,
            minWidth: '200px'
        },
        {
            name: `${t('Багшийн дүн')}`,
            selector: (row) => (<span>{Number(row?.score).toFixed(1)}</span>),
            center: true,
            header: 'score',
            sortable: true
        },
        {
            name: `${t('Багшийн нэр')}`,
            selector: (row) => (<span>{row?.teacher_first_name}</span>),
            center: true,
            header: 'teacher_first_name',
            sortable: true,
            minWidth: '200px'
        },
        {
            name: `${t('Багшийн овог')}`,
            selector: (row) => (<span>{row?.teacher_last_name}</span>),
            center: true,
            header: 'teacher_last_name',
            sortable: true,
            minWidth: '200px'
        },
    ]

    const default_page = ['Бүгд', 10, 20, 50, 75, 100]
    // #endregion

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(e.target.value === 'Бүгд' ? 10000000 : parseInt(e.target.value))
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    async function handleSearch() {
        if (search_value.length > 0) setRenderToSearch(!render_to_search)
    }

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-xl">
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <Row className='mt-1'>
                        <Col>
                            <Input
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px", width: "80px" }}
                                value={rows_per_page}
                                onChange={e => handlePerPage(e)}
                                className='mb-50'
                            >
                                {
                                    default_page.map((page, idx) => (
                                        <option
                                            key={idx}
                                            value={page}
                                        >
                                            {page}
                                        </option>
                                    ))
                                }
                            </Input>
                            <GenericDataTable apiGetFunc={challengeApi.getReport} isApiGetFuncArgsDefault={true} apiGetFuncArgs={{ report_type: 'students_detail', group: group, profession: profession, student: student }} columns={columns} rows_per_page={rows_per_page} search_value={search_value} render_to_search={render_to_search} />
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
