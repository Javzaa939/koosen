// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import { X } from "react-feather";

import {
	Modal,
	ModalBody,
	ModalHeader,
    Spinner
} from "reactstrap";

import { useTranslation } from 'react-i18next';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import Calendar from './Calendar'
import { get_time_date } from "@utils"


const GroupModal = ({ open, handleModal, isRtl, user  }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const calendarListApi = useApi().timetable.register
    const [resourceOption, setResourceOption] = useState([])
    const [datas, setDatas] = useState([])

    const [teacherResourceOption, setResourceTeacherOption] = useState([])
    const [datasTeacher, setDatasTeacher] = useState([])
    const { fetchData, isLoading, Loader } = useLoader({})


    const { t } = useTranslation()

    function getGroup() {
        var dep_id = ''
        if(user?.permissions?.includes('lms-timetable-register-teacher-update') && user?.department) {
            dep_id = user?.department
        }
        Promise.all([
            // Хичээлийн хуваарийн дата
            fetchData(calendarListApi.getCalendar('', '', '', '', true, '', 'group', '', false, dep_id)),
            // Resource дата
            fetchData(calendarListApi.selectionDatas('group', '', '', false, dep_id)),
        ]).then((values) => {
            if(values[0]?.data?.results) {
                var data = values[0]?.data.results
                for(var i in data) {
                    const group = data[i]?.addon_group_id
                    const odd_even = data[i].odd_even

                    const stimes = get_time_date(data[i].time, data[i].day)

                    data[i].start= stimes?.start_time
                    data[i].end = stimes?.end_time
                    data[i].textColor = data[i]?.textcolor || 'white'

                    // Resource ID
                    data[i].resourceId = group

                    if (odd_even == 1) {
                        data[i].classNames = ['box']
                    } else if (odd_even == 2 ) {
                        data[i].classNames = ['box1']
                    }
                }
                setDatas(data)
            }
            setResourceOption(values[1]?.data)
        })
    }

    function getTeacher() {
        var dep_id = ''
        if(user?.permissions?.includes('lms-timetable-register-teacher-update') && user?.department) {
            dep_id = user?.department
        }
        Promise.all([
            // Хичээлийн хуваарийн дата
            fetchData(calendarListApi.getCalendar('', '', '', '', true, '', 'teacher', '', false, dep_id)),
            // Resource дата
            fetchData(calendarListApi.selectionDatas('teacher', '', '', false, dep_id)),
        ]).then((values) => {
            if(values[0]?.data?.results) {
                var data = values[0]?.data.results
                for(var i in data) {
                    const teacher = data[i]?.teacher
                    const odd_even = data[i].odd_even

                    const stimes = get_time_date(data[i].time, data[i].day)

                    data[i].start= stimes?.start_time
                    data[i].end = stimes?.end_time
                    data[i].textColor = data[i]?.textcolor || 'white'

                    data[i].resourceId = teacher

                    if (odd_even == 1) {
                        data[i].classNames = ['box']
                    } else if (odd_even == 2 ) {
                        data[i].classNames = ['box1']
                    }
                }
                setDatasTeacher(data)
            }
            setResourceTeacherOption(values[1]?.data)
        })
    }

    useEffect(
        () =>
        {
           if (open) {
                getGroup()
                getTeacher()
           }
        },
        [open]
    )

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl'
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
                    <h5 className="modal-title">{t("Хичээлийн хуваарь анги багшаар харах")}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {isLoading && Loader}
                    <div>
                        <h5>Ангийн хуваарь</h5>
                        <Calendar
                            isRtl={isRtl}
                            is_volume={false}
                            eventDatas={datas}
                            height={400}
                            resources={resourceOption}
                        />
                    </div>
                    <div className='mt-1'>
                        <h5>Багшийн хуваарь</h5>
                        <Calendar
                            isRtl={isRtl}
                            eventDatas={datasTeacher}
                            resources={teacherResourceOption}
                            height={400}
                            is_volume={false}
                        />
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default GroupModal;
