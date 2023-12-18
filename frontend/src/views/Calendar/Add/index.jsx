// ** React Imports
import { useState, useEffect, useContext } from 'react'

// ** Third Party Components
import { X } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select' // eslint-disable-line
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

import useApi from '@hooks/useApi';
import useModal from "@hooks/useModal";
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { useTranslation } from 'react-i18next'

// ** Reactstrap Imports
import { Button, Modal, ModalHeader, ModalBody, Label, Input, Form, FormFeedback, Spinner } from 'reactstrap'

// ** Utils
import { get_event_people_type, ReactSelectStyles, convertDefaultValue, isObjEmpty, get_action_type } from '@utils'

// ** Styles Imports
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'

import classnames from 'classnames'

const AddEventSidebar = props => {
    // ** Props
    const {
        open,
        dates,
        is_new,
        editId,
        refreshDatas,
        handleAddEventSidebar
    } = props

    // ** Vars & Hooks
    const {
        reset,
        control,
        setError,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm({})

    const { t } = useTranslation()
    const { showWarning } = useModal()
    const { user } = useContext(AuthContext)

    const { Loader, isLoading, fetchData } = useLoader({})

    // ** States
    const [endPicker, setEndPicker] = useState(new Date())
    const [startPicker, setStartPicker] = useState(new Date())

    // State
    const [eventScope, setEventScope] = useState(get_event_people_type())
    const [actionType, setActionType] = useState(get_action_type())
    const [selectedScopeIds, setScopeIds] = useState([])
    const [is_edit, setEdit] = useState(false)
    const [edit_datas, setDatas] = useState([])
    const [is_disabled, setIsDisabled] = useState(true)

    // Api
    const calendarApi = useApi().calendar

    useEffect(() => {
        if(!isObjEmpty(dates)) {
            if(dates.start) setStartPicker(dates.start)
            if(dates.end) setEndPicker(dates.end)
        }
    },[dates])

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-calendar-update')) {
            setIsDisabled(false)
        }
    },[open])

    const handleDeleteEvent = async () => {
        if(editId) {
            const { success } = await fetchData(calendarApi.delete(editId))
            if(success) {
                refreshDatas()
                handleAddEventSidebar()
            }
        }
    }

    async function getOneDatas() {
        const { success, data } = await fetchData(calendarApi.getOne(editId))
        if(success && data) {
            const editData = data?.datas[0]
            setDatas(editData)
            // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
            if(editData === null) return
            for(let key in editData) {
                if(editData[key] !== null)
                    setValue(key, editData[key])
                else setValue(key,'')

                if(key === 'start') {
                    setStartPicker(editData[key])
                }
                if(key === 'end') {
                    setEndPicker(editData[key])
                }
            }
        }
    }

    useEffect(() => {
        if(editId && !is_new) {
            getOneDatas()
            setEdit(true)
        }
    },[open])

    async function onSubmit(cdatas) {
        cdatas['start'] = startPicker
        cdatas['end'] = endPicker

        cdatas = convertDefaultValue(cdatas)

        if(!is_edit) {
            cdatas['scope_ids'] = selectedScopeIds
            const { success, error } = await fetchData(calendarApi.post(cdatas))
            if(success) {
                reset()
                refreshDatas()
                handleAddEventSidebar()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
        else {
            const { success, error } = await fetchData(calendarApi.put(cdatas, editId))
            if(success) {
                reset()
                refreshDatas()
                handleAddEventSidebar()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
    }

    // ** Close BTN
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleAddEventSidebar} />

    function handleResetInputValues() {
        reset()
        setStartPicker(new Date())
        setEndPicker(new Date())
        setEdit(false)
    }

    return (
        <Modal
            isOpen={open}
            className='sidebar-lg'
            toggle={handleAddEventSidebar}
            onClosed={handleResetInputValues}
            contentClassName='p-0 overflow-hidden'
            modalClassName='modal-slide-in event-sidebar'
        >
        <ModalHeader className='mb-1' toggle={handleAddEventSidebar} close={CloseBtn} tag='div'>
            <h5 className='modal-title'>
                Үйл ажиллагаа бүртгэх
            </h5>
        </ModalHeader>
        <PerfectScrollbar options={{ wheelPropagation: false }}>
            <ModalBody className='flex-grow-1 pb-sm-0 pb-3'>
            {isLoading ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
					</div>
					:
                <Form onSubmit={handleSubmit(onSubmit)} >
                    <div className='mb-1'>
                        <Label className='form-label' for='title'>
                            Үйл ажиллагааны нэр <span className='text-danger'>*</span>
                        </Label>
                        <Controller
                            name='title'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                                <Input
                                    id='title'
                                    placeholder='Үйл ажиллагааны нэр'
                                    invalid={errors.title && true}
                                    {...field}
                                    bsSize="sm"
                                    disabled={is_disabled}
                                    readOnly={is_disabled}
                                />
                            )}
                        />
                        {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                    </div>
                    <div className='mb-1'>
                        <Label className='form-label' for='action_type'>
                            Үйл ажиллагааны төрөл
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="action_type"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="action_type"
                                        id="action_type"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.action_type })}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={actionType || []}
                                        value={actionType.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        // isMulti={is_edit ? false : true}
                                        isSearchable={true}
                                        styles={ReactSelectStyles}
                                        isDisabled={is_disabled}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.action_type && <FormFeedback className='d-block'>{t(errors.action_type.message)}</FormFeedback>}
                    </div>
                    <div className='mb-1'>
                        <Label className='form-label' for='organiser'>
                            Зохион байгуулагч <span className='text-danger'>*</span>
                        </Label>
                        <Controller
                            name='organiser'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                                <Input
                                    id='organiser'
                                    placeholder='Зохион байгуулагч'
                                    invalid={errors.organiser && true}
                                    {...field}
                                    bsSize="sm"
                                    disabled={is_disabled}
                                    readOnly={is_disabled}
                                />
                            )}
                        />
                        {errors.organiser && <FormFeedback className='d-block'>{t(errors.organiser.message)}</FormFeedback>}
                    </div>
                    <div className='mb-1'>
                        <Label className='form-label' for='scope'>
                            Хамрах хүрээ
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="scope"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="scope"
                                        id="scope"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.scope })}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={eventScope || []}
                                        value={eventScope.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setScopeIds(val)
                                        }}
                                        isMulti={is_edit ? false : true}
                                        isSearchable={true}
                                        styles={ReactSelectStyles}
                                        isDisabled={is_disabled}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.scope && <FormFeedback className='d-block'>{t(errors.scope.message)}</FormFeedback>}
                    </div>
                    <div className='mb-1'>
                        <Label className='form-label' for='start'>
                            Эхлэх хугацаа
                        </Label>
                        <Flatpickr
                            required
                            id='start'
                            name='start'
                            className='form-control'
                            onChange={date => setStartPicker(date[0])}
                            value={startPicker}
                            style={{height: "30px"}}
                            options={{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i',
                            }}
                            disabled={is_disabled}
                            readOnly={is_disabled}
                        />
                        {errors.start && <FormFeedback className='d-block'>{t(errors.start.message)}</FormFeedback>}
                    </div>
                    <div className='mb-1'>
                        <Label className='form-label' for='end'>
                            Дуусах хугацаа
                        </Label>
                        <Flatpickr
                            required
                            id='end'
                            name='end'
                            className='form-control'
                            onChange={date => setEndPicker(date[0])}
                            value={endPicker}
                            style={{height: "30px"}}
                            options={{
                                enableTime: true,
                                dateFormat: 'Y-m-d H:i',
                                minDate: startPicker,
                            }}
                            disabled={is_disabled}
                            readOnly={is_disabled}
                        />
                        {errors.end && <FormFeedback className='d-block'>{t(errors.end.message)}</FormFeedback>}
                    </div>
                    <div className='mb-1'>
                        <Label className='form-label' for='description'>
                            Тайлбар
                        </Label>
                        <Controller
                            name='description'
                            control={control}
                            render={({ field }) => {
                                return (
                                    <Input
                                        {...field}
                                        type='textarea'
                                        name='description'
                                        id='description'
                                        rows='6'
                                        bsSize="sm"
                                        placeholder='Тайлбар'
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                    />
                                )
                            }}
                        />
                        {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                    </div>
                    {
                        !is_disabled &&
                        <div className='d-flex mb-1'>
                            <Button className='me-1' type='submit' color='primary'>
                                {
                                    editId && !is_new ? t('Засах') : t('Нэмэх')
                                }
                            </Button>
                            {
                                editId && !is_new
                                ?
                                    <Button
                                        color='danger'
                                        outline
                                        disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-calendar-delete') ? false : true}
                                        onClick={() => showWarning({
                                            header: {
                                                title: `${t('Үйл ажиллагаа устгах')}`,
                                            },
                                            question: `Та "${edit_datas?.title}" үйл ажиллагааг устгахдаа итгэлтэй байна уу?`,
                                            onClick: () => handleDeleteEvent(),
                                            btnText: 'Устгах',
                                        })}
                                    >
                                        Устгах
                                    </Button>
                                :
                                    <Button color='secondary' type='reset' onClick={handleAddEventSidebar} outline>
                                        Буцах
                                    </Button>
                            }
                        </div>
                    }
                </Form> }
            </ModalBody>
        </PerfectScrollbar>
        </Modal>
    )
}

export default AddEventSidebar
