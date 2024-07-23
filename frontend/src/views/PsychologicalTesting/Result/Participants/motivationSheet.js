import {utils, writeFile} from 'xlsx-js-style'

export function motivationSheet(datas){
    const mainData = datas.map((data, index) => {
        return(
            {
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
                'DATA22': data[22],
                'DATA23': data[23],
                'DATA24': data[24],
                'DATA25': data[25],
                'DATA26': data[26],
                'DATA27': data[27],
                'DATA28': data[28],
                'DATA29': data[29],
                'DATA30': data[30],
                'DATA31': data[31],
                'DATA32': data[32],
                'DATA33': data[33],
                'DATA34': data[34],
                'DATA35': data[35],
                'DATA36': data[36],
                'DATA37': data[37],
                'DATA38': data[38],
                'DATA39': data[39],
                'DATA40': data[40],
                'DATA41': data[41],
                'DATA42': data[42],
                'DATA43': data[43],
                'DATA44': data[44],
                'DATA45': data[45],
                'DATA46': data[46],
                'DATA47': data[47],
                'DATA48': data[48],
                'DATA49': data[49],
                'DATA50': data[50],
                '4*':data?.score_4,
                '17*':data?.score_17,
                '26*':data?.score_26,
                '9*':data?.score_9,
                '31*':data?.score_31,
                '33*':data?.score_33,
                '43*':data?.score_43,
                '48*':data?.score_48,
                '49*':data?.score_49,
                '24*':data?.score_24,
                '35*':data?.score_35,
                '38*':data?.score_38,
                '44*':data?.score_44,
                '28*':data?.score_28,
                '42*':data?.score_42,
                '11*':data?.score_11,
                'Мэдлэг олж авах':data?.knowledge_score,
                'Мэргэжлийн ур чадвар':data?.skill_score,
                'Диплом авах':data?.diplom_score,
            }
        )
    })

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
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
        '32',
        '33',
        '34',
        '35',
        '36',
        '37',
        '38',
        '39',
        '40',
        '41',
        '42',
        '43',
        '44',
        '45',
        '46',
        '47',
        '48',
        '49',
        '50',
        '4',
        '17',
        '26',
        '9',
        '31',
        '33',
        '43',
        '48',
        '49',
        '24',
        '35',
        '38',
        '44',
        '28',
        '42',
        '11',
        'Мэдлэг олж авах',
        'Мэргэжлийн ур чадвар',
        'Диплом авах',
    ]

    utils.sheet_add_aoa(worksheet, [staticCell1], {origin: "A1"});

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

    const COLUMN_LENGTH = 72

    const startRow = 0;
    const endRow = 0;
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

    const colWidth = Array.from({length: 69}, (_, idx) => {
        return(
            {
                wch:(
                    idx === 66 ||
                    idx === 67 ||
                    idx === 68
                ) ? 10 : 7
            }
        )
    })

    worksheet["!cols"] = [
        {wch: 5},
        {wch: 35},
        ...colWidth
    ]

    worksheet["!rows"] = [
        { hpx: 35 },
    ];

    worksheet['!merges'] = Array.from({ length: COLUMN_LENGTH - 1 }, (_, idx) => ({
        s: { r: 0, c: idx },
        e: { r: 0, c: idx },
    }));

    return worksheet
}