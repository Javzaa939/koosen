import React from 'react';

import { Card, CardHeader, CardTitle, Button } from 'reactstrap'

import { Printer } from 'react-feather';

import { useTranslation } from 'react-i18next';

import { printTableBody } from "@utils"

import TableComponent from './TableComponent';

const ExaminationSchedule = () => {

    return (
        <Card>
            <p className='p-5 fs-4 fw-bolder' >Тун удахгүй....</p>
        </Card>
    )

    const { t } = useTranslation()

    function handlerPrint() {
		const mywindow = window.open("", "", "height=600,width=800")
		mywindow.document.write("<html><head><title>АШУҮИС</title>")

		//Print the Table CSS.
		mywindow.document.write('<style type = "text/css">')
		mywindow.document.write(printTableBody)
		mywindow.document.write("</style>")
		mywindow.document.write("</head>")

		//Print the DIV contents i.e. the HTML Table.
		var divContents = document.getElementById("ExaminationSchedule").innerHTML
		mywindow.document.write(divContents)

		mywindow.document.write("</html>")
		mywindow.document.close()
		mywindow.print()
	}

    return (
        <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
                <CardTitle tag="h4">{t('Шалгалтын хуваарь')}</CardTitle>
                <div className='d-flex flex-wrap mt-md-0 mt-50'>
                    <Button
                        color='primary'
                        onClick={e => handlerPrint()}
                    >
                        <Printer size={15} />
                        <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                    </Button>
                </div>
            </CardHeader>
            <div id="ExaminationSchedule">
                <TableComponent />
            </div>
        </Card>
    );
};

export default ExaminationSchedule;
