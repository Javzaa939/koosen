import { utils, writeFile } from 'xlsx-js-style';

export function dass21Sheet(datas) {
    const mainData = datas.map((data, index) => {
        return {
            'д/д': index + 1,
            'Цол, овог, нэр': `${data?.last_name} ${data?.first_name}`,
            'DATA1': data[1],
            'DATA2': data[2],
            'DATA3': data[3],
            'DATA4': data[4],
            'DATA5': data[5],
            'DATA6': data[6],
            'DATA7': data[7],
            'DATA8': data[8],
            'DATA9': data[9],
            'DATA10': data[10],
            'DATA11': data[11],
            'DATA12': data[12],
            'DATA13': data[13],
            'DATA14': data[14],
            'DATA15': data[15],
            'DATA16': data[16],
            'DATA17': data[17],
            'DATA18': data[18],
            'DATA19': data[19],
            'DATA20': data[20],
            'DATA21': data[21],
            'Депресс | Оноо': data?.depression_score,
            'Түгшүүр | Оноо': data?.anxiety_score,
            'Стресс | Оноо': data?.stress_score,
            'Депресс | Түвшин': data?.depression,
            'Түгшүүр | Түвшин': data?.anxiety,
            'Стресс | Түвшин': data?.stress,
        };
    });

    const worksheet = utils.json_to_sheet(mainData);

    const staticCell1 = [
        'д/д',
        'Цол, овог, нэр',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        'Депресс',
        'Түгшүүр',
        'Стресс',
        'Депресс',
        'Түгшүүр',
        'Стресс',
    ];

    utils.sheet_add_aoa(worksheet, [staticCell1], { origin: "A1" });

    const tableHeaderStyle = {
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
        },
        font: {
            sz: 11,
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
            vertical: 'center',
        },
        fill: {
            fgColor: { rgb: 'FFFFFF' },
        },
    };

    const numberCellStyle = {
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true,
        },
        font: {
            sz: 11,
        },
    };

    const COLUMN_LENGTH = 30;

    const startRow = 0;
    const endRow = 0;
    const startCol = 0;
    const endCol = COLUMN_LENGTH;

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cellAddress = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = {};
            }

            worksheet[cellAddress].s = tableHeaderStyle;
        }
    }

    const styleRow = endRow + 1;
    const sendRow = endRow + mainData.length;
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

    const colWidth = Array.from({ length: 27 }, (_, idx) => {
        return {
            wch: idx >= 21 && idx <= 26 ? 13 : 3,
        };
    });

    worksheet["!cols"] = [
        { wch: 5 },
        { wch: 35 },
        ...colWidth,
    ];

    worksheet["!rows"] = [
        { hpx: 35 },
    ];

    worksheet['!merges'] = Array.from({ length: COLUMN_LENGTH - 1 }, (_, idx) => ({
        s: { r: 0, c: idx },
        e: { r: 0, c: idx },
    }));

    return worksheet;
}
