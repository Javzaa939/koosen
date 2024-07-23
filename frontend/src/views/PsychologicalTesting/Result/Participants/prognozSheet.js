import {utils, writeFile} from 'xlsx-js-style'

export function prognozSheet(datas){
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
                'DATA51': data[51],
                'DATA52': data[52],
                'DATA53': data[53],
                'DATA54': data[54],
                'DATA55': data[55],
                'DATA56': data[56],
                'DATA57': data[57],
                'DATA58': data[58],
                'DATA59': data[59],
                'DATA60': data[50],
                'DATA61': data[61],
                'DATA62': data[62],
                'DATA63': data[63],
                'DATA64': data[64],
                'DATA65': data[65],
                'DATA66': data[66],
                'DATA67': data[67],
                'DATA68': data[68],
                'DATA69': data[69],
                'DATA70': data[70],
                'DATA71': data[71],
                'DATA72': data[72],
                'DATA73': data[73],
                'DATA74': data[74],
                'DATA75': data[75],
                'DATA76': data[76],
                'DATA77': data[77],
                'DATA78': data[78],
                'DATA79': data[79],
                'DATA80': data[80],
                'DATA81': data[81],
                'DATA82': data[82],
                'DATA83': data[83],
                'DATA84': data[84],
                'DATA85': data[85],
                'DATA86': data[86],
                '1*': data?.score_1 ?? '',
                '6*': data?.score_6 ?? '',
                '10*': data?.score_10 ?? '',
                '12*': data?.score_12 ?? '',
                '15*': data?.score_15 ?? '',
                '19*': data?.score_19 ?? '',
                '21*': data?.score_21 ?? '',
                '26*': data?.score_26 ?? '',
                '33*': data?.score_33 ?? '',
                '38*': data?.score_38 ?? '',
                '44*': data?.score_44 ?? '',
                '49*': data?.score_49 ?? '',
                '52*': data?.score_52 ?? '',
                '58*': data?.score_58 ?? '',
                '61*': data?.score_61 ?? '',
                '2*': data?.score_2 ?? '',
                '3*': data?.score_3 ?? '',
                '5*': data?.score_5 ?? '',
                '7*': data?.score_7 ?? '',
                '9*': data?.score_9 ?? '',
                '11*': data?.score_11 ?? '',
                '13*': data?.score_13 ?? '',
                '14*': data?.score_14 ?? '',
                '16*': data?.score_16 ?? '',
                '18*': data?.score_18 ?? '',
                '20*': data?.score_20 ?? '',
                '22*': data?.score_22 ?? '',
                '23*': data?.score_23 ?? '',
                '25*': data?.score_25 ?? '',
                '27*': data?.score_27 ?? '',
                '28*': data?.score_28 ?? '',
                '29*': data?.score_29 ?? '',
                '31*': data?.score_31 ?? '',
                '32*': data?.score_32 ?? '',
                '34*': data?.score_34 ?? '',
                '36*': data?.score_36 ?? '',
                '37*': data?.score_37 ?? '',
                '39*': data?.score_39 ?? '',
                '40*': data?.score_40 ?? '',
                '42*': data?.score_42 ?? '',
                '43*': data?.score_43 ?? '',
                '45*': data?.score_45 ?? '',
                '47*': data?.score_47 ?? '',
                '48*': data?.score_48 ?? '',
                '51*': data?.score_51 ?? '',
                '53*': data?.score_53 ?? '',
                '54*': data?.score_54 ?? '',
                '56*': data?.score_56 ?? '',
                '57*': data?.score_57 ?? '',
                '59*': data?.score_59 ?? '',
                '60*': data?.score_60 ?? '',
                '62*': data?.score_62 ?? '',
                '63*': data?.score_63 ?? '',
                '65*': data?.score_65 ?? '',
                '66*': data?.score_66 ?? '',
                '67*': data?.score_67 ?? '',
                '68*': data?.score_68 ?? '',
                '69*': data?.score_69 ?? '',
                '70*': data?.score_70 ?? '',
                '71*': data?.score_71 ?? '',
                '72*': data?.score_72 ?? '',
                '73*': data?.score_73 ?? '',
                '74*': data?.score_74 ?? '',
                '75*': data?.score_75 ?? '',
                '76*': data?.score_76 ?? '',
                '77*': data?.score_77 ?? '',
                '78*': data?.score_78 ?? '',
                '79*': data?.score_79 ?? '',
                '80*': data?.score_80 ?? '',
                '81*': data?.score_81 ?? '',
                '82*': data?.score_82 ?? '',
                '83*': data?.score_83 ?? '',
                '84*': data?.score_84 ?? '',
                '85*': data?.score_85 ?? '',
                '86*': data?.score_86 ?? '',
                '4*': data?.score_4 ?? '',
                '8*': data?.score_8 ?? '',
                '17*': data?.score_17 ?? '',
                '24*': data?.score_24 ?? '',
                '30*': data?.score_30 ?? '',
                '35*': data?.score_35 ?? '',
                '41*': data?.score_41 ?? '',
                '46*': data?.score_46 ?? '',
                '50*': data?.score_50 ?? '',
                '55*': data?.score_55 ?? '',
                '64*': data?.score_64 ?? '',
                'Үнэн худал':data?.mental_score,
                'оноо':data?.true_false_score,
                'Түвшин':data?.overall_review,
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
        '51',
        '52',
        '53',
        '54',
        '55',
        '56',
        '57',
        '58',
        '59',
        '60',
        '61',
        '62',
        '63',
        '64',
        '65',
        '66',
        '67',
        '68',
        '69',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '78',
        '79',
        '80',
        '81',
        '82',
        '83',
        '84',
        '85',
        '86',
        '1',
        '6',
        '10',
        '12',
        '15',
        '19',
        '21',
        '26',
        '33',
        '38',
        '44',
        '49',
        '52',
        '58',
        '61',
        '2',
        '3',
        '5',
        '7',
        '9',
        '11',
        '13',
        '14',
        '16',
        '18',
        '20',
        '22',
        '23',
        '25',
        '27',
        '28',
        '29',
        '31',
        '32',
        '34',
        '36',
        '37',
        '39',
        '40',
        '42',
        '43',
        '45',
        '47',
        '48',
        '51',
        '53',
        '54',
        '56',
        '57',
        '59',
        '60',
        '62',
        '63',
        '65',
        '66',
        '67',
        '68',
        '69',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '78',
        '79',
        '80',
        '81',
        '82',
        '83',
        '84',
        '85',
        '86',
        '4',
        '8',
        '17',
        '24',
        '30',
        '35',
        '41',
        '46',
        '50',
        '55',
        '64',
        'Үнэн худал',
        'оноо',
        'Түвшин',
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

    const COLUMN_LENGTH = 177

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

    const colWidthValue = Array.from({ length: 86 }, () => ({
        wch: 7
    }));

    const colWidth = Array.from({ length: 177 }, (_, idx) => ({
        wch: (idx === 86 || idx === 87 || idx === 88) ? 10 : 3
    }));

    worksheet["!cols"] = [
        { wch: 5 },
        { wch: 35 },
        ...colWidthValue,
        ...colWidth
    ];

    worksheet["!rows"] = [
        { hpx: 35 },
    ];

    worksheet['!merges'] = Array.from({ length: COLUMN_LENGTH-1}, (_, idx) => (
        {
            s: { r: 0, c: idx },
            e: { r: 0, c: idx }
        }
    ));

    return worksheet
}