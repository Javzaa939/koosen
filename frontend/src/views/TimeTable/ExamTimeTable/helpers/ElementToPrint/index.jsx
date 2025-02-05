import { useTranslation } from "react-i18next";
import image_iso from "./assets/iso.png"
import image_logo from "./assets/logo.png"

export default function ElementToPrint({ data_to_print, elementToPrintId, selectedGroupNames }) {
	const { t } = useTranslation()

	return (
		<div id={elementToPrintId}>
			<table style={{ width: '100%' }}>
				<thead>
					<tr>
						<td className="mainTable">
							<div style={{ paddingLeft: '2mm', paddingRight: '2mm', paddingBottom: '5mm', width: '100%' }}>
								<table style={{ width: '100%' }}>
									<thead>
										<tr>
											<td align='center' rowSpan={2} style={{ width: '20mm' }}>
												<img style={{ maxWidth: '15mm', maxHeight: '18mm' }} src={image_logo} alt="logo" />
											</td>
											<td colSpan={2} style={{ width: '42mm' }}>{t('Баримт бичгийн нэр')}:</td>
											<td colSpan={4}>{t('Бакалаврын шалгалтын үнэлгээний хуудас')}</td>
											<td align='center' rowSpan={2} style={{ width: '20mm' }}>
												<img style={{ maxWidth: '15mm', maxHeight: '18mm' }} src={image_iso} alt="iso" />
											</td>
										</tr>
										<tr>
											<td style={{ width: '20mm' }}>{t('Код')}:</td>
											<td>{t('D.YX-201')}</td>
											<td style={{ width: '44mm' }}>{t('Баталсан огноо')}:</td>
											<td>{t('220-06-02')}:</td>
											<td>{t('Хувилбар')}:</td>
											<td align="center" style={{ width: '35mm' }}>{t('1')}</td>
										</tr>
									</thead>
									<tbody>
									</tbody>
								</table>
							</div>
						</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td align='center' className="mainTable">
							{t('Баримт бичгийн хяналт, баталгаажуулалт')}
							<table style={{ width: '100%' }}>
								<thead>
									<tr align="center">
										<td style={{ width: '45mm' }}>{t('Гүйцэтгэл')}:</td>
										<td style={{ width: '70mm' }}>{t('Албан тушаал')}</td>
										<td>{t('Нэр')}</td>
										<td style={{ width: '47mm' }}>{t('Гарын үсэг')}</td>
										<td style={{ width: '32mm' }}>{t('Огноо')}</td>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{t('Баталсан')}:</td>
										<td>{t('Сургалтын бодлого төлөвлөлтийн газрын дарга')}</td>
										<td>{'Б. Мөнхзаяа'}</td>
										<td></td>
										<td></td>
									</tr>
									<tr>
										<td>{t('Явцын үнэлгээ гаргасан багш')}:</td>
										<td>{data_to_print?.teacher_org_position}</td>
										<td>{data_to_print?.teacher_name}</td>
										<td></td>
										<td>{data_to_print?.teacher_score_updated_at}</td>
									</tr>
									{
										data_to_print?.exam_committee?.map((item, key)=>
											<tr key={key}>
												<td>{t('Шалгалтын комисс')} -{key + 1}:</td>
												<td>{item?.teacher_org_position}</td>
												<td>{item?.teacher_name}</td>
												<td></td>
												<td>{item?.teacher_score_updated_at}</td>
											</tr>
										)
									}
									<tr>
										<td>{t('Нэгтгэсэн')}:</td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
								</tbody>
							</table>
							<div className="etp_mt-1" style={{ textTransform: 'uppercase' }}>
								{`${data_to_print?.lesson_year} ${t('ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН')} ${data_to_print?.lesson_season == "Намар" ? 'I' : 'II'} ${t('УЛИРЛЫН')} ${selectedGroupNames}${t('-Р ДАМЖААНЫ СУРАЛЦАГЧДЫН ҮНЭЛГЭЭНИЙ ХУУДАС')}`}
							</div>
							<table className="etp_mt-1 etp_borderless" style={{ width: '236mm', marginBottom: '2mm' }} align='right'>
								<tbody>
									<tr style={{ display: 'flex' }}>
										<td>{t('Хичээлийн нэр')}:</td>
										<td style={{ borderBottom: '2px dotted black', fontWeight: 'bolder' }}>{data_to_print?.lesson_name}</td>
										<td style={{ flexGrow: 1 }}></td>
										<td align="right">{t('Авбал зохих багц цаг')}:</td>
										<td style={{ borderBottom: '2px dotted black', fontWeight: 'bolder', width: '15mm' }}>{data_to_print?.lesson_credit}</td>
									</tr>
								</tbody>
							</table>
							<table style={{ width: '100%' }}>
								<tbody>
									<tr align='center'>
										<td rowSpan={2} style={{ width: '9mm' }}>{t('№')}</td>
										<td rowSpan={2}>{t('Суралцагчийн нэр')}</td>
										<td colSpan={5}>{t('Явцын үнэлгээ')}</td>
										<td rowSpan={2} style={{ width: '32mm' }}>{t('Суралцагчийн гарын үсэг')}</td>
										<td colSpan={4}>{t('Шалгалтын үнэлгээ')}</td>
										<td rowSpan={2} style={{ width: '13mm' }}>{t('Нийт оноо')}</td>
										<td rowSpan={2} style={{ width: '17mm' }}>{t('Үсгэн үнэлгээ')}</td>
									</tr>
									<tr align='center'>
										<td style={{ width: '12mm' }}>{t('I')}</td>
										<td style={{ width: '12mm' }}>{t('II')}</td>
										<td style={{ width: '12mm' }}>{t('III')}</td>
										<td style={{ width: '12mm' }}>{t('IV')}</td>
										<td style={{ width: '19mm' }}>{t('Нийлбэр оноо')}</td>
										<td style={{ width: '12mm' }}>{t('I')}</td>
										<td style={{ width: '12mm' }}>{t('II')}</td>
										<td style={{ width: '12mm' }}>{t('III')}</td>
										<td style={{ width: '19mm' }}>{t('Нийлбэр оноо')}</td>
									</tr>
									{
										data_to_print?.lesson_students?.map((item, key) =>
											<tr key={key}>
												<td align='center'>{key + 1}</td>
												<td>{item.full_name}</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td>{item?.teacher_score}</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td>{item?.exam_score}</td>
												<td>{item?.total}</td>
												<td>{item?.letter}</td>
											</tr>
										)
									}
								</tbody>
							</table>
							<div className="etp_mt-1" style={{ paddingLeft: '2mm', paddingRight: '2mm', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
								<table style={{ width: '120mm' }}>
									<thead>
										<tr align='center'>
											<td rowSpan={2} style={{ width: '40mm' }}>{t('Нийт суралцагчдын тоо')}</td>
											<td colSpan={5}>{t('Үүнээс')}</td>
										</tr>
										<tr>
											<td>{t('Дүгнэсэн')}</td>
											<td>{t('Өвч')}</td>
											<td>{t('Чөл')}</td>
											<td>{t('Тас')}</td>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>&nbsp;</td>
											<td></td>
											<td></td>
											<td></td>
											<td></td>
										</tr>
									</tbody>
								</table>
								<table style={{ width: '160mm' }}>
									<thead align='center'>
										<tr>
											<td colSpan={2}>{t('Суралцагчдын ирц')}</td>
											<td colSpan={5}>{t('Үнэлгээ')}</td>
											<td rowSpan={2}>{t('Амжилт')}</td>
											<td rowSpan={2}>{t('Чанар')}</td>
										</tr>
										<tr>
											<td>{t('Орвол зохих')}</td>
											<td>{t('Орсон')}</td>
											<td>{t('A')}</td>
											<td>{t('B')}</td>
											<td>{t('C')}</td>
											<td>{t('D')}</td>
											<td>{t('F')}</td>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>{data_to_print?.total_students_count}</td>
											<td>{data_to_print?.scored_students_count}</td>
											<td>{data_to_print?.a_students_count}</td>
											<td>{data_to_print?.b_students_count}</td>
											<td>{data_to_print?.c_students_count}</td>
											<td>{data_to_print?.d_students_count}</td>
											<td>{data_to_print?.f_students_count}</td>
											<td>{data_to_print?.success}</td>
											<td>{data_to_print?.quality}</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div style={{ paddingLeft: '6mm', paddingRight: '6mm', width: '100%' }}>
								<table className="etp_mt-1 etp_borderless" style={{ width: '100%' }}>
									<tbody>
										<tr style={{ display: 'flex' }}>
											<td>{t('Тайлбар')}:</td>
											<td style={{ flexGrow: 1, borderBottom: '2px dotted black' }}></td>
										</tr>
									</tbody>
								</table>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
