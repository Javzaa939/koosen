import { ArrowLeft, ArrowUpLeft, ChevronRight, Minus, MinusCircle, Plus, PlusCircle, X } from 'react-feather'
import { Controller, useFormContext, useFieldArray, useForm } from 'react-hook-form'

import {
    Button,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    Badge,
    Row,
    Col,
    Label,
    Input,
    ListGroup,
    ListGroupItem,
    InputGroup,
    InputGroupText
} from 'reactstrap'
import { useTranslation } from 'react-i18next';


export default function Models(props) {

    const { t } = useTranslation()

    const { control, formState: { errors } } = useFormContext()

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control,
        name: `answers`
    });

    function addItem() {
        if (fields.length <= 99) {
            append()
        }
    }

    function removeItem(index) {
        remove(index)
    }

    return (
        <>
            <Row className='g-0 gx-1 border border-2 rounded py-1 px-50'>
                <Col md={12} className='d-flex justify-content-between'>
                    <div className='d-flex'>
                        <h4 className='mb-0'>
                            {t('Загвар')}
                        </h4>
                    </div>
                </Col>
                <Col md={12}>
                    <Label className="form-label" for="room_type1">
                        {t('Боломжит хариултууд')}
                    </Label>
                    <Row className='g-0'>
                        <Col md={4} className=''>
                            <ListGroup className='p-0'>
                                {
                                    fields.map((item, idx) => {

                                        return (
                                            <div className='mb-50' key={item.id}>
                                                <Controller
                                                    defaultValue=''
                                                    control={control}
                                                    id={`answers[${idx}].name`}
                                                    name={`answers[${idx}].name`}
                                                    render={({ field }) => (
                                                        <ListGroupItem className='border-0 p-0 d-flex justify-content-between'>
                                                            <InputGroup>
                                                                <InputGroupText className='p-0 justify-content-center' style={{ width: "16px" }}  >
                                                                    <span className=''>
                                                                        {idx + 1}
                                                                    </span>
                                                                </InputGroupText>
                                                                <Input
                                                                    {...field}
                                                                    id={`answers[${idx}].name`}
                                                                    name={`answers[${idx}].name`}
                                                                    bsSize="sm"
                                                                    placeholder={t('Хариулт')}
                                                                    type="text"
                                                                    invalid={errors[`answers[${idx}].name`] && true}
                                                                />
                                                                <InputGroupText className='p-0 px-50 cursor-pointer' onClick={() => { removeItem(idx) }}>
                                                                    <Minus className='text-danger' size={16} />
                                                                </InputGroupText>
                                                            </InputGroup>
                                                        </ListGroupItem>
                                                    )}
                                                />
                                            </div>
                                        )
                                    })
                                }
                                <ListGroupItem className='p-0 border-0'>
                                    <Button className='p-25 w-100' color='primary' outline onClick={() => { addItem() }}>
                                        <Plus size={12} />
                                        <span style={{ fontSize: "12px" }}>
                                            Нэмэх
                                        </span>
                                    </Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
};
