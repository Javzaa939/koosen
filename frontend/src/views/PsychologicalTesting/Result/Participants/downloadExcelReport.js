import {utils, writeFile} from 'xlsx-js-style'
import { dass21Sheet } from './dass21Sheet'
import { motivationSheet } from './motivationSheet'
import { prognozSheet } from './prognozSheet'

export function downloadExcelReport(datas){
    const header = Array.from({length: 2},(_, hidx) => {
        return(
            {
                'д/д':'',
                'Цол, овог, нэр':'',
                'DASS21 | Депресс | Оноо':'',
                'DASS21 | Депресс | Түвшин':'',
                'DASS21 | Түгшүүр | Оноо':'',
                'DASS21 | Түгшүүр | Түгшүүр':'',
                'DASS21 | Стресс | Оноо':'',
                'DASS21 | Стресс | Стресс':'',
                'Сурах сэдэл | Мэдлэг олж авах':'',
                'Сурах сэдэл | Мэргэжлийн ур чадвар':'',
                'Сурах сэдэл | Диплом авах':'',
                'Мэдрэл сэтгэцийн тогтвортой байдлын түвшин | Үнэн худал':'',
                'Мэдрэл сэтгэцийн тогтвортой байдлын түвшин | Оноо':'',
                'Мэдрэл сэтгэцийн тогтвортой байдлын түвшин | Түвшин':'',
            }
        )
    })

    const mainData = datas?.overall_datas?.map((data, index) => {
        return(
            {
                'д/д':index + 1,
                'Цол, овог, нэр':`${data?.last_name} ${data?.first_name}, ${data?.register}`,
                'DASS21 | Депресс | Оноо':data?.depression_score,
                'DASS21 | Депресс | Түвшин':data?.depression,
                'DASS21 | Түгшүүр | Оноо':data?.anxiety_score,
                'DASS21 | Түгшүүр | Түгшүүр':data?.anxiety,
                'DASS21 | Стресс | Оноо':data?.stress_score,
                'DASS21 | Стресс | Стресс':data?.stress,
                'Сурах сэдэл | Мэдлэг олж авах':data?.knowledge_score,
                'Сурах сэдэл | Мэргэжлийн ур чадвар':data?.skill_score,
                'Сурах сэдэл | Диплом авах':data?.diplom_score,
                'Мэдрэл сэтгэцийн тогтвортой байдлын түвшин | Үнэн худал':data?.true_false_score,
                'Мэдрэл сэтгэцийн тогтвортой байдлын түвшин | Оноо':data?.mental_score,
                'Мэдрэл сэтгэцийн тогтвортой байдлын түвшин | Түвшин':data?.overall_review,
            }
        )
    })

    const merge = [
        ...header,
        ...mainData
    ]

    const worksheet = utils.json_to_sheet(merge);
    const workbook = utils.book_new();

    utils.book_append_sheet(workbook, worksheet, "Нийт")

    const staticCell1 = [
        'д/д',
        'Цол, овог, нэр',
        'DASS21',
        '',
        '',
        '',
        '',
        '',
        'Сурах сэдэл',
        '',
        '',
        'Мэдрэл сэтгэцийн тогтвортой байдлын түвшин',
        '',
        '',
    ]

    const staticCell2 = [
        '',
        '',
        'Депресс',
        '',
        'Түгшүүр',
        '',
        'Стресс',
        '',
        'Мэдлэг олж авах',
        'Мэргэжлийн ур чадвар',
        'Диплом авах',
        '',
        '',
        '',
    ]

    const staticCell3 = [
        '',
        '',
        'Оноо',
        'Түвшин',
        'Оноо',
        'Түгшүүр',
        'Оноо',
        'Стресс',
        '',
        '',
        '',
        'Үнэн худал',
        'Оноо',
        'Түвшин',
    ]

    utils.sheet_add_aoa(worksheet, [staticCell1], {origin: "A1"});
    utils.sheet_add_aoa(worksheet, [staticCell2], {origin: "A2"});
    utils.sheet_add_aoa(worksheet, [staticCell3], {origin: "A3"});

    const tableHeaderStyle = {
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        },
        font: {
            sz: 11
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
            vertical: 'center',
        },
        fill: {
            fgColor: { rgb: 'FFFFFF' }
        }
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
        font:{
            sz:11
        }
    };

    const COLUMN_LENGTH = 15

    const startRow = 0;
    const endRow = header.length;
    const startCol = 0;
    const endCol = COLUMN_LENGTH;

    for (let row = startRow; row <= endRow; row++){
        for (let col = startCol; col <= endCol; col++){
            const cellAddress = utils.encode_cell({r: row, c: col});

            if(!worksheet[cellAddress]){
                worksheet[cellAddress] = {};
            }

            worksheet[cellAddress].s = tableHeaderStyle
        }
    }

    const styleRow = endRow + 1;
    const sendRow = endRow + mainData.length + 4;
    const styleCol = 0;
    const sendCol = COLUMN_LENGTH;

    for (let row = styleRow; row <= sendRow; row++) {
        for (let col = styleCol; col <= sendCol; col++) {
        const cellNum = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellNum]) {
                worksheet[cellNum] = {};
            }

            worksheet[cellNum].s = numberCellStyle;
        }
    }

    const colWidth = Array.from({length: 15}, (_, idx) => {
        return(
            {
                wch:(
                    idx === 1 ||
                    idx === 3 ||
                    idx === 5 ||
                    idx === 6 ||
                    idx === 7 ||
                    idx === 8 ||
                    idx === 9 ||
                    idx === 10 ||
                    idx === 11
                ) ? 20 : 10
            }
        )
    })

    worksheet["!cols"] = [
        {wch: 5},
        {wch: 50},
        ...colWidth
    ]

    worksheet["!rows"] = [
        { hpx: 35 },
        { hpx: 30 },
        { hpx: 40 },
    ];

    worksheet['!merges'] = [
        {
            s: { r: 0, c: 0 },
            e: { r: 2, c: 0 }
        },
        {
            s: { r: 0, c: 1 },
            e: { r: 2, c: 1 }
        },

        // DASS21
        {
            s: { r: 0, c: 2 },
            e: { r: 0, c: 7 }
        },
        {
            s: { r: 1, c: 2 },
            e: { r: 1, c: 3 }
        },
        {
            s: { r: 1, c: 4 },
            e: { r: 1, c: 5 }
        },
        {
            s: { r: 1, c: 6 },
            e: { r: 1, c: 7 }
        },

        // Сурах сэдэл
        {
            s: { r: 0, c: 8 },
            e: { r: 0, c: 10 }
        },
        {
            s: { r: 1, c: 8 },
            e: { r: 2, c: 8 }
        },
        {
            s: { r: 1, c: 9 },
            e: { r: 2, c: 9 }
        },
        {
            s: { r: 1, c: 10 },
            e: { r: 2, c: 10 }
        },


        // Мэдрэл сэтгэцийн тогтвортой байдлын түвшин
        {
            s: { r: 0, c: 11 },
            e: { r: 1, c: 13 }
        },
        {
            s: { r: 2, c: 11 },
            e: { r: 2, c: 11 }
        },
        {
            s: { r: 2, c: 12 },
            e: { r: 2, c: 12 }
        },
        {
            s: { r: 2, c: 13 },
            e: { r: 2, c: 13 }
        },
    ]

    const additionalData = []

    // DASS21 шинэ sheet
    const dass21NewSheet = dass21Sheet(datas?.dass21_datas);
    utils.book_append_sheet(workbook, dass21NewSheet, "DASS21");

    // Сурах сэдэл шинэ sheet
    const motivationNewSheet = motivationSheet(datas?.motivation_datas);
    utils.book_append_sheet(workbook, motivationNewSheet, "Сурах сэдэл");

    // prognozSheet
    const prognozSheetNewSheet = prognozSheet(datas?.prognoz_datas);
    utils.book_append_sheet(workbook, prognozSheetNewSheet, "Прогноз");

    writeFile(workbook, "Сэтгэлзүйн_Шалгалт_Үр_Дүн.xlsx", { compression: true });
}