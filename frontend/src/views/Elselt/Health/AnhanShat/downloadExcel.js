
import { utils, writeFile } from 'xlsx-js-style';

export function excelDownLoad(datas, STATE_LIST) {
        const mainData = datas.map((data, idx) => {
            return(
                {
                    '№': idx + 1,
                    'Овог': data?.last_name,
                    'Нэр': data?.first_name || '',
                    'РД': data?.user_register || '',
                    'Нас': data?.user_age || '',
                    'Утасны дугаар': data?.user?.mobile || '',
                    'Яаралтай үед холбогдох дугаар': data?.user?.parent_mobile || '',
                    'Имейл': data?.user?.email || '',
                    'Хүйс': data?.gender_name || '',
                    'Үзлэгийн төлөв': data?.health_user_data ?
                            STATE_LIST.find(val => val.id === data?.health_user_data?.state).name
                        :
                            '',
                    'Тайлбар': data?.health_user_data?.description || '',
                    'Өндөр (см)': data?.health_user_data?.height || '',
                    'Жин (кг)': data?.health_user_data?.weight || '',
                    'Шарх сорви': data?.health_user_data?.is_chalk ? 'Байгаа' : 'Байхгүй',
                    'Шивээс': data?.health_user_data?.is_tattoo ? 'Байгаа' : 'Байхгүй',
                    'Сэтгэцэд нөлөөт бодисын хамаарал': data?.health_user_data?.is_drug ? 'Байгаа' : 'Байхгүй',
                    'Төгссөн сургууль': data?.userinfo?.graduate_school || '',
                    'Хөтөлбөр': data?.userinfo?.graduate_profession || '',
                    'Төгссөн он': data?.userinfo?.graduate_school_year || '',
                    'Голч': data?.userinfo?.gpa || '',
                    'Ажиллаж байгаа байгууллагын нэр': data?.userinfo?.work_organization || '',
                    'Албан тушаал': data?.userinfo?.position_name || '',
                    'Цол': data?.userinfo?.tsol_name || '',
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
                'Овог',
                'Нэр',
                'РД',
                'Нас',
                'Утасны дугаар',
                'Яаралтай үед холбогдох дугаар',
                'Имейл',
                'Хүйс',
                'Үзлэгийн төлөв',
                'Тайлбар',
                'Өндөр (см)',
                'Жин (кг)',
                'Шарх сорви',
                'Шивээс',
                'Сэтгэцэд нөлөөт бодисын хамаарал',
                'Төгссөн сургууль',
                'Хөтөлбөр',
                'Төгссөн он',
                'Голч',
                'Ажиллаж байгаа байгууллагын нэр',
                'Албан тушаал',
                'Цол',
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