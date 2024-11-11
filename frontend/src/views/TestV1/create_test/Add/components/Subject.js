import React, { memo, useState, useEffect } from 'react'

import {
    Col,
    Input,
    Label,
} from 'reactstrap'

import classnames from 'classnames'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

function Subject({ handleSearchChecked, lessonId, checked_ids }) {

    const [lessonSedevOption, setLessonSedevOption] = useState([])

    // Loader
	const { isLoading, fetchData } = useLoader({});

    // API
    const teacherLessonApi = useApi().study.lesson

    async function getLessonSedev()
    {
        if(lessonId) {
            const { success, data } = await fetchData(teacherLessonApi.getSedevAll(lessonId))
            if(success) {
                setLessonSedevOption(data)
            }
        }
    }

    useEffect(
        () =>
        {
            getLessonSedev()
        },
        [lessonId]
    )

    return (
        <Col md={6}>
            <h5>Хичээлийн сэдвүүд</h5>
            <div className='added-cards'>
                <div className={classnames('cardMaster rounded border p-1')}>
                    {
                        lessonSedevOption && lessonSedevOption.map((item, idx) =>
                            <div className='d-flex justify-content-start mb-1' key={idx}>
                                <div>
                                    <Input
                                        type='checkbox'
                                        className='me-1'
                                        bsSize="md"
                                        value={item.id}
                                        name={item.title}
                                        id={item.title}
                                        checked={checked_ids.includes(item.id)}
                                        onChange={(e) => handleSearchChecked(e)}
                                    />
                                </div>
                                <Label className='form-label'>{item.title}</Label>
                            </div>
                        )
                    }
                </div>
            </div>
        </Col>
    )
}

export default memo(Subject)
