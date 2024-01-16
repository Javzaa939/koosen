
import { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import {
  Row,
  Col,
  Card,
  Label,
  Input,
  Table,
  Modal,
  Button,
  CardBody,
  ModalBody,
  ModalHeader,
  FormFeedback,
  Spinner,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  ListGroup,
  ListGroupItem
} from 'reactstrap'

import { useForm, Controller } from 'react-hook-form'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useModal from "@hooks/useModal";
import useUpdateEffect from '@hooks/useUpdateEffect'

import illustration from '@src/assets/images/illustration/faq-illustrations.svg'


export default function Role()
{
    const [ show, setShow ] = useState(false);                      // Modal харагдах утга
    const [ roles, setRoles ] = useState([])                        // Бүх Role-ийн утга
    const [ positions, setPositions ] = useState([])                // Бүх Албан тушаал-ийн утга
    const [ permissions, setPermissions ] = useState(null)          // Бүх Эрх-ийн утга
    const [ cpermissions, setCpermissions ] = useState(null)        // Бүх Эрх-ийн утга (Хайлт хийх үед ашигладаг, утгаа авчаад өөрчлөгддөггүй)
    const [ checked, setChecked ] = useState([])                    // Сонгогдсон эрхүүдийн жагсаалт (id)
    const [ isUpdate, setIsUpdate ] = useState(null)                // Засах дарах үеийн role-ийн утга
    const [ searchVal, setSearchVal ] = useState('')                // Эрх хайх утга
    const [ active, setActive ] = useState('1')                     // Идэвхтэй tab
    const [ checkedPos, setCheckedPos ] = useState([])              // Сонгогдсон албан тушаалын жагсаалт (id)

    const {
        reset,
        control,
        setError,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm({ defaultValues: { name: '' } })

    // Api
    const roleApi = useApi().settings.role
    const permissionApi = useApi().settings.permission
    const hrmsApi = useApi().hrms

    const { showWarning } = useModal()

    // Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: createLoading, fetchData: createFetchData } = useLoader({});

    /** Утга дуудах */
    async function refreshDatas()
    {
        const { success, data } = await fetchData(roleApi.get())
        if(success)
        {
            setRoles(data)
        }
    }

    const toggle = tab => {
        if (active !== tab)
        {
            setActive(tab)
        }
    }

    const onReset = () => {
        setShow(false)
        reset({ name: '' })
    }

    /** Анхны бүх хүсэлтүүд */
    useEffect(
        function()
        {
            (async function getAll()
            {
                await Promise.all(
                    [
                        fetchData(roleApi.get()),
                        fetchData(permissionApi.list()),
                        fetchData(hrmsApi.position.getAll())
                    ]
                ).then((values) => {
                    setRoles(values[0]?.data)
                    setPermissions(values[1]?.data)
                    setCpermissions(values[1]?.data)
                    setPositions(values[2]?.data)
                })
            })()
        },
        []
    )


    /** Хадгалах дарах үе
     * @param {object} data Хадгалах role-хамааралтай утгууд
     */
    async function onSubmit(data)
    {
        // Эрх сонгоогүй бол warning өгнө
        if (checked.length < 1)
        {
            return showWarning({
                header: {
                    title: 'Эрх сонгоно уу',
                },
                question: ' ',
                btnShow: false
            })
        }

        // Нэр талбарыг бөглөсон тохиолдолд үргэлжлүүлнэ
        if (data.name.length)
        {
            data['permissions'] = checked
            data['orgpositions'] = checkedPos

            const { success, errors } = await createFetchData(isUpdate ? roleApi.put(isUpdate.id, data) : roleApi.post(data))
            if(success)
            {
                reset()
                refreshDatas()
                setShow(false)
            }
            else
            {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let error of errors)
                {
                    setError(error.field, { type: 'custom', message:  error.msg});
                }
            }
        }
        else
        {
            setError('name', {
                type: 'manual'
            })
        }
    }


    /**
     * read, create, update, delete орчуулах
     * @param {string} text монгол руу болгох
    */
    function textInc(text='')
    {
        let crudName = text
        if (crudName.includes('read'))
        {
            crudName = 'Харах'
        }
        else if (crudName.includes('create'))
        {
            crudName = 'Үүсгэх'
        }
        else if (crudName.includes('update'))
        {
            crudName = 'Шинэчлэх'
        }
        else if (crudName.includes('delete'))
        {
            crudName = 'Устгах'
        }

        return crudName
    }

    /**
     * Албан тушаал сонгох үе
     * @param {object} event Эрхийн input
    */
    function checkPerm(event)
    {
        setChecked((prevState) =>
        {
            const newState = [...prevState]
            let value = parseInt(event.target.id.replace('perm-', ''))

            // Байвал хасаж үгүй бол нэмнэ
            if (event.target.checked)
            {
                newState.push(value)
            }
            else
            {
                newState.splice(newState.findIndex(e => e == value), 1)
            }
            return newState
        })
    }

    /**
     * Албан тушаал сонгох үе
     * @param {string} id Албан тушаалын id
    */
    function checkPos(id)
    {
        setCheckedPos((prevState) =>
        {
            const newState = [...prevState]

            // Байвал хасаж үгүй бол нэмнэ
            if (newState.includes(id))
            {
                newState.splice(newState.indexOf(id), 1)
            }
            else
            {
                newState.push(id)
            }

            return newState
        })
    }


    /** Modal нээгдэх үе (role үүсгэх болон засах дарах үед) */
    function openedModal()
    {
        // үүсгэх дарах үед
        if (!isUpdate)
        {
            setChecked([])
            setCheckedPos([])
            return
        }
        // засах дарах үед албан тушаал болон эрхүүдийг сонгогдсон болгоно
        else
        {
            setValue('name', isUpdate.name)
            setValue('description', isUpdate.description)
            setChecked(isUpdate.permissions)
            setCheckedPos(isUpdate.positions)

            for (let perm of isUpdate.permissions)
            {
                let permInput = document.getElementById(`perm-${perm}`)
                if (permInput)
                {
                    document.getElementById(`perm-${perm}`).checked = true
                }
            }
        }
    }


    /**
     * Устгах дарах үе
     * @param {string} id role-id
    */
    async function handleDelete(id)
    {
        const { success } = await fetchData(roleApi.delete(id))
        if(success)
        {
            refreshDatas()
        }
    }


    /**
     * Эрх хайх
    */
    useUpdateEffect(() =>
    {
        // name болон description field-үүдээс хайж олдсон эрхүүдийг буцаана
        if(searchVal)
        {
            setPermissions(() =>
            {
                let data = {}

                let crud_perms = cpermissions?.crud_perms?.filter((val) => val.name.includes(searchVal) || val.description.includes(searchVal))
                let non_crud_perms = cpermissions?.non_crud_perms?.filter((val) =>  val.name.includes(searchVal) || val.description.includes(searchVal))

                data.crud_perms = crud_perms
                data.non_crud_perms = non_crud_perms

                return data
            })
        }
        // хайх үг байгаагүй бол бүх эрхийг буцаана
        else
        {
            setPermissions(cpermissions)
        }
    }, [searchVal])


    /** checked болгодог */
    useEffect(
        () =>
        {
            if (isUpdate && isUpdate.permissions)
            {
                for (let perm of isUpdate.permissions)
                {
                    let permInput = document.getElementById(`perm-${perm}`)
                    if (permInput)
                    {
                        document.getElementById(`perm-${perm}`).checked = true
                    }
                }
            }
        },
        [permissions]
    )


    /**
     * Албан тушаал хайх
     * @param {string} name Хайх үг
    */
    function searchPosition(name)
    {
        if (name)
        {
            // Бүх албан тушаалаас хайж эхний олдсоныг буцаана
            let result = positions.find((val) => val.name.toLowerCase().includes(name.toLowerCase()))

            // Албан тушаал олдвол scroll дож аваачина
            if (result)
            {
                document.getElementById(`orgposition-${result.id}`).scrollIntoView({ behavior: "smooth" })
            }
        }
    }

    return (
        <Fragment>
            <h3>Роль</h3>

            {
                isLoading
                ?
                    <div className="row placeholder-glow">
                        {
                            [...Array(9)].map((val, idx) =>
                            {
                                return (
                                    <div key={`loader${idx}`} className="placeholder col-md-6 col-xl-4 position-relative" style={{ height: '160px', marginBottom: '2rem', boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.1)' }} >
                                        <div className='position-absolute start-0 bg-light h-100' style={{ width: 'calc(var(--bs-gutter-x) * 0.5)' }}></div>
                                        <div className='position-absolute end-0 bg-light h-100' style={{ width: 'calc(var(--bs-gutter-x) * 0.5)' }}></div>
                                    </div>
                                )
                            })
                        }
                    </div>
                :
                    <Row>
                        {
                            roles.map(function(val, idx)
                            {
                                return (
                                    <Col key={`role-${idx}`} xl={4} md={6}>
                                        <Card>
                                            <CardBody>
                                                <div className='d-flex'>
                                                    <span>{`Нийт ${val.permissions.length} эрхүүд`}</span>
                                                </div>
                                                <div className='mt-1 pt-25'>
                                                    <div className='role-heading'>
                                                        <h4 className='fw-bolder mb-0'>{val.name}</h4>
                                                        <small>{val.description}</small><br />
                                                        <div className='d-flex justify-content-between'>
                                                            <Link
                                                                className='role-edit-modal'
                                                                onClick={e => {
                                                                    e.preventDefault()
                                                                    setIsUpdate(val)
                                                                    setShow(true)
                                                                }}
                                                            >
                                                                <small className='fw-bolder'>роль засах</small>
                                                            </Link>
                                                            <Link
                                                                className='role-edit-modal'
                                                                onClick={
                                                                    (e) =>
                                                                    {
                                                                        e.preventDefault()
                                                                        showWarning({
                                                                            header: {
                                                                                title: 'Эрх устгах',
                                                                            },
                                                                            question: `Та "${val?.name}" роль устгахдаа итгэлтэй байна уу?`,
                                                                            onClick: () => handleDelete(val?.id),
                                                                            btnText: 'Устгах',
                                                                        })
                                                                    }
                                                                }
                                                            >
                                                                <small className='fw-bolder text-danger'>роль устгах</small>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                )
                            })
                        }
                        <Col xl={4} md={6}>
                            <Card>
                                <Row>
                                    <Col sm={5}>
                                        <div className='d-flex align-items-end justify-content-center h-100'>
                                            <img className='img-fluid mt-2' src={illustration} alt='Image' width={85} />
                                        </div>
                                    </Col>
                                    <Col sm={7}>
                                        <CardBody className='text-sm-end text-center ps-sm-0'>
                                            <Button
                                                color='primary'
                                                className='text-nowrap mb-1'
                                                onClick={() => {
                                                    setShow(true)
                                                    setIsUpdate(null)
                                                }}
                                            >
                                                Роль үүсгэх
                                            </Button>
                                            <p className='mb-0'>Байхгүй бол шинэ роль нэмнэ үү</p>
                                        </CardBody>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
            }


            <Modal
                isOpen={show}
                onClosed={() => {reset({ name: '' }); setSearchVal('')}}
                toggle={() => setShow(!show)}
                onOpened={() => openedModal()}
                className='modal-dialog-centered'
                size="xl"
            >
                <ModalHeader className='bg-transparent' toggle={() => setShow(!show)}></ModalHeader>
                <ModalBody className='px-5 pb-5 pt-0'>
                    <div className='text-center'>
                        <h1>Роль</h1>
                        <p>Ролийн эрхийг тохируулах</p>
                    </div>
                    <Row tag='form' onSubmit={handleSubmit(onSubmit)}>
                        <Col xs={12}>
                            <Label className='form-label' for='name'>
                                Роль нэр
                            </Label>
                            <Controller
                                name='name'
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} id='name' placeholder='Роль нэр' invalid={errors.name && true} />
                                )}
                            />
                            {errors.name && <FormFeedback>Ролийн нэрийг оруулна уу</FormFeedback>}
                        </Col>
                        <Col xs={12}>
                            <Label className='form-label' for='description'>
                                Тайлбар
                            </Label>
                            <Controller
                                name='description'
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} type='textarea' id='description' placeholder='Тайлбар' invalid={errors.description && true} />
                                )}
                            />
                            {errors.description && <FormFeedback>Тайлбарыг оруулна уу</FormFeedback>}
                        </Col>
                        <Col xs={12} style={{ scrollBehavior: 'smooth' }} >
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        active={active === '1'}
                                        onClick={() => {
                                            toggle('1')
                                        }}
                                    >
                                        Эрхүүд
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={active === '2'}
                                        onClick={() => {
                                            toggle('2')
                                        }}
                                    >
                                        Албан тушаал
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent className='py-50' activeTab={active}>
                                <TabPane tabId='1'>
                                    <Input type="text" id='search' placeholder='Эрх хайх...' value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />
                                    <Table className='table-flush-spacing' style={{ display: 'block', maxHeight: '450px', overflow: 'auto' }} responsive>
                                        <tbody>
                                            {
                                                permissions?.non_crud_perms?.map((val, idx) =>
                                                {
                                                    return (
                                                        <tr key={`non_crud_perms${idx}`}>
                                                            <td className='text-nowrap fw-bolder'>{val.description}
                                                                <br />
                                                                <small>
                                                                    {val.name}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <div className='d-flex'>
                                                                    <div className='form-check me-3 me-lg-5'>
                                                                        <Input type='checkbox' id={`perm-${val.id}`} onClick={e => checkPerm(e)} />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                            {
                                                permissions?.crud_perms?.map((val, idx) =>
                                                {
                                                    return (
                                                        <tr key={`crud_perms${idx}`}>
                                                            <td className='text-nowrap fw-bolder'>{val.description}
                                                                <br />
                                                                <small>
                                                                    {val.name}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <div className='d-flex'>
                                                                {
                                                                    val?.filtered?.map((filVal, filIdx) =>
                                                                    {
                                                                        return (
                                                                            <div key={filIdx} className='form-check me-3 me-lg-5'>
                                                                                <Input type='checkbox' id={`perm-${filVal.id}`} onClick={e => checkPerm(e)} />
                                                                                <Label className='form-check-label' for={`perm-${filVal.id}`}>
                                                                                    {
                                                                                        textInc(filVal.name)
                                                                                    }
                                                                                </Label>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </TabPane>
                                <TabPane tabId='2'>
                                    <Input type="text" id='search' placeholder='Албан тушаал хайх...' onChange={(e) => searchPosition(e.target.value)} />
                                    <ListGroup className='cursor-pointer' style={{ display: 'block', maxHeight: '450px', overflow: 'auto' }}>
                                        {
                                            positions.map((val, idx) =>
                                            {
                                                return (
                                                    <ListGroupItem key={idx} active={checkedPos.includes(val.id)} onClick={() => checkPos(val.id)} id={`orgposition-${val.id}`} >
                                                        <div>
                                                            <h6 className={`${checkedPos.includes(val.id) && 'text-white'} m-0`}>{val.name}</h6>
                                                        </div>
                                                    </ListGroupItem>
                                                )
                                            })
                                        }
                                    </ListGroup>
                                </TabPane>
                            </TabContent>
                        </Col>
                        <Col className='text-center mt-2' xs={12}>
                            <Button type='submit' color='primary' className='me-1' disabled={createLoading} >
                                {
                                    createLoading
                                    ?
                                        <Spinner size='sm' className='me-25' />
                                    :
                                        null
                                }
                                Хадгалах
                            </Button>
                            <Button type='reset' outline onClick={onReset}>
                                Болих
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
