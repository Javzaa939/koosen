import { useMemo, useContext, useState } from "react"

import { t } from 'i18next';
import Select from 'react-select'

import { Plus, Trash2 } from "react-feather";
import classnames from "classnames";

import AuthContext from "@context/AuthContext"

import { Button, Table, Input, Badge, FormFeedback } from 'reactstrap';

import { ReactSelectStyles } from "@utils"

function TableRows({ rowsData, deleteTableRows, handleChange, lessonOption, isDisabled, isSolved, isAllow,  oldLessonOption, editId }) {
    console.log('isAllow', isAllow)
    return(
        rowsData.map((data, idx)=>{
            const { correspond_lesson_id, correspond_kredit, learn_lesson, learn_kredit, score, season, is_allow }= data
            return(
                <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ width: '33%'}}>
                        <Select
                            name="correspond_lesson_id"
                            id="correspond_lesson_id"
                            classNamePrefix='select'
                            isClearable
                            className={'react-select'}
                            placeholder={t('-- Сонгоно уу --')}
                            options={lessonOption || []}
                            value={lessonOption.find((c) => c.id === correspond_lesson_id || '')}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) =>
                                handleChange(idx, val?.id, 'correspond_lesson_id')
                            }
                            isDisabled={isSolved ? true : isDisabled}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.full_name}
                        />
                    </td>
                    <td>
                        {correspond_kredit}
                    </td>
                    <td>
                       {season}
                    </td>
                    <td>{idx + 1}</td>
                    <td style={{ width: '25%'}}>
                        {
                            oldLessonOption.length > 0
                            ?
                                <Select
                                    name="learn_lesson"
                                    id="learn_lesson"
                                    classNamePrefix='select'
                                    isClearable
                                    className={'react-select'}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={oldLessonOption || []}
                                    value={oldLessonOption.find((c) => c.lesson__name === learn_lesson || '')}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) =>
                                        {
                                            handleChange(idx, val?.lesson__name, 'learn_lesson'),
                                            handleChange(idx, val?.lesson__kredit, 'learn_kredit')
                                            handleChange(idx, val?.score_total, 'score')
                                        }
                                    }
                                    isDisabled={isSolved ? true : isDisabled}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.lesson__name}
                                    getOptionLabel={(option) => option.lesson__name}
                                />
                            :

                                <Input
                                    type='text'
                                    id='learn_lesson'
                                    name='learn_lesson'
                                    bsSize='sm'
                                    placeholder="Хичээлийн нэр"
                                    defaultValue={learn_lesson}
                                    disabled={isSolved ? true : isDisabled}
                                    onChange={(e) =>
                                        handleChange(idx, e.target.value, e.target.name)
                                    }
                                />
                        }
                    </td>
                    <td>
                        <Input
                            type='number'
                            id='learn_kredit'
                            name='learn_kredit'
                            bsSize='sm'
                            placeholder="Кредит"
                            defaultValue={learn_kredit}
                            disabled={isSolved ? true : isDisabled}
                            onChange={(e) =>
                                handleChange(idx, e.target.value, e.target.name)
                            }
                        />
                    </td>
                    <td>
                        <Input
                            type='number'
                            id='score'
                            name='score'
                            bsSize='sm'
                            placeholder="Дүн"
                            defaultValue={score}
                            disabled={isSolved ? true : isDisabled}
                            onChange={(e) =>
                                handleChange(idx, e.target.value, e.target.name)
                            }
                        />
                    </td>
                    <td className='text-center'>
                        {
                            isSolved
                            ?
                                <Input
                                    className='me-50'
                                    type='checkbox'
                                    name='is_allow'
                                    id='is_allow'
                                    // id={`is_allow_${idx}`}
                                    // disabled={!isAllow ? true : false}
                                    defaultChecked={is_allow}
                                    onChange={(e) =>
                                        handleChange(idx, e.target.checked, e.target.name)
                                    }
                                />
                            :

                                <a
                                    role="button"
                                    onClick={() => deleteTableRows(idx)}
                                >
                                    <Badge color="light-danger" pill> <Trash2 width={"15px"} /></Badge>
                                </a>
                        }
                    </td>
                </tr>
            )
        })
    )
}

const AddTable = (props) => {

    const {
        datas,
        setDatas,
        lessonOption,
        isDisabled,
        isSolved,
        isDetail,
        // allowIds,
        //setIds
        isAllow,
        oldLessonOption,
        addRow,
        editId
    } = props

    const { user } = useContext(AuthContext)
    const [error, setError] = useState(false)

    const [allowIds, setIds] = useState([])

    const tableHeader = useMemo(() => {
        return (
            <tr>
                <th className='text-center'>№</th>
                <th>
                    {t('Хичээлийн нэр')}
                </th>
                <th>
                    {t('Кр')}
                </th>
                <th>
                    {t('Улирал')}
                </th>
                <th className='text-center'>№</th>
                <th>
                    {t('Судласан хичээлийн нэр')}
                </th>
                <th>
                    {t('Кр')}
                </th>
                <th>
                    {t('Дүн')}
                </th>
                {
                    user && Object.keys(user).length > 0 && user.permissions.includes('lms-request-correspond-delete')
                    ?
                        <th className='text-center'>{t('Батлах')}</th>
                    :
                        <th className='text-center'>{t('Үйлдэл')}</th>
                }
            </tr>
        )
    }, [])

    function handleItemChanged(idx, value, name) {

        const rowsInput = [...datas];
        rowsInput[idx][name] = value;
        console.log('safeAllowIds', allowIds)

        if (isSolved && name === 'is_allow') {
            var id = rowsInput[idx]?.id

            if (value) {
                setIds([...allowIds, id]);
            }
            else {
                setIds(allowIds.filter(item => item !== id));
            }
        }

        if (name === 'correspond_lesson_id') {
            var item = lessonOption.find((c) => c.id === value )
            rowsInput[idx]['season'] = item?.season
            rowsInput[idx]['correspond_kredit'] = item?.kredit
        }

        setDatas(rowsInput);
    }

    // Мөр дата устгах хэсэг
    function handleDelete(idx) {
        var items = [...datas];
        items.splice(idx, 1);

        setDatas(items)
    }

    return (
        <div className={`added-cards mt-0` }>
            <div className={classnames('cardMaster rounded border p-1 table-responsive overflow-scroll')} style={{height: isDetail ? '300px' : '400px'}}>
                {
                    !isSolved &&
                        <div className='text-end mb-50'>
                            <Button size='sm' color="primary" onClick={() => addRow(datas)} disabled={isDisabled}>
                                {t('Дүйцүүлэлт хийх')}
                            </Button>
                        </div>
                }
                <Table bordered size="sm" >
                    <thead>
                        {tableHeader}
                    </thead>
                    <tbody>
                        <TableRows rowsData={datas} deleteTableRows={handleDelete} handleChange={handleItemChanged} lessonOption={lessonOption} isDisabled={isDisabled} isSolved={isSolved} isAllow={isAllow} error={error} oldLessonOption={oldLessonOption} editId={editId}/>
                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default AddTable
