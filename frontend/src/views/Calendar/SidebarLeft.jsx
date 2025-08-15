// ** React Imports
import { Fragment, useState, useContext, useEffect } from 'react';

// ** Reactstrap Imports
import { Card, CardBody, Button, Input, Label, Row, Col } from 'reactstrap';

import DatePicker from 'react-datepicker';

import { useTranslation } from 'react-i18next';

import AuthContext from '@context/AuthContext';
import ActiveYearContext from '@context/ActiveYearContext';

import { get_event_people_type } from '@utils';

// import "react-datepicker/dist/react-datepicker.css";

import './style.scss';

const SidebarLeft = (props) => {
    const { t } = useTranslation();

    const { user } = useContext(AuthContext);

    // ** Props
    const { handleAddEventSidebar, toggleSidebar, searchValue, setNew, active_week } = props;

    const days = [t('Ня'), t('Да'), t('Мя'), t('Лх'), t('Пү'), t('Ба'), t('Бя')];
    const months = [
        t('1 сар'),
        t('2 сар'),
        t('3 сар'),
        t('4 сар'),
        t('5 сар'),
        t('6 сар'),
        t('7 сар'),
        t('8 сар'),
        t('9 сар'),
        t('10 сар'),
        t('11 сар'),
        t('12 сар'),
    ];

    const { cyear_name, cseason_name } = useContext(ActiveYearContext);
    const [filters, setFilters] = useState(get_event_people_type());
    const [checked_search, setChecked] = useState(filters.map((li) => li.id));
    const [is_checked, setIsChecked] = useState(true);

    // ** Function to handle Add Event Click
    const handleAddEventClick = () => {
        toggleSidebar(false);
        handleAddEventSidebar();
        setNew(true);
    };

    const locale = {
        localize: {
            day: (n) => days[n],
            month: (n) => months[n],
        },
        formatLong: {
            date: () => 'mm/dd/yyyy',
        },
    };

    const handleSearchSelectAll = (e) => {
        setIsChecked(!is_checked);
        setChecked(filters.map((li) => li.id));
        if (is_checked) {
            setChecked([]);
        }
    };

    function handleSearchChecked(e) {
        const { value, checked } = e.target;
        const id = parseInt(value);

        setChecked([...checked_search, id]);
        if (!checked) {
            setIsChecked(false);
            setChecked(checked_search.filter((item) => item !== id));
        }
    }

    useEffect(() => {
        searchValue(checked_search);
        if (checked_search.length === filters.length) {
            setIsChecked(true);
        }
    }, [checked_search]);

    return (
        <Fragment>
            <div className="sidebar-wrapper">
                {Object.keys(user).length > 0 &&
                    user.permissions.includes('lms-calendar-create') && (
                        <>
                            <CardBody className="card-body d-flex justify-content-center my-sm-0 p-50">
                                <Button color="primary" block onClick={handleAddEventClick}>
                                    <span className="align-middle">Үйл ажиллагаа нэмэх</span>
                                </Button>
                            </CardBody>
                            <hr className="m-0" />
                        </>
                    )}
                <CardBody className="d-flex justify-content-center my-sm-0 p-50">
                    <Card body className="mb-0 sidebar-left-color">
                        <Row>
                            <Col>
                                <Row>
                                    <Card className="border-0 mb-0 p-1 sidebar-left-color1 py-2">
                                        <p className="mb-0 text-center">{active_week}</p>
                                        <p
                                            className="text-center d-flex align-items-end"
                                            style={{ fontSize: '12px' }}
                                        >
                                            {t('Долоо хоног')}
                                        </p>
                                    </Card>
                                </Row>
                            </Col>
                            <Col>
                                <Row>
                                    <Col className="d-flex align-items-start">
                                        <p className="text-center" style={{ fontSize: '12px' }}>
                                            {t('Хичээлийн жил')}
                                        </p>
                                    </Col>
                                    <Col>
                                        <p
                                            className="mb-0 text-center"
                                            style={{ fontSize: '12px' }}
                                        >
                                            {cyear_name}
                                        </p>
                                        <p
                                            className="text-center mb-0"
                                            style={{ fontSize: '12px' }}
                                        >
                                            {cseason_name}
                                        </p>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </CardBody>
                <hr className="m-0" />
                <CardBody className="d-flex justify-content-center my-sm-0 p-50">
                    <DatePicker
                        selectsRange
                        inline
                        disabled
                        locale={locale}
                        minDate={new Date()}
                        maxDate={new Date()}
                    />
                </CardBody>
                <hr className="m-0" />
                <CardBody className="ms-1 mt-1">
                    <h5 className="section-label mb-1">
                        <span className="align-middle">Хайлт</span>
                    </h5>
                    <div className="form-check mb-1">
                        <Input
                            id="view-all"
                            type="checkbox"
                            label="View All"
                            className="select-all"
                            checked={is_checked}
                            onChange={(e) => handleSearchSelectAll(e)}
                        />
                        <Label className="form-check-label" for="view-all">
                            Бүгд
                        </Label>
                    </div>
                    <div className="calendar-events-filter">
                        {filters &&
                            filters.length &&
                            filters.map((filter) => {
                                return (
                                    <div key={filter.name} className="form-check mb-1">
                                        <Input
                                            type="checkbox"
                                            value={filter.id}
                                            name={filter.name}
                                            id={filter.name}
                                            checked={checked_search.includes(filter.id)}
                                            onChange={(e) => handleSearchChecked(e)}
                                        />
                                        <Label className="form-check-label" for={filter.name}>
                                            {filter.name}
                                        </Label>
                                    </div>
                                );
                            })}
                    </div>
                    <small>
                        <b>ОНА </b>- олон нийтийн ажил
                    </small>
                </CardBody>
            </div>
        </Fragment>
    );
};

export default SidebarLeft;
