
import React,{useState, useEffect} from "react";
import {
    Row,
    Label,
    Col,
	Input,
	Spinner
} from "reactstrap";

import useApi from "@hooks/useApi"

import { ChevronRight, Square, CheckSquare, MinusSquare,  } from "react-feather"
import TreeView, { flattenTree } from 'react-accessible-treeview'

import { t } from "i18next"
import useLoader from "@hooks/useLoader"

import classnames from "classnames";
import "./checkbox.css"

function Teacher({ onChosenScopeChange, editData}) {

	const [isAll, setIsAll] = useState(false)
	const [ datas, setDatas ] = useState([])
	const [selectedValue, setSelectedValue] = useState('')
	const [formatData, setFormatData] = useState({})

	const { isLoading, fetchData } = useLoader({});

	const surveyApi = useApi().survey.surveyrange;

	async function getDatas() {
		const { success, data: apiResult } = await fetchData(surveyApi.get({ types: 'teacher', selectedValue: selectedValue }));
		if (success) {
			const data = apiResult?.results
			var formattedData = {}
			if (selectedValue === 'is_org') {
				formattedData = {
					name: "Бүгд",
					id: 'all',
					children: data.map((citem1) => ({
						name: citem1.name,
						id: `school${citem1.id}`,
						children: citem1.children ? citem1.children.map((citem2) => ({
							name: citem2.name,
							id: `subschool${citem2.id}`,
							children: citem2.children ? citem2.children.map((citem3) => ({
								name: citem3.name,
								id: citem3.id
							})) : []
						})) : []
					})),
				};
			} else if (selectedValue === 'is_dep') {
				formattedData = {
					name: "Бүгд",
					id: 'all',
					children: data.map((citem1) => ({
						name: citem1.name,
						id: `subschool${citem1.id}`,
						children: citem1.children ? citem1.children.map((citem2) => ({
							name: citem2.name,
							id: citem2.id,
						})) : []
					})),
				};
			}
			setFormatData(formattedData)
			setDatas(data);
		}
	}

	useEffect(() => {
		getDatas();
	}, [
		selectedValue
	]);

	const handleTreeSelect =(selectedItems) => {
		var selectedIds = []
		selectedItems?.treeState?.selectedIds.forEach(select_id => {
				if (typeof select_id === 'number') selectedIds.push(select_id)
			}
		);

		const newData = {'selected_ids': selectedIds, 'is_teacher': true};
		onChosenScopeChange(newData);
	}

	return(
		<Row>
			<Col md={6} sx={12}>
				<div className='added-cards mb-2'>
					<div className={classnames('cardMaster rounded border p-1')}>
						<p>Хамрах хүрээ</p>
						<div className="mb-1">
							<Input
								type='checkbox'
								className="me-1"
								name={'all'}
								checked={isAll}
								onChange={(e) => {setIsAll(e.target.checked), onChosenScopeChange({'isAllTeacher': true, 'is_teacher': true})}}
							/>
							<Label className='form-check-label' for={'all'}>
								{'Бүх багш нар'}
							</Label>
						</div>

						{
							!isAll
							&&
							<>
								<div className="mb-1">
									<Input
										type='checkbox'
										className="me-1"
										id='is_org'
										name={'is_org'}
										checked={selectedValue==='is_org'}
										onChange={(e) => setSelectedValue(e.target.name)}
									/>
									<Label className='form-check-label' for={'is_org'}>
										{'Салбар сургууль'}
									</Label>
								</div>
								<div className="mb-1">
									<Input
										type='checkbox'
										className="me-1"
										name={'is_dep'}
										id={'is_dep'}
										checked={selectedValue==='is_dep'}
										onChange={(e) => setSelectedValue(e.target.name)}
									/>
									<Label className='form-check-label' for={'is_dep'}>
										{'Тэнхим'}
									</Label>
								</div>
							</>
						}
					</div>
				</div>
			</Col>

			<Col md={6} sx={12}>
				{isLoading && (
					<div className="suspense-loader">
						<Spinner size="bg" />
						<span className="ms-50">{t("Түр хүлээнэ үү...")}</span>
					</div>
				)}
				<div>
					<div className={classnames('cardMaster rounded border p-1')}>
						<div className="checkbox">
							<TreeView
								data={flattenTree(formatData)}
								aria-label="Checkbox tree"
								multiSelect
								propagateSelect
								propagateSelectUpwards
								togglableSelect
								onSelect={handleTreeSelect}
								nodeRenderer={({
									element,
									isBranch,
									isExpanded,
									isSelected,
									isHalfSelected,
									getNodeProps,
									level,
									handleSelect,
									handleExpand
								}) => {
									return (
									<div
										{...getNodeProps({ onClick: handleExpand })}
										style={{ marginLeft: 40 * (level - 1) }}
									>
										{isBranch && <ArrowIcon  isOpen={isExpanded} />}
										<CheckBoxIcon
											className="checkbox-icon"
											size={20}
											onClick={
												e => {
													handleSelect(e);
													e.stopPropagation();
												}
											}
											variant={
												isHalfSelected ? "some" : isSelected ? "all" : "none"
											}
										/>
										<span className="name">{element.name}</span>
									</div>
									);
								}}
							/>
						</div>
					</div>
				</div>
			</Col>
		</Row>
    )
}

// treeview ийн Icon
const ArrowIcon = ({ isOpen, className }) => {
	const baseClass = "arrow";
	const classes = classnames(
	  baseClass,
	  { [`${baseClass}--closed`]: !isOpen },
	  { [`${baseClass}--open`]: isOpen },
	  className
	);
	return <ChevronRight className={classes}/>;
  };
  const CheckBoxIcon = ({ variant, ...rest }) => {
	switch (variant) {
	  case "all":
		return <CheckSquare size={15}{...rest} />;
	  case "none":
		return <Square size={15}{...rest} />;
	  case "some":
		return <MinusSquare size={15}{...rest} />;
	  default:
		return null;
	}
  };

export default Teacher;