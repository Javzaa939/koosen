import React from 'react';

import { Card, CardHeader, CardTitle, Button } from 'reactstrap'

import { Printer } from 'react-feather';

import { useTranslation } from 'react-i18next';

import { printTableBody } from "@utils"

import TableComponent from './TableComponent';

const LessonSchedule = () => {

    const { t } = useTranslation()

    function handlerPrint() {
		const mywindow = window.open("", "", "height=600,width=800")
		mywindow.document.write("<html><head><title>АШУҮИС</title>")

		//Print the Table CSS.
		mywindow.document.write('<style type = "text/css">')
		mywindow.document.write('.test_bg{height: fit-content} .border_lekts{border: 1px solid #8a8a8a}')
		mywindow.document.write(printTableBody)
		mywindow.document.write("</style>")
		mywindow.document.write("</head>")

		//Print the DIV contents i.e. the HTML Table.
		var divContents = document.getElementById("lessonSchedule").innerHTML
		mywindow.document.write(divContents)

		mywindow.document.write("</html>")
		mywindow.document.close()
		mywindow.print()
	}

    return (
        <Card>
            <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
                <CardTitle tag="h4">{t('Хичээлийн хуваарь')}</CardTitle>
                <div className='d-flex flex-wrap mt-md-0 mt-1'>
                    <iframe id="ifmcontentstoprint" style={{
                        height: '0px',
                        width: '0px',
                        position: 'absolute'
                    }}>
                    </iframe>
                    <Button
                        color='primary'
                        onClick={e => handlerPrint()}
                    >
                        <Printer size={15} />
                        <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                    </Button>
                </div>
            </CardHeader>
            <div id="lessonSchedule" className='w-100'>
                <div className='print_title'>
                    <h2>Хичээлийн хуваарь</h2>
                </div>
                <TableComponent />
            </div>
        </Card>
    );
};

export default LessonSchedule;
