import React, { useEffect, useState } from 'react';

import { Col, Label } from 'reactstrap'

import Select from 'react-select'

import { ReactSelectStyles } from "@utils"

/**
    ** Хичээлийн жилийн жагсаалт авна
    * @param {Function}        handleYear        Сонгосон утгыг авна
    * @param {String}          year              Хэдэн жил доторхыг авхаа дамжуулна
*/

const LessonYear = ({ handleYear, year='5' }) => {

    var today = new Date();
    var now_year = today.getFullYear();

    const [select_year, setYears] = useState([])

    useEffect(() => {
        const start_year = now_year - year
        const years = []

        for (var i = start_year; i <= now_year; i++) {
            var value = i + '-' + (i + 1)
            var check_years = { id: value, name: value }

            years.push(check_years);
            setYears(years)
        }

    },[now_year, year])

    return (
        <Col lg={4} xs={12}>
            <Label className="form-label" for="year">
                Хичээлийн жил
            </Label>
            <Select
                id="year"
                name="year"
                isClearable
                classNamePrefix='select'
                className='react-select'
                placeholder={`-- Сонгоно уу --`}
                options={select_year || []}
                noOptionsMessage={() => 'Хоосон байна'}
                onChange={(val) => {
                    handleYear(val?.id || '')
                }}
                styles={ReactSelectStyles}
                getOptionValue={(option) => option.id}
                getOptionLabel={(option) => option.name}
            />
        </Col>
    );
};

export default LessonYear;
