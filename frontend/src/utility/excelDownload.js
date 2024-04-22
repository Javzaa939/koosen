import { utils, writeFile } from 'xlsx-js-style'

/**
 *
 * REQUIRED
 * @param {Array} datas Эксел файл дээр шивэх үндсэн дата
 * @param {object} rowInfo ирсэн датаны хаанаас аль датаг авч тавих вэ гэдгээ шийдэх хэсэг
 *
 * NON-REQUIRED
 * @param {String} fileName Файлын нэр
 * @param {Object} height Мөрийн өндөр
 * @param {Number} width Баганы өргөн
 * @returns
 */
export default function excelDownload(datas, rowInfo, fileName, height, width) {

    /**
     * Функцыг ажиллуулахад шаардлагатай мэдээллүүдийн нэг л байхгүй бол явуулах
     * шаардлагагүй ба процессийг шууд зогсоож болно.
     */
    if(!datas){
        console.warn('Эксел файлд шивэх мэдээллээ оруулна уу !')
        return
    }

    if(!rowInfo || !rowInfo?.datas || !rowInfo?.headers){
        console.warn('Эксел файлын дата хуваарилах тохиргоог буюу rowInfo-г зөв тохируулсан эсэхийг шалгана уу!')
        return
    }

    /**
     * Функцыг дуудах үед оноох датаг экселийн сан унших хувилбарт оруулж байна.
     */
    function nestedProperty(obj, path) {
        return path.split('.').reduce((acc, key) => acc && acc[key] !== 'undefined' ? acc[key] : undefined, obj);
    }

    const mainData = datas.map((data, idx) => ({
        ...rowInfo.datas.reduce((acc, val) => {
            const newVal = val === 'index' ? idx + 1 : nestedProperty(data, val) || '';
            acc[val === 'index' ? 'index' : val] = newVal !== undefined ? newVal : '';
            return acc;
        }, {})
    }));

    const combo = [...mainData]

    const worksheet = utils.json_to_sheet(combo);

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet)

    const staticCells = rowInfo?.headers

    utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });


    const headerStyle = {
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
            sz:10,
            bold:true
        }
    };

    const indexStyle = {
        border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
        },
        font:{
            sz:10
        }
    };

    const defaultCellStyle = {
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

    const styleRow = 0;
    const sendRow = datas.length + 1;
    const styleCol = 0;
    const sendCol = rowInfo?.headers.length - 1;

    for (let row = styleRow; row <= sendRow; row++) {
        for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellNum]) {
                worksheet[cellNum] = {};
            }

            /**
             * Header болон дугаарлалтын хэсгийг таньж Body хэсэгт defaultCellStyle ийг оноож өгнө.
             * Хэрэв та өндөр өргөн өөрчлөхийг хүсвэл доош гүйлгэнэ үү.
             */
            worksheet[cellNum].s = row === 0 ? headerStyle : col === 0 ? indexStyle : defaultCellStyle
        }
    }

    const DEFAULT_BODY_HEIGHT = 20
    const DEFAULT_HEADER_HEIGHT = 40
    const DEFAULT_BODY_WIDTH = 20

    const tableRow = Array.from({length: datas.length},(_, vidx) => {
        return(
            { hpx: rowInfo?.height?.body ? rowInfo?.height?.body || DEFAULT_BODY_HEIGHT : DEFAULT_BODY_HEIGHT }
        )
    })

    worksheet["!rows"] = [
        { hpx: rowInfo?.height?.header ? rowInfo?.height?.header || DEFAULT_HEADER_HEIGHT : DEFAULT_HEADER_HEIGHT },
        ...tableRow
    ];

    const tableWidth = Array.from({length: rowInfo?.datas.length - 1},(_, vidx) => {
        return(
            { wch: rowInfo?.width ? rowInfo?.width || DEFAULT_BODY_WIDTH : DEFAULT_BODY_WIDTH }
        )
    })

    worksheet["!cols"] = [
        { wch: 5 },
        ...tableWidth
    ];

    writeFile(workbook, fileName ? fileName+'.xlsx' : 'jagsaalt.xlsx', { compression: true });

}
