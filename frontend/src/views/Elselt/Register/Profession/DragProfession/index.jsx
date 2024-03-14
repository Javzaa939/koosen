import { useEffect, useState } from 'react'

import { ReactSortable } from 'react-sortablejs'
import '@styles/react/libs/drag-and-drop/drag-and-drop.scss'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import Select from 'react-select'
import classnames from "classnames";
import { ReactSelectStyles } from '@utils'
import { Plus, Minus, Search} from 'react-feather'
import { t } from 'i18next';

import {
    Card,  CardBody,
    Row, Col, ListGroupItem, Badge, Label,
    Input, Button, Table, UncontrolledTooltip
} from 'reactstrap'

import ShalguurModal from './ShalguurModal';

const DragProfession = ({ cdatas }) => {
    var values = {
        degree: '',
        department: '',
    }

    const shalguurs = [
        {
            'id': 1,
            'name': 'Элсэлтийн ерөнхий шалгалтын оноогоор'
        },
        {
            'id': 2,
            'name': 'Дээд боловсролтой иргэн (2 жил)'
        },
        {
            'id': 3,
            'name': 'Дээд боловсролтой албан хаагч)'
        },
        {
            'id': 4,
            'name': 'Албан хаагч (бүрэн дунд боловсролтой))'
        },
    ]

    const [listArr1, setListArr1] = useState([])
    const [listArr2, setListArr2] = useState([])
    const [degreeOption, setDegree] = useState([])
    const [depOption, setDepartment] = useState([])
    const [profOption, setProfession] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [searchValue, setSearchValue] = useState("");
    const [modal, setModal] = useState(false)
    const [admission_data, setAdmission] = useState({})
    const [admissionDatas, setAdmissionDatas] = useState([])

	const [filteredData, setFilteredData] = useState([]);

    const professionApi = useApi().study.professionDefinition
    const depApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const elseltApi = useApi().elselt.profession

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {

        const { success, data } = await fetchData(professionApi.getList(select_value?.degree, select_value.department))
        if (success) {
            setProfession(cdatas?.degrees.length > 0 ? data.filter(val => cdatas?.degrees?.includes(val?.degree)) : data)
        }
	}

    //Боловсролын зэргийн жагсаалт авах
    async function getDegree () {

        const { success, data } = await fetchData(degreeApi.get())
        if (success) {
            setDegree(data)
        }
	}

    // Салбарын жагсаалт авах
    async function getDepartment () {
        const { success, data } = await fetchData(depApi.get())
        if (success) {
            setDepartment(data)
        }
	}

    useEffect(
        () =>
        {
            getProfession()
        },
        [select_value]
    )

    useEffect(
        () =>
        {
            getDepartment()
            getDegree()
        },
        []
    )

    // Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		var updatedData = [];
		const value = e.target.value.trimStart();

		if (value.length) {
			updatedData = profOption.filter((item) => {
				const startsWith =
					item.full_name.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item.name.toString().toLowerCase().startsWith(value.toString().toLowerCase())

				const includes =
					item.full_name.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item.name.toString().toLowerCase().includes(value.toString().toLowerCase())

				if (startsWith) {
					return startsWith;
				}
				else if (!startsWith && includes) {
					return includes;
				}
				else {
					return null;
				}
			});

			setFilteredData(updatedData);
		}
        setSearchValue(value);
	};

    async function getProps() {
        const { success, data } = await fetchData(elseltApi.get(cdatas.id))
        if (success) {
            const { datas, admission_datas } = data
            setListArr1(datas)
            setAdmissionDatas(admission_datas)
        }
    }

    console.log(listArr1)

    async function moveProp(order) {
        var options = searchValue.length > 0 ? [...filteredData] : [...listArr2]
        let update_id = options[order.oldIndex].id

        var datas = {
            'profession': update_id,
            'admission': cdatas.id
        }
        const { success, data } = await fetchData(elseltApi.post(datas))
        if (success) {
            getProps()
        }
    }

    async function removeProp(order) {
        var options = [...listArr1]
        let update_id = options[order.oldIndex].id

        const { success, data } = await fetchData(elseltApi.delete(update_id,  cdatas.id))
        if (success) {
            getProps()
        }
    }

    useEffect(
        () =>
        {
            getProps()
        },
        []
    )

    function getDifference(array1, array2) {
        return array1.filter(object1 => {
          return !array2.some(object2 => {
            return object1.id === object2.id;
          });
        });
    }

    useEffect(
        () =>
        {
            const difference_list = getDifference(profOption, listArr1)
            setListArr2(difference_list)
        },
        [listArr1, profOption]
    )

    function addShalgur(prof={})
    {
        setModal(!modal)
        var admission = admissionDatas.find((c) => c.profession == prof.id)
        setAdmission(admission || {})
    }


    async function saveState(profId, state) {
        var datas = {
            'profession': profId,
            'state': state,
            'admission': cdatas?.id
        }
        const { success } = await fetchData(elseltApi.putPropState(datas))
        if (success) {
            getProps()
        }
    }

    return (
        <Card>
            <CardBody>
                <Row className='mb-1'>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="department">
                            {'Тэнхим'}
                        </Label>
                        <Select
                            name="department"
                            id="department"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={'-- Сонгоно уу --'}
                            options={depOption || []}
                            value={depOption.find((c) => c.id === select_value.department)}
                            noOptionsMessage={() => 'Хоосон байна.'}
                            onChange={(val) => {
                                setSelectValue({
                                    degree: select_value.degree,
                                    department: val?.id || ''
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="degree">
                            {'Боловсролын зэрэг'}
                        </Label>
                        <Select
                            name="degree"
                            id="degree"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={'-- Сонгоно уу --'}
                            options={degreeOption || []}
                            value={degreeOption.find((c) => c.id === select_value.degree)}
                            noOptionsMessage={() => 'Хоосон байна.'}
                            onChange={(val) => {
                                setSelectValue({
                                    degree: val?.id || '',
                                    department: select_value.department
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.degree_name}
                        />
                    </Col>
                    <Col className='d-flex align-items-center  justify-content-end flex-fill mt-1 ' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={"Хайх үг...."}
                            value={searchValue}
                            onChange={handleFilter}
                            // onKeyPress={e => e.key === 'Enter' && handleFilter()}
                        />
                        <Button
                            size='sm'
                            className='ms-50 mb-50'
                            color='primary'
                            onClick={handleFilter}
                        >
                            <Search size={15} />
                            <span className='align-middle ms-50'></span>
                        </Button>
                    </Col>
                </Row>
                <Row className='mb-1'>
                    <Table responsive bordered>
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Хөтөлбөрийн нэр</th>
                                <th>Шалгуур нэмэх</th>
                                <th>Элсэлтийн төрөл сонгох </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                listArr1.map((item, idx) =>
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item?.full_name}</td>
                                        <td>
                                            <a role="button" onClick={() => { addShalgur(item)} }
                                                id={`edit${idx}`}
                                                className="me-1"
                                            >
                                                <Badge color="light-success" pill><Plus  width={"15px"} /></Badge>
                                            </a>
                                            <UncontrolledTooltip placement='top' target={`edit${idx}`} >Нэмэх</UncontrolledTooltip>
                                        </td>
                                        <td>
                                            <Select
                                                name="degrees"
                                                id="degrees"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select')}
                                                isLoading={isLoading}
                                                defaultValue={item?.state}
                                                menuPortalTarget={document.body}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={shalguurs || []}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    saveState(item?.id, val?.id)
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </Row>
                <div className='justify-content-center py-50'>
                    <h4 className=''>Сонгох хөтөлбөрөөс сонгогдсон хөтөлбөр лүү зөөнө үү</h4>
                </div>
                <Row id='dd-with-handle' className='border-top'>
                    <Col md='6' sm='12'>
                        <h4 className='my-1'>Сонгогдсон хөтөлбөрүүд</h4>
                        <ReactSortable
                            tag='ul'
                            className='list-group list-group-flush sortable'
                            group='shared-group'
                            list={listArr1}
                            setList={setListArr1}
                            onEnd={removeProp}
                        >
                        {listArr1.map((item) => {
                            return (
                                <ListGroupItem key={item?.id}>
                                    <Badge color='light-primary' pill className='me-50'>
                                        <Minus size={15}></Minus>
                                    </Badge>
                                    {item?.full_name}
                                </ListGroupItem>
                            )
                        })}
                        </ReactSortable>
                    </Col>
                    <Col md='6' sm='12'>
                        <h4 className='my-1'>Сонгох хөтөлбөрүүд</h4>
                        <ReactSortable
                            tag='ul'
                            className='list-group list-group-flush sortable'
                            group='shared-group'
                            list={searchValue.length > 0 ? filteredData : listArr2}
                            setList={setListArr2}
                            onEnd={moveProp}
                        >
                        {
                        searchValue.length > 0
                            ?
                            filteredData.map(item => {
                                return (
                                <ListGroupItem className='draggable' key={item?.id}>
                                    <Badge color='light-primary' pill className='me-50'>
                                        <Plus size={15}></Plus>
                                    </Badge>
                                    <span className='cursor-pointer' style={{ userSelect: 'none' }}>
                                        {item?.full_name}
                                    </span>
                                </ListGroupItem>
                                )
                            })
                            :
                            listArr2.map(item => {
                                return (
                                <ListGroupItem className='draggable' key={item?.id}>
                                    <Badge color='light-primary' pill className='me-50'>
                                        <Plus size={15}></Plus>
                                    </Badge>
                                    <span className='cursor-pointer' style={{ userSelect: 'none' }}>
                                        {item?.full_name}
                                    </span>
                                </ListGroupItem>
                                )
                            })
                        }
                        </ReactSortable>
                    </Col>
                </Row>
            </CardBody>
            {
                modal && <ShalguurModal open={modal} handleModal={addShalgur} admission_data={admission_data} refreshDatas={getProps}/>
            }
        </Card>
    )
}

export default DragProfession
