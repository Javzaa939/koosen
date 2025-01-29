import React, { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";
import { Col, Row, Card, Nav, NavItem, NavLink, TabContent } from "reactstrap";

import SummaryCount from "./components/SummaryCount";
import SemesterExamReport from './tabs/SemesterExamReport';
import useGeneralData from './utils';

export default function Report() {
	const { t } = useTranslation()

	const [activeTab, setActiveTab] = useState(0)
	const [component, setComponent] = useState(<></>)

	const { datas, united_score_ranges, isLoading, level2_key1, level2_key2, main_school_name } = useGeneralData();

	const button_list = [
		{
			name: t('Улирлын шалгалт'),
			id: 0,
			icon: 'Activity',
			component: <SemesterExamReport key={0} data={datas} scoreRanges={united_score_ranges} isLoading={isLoading} level2_key1={level2_key1} level2_key2={level2_key2} main_school_name={main_school_name} />
		},
		{
			name: t('Давтан шалгалт'),
			icon: 'Activity',
			id: 1,
			component: <SemesterExamReport key={1} data={datas} scoreRanges={united_score_ranges} isLoading={isLoading} level2_key1={level2_key1} level2_key2={level2_key2} main_school_name={main_school_name} examType={'reExam'} />
		},
	]


	const toggleTab = tab => {
		if (activeTab !== tab) {
			setActiveTab(tab)
		}
	}

	useEffect(() => {
		var check = button_list.find(menus => menus.id == activeTab)
		setComponent(check.component)
	}, [activeTab, datas])

	return (
		<>
			<Row>
				<Col sm={6} md={5} lg={4}>
					<SummaryCount
						title={t('Давхардсан тоогоор нийт шалгалтад хамрагдсан суралцагчийн тоо')}
						count={datas.filter(item => item.score_type_name === '30 онооны шалгалт').length}
					/>
				</Col>
			</Row>
			<Card>
				<Nav tabs>
					{button_list.map(button => {
						return (
							<NavItem key={button?.id}>
								<NavLink active={activeTab === button?.id} onClick={() => toggleTab(button?.id)}>
									<span className='fw-bold'>{button?.name}</span>
								</NavLink>
							</NavItem>
						)
					})}
				</Nav>
				<TabContent className='py-50' activeTab={activeTab} >
					{
						component && component
					}
				</TabContent>
			</Card>
		</>
	)
}
