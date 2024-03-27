
import { utils, writeFile } from 'xlsx-js-style';

export function excelDownLoad(data) {
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet([]);
    utils.book_append_sheet(workbook, worksheet, "Хичээлийн хуваарь")

    const SONDGOI = 1
    const TEGSH = 2
    const ENGIIN = 3
    const BLANK = 4

    const header = Array.from({length: 6},(_, hidx) => {
        return(
            {
                'Анги': 'А',
                    // davaa
                    'davaa1': '',
                    'davaa2': '',
                    'davaa3': '',
                    'davaa4': '',
                    'davaa5': '',
                    'davaa6': '',
                    // myagmar
                    'myagmar1': '',
                    'myagmar2': '',
                    'myagmar3': '',
                    'myagmar4': '',
                    'myagmar5': '',
                    'myagmar6': '',
                    // lhagva
                    'lhagva1': '',
                    'lhagva2': '',
                    'lhagva3': '',
                    'lhagva4': '',
                    'lhagva5': '',
                    'lhagva6': '',
                    // purev
                    'purev1': '',
                    'purev2': '',
                    'purev3': '',
                    'purev4': '',
                    'purev5': '',
                    'purev6': '',
                    // baasan
                    'baasan1': '',
                    'baasan2': '',
                    'baasan3': '',
                    'baasan4': '',
                    'baasan5': '',
                    'baasan6': '',
            }
        )
    })

    // const phaseArray = [3, 4, 5]

    const data_relayer = data.data.flatMap((item, iidx) => [
        ...Array(6).fill().map((_, idx) => ({
            ...item,
            key: `${item.key || iidx}_${idx}`,
            vidx: idx,
            // Тэгш болон сондгой хичээлийг ялгахын тулд boolean явуулсан.

            // ашиглаагүй
            // phaseOne: phaseArray.includes(idx)
        }))
    ]);


    const mainData = data_relayer.map((value, index) => {

        const cidx = value.vidx

        //data butsaah function
        function valuefind(day, time)
        {
            let rdata = value.schedule.filter(val => (val.day === day && val.time === time))

            return rdata
        }

        //index tus bvrt utga onooh function dawhar odd even shalgana
        function valuefind2(day, time)
        {
            let cvalue = ''

            let relay = valuefind(day,time)

            if (relay.length == 1)
            {
                relay = relay[0]

                if(relay?.odd_even === 3)
                {
                    switch (cidx)
                    {
                        case 0:
                            cvalue = `${relay?.lesson_name}` || ''
                            break;
                        case 1:
                            cvalue = ''
                            break;
                        case 2:
                            cvalue = ''
                            break;
                        case 3:
                            cvalue = `${relay?.teacher_name}`
                            break;
                        case 4:
                            cvalue = relay?.room_name || ''
                            break;
                        case 5:
                            cvalue = ''
                            break;
                        default:
                            break;
                    }
                }
                else if(relay?.odd_even === 2)
                {
                    switch (cidx)
                    {
                        case 0:
                            cvalue = ''
                            break;
                        case 1:
                            cvalue = ''
                            break;
                        case 2:
                            cvalue = ''
                            break;
                        case 3:
                            cvalue = relay?.lesson_name
                            break;
                        case 4:
                            cvalue = relay?.teacher_name
                            break;
                        case 5:
                            cvalue = relay?.room_name
                            break;
                        default:
                            break;
                    }
                }
                else
                {
                    switch (cidx)
                    {
                        case 0:
                            cvalue = relay?.lesson_name || ''
                            break;
                        case 1:
                            cvalue = relay?.teacher_name || ''
                            break;
                        case 2:
                            cvalue = relay?.room_name || ''
                            break;
                        case 3:
                            cvalue =  ''
                            break;
                        case 4:
                            cvalue =  ''
                            break;
                        case 5:
                            cvalue = ''
                            break;
                        default:
                            break;
                    }
                }
            }
            else if (relay.length > 1)
            {
                switch (cidx)
                {
                    case 0:
                        cvalue = relay.find(val => val.odd_even === SONDGOI)?.lesson_name || ''
                        break;
                    case 1:
                        cvalue = relay.find(val => val.odd_even === SONDGOI)?.teacher_name || ''
                        break;
                    case 2:
                        cvalue = relay.find(val => val.odd_even === SONDGOI)?.room_name || ''
                        break;
                    case 3:
                        cvalue = relay.find(val => val.odd_even === TEGSH)?.lesson_name || ''
                        break;
                    case 4:
                        cvalue = relay.find(val => val.odd_even === TEGSH)?.teacher_name || ''
                        break;
                    case 5:
                        cvalue = relay.find(val => val.odd_even === TEGSH)?.room_name || ''
                        break;
                    default:
                        break;
                }
            }

            return cvalue
        }

        return(
            {
                'Анги': value?.name,
                // davaa
                'davaa1': valuefind2(1,1),
                'davaa2': valuefind2(1,2),
                'davaa3': valuefind2(1,3),
                'davaa4': valuefind2(1,4),
                'davaa5': valuefind2(1,5),
                'davaa6': valuefind2(1,6),
                // myagmar
                'myagmar1': valuefind2(2,1),
                'myagmar2': valuefind2(2,2),
                'myagmar3': valuefind2(2,3),
                'myagmar4': valuefind2(2,4),
                'myagmar5': valuefind2(2,5),
                'myagmar6': valuefind2(2,6),
                // lhagva
                'lhagva1': valuefind2(3,1),
                'lhagva2': valuefind2(3,2),
                'lhagva3': valuefind2(3,3),
                'lhagva4': valuefind2(3,4),
                'lhagva5': valuefind2(3,5),
                'lhagva6': valuefind2(3,6),
                // purev
                'purev1': valuefind2(4,1),
                'purev2': valuefind2(4,2),
                'purev3': valuefind2(4,3),
                'purev4': valuefind2(4,4),
                'purev5': valuefind2(4,5),
                'purev6': valuefind2(4,6),
                // baasan
                'baasan1': valuefind2(5,1),
                'baasan2': valuefind2(5,2),
                'baasan3': valuefind2(5,3),
                'baasan4': valuefind2(5,4),
                'baasan5': valuefind2(5,5),
                'baasan6': valuefind2(5,6),
            })
        }
    )

    const footer = Array.from({length: 10}, (_, idx) => {
        return(
            {
                'Анги': 'А',
                    // davaa
                    'davaa1': '',
                    'davaa2': '',
                    'davaa3': '',
                    'davaa4': '',
                    'davaa5': '',
                    'davaa6': '',
                    // myagmar
                    'myagmar1': '',
                    'myagmar2': '',
                    'myagmar3': '',
                    'myagmar4': '',
                    'myagmar5': '',
                    'myagmar6': '',
                    // lhagva
                    'lhagva1': '',
                    'lhagva2': '',
                    'lhagva3': '',
                    'lhagva4': '',
                    'lhagva5': '',
                    'lhagva6': '',
                    // purev
                    'purev1': '',
                    'purev2': '',
                    'purev3': '',
                    'purev4': '',
                    'purev5': '',
                    'purev6': '',
                    // baasan
                    'baasan1': '',
                    'baasan2': '',
                    'baasan3': '',
                    'baasan4': '',
                    'baasan5': '',
                    'baasan6': '',
            }
        )
    })


    const combo = [
        ...header,
        ...mainData,
        ...footer
    ]

    const currentSheet = workbook.Sheets['Хичээлийн хуваарь']

    const newSheet = utils.json_to_sheet(combo)


    Object.assign(currentSheet, newSheet)

    const staticCells0 = [
        'Анги',

        'Даваа',
        '',
        '',
        '',
        '',
        '',

        'Мягмар',
        '',
        '',
        '',
        '',
        '',

        'Лхагва',
        '',
        '',
        '',
        '',
        '',

        'Пүрэв',
        '',
        '',
        '',
        '',
        '',

        'Баасан',
        '',
        '',
        '',
        '',
        '',

    ]
    const staticCells1 = [
        'Анги',

        '8:00',
        '9:40',
        '11:20',
        '13:10',
        '14:50',
        '16:30',

        '8:00',
        '9:40',
        '11:20',
        '13:10',
        '14:50',
        '16:30',

        '8:00',
        '9:40',
        '11:20',
        '13:10',
        '14:50',
        '16:30',

        '8:00',
        '9:40',
        '11:20',
        '13:10',
        '14:50',
        '16:30',

        '8:00',
        '9:40',
        '11:20',
        '13:10',
        '14:50',
        '16:30',

    ]

    const staticCells2 = [
        'Анги',

        '9:30',
        '11:10',
        '12:50',
        '14:40',
        '16:20',
        '18:00',

        '9:30',
        '11:10',
        '12:50',
        '14:40',
        '16:20',
        '18:00',

        '9:30',
        '11:10',
        '12:50',
        '14:40',
        '16:20',
        '18:00',

        '9:30',
        '11:10',
        '12:50',
        '14:40',
        '16:20',
        '18:00',

        '9:30',
        '11:10',
        '12:50',
        '14:40',
        '16:20',
        '18:00',

    ]

    utils.sheet_add_aoa(worksheet, [staticCells0], { origin: "A5" });
    utils.sheet_add_aoa(worksheet, [staticCells1], { origin: "A6" });
    utils.sheet_add_aoa(worksheet, [staticCells2], { origin: "A7" });

    //////////////////////////////////////////////////////////////////////////////////

        // rgb color variants

        const green_border = '054d05'
        const header_bg = 'ffa200'
        const body_bg = 'fcebcc'
        const tegsh_bg = 'fff0e0'


    //////////////////////////////////////////////////////////////////////////////////


    const textCellStyle = {
        border: {
            top: { style: "thin", color: { rgb: "ffffff" } },
            bottom: { style: "thin", color: { rgb: "ffffff" } },
            left: { style: "thin", color: { rgb: "ffffff" } },
            right: { style: "thin", color: { rgb: "ffffff" } }
        },
        font: {
            sz: 9
        },
        alignment: {
            wrapText: true
        },
    }

    const footerBorder = {
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "ffffff" } },
            left: { style: "thin", color: { rgb: "ffffff" } },
            right: { style: "thin", color: { rgb: "ffffff" } },
            wrapText: true
        },
        font:{
            sz: 9
        }

    };

    const bottomBorder = {
        border: {
            top: { style: "thin", color: { rgb: "ffffff" } },
            bottom: { style: "thin", color: { rgb: "0000000" } },
            left: { style: "thin", color: { rgb: "ffffff" } },
            right: { style: "thin", color: { rgb: "ffffff" } },
            wrapText: true
        },
        font:{
            sz: 9
        }

    };

    const headerStyle = {

        border: {
            top: { style: "thin", color: { rgb: "ffffff" } },
            bottom: { style: "thin", color: { rgb: "ffffff" } },
            left: { style: "thin", color: { rgb: "ffffff" } },
            right: { style: "thin", color: { rgb: "ffffff" } },
        },
        font: {
            sz: 12,
            bold: true
        }
    };

    const headerStyle2 = {

        border: {
            top: { style: "thin", color: { rgb: "ffffff" } },
            bottom: { style: "thin", color: { rgb: "ffffff" } },
            left: { style: "thin", color: { rgb: "ffffff" } },
            right: { style: "thin", color: { rgb: "ffffff" } },
        },
        font: {
            sz: 20,
            bold: true
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        }
    };

    const centeredTableStyle = {
        border: {
            top: { style: "thin", color: { rgb: green_border } },
            bottom: { style: "thin", color: { rgb: green_border } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        },
        fill: {
            fgColor: {rgb:body_bg}
        }
    }

    const tableHeaderStyle = {
        border: {
            top: { style: "thin", color: { rgb: green_border } },
            bottom: { style: "thin", color: { rgb: green_border } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        },
        fill: {
            fgColor: {rgb:header_bg}
        }
    }


    const whiteCellStyle = {
        border: {
            top: { style: "thin", color: { rgb: green_border } },
            bottom: { style: "thin", color: { rgb: green_border } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        },
        // fill: {
        //     fgColor: {rgb:'ffffff'}
        // }
    }

    const whiteCellMiddle = {
        border: {
            top: { style: "thin", color: { rgb: 'ffffff' } },
            bottom: { style: "thin", color: { rgb: 'ffffff' } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        },
    }


    const whiteCellTop = {
        border: {
            top: { style: "thin", color: { rgb: green_border } },
            bottom: { style: "thin", color: { rgb: 'ffffff' } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        }
    }

    const whiteCellBottom = {
        border: {
            top: { style: "thin", color: { rgb: 'ffffff' } },
            bottom: { style: "thin", color: { rgb: green_border } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        }
    }

    const whiteCellLeftRight = {
        border: {
            top: { style: "thin", color: { rgb: 'ffffff' } },
            bottom: { style: "thin", color: { rgb: 'ffffff' } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        }
    }


    const grayCellTop = {
        border: {
            top: { style: "thin", color: { rgb: green_border } },
            bottom: { style: "thin", color: { rgb: tegsh_bg } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        },
        fill:{
            fgColor: {rgb:tegsh_bg}
        }
    }

    const grayCellBottom = {
        border: {
            top: { style: "thin", color: { rgb: tegsh_bg } },
            bottom: { style: "thin", color: { rgb: green_border } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        },
        fill:{
            fgColor: {rgb:tegsh_bg}
        }
    }

    const grayCellLeftRight = {
        border: {
            top: { style: "thin", color: { rgb: tegsh_bg } },
            bottom: { style: "thin", color: { rgb: tegsh_bg } },
            left: { style: "thin", color: { rgb: green_border } },
            right: { style: "thin", color: { rgb: green_border } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
        },
        font:{
            sz: 9
        },
        fill:{
            fgColor: {rgb:tegsh_bg}
        }
    }


    const COLUMN_LENGTH = 30

        // Толгой хэсэгт стайл болон Текст өгж буй хэсэг
        const startRow = 0;
        const endRow = 3;
        const startCol = 0;
        const endCol = COLUMN_LENGTH;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
            const cellAddress = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = {};
                }

            worksheet[cellAddress].s = row === 6 ? bottomBorder : textCellStyle
            worksheet[cellAddress].v = ''
            }
        }

        // Хүснэгтийн даваа лхагва баасан гарагийн хуваарь өөр өнгөтэй гарах тул доорхи баганы
        // дугааруудыг статикаар тавьж өгөв. 7 цагтай хуваарь дээр шинэчлэх шаардлагатай.

        const davaa_lhagva_baasan = [
            1, 2, 3, 4, 5, 6,
            13, 14, 15, 16, 17, 18,
            25, 26, 27, 28, 29, 30
        ]

        let styleRow = endRow + 1;
        let styleRowLooping = endRow + 1;
        const sendRow = endRow + mainData.length + 3;
        const styleCol = 0;
        const sendCol = 30;

        let inLessonRow = false

        while (styleRowLooping <= sendRow)
        {
            for (let col = styleCol; col <= sendCol; col++)
            {
                const cellNum = utils.encode_cell({ r: styleRowLooping, c: col });
                const cellNum1 = utils.encode_cell({ r: styleRowLooping + 1, c: col });
                const cellNum2 = utils.encode_cell({ r: styleRowLooping + 2, c: col });
                const cellNum3 = utils.encode_cell({ r: styleRowLooping + 3, c: col });
                const cellNum4 = utils.encode_cell({ r: styleRowLooping + 4, c: col });
                const cellNum5 = utils.encode_cell({ r: styleRowLooping + 5, c: col });

                // Хэрвээ хоосон хүснэгт эсвэл дан хичээлтэй бол
                if (
                    inLessonRow && col > 0 &&

                    (!worksheet[cellNum].v &&
                    !worksheet[cellNum1].v &&
                    !worksheet[cellNum2].v &&
                    !worksheet[cellNum3].v &&
                    !worksheet[cellNum4].v &&
                    !worksheet[cellNum5].v)
                ||

                    (worksheet[cellNum].v &&
                    !worksheet[cellNum1].v &&
                    !worksheet[cellNum2].v &&
                    (worksheet[cellNum3].v || worksheet[cellNum4].v) &&
                    !worksheet[cellNum5].v)

                )
                {

                    if(davaa_lhagva_baasan.includes(col)){

                        worksheet[cellNum].s = whiteCellTop

                        worksheet[cellNum1].s = whiteCellLeftRight
                        worksheet[cellNum2].s = whiteCellLeftRight
                        worksheet[cellNum3].s = whiteCellLeftRight
                        worksheet[cellNum4].s = whiteCellLeftRight
                        worksheet[cellNum5].s = whiteCellBottom
                    } else {

                        worksheet[cellNum].s = grayCellTop

                        worksheet[cellNum1].s = grayCellLeftRight
                        worksheet[cellNum2].s = grayCellLeftRight
                        worksheet[cellNum3].s = grayCellLeftRight
                        worksheet[cellNum4].s = grayCellLeftRight
                        worksheet[cellNum5].s = grayCellBottom
                    }

                    continue
                }
                // Хэрвээ хуваарьт тэгш сондгой аль нэг нь байгаа бол
                else if (
                    inLessonRow &&

                        (
                    inLessonRow &&
                    col > 0 &&
                        worksheet[cellNum].v &&
                        worksheet[cellNum1].v &&
                        worksheet[cellNum2].v &&
                        !worksheet[cellNum3].v &&
                        !worksheet[cellNum4].v &&
                        !worksheet[cellNum5].v)
                    ||

                        (
                    inLessonRow &&
                    col > 0 &&
                        !worksheet[cellNum].v &&
                        !worksheet[cellNum1].v &&
                        !worksheet[cellNum2].v &&
                        worksheet[cellNum3].v &&
                        worksheet[cellNum4].v &&
                        worksheet[cellNum5].v)
                    ||

                        (
                    inLessonRow &&
                    col > 0 &&
                        worksheet[cellNum].v &&
                        worksheet[cellNum1].v &&
                        worksheet[cellNum2].v &&
                        worksheet[cellNum3].v &&
                        worksheet[cellNum4].v &&
                        worksheet[cellNum5].v)
                ) {

                    if(davaa_lhagva_baasan.includes(col)){

                    worksheet[cellNum].s = whiteCellTop

                    worksheet[cellNum1].s = whiteCellLeftRight
                    worksheet[cellNum2].s = whiteCellBottom
                    worksheet[cellNum3].s = whiteCellTop
                    worksheet[cellNum4].s = whiteCellLeftRight
                    worksheet[cellNum5].s = whiteCellBottom
                    } else {

                    worksheet[cellNum].s = grayCellTop

                    worksheet[cellNum1].s = grayCellLeftRight
                    worksheet[cellNum2].s = grayCellBottom
                    worksheet[cellNum3].s = grayCellTop
                    worksheet[cellNum4].s = grayCellLeftRight
                    worksheet[cellNum5].s = grayCellBottom
                    }
                    continue
                }
             // Эхний багана
             else if (
                col == 0
            ) {
                worksheet[cellNum].s = tableHeaderStyle

                worksheet[cellNum1].s = tableHeaderStyle
                worksheet[cellNum2].s = tableHeaderStyle
                worksheet[cellNum3].s = tableHeaderStyle
                worksheet[cellNum4].s = tableHeaderStyle
                worksheet[cellNum5].s = tableHeaderStyle
                continue
            }
                worksheet[cellNum].s = (styleRowLooping === styleRow || styleRowLooping === styleRow + 1 || styleRowLooping === styleRow + 2 || styleRowLooping === styleRow + 3 ||styleRowLooping === styleRow + 4 ||styleRowLooping === styleRow + 5) && tableHeaderStyle


            }



            if (styleRowLooping == 4 || styleRowLooping == 5 || styleRowLooping == 6)
            {
                styleRowLooping++;
                if (styleRowLooping == 6)
                {
                    inLessonRow = true
                }
            }
            else
            {
                styleRowLooping = styleRowLooping + 6;
            }
        }

        const fRow = sendRow + 1;
        const fendRow = sendRow + 15;
        const fCol = 0;
        const fendCol = COLUMN_LENGTH;

        for (let row = fRow; row <= fendRow; row++) {
            for (let col = fCol; col <= fendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s = row === fRow ? footerBorder : textCellStyle
                    worksheet[cellNum].v = (col === 0 && row === fRow + 1)
                        ? `Хянасан: ${data?.info?.hynasan_position}`
                        : (col === 4 && row === fRow + 1) ? `${data?.info?.hynasan_name}`
                            : (col === 0 && row === fRow + 3) ? `Боловсруулсан: ${data?.info?.bolovsruulsan_position}`
                            : (col === 4 && row === fRow + 3) ? `${data?.info?.bolovsruulsan_name}`
                                : ''
            }
        }


            const tableCol = Array.from({length: 30}, (_, idx) => {
                return(
                    {
                        wch: 13
                    }
                )
            })

            worksheet['!cols'] = [
                {
                    wch: 10
                },
                ...tableCol
            ]

            const tableRow = Array.from({length: data_relayer.length}, (_, idx) => {
                return(
                    {
                        hpx: (data_relayer[idx].vidx === 0 || data_relayer[idx].vidx === 3) ? 60 : 10
                    }
                )
            })

            worksheet["!rows"] = [
                { hpx: 40 },
                { hpx: 10 },
                { hpx: 20 },
                { hpx: 20 },
                { hpx: 20 },
                { hpx: 20 },
                { hpx: 20 },
                ...tableRow
            ];

            const tableBodyMerge = Array.from({length: data.data.length}, (_,cidx) => {
                return(
                    {
                        // тус бүрт нь 3 3ийг нэмж хүснэгтийн эхний мөрөнд хүрнэ
                        s: { c: 0, r: cidx * 6 + 3 + styleRow},
                        e: { c: 0, r: cidx * 6 + 3 + 5 + styleRow}

                    }
                )
            })

            worksheet['!merges'] = [

                // page heaqder merge
                {
                    s: { c: 0, r: 0 },
                    e: { c: 4, r: 0 }
                },
                {
                    s: { c: 5, r: 0 },
                    e: { c: 9, r: 0 }
                },
                {
                    s: { c: 0, r: 2 },
                    e: { c: 30, r: 3 }
                },
                // table header merge
                {
                    s: { c: 0, r: styleRow },
                    e: { c: 0, r: styleRow + 2}
                },
                {
                    s: { c: 1, r: styleRow },
                    e: { c: 6, r: styleRow }
                },
                {
                    s: { c: 7, r: styleRow },
                    e: { c: 12, r: styleRow }
                },
                {
                    s: { c: 13, r: styleRow },
                    e: { c: 18, r: styleRow }
                },
                {
                    s: { c: 19, r: styleRow },
                    e: { c: 24, r: styleRow }
                },
                {
                    s: { c: 25, r: styleRow },
                    e: { c: 30, r: styleRow }
                },

                ...tableBodyMerge,

                {
                    s: { c: 0, r: fRow + 1 },
                    e: { c: 3, r: fRow + 1 }
                },
                {
                    s: { c: 4, r: fRow + 1 },
                    e: { c: 6, r: fRow + 1 }
                },
                {
                    s: { c: 0, r: fRow + 3 },
                    e: { c: 3, r: fRow + 3 }
                },
                {
                    s: { c: 4, r: fRow + 3 },
                    e: { c: 6, r: fRow + 3 }
                },
            ]

        worksheet['A1'] = {s:headerStyle, v:`БАТЛАВ. ${data?.info?.director_position}`}
        worksheet['F1'] = {s:headerStyle, v: data?.info?.director_name}

        // static
        worksheet['A3'] = {s:headerStyle2, v: `${data.info?.school_name?.slice(0, -1)}ИЙН ${data.info?.lesson_year} ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН ${data.info?.lesson_season === 1 ? 'I' : 'II'} УЛИРЛЫН ХИЧЭЭЛИЙН ХУВААРЬ`}


    writeFile(workbook, `${data?.info?.school_name?.slice(0, -1)}ИЙН ХУВААРЬ.xlsx`, { compression: true });

}