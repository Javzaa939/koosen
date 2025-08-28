import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, CardBody, CardHeader, CardText, CardTitle, Input, Label, Table } from 'reactstrap';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import useScore from './hooks/useScore';
import './style.css';

const ATTACHMENT_DIPLOMA = 1
const ATTACHMENT_SHALGALT = 2

export default function Graduate() {
	// #region copied from lms/student/index.jsx
	const { data: scoreData } = useScore()
	// #endregion

	const { t } = useTranslation()

	// Loader
	const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false })

	// API
	const studentApi = useApi().student

	// State
	const [tableRowCount, setTableRowCount] = useState([])
	const [rowSum, setRowSum] = useState(0)
	const [datas, setDatas] = useState({})

	const printDatas = {
		lessons: scoreData?.score_register,
		student: scoreData?.student,
	}

	function getDatas(studentId) {
		Promise.all([
			fetchData(studentApi.calculateGpaDimplomaGet(studentId)),
		]).then((values) => {
			setDatas(values[0]?.data)
		})
	}

	function getAllData(studentId) {
		// Нэгдсэн нэг сургуулийн захирал гарын үсэг хэвлэж байгаа болохоор, data?.student?.group?.profession?.school
		// , printDatas.student?.department?.sub_orgs
		Promise.all([
			fetchData(studentApi.calculateGpaDimplomaGet(studentId)),
			fetchData(studentApi.getConfig(printDatas?.student?.group, 'mongolian'))
		]).then((values) => {
			setDatas(values[0]?.data)
			setTableRowCount(values[1]?.data?.row_count ? values[1]?.data?.row_count : [])
			var sum_count = values[1]?.data?.row_count?.reduce((partialSum, a) => partialSum + a, 0);
			setRowSum(sum_count)
		})
	}

	useEffect(
		() => {
			if (scoreData?.student) getAllData(printDatas?.student?.id)
		},
		[scoreData]
	)

	const lessonData = datas?.lessons || []

	const flattenedArray = lessonData.flatMap(item => [
        {
            type: "parent",
            name: item?.name
        },
		...item.lessons.map((lesson) => {
            return {
                ...lesson,
                type: "children"
            };
        })
    ]);

	function clearTableJS() {
		if (datas?.lessons && tableRowCount.length > 0) {
			if (datas?.lessons?.length != 0) {
				for (let [idx, val] of tableRowCount.entries()) {
					if (val > 0) {
						let tableDoc = document.getElementById(`table${idx + 1}`)
						var tbodyRef = tableDoc.getElementsByTagName('tbody')[0]
						tbodyRef.innerHTML = ''
					}
				}
			}
		}
	}

	useEffect(
		() => {
			clearTableJS()

			if (datas?.lessons && tableRowCount.length > 0)
                {
                if (datas?.lessons?.length != 0)
                {
                    let count = 0
                    let perCount = 0
                    let half = tableRowCount.length / 2

                    let divide = tableRowCount.filter(element => element !== 0).length
                    let dividePage1 = divide > 3 ? 3 : divide

                    for (let [idx, val] of tableRowCount.entries())
                    {
                        if (idx == half)
                        {
                            if (val > 0)
                            {
                                setIsPageBreak(true)
                            }
                        }

                        if (val > 0)
                        {
                            let tableDoc = document.getElementById(`table${idx + 1}`)
                            let parentTableDoc = document.getElementById(`table${idx + 1}-${idx + 1}`)
                            tableDoc.classList.toggle('d-none')

                            var tbodyRef = tableDoc.getElementsByTagName('tbody')[0];

                            if (tableRowCount[2] == 0 && tableRowCount[1] == 0)
                            {
                                if (idx == 0)
                                {
                                    parentTableDoc.style.padding = '0px 76px 0px 70px'
                                }
                            }

                            parentTableDoc.style.width = `${99.1 / dividePage1}%`

                            for (let bodyIdx = 0; bodyIdx < val; bodyIdx++)
                            {

                                let newRow = tbodyRef.insertRow();

                                count++

                                if(flattenedArray[count - 1]?.type === "children")
                                {
                                    let newCell1 = newRow.insertCell();
                                    let newCell2 = newRow.insertCell();
                                    let newCell3 = newRow.insertCell();
                                    let newCell4 = newRow.insertCell();
                                    let newCell5 = newRow.insertCell();

                                    perCount++

                                    newCell1.innerHTML = perCount
                                    newCell2.innerHTML = flattenedArray[count - 1]?.name || ''
                                    newCell3.innerHTML = flattenedArray[count - 1]?.kredit || ''

                                    // Тооцов дүнг харуулахдаа
                                    if (flattenedArray[count - 1]?.grade_letter) {
                                        newCell4.innerHTML = flattenedArray[count - 1]?.grade_letter ? flattenedArray[count - 1]?.grade_letter : ''
                                        newCell4.colSpan = 2
                                    } else {
                                        newCell4.innerHTML = flattenedArray[count - 1]?.score ? flattenedArray[count - 1]?.score : ''

                                        newCell5.innerHTML = flattenedArray[count - 1]?.assesment || ''
                                        newCell5.className = 'border-dark footer3-cell'
                                    }


                                    newCell1.className = 'border-dark mini-cell'
                                    {
                                        printDatas?.student?.group?.degree?.degree_code === 'D'
                                        ?
                                            newCell2.className = 'border-dark body-cell'
                                        :
                                            newCell2.className = 'border-dark body-cell1'

                                    }
                                    newCell3.className = 'border-dark footer1-cell'
                                    newCell4.className = 'border-dark footer2-cell'
                                }
                                else
                                {
                                    let newCell1 = newRow.insertCell();
                                    if (flattenedArray[count - 1]) {
                                        newCell1.innerHTML = flattenedArray[count - 1]?.name
                                        newCell1.colSpan = 5

                                        newCell1.className = 'border-dark body-cell text-center'
                                    }
                                }

                            }
                        }
                    }
                }
            }

			if (datas?.graduation_work?.is_check) setSignatureCheck(true)
		},
		[datas, tableRowCount]
	)

	// #region to set graduationwork.is_check = true
	const [signatureCheck, setSignatureCheck] = useState(datas?.graduation_work?.is_check)

	async function handleSubmit() {
		const student_id = printDatas?.student?.id
		const { success } = await fetchData(studentApi.checkGraduation(student_id))

		if (success) {
			getDatas(student_id)
		}
	}

	return (
		<Card>
			<CardHeader className='border-bottom'>
				<CardTitle>
					{t('Төгсөлттэй холбоотой мэдээлэл')}
				</CardTitle>
			</CardHeader>
			<CardBody className='pt-2'>
				{isLoading && Loader}
				<Alert color='primary' className='p-1'>
					<p>
						Энэхүү мэдээлэл таны диплом дээр бичигдэх учир нарийн нягтлахыг хүсч байна.
					</p>
					Таны овог, нэр МОНГОЛ, АНГЛИ, УЙГАРЖИН гэсэн 3 хэл дээр зөв бичигдсэн эсэх мөн дүнгийн мэдээлэл болон голч дүн зөв байгаа эсэхийг шалгаж, ХЭРВЭЭ зөрүүтэй мэдээлэл байвал АРГА ЗҮЙЧ-дээ хандана уу.
				</Alert>
				<Table responsive size='sm' bordered>
					<thead>
						<tr>
							<th>
							</th>
							<th>
								{t('Монгол')}
							</th>
							<th>
								{t('Англи')}
							</th>
							<th>
								{t('Уйгаржин')}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								{t('Эцэг /Эх/-ийн нэр')}
							</td>
							<td>
								{printDatas?.student?.last_name}
							</td>
							<td>
								{printDatas?.student?.last_name_eng}
							</td>
							<td>
								{printDatas?.student?.last_name_uig}
							</td>
						</tr>
						<tr>
							<td>
								{t('Нэр')}
							</td>
							<td>
								{printDatas?.student?.first_name}
							</td>
							<td>
								{printDatas?.student?.first_name_eng}
							</td>
							<td >
								{printDatas?.student?.first_name_uig}
							</td>
						</tr>
					</tbody>
				</Table>

				<CardText className='mt-1'>{t('Регистрийн дугаар')}: {printDatas?.student?.register_num}</CardText>

				<div className={`position-relative px-1 d-flex justify-content-between`} style={{ fontSize: '11px', color: 'black', fontFamily: 'Times New Roman' }} >
					<div
						className='d-flex flex-wrap align-content-start'
						id='table1-1'
					>
						<table className='font-dark w-100 text-center d-none' id='table1' style={{ fontSize: rowSum < 24 ? '12px' : rowSum < 49 ? '10px' : '8px' }}>
							<thead className='fw-bolder'>
								<tr style={{ height: '30px' }}>
									<td className='border-dark' style={{ width: '6%' }}>№</td>
									<td className='border-dark' style={{ width: '73%' }}>Хичээлийн нэр</td>
									<td className='border-dark' style={{ width: '7%' }}>Багц цаг</td>
									<td className='border-dark' style={{ width: '14%' }} colSpan="2">Үнэлгээ</td>
								</tr>
							</thead>
							<tbody>

							</tbody>
						</table>
					</div>

					<div className='d-flex flex-wrap align-content-start' id='table2-2' style={{ fontSize: rowSum < 24 ? '12px' : rowSum < 49 ? '10px' : '8px' }}>

						<table className='font-dark w-100 text-center d-none' id='table2'>
							<thead className='fw-bolder'>
								<tr style={{ height: '30px' }}>
									<td className='border-dark' style={{ width: '6%' }}>№</td>
									<td className='border-dark' style={{ width: '73%' }}>Хичээлийн нэр</td>
									<td className='border-dark' style={{ width: '7%' }}>Багц цаг</td>
									<td className='border-dark' style={{ width: '14%' }} colSpan="2">Үнэлгээ</td>
								</tr>
							</thead>
							<tbody>

							</tbody>
						</table>
					</div>

					<div className='d-flex flex-wrap align-content-start' id='table3-3' style={{ fontSize: rowSum < 24 ? '12px' : rowSum < 49 ? '10px' : '8px' }}>

						<table className='font-dark w-100 text-center d-none' id='table3'>
							<thead className='fw-bolder'>
								<tr style={{ height: '30px' }}>
									<td className='border-dark' style={{ width: '6%' }}>№</td>
									<td className='border-dark' style={{ width: '73%' }}>Хичээлийн нэр</td>
									<td className='border-dark' style={{ width: '7%' }}>Багц цаг</td>
									<td className='border-dark' style={{ width: '14%' }} colSpan="2">Үнэлгээ</td>
								</tr>
							</thead>
							<tbody>

							</tbody>
						</table>
					</div>
				</div>

				<div className='w-100 font-dark mt-1'
					style={{ fontSize: '13px', color: 'black', bottom: printDatas?.student?.group?.degree?.degree_code == 'D' ? '' : '10px', fontFamily: 'Times New Roman' }}
				>
					<Table responsive size='sm' bordered>
						<thead>
							<tr>
								<th>
								</th>
								{
									datas?.graduation_work?.lesson_type == ATTACHMENT_SHALGALT
									&&
									<th>
										№
									</th>
								}
								<th>
									{t('Монгол')}
								</th>
								<th>
									{t('Англи')}
								</th>
								<th>
									{t('Уйгаржин')}
								</th>
								{
									datas?.graduation_work?.lesson_type == ATTACHMENT_SHALGALT
									&&
									<th>
										{t('Үсгэн үнэлгээ')}
									</th>
								}
							</tr>
						</thead>
						<tbody>
							{
								datas?.graduation_work?.lesson_type == ATTACHMENT_SHALGALT
								&&
								datas?.graduation_work?.lesson?.map((val, idx) => {
									return (
										<tr key={idx}>
											{idx === 0 &&
												<td rowSpan={datas?.graduation_work?.lesson.length}>
													{t('Төгсөлтийн шалгалт')}
												</td>
											}
											<td>
												{idx + 1}
											</td>
											<td>
												{val?.name}
											</td>
											<td>
												{val?.name_eng}
											</td>
											<td>
												{val?.name_uig}
											</td>
											<td>
												{(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment}
											</td>
										</tr>
									)
								})
							}
							{
								datas?.graduation_work?.lesson_type == ATTACHMENT_DIPLOMA
								&&
								<tr>
									<td>
										{t('Дипломын ажлын сэдэв')}
									</td>
									<td>
										<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic}</span>
									</td>
									<td>
										<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_eng}</span>
									</td>
									<td>
										<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_uig}</span>
									</td>
								</tr>
							}
						</tbody>
					</Table>
					{
						Object.keys(datas)?.length > 0
						&&
						<div className={`mt-1 d-flex justify-content-center gap-5 fw-bolder  ${rowSum > 40 ? '' : 'mb-2'}`} style={{ fontSize: '14px' }}>
							<div>Нийт багц цаг: <span className='fw-bolder'>{datas?.score?.max_kredit}</span></div>
							<div>Голч оноо: <span className='fw-bolder'>{datas?.score?.average_score}</span></div>
							<div>Голч дүн: <span className='fw-bolder'>{datas?.score?.assesment}</span></div>
						</div>
					}
				</div>
				<div className='d-flex justify-content-between'>
					<div className="d-flex gap-1 mt-1 ">
						<Input id="signature" type="checkbox" checked={signatureCheck === undefined ? false : signatureCheck} onChange={() => { setSignatureCheck((current) => !current) }} disabled={datas?.graduation_work?.is_check} />
						<Label htmlFor='signature' className="ms-1 fw-bolder">{t('Мэдээлэлтэй танилцан зөвшөөрч байна')}</Label>
					</div>
					<Button
						className="me-2"
						color="primary"
						type="button"
						size='sm'
						disabled={!signatureCheck || datas?.graduation_work?.is_check}
						onClick={handleSubmit}
					>
						{t('Зөвшөөрөх')}
					</Button>
				</div>
			</CardBody>
		</Card>
	)
}
