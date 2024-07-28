import { utils, writeFile } from 'xlsx-js-style';

export function downloadIQExcelReport(datas) {
    const header = [
        'д/д', 'Овог', 'Нэр', 'Регистр',
        ...Array.from({ length: datas.question }, (_, i) => `Асуулт ${i + 1}`),
        'Нийт авсан оноо'
    ];

    const mainData = datas?.user_data.map((data, index) => {
        const answers = data?.scores || [];
        const answerColumns = Array.from({ length: datas.question }, (_, i) => {
            // Хариулаагүй байвал хоосон
            return answers[i] === null ? '' : answers[i];
        });

        return [
            index + 1,
            data?.last_name || '',
            data?.first_name || '',
            data?.register || '',
            ...answerColumns,
            data?.total_score || ''
        ];
    });

    const worksheet = utils.aoa_to_sheet([header, ...mainData]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Report");

    const tableHeaderStyle = {
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        },
        font: { sz: 12, bold: true },
        alignment: {
            wrapText: true,
            horizontal: 'center',
            vertical: 'center'
        },
        fill: { fgColor: { rgb: 'D0CECE' } }
    };

    const numberCellStyle = {
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font: { sz: 11 }
    };

    const headerRow = 0;
    const numCols = header.length;

    for (let col = 0; col < numCols; col++) {
        const cellAddress = utils.encode_cell({ r: headerRow, c: col });
        if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = {};
        }
        worksheet[cellAddress].s = tableHeaderStyle;
    }

    for (let row = 1; row < mainData.length + 1; row++) {
        for (let col = 0; col < numCols; col++) {
            const cellAddress = utils.encode_cell({ r: row, c: col });
            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = {};
            }
            worksheet[cellAddress].s = numberCellStyle;
        }
    }

    const colWidth = Array.from({ length: numCols }, (_, idx) => ({
        wch: idx === 1 ? 15 : 10
    }));

    worksheet["!cols"] = colWidth;

    worksheet["!rows"] = [
        { hpx: 35 },
        { hpx: 30 }
    ];

    // Write file
    writeFile(workbook, "IQ_Test_үр_дүн.xlsx", { compression: true });
}
