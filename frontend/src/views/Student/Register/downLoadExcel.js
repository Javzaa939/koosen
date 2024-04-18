import * as excelJs from 'exceljs';

const GENDER_LIST=['Эрэгтэй', 'Эмэгтэй']

export const downloadTemplate = async (department_option, groupOption) => {

    const workbook = new excelJs.Workbook();

    const ws = workbook.addWorksheet('Оюутны бүртгэл', {
        properties: {
            tabColor:{
                argb:'071a52'
            },
            defaultRowHeight: 35
        },
        views:[{state: 'frozen', ySplit:1}]
    });

    const options_dep = department_option.map((opt) => `${opt?.name}`)
    const options_group = groupOption.map((opt) => opt?.name)
    const genderOpts = GENDER_LIST.map((opt) => opt)

    var payment_type = [
        'Засгийн газар хоорондын тэтгэлэг',
        'Төрөөс үзүүлэх тэтгэлэг',
        'Төрөөс үзүүлэх буцалтгүй тусламж',
        'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг',
        'Тухайн сургуулийн тэтгэлэг',
        'Хувийн зардал',
        'Бусад'
    ]

    const formattedDeps = options_dep.map(option => `"${option}"`).join(',');
    const formattedPayment = payment_type.map(option => `"${option}"`).join(',');
    ws.addRow(['Оюутны код', 'Хөтөлбөрийн баг', 'Анги', 'РД', 'Ургийн овог', 'Эцэг эхийн нэр', 'Эцэг эхийн нэр англи', 'Өөрийн нэр', 'Өөрийн нэр англи', 'Утасны дугаар', 'Хүйс', 'Яс үндэс', 'Бүртгэлийн байдал', 'Төлбөр төлөлт']);

    ws.columns.map((col, index) => (col.width = 18));

    // @ts-ignore
    ws.dataValidations.add('B2:B99999', {
        type: 'list',
        allowBlank: false,
        formulae: [formattedDeps],
    });

    // @ts-ignore
    ws.dataValidations.add('C2:C99999', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${options_group.join(',')}"`],
    });

    // @ts-ignore
    ws.dataValidations.add('K2:K99999', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${genderOpts.join(',')}"`],
    });

    // @ts-ignore
    ws.dataValidations.add('M2:M99999', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${['Суралцаж буй', 'Төгссөн'].join(',')}"`],
    });

    // @ts-ignore
    ws.dataValidations.add('N2:N99999', {
        type: 'list',
        allowBlank: false,
        formulae: [formattedPayment],
    });

    const row = ws.getRow(1)

    for (let i = 1; i <= 14; i++) {
        const cell = row.getCell(i);
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '071a52' }
        };
        cell.border = {
            top: {
                style:'thin',
                color: { argb: 'ffffffff' }
            },
            bottom: {
                style:'thin',
                color: { argb: 'ffffffff' }
            },
            right: {
                style:'thin',
                color: { argb: 'ffffffff' }
            },
            left: {
                style:'thin',
                color: { argb: 'ffffffff' }
            },
        }
        cell.alignment = {
            horizontal: 'left',
            vertical: 'middle',
            wrapText: true
        };
    }

    row.height = 30
    ws.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            cell.font = {
                name: 'Verdana',
                size: 10,
                bold: true
            };
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true
            };
        });
    });

    const excelBlob = await workbook.xlsx.writeBuffer();
    const excelUrl = URL.createObjectURL(
        new Blob([excelBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    );

    const link = document.createElement('a');
    link.href = excelUrl;

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    link.download = `oyutan-zagvar-${formattedDate}.xlsx`;
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(excelUrl);
    document.body.removeChild(link);

};