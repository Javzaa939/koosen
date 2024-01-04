
// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
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
  UncontrolledTooltip,
  Spinner,
} from 'reactstrap'

// ** Third Party Components
import { Copy, Info } from 'react-feather'
import { useForm, Controller } from 'react-hook-form'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useModal from "@hooks/useModal";

// ** FAQ Illustrations
import illustration from '@src/assets/images/illustration/faq-illustrations.svg'


export default function Role()
{
    const [ show, setShow ] = useState(false);
    const [ roles, setRoles ] = useState([])
    const [ permissions, setPermissions ] = useState([])
    const [ checked, setChecked ] = useState([])
    const [ isUpdate, setisUpdate ] = useState(null)

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

    const { showWarning } = useModal()

    // Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: createLoading, fetchData: createFetchData } = useLoader({});

    async function refreshDatas()
    {
        const { success, data } = await fetchData(roleApi.get())
        if(success)
        {
            setRoles(data)
        }
    }


    useEffect(
        function()
        {
            (async function getAll()
            {
                await Promise.all(
                    [
                        fetchData(roleApi.get()),
                        fetchData(permissionApi.list()),
                    ]
                ).then((values) => {
                    setRoles(values[0]?.data)
                    setPermissions(values[1]?.data)
                })
            })()
        },
        []
    )


    async function onSubmit(data)
    {
        if (data.name.length)
        {
            data['permissions'] = checked

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

    const onReset = () => {
        setShow(false)
        reset({ name: '' })
    }

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

    function checkPerm(event)
    {
        setChecked((prevState) =>
        {
            const newState = [...prevState]
            let value = parseInt(event.target.id.replace('perm-', ''))
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

    function updateRole()
    {
        if (!isUpdate)
        {
            setChecked([])
            return
        }
        else
        {
            setValue('name', isUpdate.name)
            setValue('description', isUpdate.description)
            setChecked(isUpdate.permissions)

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

    /** Устгах дарах үе */
    async function handleDelete(id)
    {
        const { success } = await fetchData(roleApi.delete(id))
        if(success)
        {
            refreshDatas()
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
                                                                    setisUpdate(val)
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
                                                    setisUpdate(null)
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
                onClosed={() => reset({ name: '' })}
                toggle={() => setShow(!show)}
                onOpened={() => updateRole()}
                className='modal-dialog-centered'
                size="xl"
            >
                <ModalHeader className='bg-transparent' toggle={() => setShow(!show)}></ModalHeader>
                <ModalBody className='px-5 pb-5'>
                    <div className='text-center mb-4'>
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
                        <Col xs={12}>
                            <h4 className='mt-2 pt-50'>Эрхүүд</h4>
                            <Table className='table-flush-spacing' style={{ display: 'block', maxHeight: '400px', overflow: 'auto' }} responsive>
                                <tbody>
                                    {/* TODO: Бүх эрхийг идэвхжүүлдэг байлгах */}
                                    {/* <tr>
                                        <td className='text-nowrap fw-bolder'>
                                            <span className='me-50'>Админ эрх</span>
                                            <Info size={14} id='info-tooltip' />
                                            <UncontrolledTooltip placement='top' target='info-tooltip'>
                                                Системийн бүх эрхийг өгнө
                                            </UncontrolledTooltip>
                                        </td>
                                        <td>
                                            <div className='form-check'>
                                                <Input type='checkbox' id='select-all' />
                                                <Label className='form-check-label' for='select-all'>
                                                    Бүгдийг идэвхжүүлэх
                                                </Label>
                                            </div>
                                        </td>
                                    </tr> */}
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
