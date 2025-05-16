import { Card, CardHeader, CardTitle, Button } from 'reactstrap'
import { useTranslation } from 'react-i18next';
import { printTableBody } from "@utils"
import { Printer } from 'react-feather';

import TableComponent from './TableComponent';
import React from 'react';


const ExamSchedule = () => {

    const { t } = useTranslation()

    function handlerPrint() {
		const mywindow = window.open("", "", "height=600,width=800")
		mywindow.document.write("<html><head><title>Рояаль Олон Улсын Их Сургууль</title>")

		//Print the Table CSS.
		mywindow.document.write('<style type = "text/css">')
		mywindow.document.write(printTableBody)
		mywindow.document.write("</style>")
		mywindow.document.write("</head>")

		//Print the DIV contents i.e. the HTML Table.
		var divContents = document.getElementById("ExamSchedule").innerHTML
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
            <div id="ExamSchedule">
                <TableComponent />
            </div>
        </Card>
    );
};

export default ExamSchedule;
