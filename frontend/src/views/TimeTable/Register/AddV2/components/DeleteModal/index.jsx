import { useContext, useEffect, useState } from 'react';
import { Search, Trash2, X } from "react-feather";
import { useTranslation } from 'react-i18next';

import {
    Button,
    Col,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from '@src/utility/context/AuthContext';
import FullSetDataTable from '../FullSetDataTable';
import { getColumns } from './helpers';
import useModal from '@src/utility/hooks/useModal';

import React, { useCallback, } from 'react';
import ScrollSelectFilterById from '../ScrollSelectFilterById';
import classNames from 'classnames';

export default function DeleteModal({ open, handleModal, refreshDatas }) {
    const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />
    const defaultPage = ['Бүгд', 10, 20, 50, 75, 100]

    const { t } = useTranslation()
    const { fetchData, isLoading, Loader } = useLoader({})
    const { user } = useContext(AuthContext)
    const { showWarning } = useModal()

    const timetableRootApi = useApi().timetable
    const timetableApi = useApi().timetable.register

    // #region states
    // selected rows
    const [selectedRows, setSelectedRows] = useState([])

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(defaultPage[2]);
    const [totalCount, setTotalCount] = useState('')

    const [datas, setDatas] = useState([]);
    // #endregion

    async function handleDelete(id) {
        let ids = ''

        if (id) ids = id
        else {
            if (Array.isArray(selectedRows) && selectedRows.length > 0) ids = selectedRows.map(item => item.id)
            else return
        }

        const { success } = await fetchData(timetableApi.deleteByList(ids))

        if (success) {
            refreshDatas()
            getDatas()
            setSelectedRows([])
        }
    }

    async function getDatas() {
        const { success, data } = await fetchData(timetableRootApi.getList(
            rowsPerPage,
            currentPage,
            '',
            searchValue,
            '',
            selectLesson,
            '', '', '',
            selectGroup,
            selectDay,
            selectTime,
            '',
            true
        ))

        if (success) {
            setTotalCount(data.count)
            setDatas(data.results)
        }
    }

    // #region search
    const [searchValue, setSearchValue] = useState('')

    useEffect(() => {
        if (searchValue?.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);

            return () => clearTimeout(timeoutId);
        }
    }, [searchValue]);
    // #endregion

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage])

    // #region select input lesson
    const selectInputLessonName = 'lesson'
    const [selectLesson, setSelectLesson] = useState('')

    const getLessons = useCallback(async (pageLocal, searchTextLocal, recordsLimitPerPageLocal) =>
        timetableRootApi.getSelectLessons(
            recordsLimitPerPageLocal,
            pageLocal,
            '',
            searchTextLocal,
        ), []
    )
    // #endregion

    // #region select input group
    const selectInputGroupName = 'group'
    const [selectGroup, setSelectGroup] = useState('')

    const getGroups = useCallback(async (pageLocal, searchTextLocal, recordsLimitPerPageLocal) =>
        timetableRootApi.getSelectGroups({
            limit: recordsLimitPerPageLocal,
            page: pageLocal,
            search: searchTextLocal,
            lesson: selectLesson,
        }), [selectLesson]
    )
    // #endregion

    // #region select input day
    const selectInputDayName = 'day'
    const [selectDay, setSelectDay] = useState('')

    const MONDAY = 1
    const TUESDAY = 2
    const WENDESDAY = 3
    const THURSDAY = 4
    const FRIDAY = 5
    const SATURDAY = 6
    const SUNDAY = 7

    const days = [
        { value: MONDAY, label: 'Даваа' },
        { value: TUESDAY, label: 'Мягмар' },
        { value: WENDESDAY, label: 'Лхагва' },
        { value: THURSDAY, label: 'Пүрэв' },
        { value: FRIDAY, label: 'Баасан' },
        { value: SATURDAY, label: 'Бямба' },
        { value: SUNDAY, label: 'Ням' },
    ]
    // #endregion

    // #region select input time
    const selectInputTimeName = 'time'
    const [selectTime, setSelectTime] = useState('')

    const FIRST = 1
    const SECOND = 2
    const THIRD = 3
    const FOURTH = 4
    const FIFTH = 5
    const SIXTH = 6
    const SEVENTH = 7
    const EIGHTH = 8

    const times = [
        { label: '1-р пар', value: FIRST },
        { label: '2-р пар', value: SECOND },
        { label: '3-р пар', value: THIRD },
        { label: '4-р пар', value: FOURTH },
        { label: '5-р пар', value: FIFTH },
        { label: '6-р пар', value: SIXTH },
        { label: '7-р пар', value: SEVENTH },
        { label: '8-р пар', value: EIGHTH },
    ]
    // #endregion

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className='sidebar-xl custom-80'
            modalClassName='modal-slide-in'
            contentClassName='pt-0'
            fullscreen='xl'
        >
            <ModalHeader
                className="mb-1"
                toggle={handleModal}
                close={CloseBtn}
                tag="div"
            >
                <h5 className="modal-title">{t("Хичээлийн хуваарь устгах")}</h5>
            </ModalHeader>
            <ModalBody className='mt-0'>
                {isLoading && Loader}
                <Row>
                    <Col md={4} className="mb-1">
                        <Label className="form-label" for={selectInputLessonName}>
                            {t('Хичээл')}
                        </Label>
                        <ScrollSelectFilterById
                            fieldName={selectInputLessonName}
                            getApi={getLessons}
                            getOptionLabel={(option) => option.code + ' ' + option.name}
                            getOptionValue={(option) => option.id}
                            onChange={(val) => {
                                const ids = val.map(item => item.id)
                                setSelectLesson(ids)
                            }}
                            className={classNames('react-select')}
                            recordsLimitPerPage={15}
                            optionValueFieldName={'id'}
                            value={selectLesson}
                            isMulti={true}
                        />
                    </Col>
                    <Col md={4} className="mb-1">
                        <Label className="form-label" for={selectInputGroupName}>
                            {t('Анги')}
                        </Label>
                        <ScrollSelectFilterById
                            fieldName={selectInputGroupName}
                            getApi={getGroups}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            onChange={(val) => {
                                const ids = val.map(item => item.id)
                                setSelectGroup(ids)
                            }}
                            className={classNames('react-select')}
                            recordsLimitPerPage={15}
                            optionValueFieldName={'id'}
                            value={selectGroup}
                            isMulti={true}
                        />
                    </Col>
                    <Col md={4} className="mb-1">
                        <Label className="form-label" for={selectInputDayName}>
                            {t('Өдөр')}
                        </Label>
                        <ScrollSelectFilterById
                            fieldName={selectInputDayName}
                            staticOptions={days}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(val) => {
                                const ids = val.map(item => item.value)
                                setSelectDay(ids)
                            }}
                            className={classNames('react-select')}
                            recordsLimitPerPage={15}
                            optionValueFieldName={'value'}
                            value={selectDay}
                            isMulti={true}
                        />
                    </Col>
                    <Col md={4} className="mb-1">
                        <Label className="form-label" for={selectInputTimeName}>
                            {t('Цаг')}
                        </Label>
                        <ScrollSelectFilterById
                            fieldName={selectInputTimeName}
                            staticOptions={times}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(val) => {
                                const ids = val.map(item => item.value)
                                setSelectTime(ids)
                            }}
                            className={classNames('react-select')}
                            recordsLimitPerPage={15}
                            optionValueFieldName={'value'}
                            value={selectTime}
                            isMulti={true}
                        />
                    </Col>
                </Row>
                <Row className='mb-1'>
                    <Col sm={12}>
                        <Button
                            size='sm'
                            className='me-50'
                            color='primary'
                            onClick={getDatas}
                        >
                            <Search size={15} />
                            <span className='align-middle ms-50'>{t('Хайлт')}</span>
                        </Button>
                        <Button
                            size='sm'
                            color='primary'
                            onClick={() => showWarning({
                                header: {
                                    title: t(`Хичээлийн хуваариудыг устгах`),
                                },
                                question: t(`Та энэхүү хичээлийн хуваариудыг устгахдаа итгэлтэй байна уу?`),
                                onClick: () => handleDelete(),
                                btnText: t('Устгах'),
                            })}
                            disabled={selectedRows?.length < 1}
                            className="me-50"
                        >
                            <Trash2 size={15} />
                            <span className='align-middle ms-50'>{t('Сонгосныг устгах')}</span>
                        </Button>
                    </Col>
                </Row>
                <FullSetDataTable
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    data={datas}
                    isLoading={isLoading}
                    totalCount={totalCount}
                    noDataComponent={
                        <div className="mb-2" style={{ marginTop: '27px' }}>
                            <h5>{t("Хуваарь байхгүй байна")}</h5>
                        </div>
                    }
                    columns={getColumns(
                        currentPage,
                        rowsPerPage,
                        totalCount,
                        handleDelete,
                        user,
                        showWarning
                    )}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    defaultPage={defaultPage}
                />
            </ModalBody>
        </Modal>
    )
}
