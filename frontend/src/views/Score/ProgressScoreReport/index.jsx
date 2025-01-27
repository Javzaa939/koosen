import React, { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";
import { Col, Row, Card, Nav, NavItem, NavLink, TabContent } from "reactstrap";

import SummaryCount from "./components/SummaryCount";
import SeasonExamReport from './tabs/SeasonExamReport';
import ReExamReport from './tabs/ReExamReport';

export default function ProgressScoreReport() {
	const { t } = useTranslation()

	const [activeTab, setActiveTab] = useState(0)
	const [component, setComponent] = useState('')

	const button_list = [
		{
			name: t('Улирлын шалгалт'),
			id: 0,
			icon: 'Activity',
			component: <SeasonExamReport key={0} />
		},
		{
			name: t('Давтан шалгалт'),
			icon: 'Activity',
			id: 1,
			component: <ReExamReport key={1} />
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
	}, [activeTab])

	return (
		<>
			<Row>
				<Col sm={6} md={5} lg={4}>
					<SummaryCount
						title={t('Давхардсан тоогоор нийт шалгалтад хамрагдсан суралцагчийн тоо')}
						count={123}
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
