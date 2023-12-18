import React, { Fragment, useState, useEffect, useContext } from "react";

import {
	Row,
	CardHeader,
	Card,
	CardTitle,
	Button,
	Col,
	Input,
	Spinner,
	Badge
} from "reactstrap";

import { Search, AlertCircle } from "react-feather";
import { useTranslation } from "react-i18next";


import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";


import ListC from "./ListC";
import "./style.css"

function SurveyResults() {

	const { t } = useTranslation();

	const [datas, setDatas] = useState([]);

	const [searchValue, setSearchValue ] = useState('');

	// Loader
	const { isLoading, fetchData } = useLoader({});

	const surveyAPI = useApi().survey;

	// Search input нэмээд search value дамжуулна
	async function getDatas() {
		const { success, data } = await fetchData(surveyAPI.getList(searchValue));
		if (success) {
			setDatas(data);
		}
	}

	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

	async function handleSearch() {
        getDatas()
    }

	useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

	function NoDataComp(){
		if (datas.length > 0) { return(
			<div className="cardlist ps-3 p">
				<ListC className='flexone' datas={datas}/>
			</div>)}
		else { return(
			// <div className="d-flex justify-content-center align-items-center customheight">
			// 	<Badge color="light-secondary" className="p-1 rounded-5 text-wrap"> <AlertCircle className="mx-1"/> Өгөгдөл байхгүй байна</Badge>
			// </div>
			<div className="my-2 d-flex justify-content-center align-items-center">
				<h5>{t('Өгөгдөл байхгүй байна')}</h5>
			</div>
		) }
}

	return (
		<Fragment>
			{isLoading && (
				<div className="suspense-loader">
					<Spinner size="bg" />
					<span className="ms-50">{t("Түр хүлээнэ үү...")}</span>
				</div>
			)}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t("Судалгааны үр дүн")}</CardTitle>
				</CardHeader>
					<Row className="justify-content-between mx-0 mt-1" sm={12}>
						<Col className='d-flex align-items-end mobile-datatable-search '>
							<Input
								className='dataTable-filter mb-50'
								type='text'
								bsSize='sm'
								id='search-input'
								placeholder={t("Хайх")}
								value={searchValue}
								onChange={handleFilter}
								onKeyPress={e => e.key === 'Enter' && handleSearch()}
							/>
							<Button
								size='sm'
								className='ms-50 mb-50'
								color='primary'
								onClick={handleSearch}
							>
								<Search size={15} />
								<span className='align-middle ms-50'></span>
							</Button>
						</Col>
					</Row>
				<NoDataComp />

			</Card>
		</Fragment>
	);
};

export default SurveyResults;

