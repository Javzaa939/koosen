
import { utils, writeFile } from 'xlsx-js-style';

export function excelDownLoad(datas, STATE_LIST) {
        const mainData = datas.map((data, idx) => {
            return(
                {
                    '№': idx + 1,
                    'Регистрийн дугаар': data?.user_register || '',
                    'Овог':data?.user?.last_name || '',
                    'Нэр':data?.user?.first_name || '',
					'Утасны дугаар': data?.user?.mobile || '',
                    'Ургийн овог': '',
                    'Яс үндэс': '',
					'Иргэний бүртгэлийн дугаар': data?.user?.code || '',
                    'Цэргийн ангилал': '',
                    'Гэрлэлтийн байдал': '',
                    'Харьяалал': 'монгол',
                    'Цусны бүлэг':'',
                    'Аймаг':data?.aimag_name|| '',
                    'Дүүрэг/сум':data?.sum_duureg_name || '',
                    'Хороо/баг':data?.horoo_name|| '',
                    'Хороолол, тоот': '',
                }
            )}
        )

        const combo = [
            ...mainData,
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Aнхан шатны эрүүл мэндийн үзлэг")
        const staticCells = [
                '№',
                'Регистрийн дугаар',
                'Овог',
                'Нэр',
                'Утасны дугаар',
                'Ургийн овог',
                'Яс үндэс',
                'Иргэний бүртгэлийн дугаар',
                'Цэргийн ангилал',
                'Гэрлэлтийн байдал',
                'Харьяалал',
                'Цусны бүлэг',
                'Аймаг',
                'Дүүрэг/сум',
                'Хороо/баг',
                'Хороолол, тоот',
            ];

        utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });

        const numberCellStyle = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'left',
                vertical: 'center',
                wrapText: true
            },
            font:{
                sz:10
            }
        };

        const tableHeader = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "0000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
                wrapText: true
            },
            alignment: {
                vertical: 'center',
                wrapText: true
            },
            font:{
                sz: 12,
                bold: true
            }

        };

        const styleRow = 0;
        const sendRow = mainData.length;
        const styleCol = 0;
        const sendCol = 22;

        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s =
                    (row === styleRow)
                        ? tableHeader
                            : numberCellStyle;
            }
        }

        const phaseTwoCells = Array.from({length: 8}, (_) => {return({wch: 15})})

        worksheet["!cols"] = [
            { wch: 5 },
            ...phaseTwoCells,
            { wch: 20 }
        ];

        const tableRow = Array.from({length: mainData.length}, (_) => {return({hpx: 20})})

        worksheet["!rows"] = [
            { hpx: 40 },
            ...tableRow
        ];

    writeFile(workbook, "uzlegiin_jagsaalt.xlsx");

}