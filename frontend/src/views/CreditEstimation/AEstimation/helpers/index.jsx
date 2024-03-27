import { Badge,UncontrolledTooltip } from 'reactstrap';
import { Plus } from 'react-feather'
import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns () {

    const columns = [
		{
			name: `${t('Багш')}`,
			selector: (row) => (<span>{row?.teacher?.full_name}</span>),
			center: true
		},
		{
			name: `${t('Багш/норм')}`,
			selector: (row) => (<span>{`${row?.teacher_norm ? row?.teacher_norm : ''} `} </span>),
			center: true
		},
		{
			name: `${'Хавар хичээл/тоо'}`,
			selector: (row) => (
				<span>{row?.spring_lesson}</span>
			),
			center: true
		},
		{
			name: `${'Хавар заасан цаг'}`,
			selector: (row) => (
				<span>{row?.spring_kredit}</span>
			),
			center: true
		},
		{
			name: `${'Намар хичээл/тоо'}`,
			selector: (row) => (
				<span>{row?.autumn_lesson}</span>
			),
			center: true
		},
		{
			name: `${'Намар заасан цаг'}`,
			selector: (row) => (
				<span>{row?.autumn_kredit}</span>
			),
			center: true
		},
		{
			name: `${'Танхим гүйц/кр'}`,
			selector: (row) => (
				<span>{row?.exec_kr}</span>
			),
			center: true
		},
		{
			name: `${'Танхим бус гүйц/кр '}`,
			selector: (row) => row?.not_chamber_exec_kr,
			center: true
        },
		{
			name: `${'Нийт гүйц/кр '}`,
			selector: (row) => (row?.exec_kr + row?.not_chamber_exec_kr),
			center: true
        },
		{
			name: `${'Зөрүү гүйц/кр '}`,
			selector: (row) => ((row?.exec_kr + row?.not_chamber_exec_kr) - row?.teacher_norm).toFixed(2),
			center: true
        },
	]
    return columns

}


export function getColumnsDetail(addModal) {

    const columns = [
		{
			name: "№",
			selector: (row, index) => index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${'Улирал'}`,
			selector: (row) => row?.lesson_season?.season_name,
			center: true
        },
		{
			name: `${'Хичээл'}`,
			selector: (row) => (<span title={row?.lesson?.full_name}>{row?.lesson?.full_name}</span>),
			width: "270px",
			center: true
		},
		{
			name: `${'Хичээл орсон анги'}`,
			selector: (row) => (
				<span title={row?.group_names}>{row?.group_names}</span>
			),
			width: "300px",
			center: true
		},
		{
			name: `${'Оюутны тоо'}`,
			selector: (row) => row?.st_count,
			center: true
        },
		{
			name: `${('Лк цаг')}`,
			selector: (row) => row?.lecture_kr,
			center: true
        },
		{
			name: `${'Сем/цаг'}`,
			selector: (row) => row?.seminar_kr,
			center: true
        },
		{
			name: `${'Нийт цаг'}`,
			selector: (row) => row?.total_kr,
			center: true
        },
        {
			name: `${'Танхим гүйц/кр'}`,
			selector: (row) => row?.exec_kr,
			center: true
        },
		{
			name: `${'Танхим бус кр'}`,
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<span >{row?.not_chamber_kr}</span>
					<a role="button" onClick={() => { addModal(row.id)}} id={`chamberAdd${row?.id}`} className="mx-1">
						<Badge color="light-primary" pill><Plus width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`chamberAdd${row.id}`}>Танхим бус цаг нэмэх</UncontrolledTooltip>
				</div>
			),
        },
	]

	return columns

}
