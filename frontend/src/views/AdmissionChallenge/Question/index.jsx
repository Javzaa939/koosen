// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button, Modal, ModalHeader, ModalBody } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'
import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers';
import { getColumnsLesson } from './helpers2';
import EQuestions from './EQuestions'

const Question = () => {

	var values = {
		position_id: '',
		department_id: ''
	}

	const { t } = useTranslation()

	// ** Hook
	const { control, setValue, formState: { errors } } = useForm({});

	const [step, setStep] = useState(1);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10)

	// Эрэмбэлэлт
	const [sortField, setSort] = useState('')
	const [searchValue, setSearchValue] = useState("");

	const { school_id } = useContext(SchoolContext)

	const [datas, setDatas] = useState([]);
	const [department, setDepartmentData] = useState([]);
	const [lesson_data, setLessonDatas] = useState([])
	const [position_option, setOrgPositions] = useState([]);
	const [selected_values, setSelectValue] = useState(values);

	const [teacher, setTeacher] = useState(0) // 0 means all teachers
	const [teacher_name, setTeacherName] = useState('')
	const [title_id, setTitleId] = useState('')

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(1)
	const [total_count2, setTotalCount2] = useState(2)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({});

	// Api
	const teacherApi = useApi().challenge
	const departmentApi = useApi().hrms.department
	const positionApi = useApi().hrms.position


	/* Жагсаалтын дата сургууль, тэнхим авах функц */
	async function getDatas() {
		const page_count = Math.ceil(total_count / rowsPerPage)

		if (page_count < currentPage && page_count != 0) {
			setCurrentPage(page_count)
		}
		const { success, data } = await allFetch(teacherApi.getTeacherList(rowsPerPage, currentPage, sortField, searchValue, school_id, selected_values.department_id, selected_values.position_id))
		if (success) {
			setTotalCount(data?.count)
			setDatas(data?.results)
		}
	}

	async function getDatas2(teacher) {
		const page_count = Math.ceil(total_count / rowsPerPage)

		if (page_count < currentPage && page_count != 0) {
			setCurrentPage(page_count)
		}
		const { success, data } = await allFetch(teacherApi.getTeacherLessonList(rowsPerPage, currentPage, sortField, searchValue, teacher))
		if (success) {
			setTotalCount2(data?.count)
			setTeacherName(data?.name)
			setLessonDatas(data?.data)
		}
	}

	/* Тэнхим дата авах функц */
	async function getDepartmentOption() {
		const { success, data } = await fetchData(departmentApi.getSelectSchool())
		if (success) {
			setDepartmentData(data)
		}
	}

	/* Албан тушаал дата авах функц */
	async function getPositionData() {
		const { success, data } = await fetchData(positionApi.get())
		if (success) {
			setOrgPositions(data)
		}
	}

	// stepper
	const handleNext = (row) => {
		setTeacher(row?.id)
		setStep(prev => prev + 1)
	}
	const handleDetail = (id) => {
		setTitleId(id)
		if (title_id) {
			setStep(prev => prev + 1)

		}
	}

	const handlePrevious = () => {
		setStep(prev => prev - 1)
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
	}, [sortField, searchValue, currentPage, school_id])
	useEffect(() => {
		if (teacher) {
			getDatas2(teacher);
		}
	}, [teacher])

	useEffect(() => {
		if (selected_values.department_id || selected_values.position_id) {
			getDatas();
		}
	}, [selected_values])

	useEffect(() => {
		getPositionData()
		getDepartmentOption()
	}, [])

	// ** Function to handle filter
	const handleFilter = e => {
		const value = e.target.value.trimStart();
		setSearchValue(value)
	}

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	function handleSort(column, sort) {
		if (sort === 'asc') {
			setSort(column.header)
		} else {
			setSort('-' + column.header)
		}
	}

	return (
		<EQuestions teacher_id={teacher} title_id={title_id} />
	)
}
export default Question;
