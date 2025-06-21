
import { utils, writeFile } from 'xlsx-js-style';

export function excelDownLoadv2(datas, STATE_LIST) {
        const mainData = datas.map((data, idx) => {
            return(
                {
                    '№': idx + 1,
                    'Регистрийн дугаар': data?.user_register || '',
                    'Овог':data?.user?.last_name || '',
                    'Нэр':data?.user?.first_name || '',
					'Утасны дугаар': data?.user?.mobile || '',
                    // 'Ургийн овог': data?.user_age || '',
                    // 'Яс үндэс': data?.user_age || '',
					'Иргэний бүртгэлийн дугаар': data?.user?.code || '',
                    // 'Цэргийн ангилал':data?.user || '',
                    // 'Гэрлэлтийн байдал':data?.user || '',
                    // 'Харьяалал':data?.user || '',
                    // 'Цусны бүлэг':data?.user || '',
                    'Аймаг':data?.aimag_name|| '',
                    'Дүүрэг/сум':data?.soum_name || '',
                    'Хороо/баг':data?.bag_name|| '',
                    'Хороолол, тоот':data?.toot|| '',
                    // 'Нас': data?.user_age || '',
                    // 'Яаралтай холбогдох': data?.user?.parent_mobile || '',
					// 'Имейл': data?.user?.email || '',
                    // 'Хүйс': data?.gender_name || '',
                    // 'Үзлэгийн төв': data ? STATE_LIST.find(val => val.id === data?.health_up_user_data?.state)?.name : '',
                    // 'Тайлбар': data?.health_up_user_data?.info_description || '',
                    // 'Дотор':data?.health_up_user_data?.belly  || '',
                    // 'Мэдрэл': data?.health_up_user_data?.nerve || '',
                    // 'Чих хамар хоолой': data?.health_up_user_data?.ear_nose || '',
                    // 'Нүд': data?.health_up_user_data?.eye || '',
                    // 'Шүд': data?.health_up_user_data?.teeth || '',
                    // 'Мэс засал': data?.health_up_user_data?.surgery || '',
                    // 'Эмэгтэйчүүд':data?.health_up_user_data?.femini || '',
                    // 'Зүрх судас':data?.health_up_user_data?.heart || '',
                    // 'Сүрьеэ': data?.health_up_user_data?.phthisis || '',
                    // 'Арьс харшил': data?.health_up_user_data?.allergies || '',
                    // 'Халдварт өвчин': data?.health_up_user_data?.contagious || '',
                    // 'Сэтгэц мэдрэл': data?.health_up_user_data?.neuro_phychic || '',
                    // 'Гэмтэл': data?.health_up_user_data?.injury || '',
                    // 'БЗДХ': data?.health_up_user_data?.bzdx || '',
                    // 'Төгссөн сургууль': data?.user_info?.graduate_school || '',
					// 'Хөтөлбөр': data?.profession || '',
                    // 'Төгссөн он': data?.user_info?.graduate_school_year || '',
                    // 'Голч': data?.user_info?.gpa || '',
                    // 'Ажиллаж байгаа байгууллагын нэр': data?.user_info?.work_organization || '',
                    // 'Албан тушаал': data?.user_info?.position_name || '',
                    // 'Цол': data?.user_info?.tsol_name || '',
                }
            )}
        )

        const combo = [
            ...mainData,
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Нарийн шатны үзлэгийн жагсаалт")
        const staticCells = [
                '№',
                'Регистрийн дугаар',
                'Овог',
                'Нэр',
				'Утасны дугаар',
                // 'Ургийн овог',
                'Иргэний бүртгэлийн дугаар',
                // 'Цэргийн ангилал',
                // 'Гэрлэлтийн байдал',
                // 'Харьяалал',
                // 'Цусны бүлэг',
                'Аймаг',
                'Дүүрэг/сум',
                'Хороо/баг',
                'Хороолол, тоот',
				// 'Нас',
				// 'Яаралтай холбогдох',
				// 'Имейл',
				// 'Хүйс',
                // 'Үзлэгийн төв',
				// 'Тайлбар',
                // 'Дотор',
                // 'Мэдрэл',
                // 'Чих хамар хоолой',
                // 'Нүд',
                // 'Шүд',
                // 'Мэс засал',
                // 'Эмэгтэйчүүд',
                // 'Зүрх судас',
                // 'Сүрьеэ',
                // 'Арьс харшил',
                // 'Халдварт өвчин',
                // 'Сэтгэц мэдрэл',
                // 'Гэмтэл',
                // 'БЗДХ',
				// 'Төгссөн сургууль',
				// 'Хөтөлбөр',
				// 'Төгссөн он',
				// 'Голч',
				// 'Ажиллаж байгаа байгууллагын нэр',
				// 'Албан тушаал',
				// 'Цол'
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
        const sendCol = 32;

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

        const phaseTwoCells = Array.from({length: 10}, (_) => {return({wch: 20})})

        worksheet["!cols"] = [
            { wch: 5 },
            ...phaseTwoCells,
            { wch: 20 }
        ];

        const tableRow = Array.from({length: mainData.length}, (_) => {return({hpx: 20})})

        worksheet["!rows"] = [
            { hpx: 50 },
            ...tableRow
        ];

    writeFile(workbook, "Нарийн шатны үзлэгийн жагсаалт.xlsx");
}