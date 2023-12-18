import { Badge,UncontrolledTooltip } from 'reactstrap';
import { Plus } from 'react-feather'
import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count,) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t('Багш')}`,
			selector: (row) => (<span>{row?.teacher?.full_name}</span>),
			center: true
		},
		{
			name: `${t('Салбар сургууль')}`,
			selector: (row) => (<span>{`${row?.school?.name}`} </span>),
			center: true,
			width: '300px'
		},
		{
			name: `${'Лекц'}`,
			selector: (row) => (
				<span>{row?.lekts}</span>
			),
			center: true
		},
		{
			name: `${'Сем'}`,
			selector: (row) => (
				<span>{row?.seminar}</span>
			),
			center: true
		},
		{
			name: `${'Лаб'}`,
			selector: (row) => (
				<span>{row?.lab}</span>
			),
			center: true
		},
		{
			name: `${'Нийт'}`,
			selector: (row) => (row?.lekts + row?.seminar + row?.lab),
			center: true
		},
	]
    return columns

}


export function getColumnsDetail(currentPage, rowsPerPage, total_count, addModal) {

	const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${'Сар өдөр'}`,
			selector: (row) => (<span>{row?.day}</span>),
			center: true
		},
		{
			name: `${'Хичээлийн сэдэв'}`,
			selector: (row) => (
				<span title={row?.title}>{row?.lesson_title}</span>
			),
			width: "400px",
			center: true
		},
		{
			name: `${'Сургалтын хэлбэр'}`,
			selector: (row) => row?.lesson_type,
			center: true,
        },
		{
			name: `${t('Өдөр')}`,
			selector: (row) => row?.day_time,
			center: true,
        },
		{
			name: `${t('Цаг')}`,
			selector: (row) => row?.time,
			center: true,
        },
		{
			name: `${'Оюутны тоо'}`,
			selector: (row) => row?.student_count,
			center: true
        },
		{
			name: `${'Анги бүлэг'}`,
			selector: (row) => (
				<span title={row?.group_names}>{row?.group_names}</span>
			),
			center: true,
			width: '400px'
        },
	]

	return columns

}
