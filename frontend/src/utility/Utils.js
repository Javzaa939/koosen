import { Fragment, useState } from "react"
import { DefaultRoute } from "../router/routes"

import ReactPaginate from 'react-paginate'

import { Badge, Label } from 'reactstrap'

import { yupResolver } from "@hookform/resolvers/yup";

import moment from 'moment'

import { utils, writeFile  } from 'xlsx'
import { t } from "i18next";

// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = (obj) => Object.keys(obj).length === 0

// ** Returns K format from a number
export const kFormatter = (num) => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num)

// ** Converts HTML to string
export const htmlToString = (html) => html.replace(/<\/?[^>]+(>|$)/g, "")

// ** Checks if the passed date is today
const isToday = (date) => {
  const today = new Date()
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  )
}

export const moneyFormat = (value) =>
{
    let currency = Number(value ?? 0).toLocaleString('en-US')
    return currency
}

/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
export const formatDate = (date, format="YYYY-MM-DD") =>
{
  return moment(date).format(format)
}

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting = { month: "short", day: "numeric" }

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: "numeric", minute: "numeric" }
  }

  return new Intl.DateTimeFormat("en-US", formatting).format(new Date(value))
}

/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => localStorage.getItem("userData")
export const getUserData = () => JSON.parse(localStorage.getItem("userData"))

/**
 ** This function is used for demo purpose route navigation
 ** In real app you won't need this function because your app will navigate to same route for each users regardless of ability
 ** Please note role field is just for showing purpose it's not used by anything in frontend
 ** We are checking role just for ease
 * ? NOTE: If you have different pages to navigate based on user ability then this function can be useful. However, you need to update it.
 * @param {String} userRole Role of user
 */
export const getHomeRouteForLoggedInUser = (userRole) => {
  if (userRole === "admin") return DefaultRoute
  if (userRole === "client") return "/access-control"
  return "/login"
}

// ** React Select Theme Colors
export const selectThemeColors = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: "#7367f01a", // for option hover bg-color
    primary: "#7367f0", // for selected option bg-color
    neutral10: "#7367f0", // for tags bg-color
    neutral20: "#ededed", // for input border-color
    neutral30: "#ededed" // for input hover border-color
  }
})

// React-select- н style
const targetHeight = 30;

export const ReactSelectStyles = {
  control: (base, state) => ({
    ...base,
    fontSize: '12px',
    minHeight: 'initial',
  }),
  valueContainer: (base) => ({
    ...base,
    height: 'auto',
    padding: '0 8px',
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '12px',
    padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
  }),
  menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
  menu: provided => ({ ...provided, zIndex: 9999 }),
  multiValue: (base) => ({
    ...base,
  })
};

export const ReactSelectStyleWidth = {
  control: (base, state) => ({
    ...base,
    fontSize: '12px',
    minHeight: 'initial',
  }),
  valueContainer: (base) => ({
    ...base,
    height: 'auto',
    padding: '0 8px',
    width: '100%',
    minWidth: '100px',
    maxWidth: '150px'
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '12px',
    padding: `${(targetHeight - 20 - 1 - 1) / 2}px`,
  }),
  menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
  menu: provided => ({ ...provided, zIndex: 9999 }),
  multiValue: (base) => ({
    ...base,
  })
};
// {value: 'value1', label: 'label'} to ====> data
export const valueLabelToArray = (data) =>
{
  return data.map(
      (element) =>
      {
        return element.value
      }
  )
}

// value type хөрвүүлэх
export const valueTypeToInputType = value_type => {

    switch(value_type) {
        case 'boolean':
            return 'checkbox'
        case 'date':
            return 'date'
        case 'double':
            return 'number'
        case 'link':
            return 'text'
        // TODO: шалгах
        case 'multi-select':
            return 'checkbox'
        case 'multi-text':
            return 'textarea'
        case 'number':
            return 'number'
        case 'single-select':
            return 'option'
        default:
            return 'text'
    }
}

// ** Pagination Previous Component
export const Previous = () => {
  return (
    <Fragment>
      <span className='align-middle d-none d-md-inline-block'>{t('Өмнөх')}</span>
    </Fragment>
  )
}

// ** Pagination Next Component
export const Next = () => {
  return (
    <Fragment>
      <span className='align-middle d-none d-md-inline-block'>{t('Дараах')}</span>
    </Fragment>
  )
}

/**
 ** Datatable хуудаслалт
 * @param {Function} handlePagination Хуудас солих үед ажиллах функц
 * @param {String} searchValue Хайлт хийх утга
 * @param {String} pageNo Сонгосон хуудасны дугаар
 * @param {Array} filteredData Хайлтын дагуух дата
 * @param {String} rowsPerPage Хуудсанд харуулах датаны лимит
 * @param {String} total_count Нийт датаны тоо
*/
export function getPagination(handlePagination, pageNo, rowsPerPage, total_count, searchValue='', filteredData='') {
    const page_count = Math.ceil(total_count / rowsPerPage)
    var filtered_page_count = 1
    if(searchValue && searchValue.length) {
      filtered_page_count = Math.ceil(filteredData.length / rowsPerPage)
    }
    if (pageNo > page_count) {
      pageNo = 1
    }
    const CustomPagination = () => (
      <div className="d-flex align-items-center justify-content-end flex-wrap mt-1">
			<Label className="mx-2 text-wrap">
				{
					searchValue && searchValue.length
					?
						<>
							Дэлгэцэнд: {(pageNo - 1) * rowsPerPage + 1} - {
								rowsPerPage != -1
									?
									((pageNo) * rowsPerPage > filteredData.length)
										?
										filteredData.length
										:
										(pageNo) * rowsPerPage
									:
									filteredData.length
							} Нийт: {filteredData.length} бичлэг
						</>
					:
						<>
							Дэлгэцэнд: {(pageNo - 1) * rowsPerPage + 1} - {
								rowsPerPage != -1
									?
									((pageNo) * rowsPerPage > total_count)
										?
										total_count
										:
										(pageNo) * rowsPerPage
									:
									total_count
							} Нийт: {total_count} бичлэг
						</>
				}
			</Label>
        <ReactPaginate
          previousLabel={<Previous size={15} />}
          nextLabel={<Next size={15} />}
          forcePage={
            searchValue.length
            ?
              (pageNo > filtered_page_count) ? (filtered_page_count !== 0 ? filtered_page_count - 1 : 0) : (pageNo !== 0 ? pageNo - 1 : 0)
            :
            (pageNo > page_count) ? 0 : (pageNo !== 0 ? pageNo - 1 : 0)
          }
          onPageChange={page => handlePagination(page)}
          pageCount={
            searchValue && searchValue.length
              ? filtered_page_count
              : page_count || 1
          }
          breakLabel={'...'}
          pageRangeDisplayed={2}
          marginPagesDisplayed={2}
          activeClassName={'active'}
          pageClassName={'page-item'}
          nextLinkClassName={'page-link'}
          nextClassName={'page-item next'}
          previousClassName={'page-item prev'}
          previousLinkClassName={'page-link'}
          pageLinkClassName={'page-link'}
          breakClassName='page-item'
          breakLinkClassName='page-link'
          containerClassName={'pagination react-paginate pagination-sm justify-content-end pe-1 mt-1'}
        />
      </div>
    )
    return CustomPagination
}

/** form data-гийн field-ийн утга хоосон байвал null болгоно.
 * @param {object} datas
 */
 export const convertDefaultValue = (datas) => {
    for (let field in datas) {
      let value = datas[field]
      if (!value && typeof(value) != 'boolean') {
        datas[field] = null
      }
    }
  return datas
}

// return Validation
export const validate = (validation) => {
    const isValidation = {
      mode: "onTouched",
      reValidateMode: "onChange",
      resolver: yupResolver(validation),
    }
    return isValidation
}


/**
 * Converts table to CSV
 * @param {Array} downloadData татах гэж байгаа дата
 * @param {object} excelColumns баганы нэрийг монгол нэршилтэй болгох
*/
function convertArrayOfObjectsToCSV(downloadData, excelColumns) {
    let result

    const columnDelimiter = ','
    const lineDelimiter = '\n'

    const keys = Object.keys(downloadData[0])

    // Excel файлын баганын нэрийг криллээр болгох
    let excel_col_keys = []
    keys.forEach(key => {
        excel_col_keys.push(excelColumns[key])
    })

    result = ''
    result += excel_col_keys.join(columnDelimiter)
    result += lineDelimiter

    downloadData.forEach(item => {
        let ctr = 0
        keys.forEach(key => {
            if (ctr > 0) result += columnDelimiter

            result += item[key]

            ctr++
        })
        result += lineDelimiter
    })

    return result
}

/**
 * Downloads CSV
 * @param {Array} downloadData татах гэж байгаа дата
 * @param {object} excelColumns баганы нэрийг монгол нэршилтэй болгох
 * @param {String} filename хадгалах гэж байгаа файлын нэр
*/
export function downloadCSV(downloadData, excelColumns, filename='export')  {
    const link = document.createElement('a')

    let csv = convertArrayOfObjectsToCSV(downloadData, excelColumns)
    if (csv === null) return

    if (!csv.match(/^data:text\/csv/i)) {
        csv = `data:text/csv;charset=utf-8,${csv}`
    }

    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', filename + '.csv')
    link.click()
}

/**
 * Downloads EXCEL
 * @param {Array} downloadData татах гэж байгаа дата
 * @param {object} excelColumns баганы нэрийг монгол нэршилтэй болгох
 * @param {String} filename хадгалах гэж байгаа файлын нэр
*/
export function downloadExcel(download_data, excelColumns, filename='export') {
    const keys = Object.keys(download_data[0])

    // Баганын нэрийг Монгол болгох хэсэг
    let excel_col_keys = []
    keys.forEach(key => {
        excel_col_keys.push(excelColumns[key])
    })

    /* generate worksheet and workbook */
    const worksheet = utils.json_to_sheet(download_data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // /* fix headers */
    utils.sheet_add_aoa(worksheet, [excel_col_keys], { origin: "A1" });

    return writeFile(workbook, filename + '.xlsx')
}

//string утгыг bool рүү хөрвүүлэх
export const stringToBoolean = (stringValue) => {
    if (typeof stringValue == "boolean") {
        return stringValue
    }
    else if (typeof stringValue === 'string') {
        switch(stringValue?.toLowerCase()?.trim()){
            case "true":
            case "1":
            return true;

            case "false":
            case "0":
            return false;

            default:
            return JSON.parse(stringValue);
        }
    }
    else {
        throw "Invalid input";
    }
}

export const generateLessonYear = ( year ) =>{

  var today = new Date();
  var now_year = today.getFullYear();
  const start_year = now_year - year
  const years = []

  for (var i = now_year; i >= start_year; i--) {
    var value = i + '-' + (i + 1)
    var check_years = { id: value, name: value }
    years.push(check_years);
  }

  return years
}

export const get_ys_undes = () => {
  var datas = []
  const yas_undes = [
    "Халх",
    "Баяд",
    "Буриад",
    "Барга",
    "Дарьганга",
    "Дархад",
    "Дөрвөд",
    "Мянгад",
    "Захчин",
    "Өөлд",
    "Торгууд",
    "Үзэмчин",
    "Хамниган",
    "Харчин",
    "Хотгойд",
    "Цахар",
    "Казак",
    "Урианхай",
    "Хотон",
    "Сартуул",
    "Элжигэн",
    "Бусад",
  ]
  yas_undes.map((undes) => {
    var check_undes = { id: undes, name: undes }
    datas.push(check_undes)
  })
  return datas
}

export const get_admission_before = () => {
  var datas = []
  const admission_before = [
    "12-р ангиас",
    "Өөр хэлбэрийн сургуулиас",
    "Ажиллагсадаас",
    "Ажилгүйчүүдээс",
    "Их, дээд сургуулийн шилжилт/Монгол улс/",
    "Бүрэлдэхүүн сургууль институтийн хооронд шилжилт",
    "Шууд элсэлтээр",
    "Давхар мэргэжлээр",
    "Гадаадад суралцагчдаас",
    "Их, дээд сургуулийн шилжилт/Гадаад улс/",
    "Хичээл солилцооны системээс",
  ]
  admission_before.map((admission_before) => {
    var check_admission_before = { id: admission_before, name: admission_before }
    datas.push(check_admission_before)
  })
  return datas
}

/** Боловсролын түвшин */
export const get_education_list = () => {
  const datas = []
  const lists = [
    "СӨБ",
    "Бага, суурь",
    "Бүрэн дунд",
    "Мэргэжлийн боловсрол",
    "Дээд боловсрол",
  ]
  lists.map((list, idx) => {
    var data = { id: idx+1, name: list }
    datas.push(data)
  })
  return datas
}

/** Өрөөний төрөл */
export const get_room_type = () => {
  const datas = []
  const lists = [
    'Лаборатор',
    'Лекц',
    'Семинар',
    'Спорт заал',
    'Номын сан',
    'Бялдаржуулах төв',
    'Бусад'

  ]
  lists.map((list, idx) => {
    var data = { id: idx+1, name: list }
    datas.push(data)
  })
  return datas
}
/** Хичээлийн төрөл */
export const get_lesson_type = () => {
  const datas = []
  const lists = [
    'Танхим',
    'Онлайн хичээл',
    'Хосолсон',
  ]
  lists.map((list, idx) => {
    var data = { id: idx+1, name: list }
    datas.push(data)
  })
  return datas
}

/* Өдрийн жагсаалт*/
export const get_day = () => {
  const datas = []
  const lists = [
    'Даваа',
    'Мягмар',
    'Лхагва',
    'Пүрэв',
    'Баасан',
    'Бямба',
    'Ням'
  ]
  lists.map((list, idx) => {
    var data = { id: idx+1, name: list }
    datas.push(data)
  })
  return datas
}

/*Хичээлийн түвшин*/
export const lesson_level = () => {
  const datas = []
  const list = [
    'Ерөнхий суурь хичээл',
    'Мэргэжлийн суурь хичээл',
    'Мэргэжлийн хичээл',
    "Диплом"
  ]
  list.map((list, idx) => {
    var data = {id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

/*Хичээлийн төрөл*/
export const lesson_type = () => {
  const datas = []
  const list = [
    'Заавал үзэх',
    'Сонгон судлах',
    'Дадлага',
    'Диплом'
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

/* Цагийн жагсаалт*/
export const get_time = () => {
  const datas = []
  var idx = 0
  for(idx = 0; idx < 8; idx++)
  {
    var data = { id: idx+1, name: (idx+1).toString() +'-р пар' }
    datas.push(data)
  }
  return datas
}

/*Сургалтын төлбөрийн эхний үлдэгдэл*/
export const first_balance = () => {
  const datas = []
  const list = [
    'Төлбөрийн илүү',
    'Төлбөрийн дутуу'
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

/*Гүйлгээний төрөл*/
export const get_BALANCE_FLAG = () => {
  const datas = []
  const list = [
    'Төлсөн төлбөр',
    'Буцаасан төлбөр'
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}


/*Сургалтын төлөвлөгөөний улирал*/
export const get_learningplan_season = () => {
  const datas = []
  const list = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

/*Дахин шалгалтын төлвийг харуулах */
export const get_EXAM_STATUS = () => {
  const datas = []
  const list = [
      'Нөхөн шалгалт',
      'Шууд тооцох шалгалт',
      'Дүн ахиулах шалгалт'
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

/** File extension шалгах функц */
export const check_image_ext = (file) => {

  var check = false
  const image_extension = ['png', 'jpg' , 'jpeg', 'svg']

  var file_name = file.name
  const splitted = file_name.split(".")
  const ext = splitted[splitted.length - 1]

  if (image_extension.includes(ext)) {
    check = true
  }

  return check
}


/** Сургалтын үйл ажиллагаанд хамрагдах хүмүүсийн төрөл  */
export const get_event_people_type = () => {
  const datas = []
  const options = [
    { value: 'Оюутан', color: '#28C76F' },
    { value: 'Багш',  color: '#FF9F43' },
    { value: 'Ажилчид', color: '#FF6666' },
    { value: 'Бусад', color: '#00CFE8' },
  ]

  options.map((list, idx) => {
    var data = {id: idx+1, name:list.value, color: list.color}
    datas.push(data)
  })
  return datas
}

/** Дотуур байранд амьдрах хүсэлт гаргасан оюутны шийдвэрийн төрөл  */
export const get_solved_type = (type='') => {
  const options = [
    // { id: 1, name: 'ИЛГЭЭСЭН', color: 'primary' },
    { id: 2, name: 'Баталгаажсан',  color: 'success' },
    { id: 3, name: 'Буцаасан',  color: 'warning' },
    { id: 4, name: 'Зөвшөөрсөн', color: 'primary' },
    { id: 5, name: 'Татгалзсан', color: 'danger' },
    { id: 6, name: 'Цуцалсан', color: 'danger' },
  ]

  if(type) {
    options.unshift({ id: 1, name: 'Шинэ', color: 'primary' })
  }

  return options
}

/** Тэтгэлэгийн хүсэлт илгээсэн оюутны шийдвэрийн төрөл */
export const SOLVED_TYPES = ( flag ) => {
  var options = []
  if(flag === 1)
  {
    options = [
      { id: 2, name: 'БУЦААСАН',  color: 'warning' },
      { id: 3, name: 'ЗӨВШӨӨРСӨН', color: 'success' },
      { id: 4, name: 'ТАТГАЛЗСАН', color: 'danger' },
    ]
  }
  else if(flag === 2) {
    {
      options = [
        { id: 3, name: 'Зөвшөөрсөн', color: 'success' },
        { id: 4, name: 'Татгалзсан', color: 'danger' },
      ]
    }
  }
  else
  {
    options = [
      { id: 1, name: 'ИЛГЭЭСЭН', color: 'primary' },
      { id: 2, name: 'БУЦААСАН',  color: 'warning' },
      { id: 3, name: 'ЗӨВШӨӨРСӨН', color: 'success' },
      { id: 4, name: 'ТАТГАЛЗСАН', color: 'danger' },
    ]
  }

  return options
}

/** Хичээлийн хуваарийн хичээллэх 7 хоногийн төрөл*/
export const get_oddeven_type = () => {
  const options = [
    { id: 1, name: 'Сондгой'},
    { id: 2, name: 'Тэгш' },
    { id: 3, name: 'Дандаа' },
  ]

  return options
}

/** Хичээллэх 7 хоног */
export const get_week = (loop_num=16) => {
  const datas = []

  for(let step = 0; step < loop_num; step++) {
    var name = `${step+1}-р долоо хоног`
    var data ={id: step+1, name:name}
    datas.push(data)
  }
  return datas
}

/** Потокийн дугаарлалт*/
export const get_potok = (loop_num=20) => {
  const datas = []

  for(let step = 0; step < loop_num; step++) {
    var name = `Поток ${step+1}`
    var data ={id: step+1, name:name}
    datas.push(data)
  }
  return datas
}

/** Хүйсийн жагсаалт */
export const get_gender_list = () => {
  const datas = []
  const list = [
      'Эрэгтэй',
      'Эмэгтэй',
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

// Пар-аас хичээлийн эхлэх болон дуусах цагийг буцаана
export const get_time_date = (value, day='', date='') => {
	let start_time = ''
	let end_time = ''
	var week = getDaysOfCurrentWeek()

  // Default хичээлийэн өдрийг generate хийх
  if (day == 8) {
      var item = week.find((item) => item?.id == 1)
      var date_str = item.date
      var def_date = new Date(date_str);
      def_date.setDate(def_date.getDate() - 1);
      var date = def_date.toISOString().slice(0, 10);
  }

  if (day && day != 8) {
    var item = week.filter((item) => {
      if(item.id == day ) {
        return item.date
      }
    })
  }

	var week_day_date = day && day != 8  ? item[0]?.date : date

	if (value === 1) {
		start_time = '08:00:00'
		end_time = '09:30:00'
	}
	else if (value === 2) {
		start_time = '09:30:00'
		end_time = '11:00:00'
	}
	else if (value === 3) {
		start_time = '11:00:00'
		end_time = '12:30:00'
	}
	else if (value === 4) {
		start_time = '12:30:00'
		end_time = '14:00:00'
	}
	else if (value === 5) {
		start_time = '14:00:00'
		end_time = '15:30:00'
	}
	else if (value === 6) {
		start_time = '15:30:00'
		end_time = '17:00:00'
	}
	else if (value === 7) {
		start_time = '17:00:00'
		end_time = '18:30:00'
	}
	else if (value === 8) {
		start_time = '18:30:00'
		end_time = '20:00:00'
	}

	var times = {
		start_time: `${week_day_date}T${start_time}`,
		end_time: `${week_day_date}T${end_time}`
	}

	return times
}


export const getDaysOfCurrentWeek = ( ) => {
	var weekdate = ''

	var current = new Date()
	var week = []

  var first = current.getDate() - current.getDay() + 1;

  // Амралтын өдрөөр өмнөх 7 хоногоо харуулна
  if (current.getDay() == 0) {
    first  = current.getDate() - 6
  } else if (current.getDay() == 0) {
    first  = current.getDate() - 5
  }

	current.setDate(first);

	for (var i = 0; i < 7; i++) {
		var daysOfWeek = new Object()

		var day = current.getDate()
		var month = current.getMonth() + 1
		if (day < 10) {
			day = '0' + day;
		}

		if (month < 10) {
			month = `0${month}`;
		}
		weekdate = current.getFullYear() + '-' + month + '-' + day;
		daysOfWeek['id'] = i + 1
		daysOfWeek['date'] = weekdate
		week.push(daysOfWeek);

		current.setDate(current.getDate() + 1);
	}

	return week;
}

/** Хүсэлтийн нэгжийн жагсаалт */
export const get_unit_list = () => {
  const datas = []
  const list = [
    'Сургуулийн захирал',
    'Сургалт эрхэлсэн дэд захирал',
    'Санхүүгийн алба',
    'Бүрэлдэхүүн сургуулийн захирал',
    'Журналын архив',
    'Номын сан танхим 1',
    'Номын сан танхим 2',
    'Тэнхимийн эрхлэгч',
    'Маркетингийн алба',
    'Үнэлгээний мэргэжилтэн',
    'Бүртгэл мэдээллийн алба',
    'Зөвлөх багш',
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}


/** String time -aac хэддүгээр пар-г олох*/
export const get_par_from_strTime = (strTime) => {
  if (strTime == '08:00:00') {
    var index = 1
  }
  if (strTime == '09:30:00') {
      index = 2
  }
  if (strTime == '11:00:00') {
      index = 3
  }
  if (strTime == '12:30:00') {
      index = 4
  }
  if (strTime == '14:00:00') {
      index = 5
  }
  if(strTime == '15:30:00') {
      index = 6
  }
  if(strTime == '17:00:00') {
      index = 7
  }
  if(strTime == '18:30:00') {
      index = 8
  }

  return index
}

/** Өрөөний төрлийн түрээслэх хэлбэр */
export const get_rent_type = () => {
  const datas = []
  const list = [
    'Оюутан /Хичээлийн жилээр/',
    'Айл /Сар өдрөөр/',
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

const get_time_par = (value) =>{
  var times = {}
  if (value === 1) {
		var start_time = '08:00'
		var end_time = '09:30'
	}
	else if (value === 2) {
		start_time = '09:40'
		end_time = '11:10'
	}
	else if (value === 3) {
		start_time = '11:20'
		end_time = '12:50'
	}
	else if (value === 4) {
		start_time = '13:20'
		end_time = '14:50'
	}
	else if (value === 5) {
		start_time = '15:00'
		end_time = '16:30'
	}
	else if (value === 6) {
		start_time = '16:40'
		end_time = '18:10'
	}
	else if (value === 7) {
		start_time = '18:20'
		end_time = '19:50'
	}
	else if (value === 8) {
		start_time = '18:30'
		end_time = '20:00'
	}

  times['start'] = start_time
  times['end'] = end_time

  return times

}

export const club_type_option = [
  {
    id: 1,
    name: 'Сургалт'
  },
  {
    id: 2,
    name: 'Спорт'
  },
  {
    id: 3,
    name: 'Соёл урлаг'
  },
  {
    id: 4,
    name: 'Бүтээлч урлал'
  },
  {
    id: 5,
    name: 'Олон нийт'
  }
]

export const order_flag_datas = [
  {
    id: 1,
    name: 'Захиалсан'
  },
  {
    id: 2,
    name: 'Цуцалсан'
  },
  {
    id: 3,
    name: 'Ирсэн'
  },
]

export const convert_kurats_times = (start_date, end_date, ktimes) => {
  var return_times = {}

  if (ktimes.length > 0) {

    var start_time = ktimes[0]
    var end_time = ktimes[ktimes.length-1]

    var s_datas = get_time_par(start_time)
    var e_datas = get_time_par(end_time)

    return_times['start'] = `${start_date}T${s_datas.start}`
    return_times['end'] = `${end_date}T${e_datas.end}`
  }

  return return_times
}

/** Хичээлийн хуваарийн хичээллэх 7 хоногийн төрөл*/
export const get_complaint_type = () => {
  const options = [
    { id: 1, name: 'Жилийн чөлөөнөөс ирэх'},
    { id: 2, name: 'Анги солих' },
    { id: 3, name: 'Улиран суралцах' },
    { id: 4, name: 'Төгсөх хүсэлт' },
    { id: 5, name: 'Дүнгийн зөрчил арилгуулах' },
    { id: 6, name: 'Бусад санал хүсэлт, гомдол' },
  ]

  return options
}

/** Дүйцүүлэлтийн төрөл */
export const get_correspond_type = () => {
  const datas = []
  const lists = [
    'Өөр сургуулиас ирсэн',
    'Сургууль төгсөөд ирсэн',
    'Өөр мэргэжлээс ирсэн',
  ]

  lists.map((list, idx) => {
    var data = { id: idx + 1, name: list }
    datas.push(data)
  })

  return datas
}

export const get_complain_menus = () => {
  const datas = []

  const lists = [
    'Өргөдөл',
    'Дүнгийн дүйцүүлэлт',
    'Чөлөөний хүсэлт',
    'Тойрох хуудас'
  ]

  lists.map((list, idx) => {
    var data = { id: `complaint${idx + 2}`, name: list }
    datas.push(data)
  })

  return datas
}

// Тийм үгүй төрлийн жагсаалт//
export const get_boolean_list = () => {
  const datas = []
  const list = [
    'Тийм',
    'Үгүй',
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}

// Мөнгөний формат
export function getFormatedCurrency(currency) {
  var total_amount = 0
  if ( currency ){
    total_amount = parseFloat(currency).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  }

  return total_amount
}

// Оны жагсаалт
export const generateYear = ( year ) =>{

  var today = new Date();
  var now_year = today.getFullYear();
  const start_year = now_year - year
  const years = []

  for (var i = now_year+3; i >= start_year; i--) {
    var check_years = { id: i, name: i }
    years.push(check_years);
  }
  return years
}

// Сарын жагсаалт
export const generateMonths = () =>{
  const months = []

  for (var i = 1; i <= 12; i++) {
    var check_month = { id: i, name: i }
    months.push(check_month);
  }
  return months
}

export const request_flag_color = (request_flag) => {
     let color = ''
        let request_flag_name = ''

        if(request_flag === 1){
            color = 'light-info'
            request_flag_name = ' Оюутан илгээсэн'
        }
        else if (request_flag === 2) {
            color = 'light-warning'
            request_flag_name = 'Оюутан цуцалсан'
        }
        else if (request_flag === 3) {
            color = 'light-success'
            request_flag_name = 'Зөвшөөрсөн'
        }
        else if (request_flag === 4) {
          color = 'light-danger'
          request_flag_name = 'Татгалзсан'
        }

        return (
			 <Badge color={color}>
				{request_flag_name}
			 </Badge>
        )
    }

export const state_flag_color = (request_flag) => {
  let color = ''
      let request_flag_name = ''

      if(request_flag === 1){
          color = 'light-info'
          request_flag_name = 'Эхлээгүй'
      }
      else if (request_flag === 2) {
          color = 'light-success'
          request_flag_name = 'Явагдаж буй'
      }
      else if (request_flag === 3) {
          color = 'light-danger'
          request_flag_name = 'Дууссан'
      }

      return (
    <Badge color={color}>
      {request_flag_name}
    </Badge>
      )
  }

export const request_flag_option = () => {
  " Хүсэлт шийдвэрлэх үед ашиглах функц"
        const options = [
          { id: 3, name: 'Зөвшөөрсөн', color: 'success' },
          { id: 4, name: 'Татгалзсан', color: 'danger' },
        ]
        return options
    }

/** Зар мэдээ харах хүмүүсийн төрөл  */
export const get_news_people_type = () => {
  const datas = []
  const options = [
    { value: 'Оюутан', color: '#28C76F' },
    { value: 'Багш',  color: '#FF9F43' },
    { value: 'Ажилчид', color: '#FF6666' },
    { value: 'Бүгд', color: '#00CFE8' },
  ]

  options.map((list, idx) => {
    var data = {id: idx+1, name:list.value, color: list.color}
    datas.push(data)
  })
  return datas
}

/*Оюутны курсын жагсаалт*/
export const student_course_level = () => {
  const datas = []
  const options = [
    { id:1, name: 'I курс' },
    { id:2, name: 'II курс' },
    { id:3, name: 'III курс' },
    { id:4, name: 'IV курс' },
    { id:5, name: 'V курс' },
    { id:6, name: 'VI курс' },
    { id:7, name: 'Бүгд' },
  ]
  options.map((list, idx) => {
    var data ={id: idx+1, id:list.id, name: list.name}
    datas.push(data)
  })
  return datas
}

export const keysHaveValue = (data, keys) =>
{

  let finalData = data

  for (let key of keys)
  {
    if (finalData[key])
    {
      finalData = finalData[key]
    }
    else
    {
      return ''
    }
  }

  return finalData
}

/** Хүснэгт хэвлэхэд ашиглах style */
export const printTableBody = `
    body
    {
        font-family: Arial;
        font-size: 10pt;
    }
    table
    {
        border: 1px solid #ccc;
        border-collapse: collapse;
    }
    table th
    {
        background-color: #F7F7F7;
        color: #333;
        font-weight: bold;
    }
    table th, table td
    {
        padding: 5px;
        border: 1px solid #ccc;
    }
  `

export const printTableHtml = (columnNames, datas, printTitle='') =>
{
	const mywindow = window.open("http://157.230.34.184/static/media/dxis_logo.png", "", "height=600,width=800")

	mywindow.document.write(`<html><head><title>${printTitle}</title>`)

	mywindow.document.write('<style type = "text/css">')
	mywindow.document.write(printTableBody)
	mywindow.document.write("</style>")
	mywindow.document.write("</head>")

	mywindow.document.write(`<div style="text-align: center; font-size: 30px; padding: 30px;"><span>${printTitle}</span></div>`)

	mywindow.document.write("<table>")
	mywindow.document.write('<thead>')
	mywindow.document.write('<tr>')

	mywindow.document.write(`<th>№</th>`)

	for (var column of columnNames)
	{
		mywindow.document.write(`<th>${column?.name}</th>`)
	}

	mywindow.document.write("</tr>")
	mywindow.document.write("</thead>")

	mywindow.document.write("<tbody>")

	let count = 0

	for (var idx in datas)
	{
		count++

		mywindow.document.write('<tr>')

		mywindow.document.write(`<td>${count}</td>`)

		for (var column of columnNames)
		{
			mywindow.document.write(`<td>${keysHaveValue(datas[idx], column.keys)}</td>`)
		}

		mywindow.document.write('</tr>')
	}

	mywindow.document.write("</tbody>")


	mywindow.document.write("</table>")

	mywindow.document.write("</html>")
	mywindow.print()
	mywindow.document.close()
}

// Дотуур байрны шийдэрийн төрөл
export const solved_type_color = (solved_flag) => {
  let color = ''
  let solved_flag_name = ''
  if (solved_flag === 1) {
    color = 'light-info'
    solved_flag_name = 'Шинэ'
  }
  else if (solved_flag === 2) {
    color = 'light-primary'
    solved_flag_name = 'Баталгаажсан'
  }
  else if(solved_flag === 3) {
    color = 'light-warning'
    solved_flag_name = 'Буцаасан'
  }
  else if (solved_flag === 4) {
      color = 'light-success'
      solved_flag_name = 'Зөвшөөрсөн'
  }
  else if (solved_flag === 5) {
      color = 'light-danger'
      solved_flag_name = 'Татгалзсан'
  }
  else if (solved_flag === 6) {
    color = 'light-warning'
    solved_flag_name = 'Цуцалсан'
  }
  return (
    <Badge color={color} pill>
      {solved_flag_name}
    </Badge>
  )
}

export const get_action_type = () => {
  const datas = []

  const lists = [
    'Элсэлт',
    'Сургалт',
    'Төгсөлт',
    'Олон нийтийн ажил',
    'Баяр ёслол',
    'ХУРАЛ'
  ]

  lists.map((list, idx) => {
    var data = { id: idx + 1 , name: list }
    datas.push(data)
  })

  return datas
}

export const leave_types = () =>
{
  const options = [
    { id: 1, name: 'Жилийн чөлөө' },
    { id: 2, name: 'Cарын чөлөө' },
    { id: 3, name: 'Хоногийн чөлөө' },
  ]

  return options
}
export const solved_complaint_types = () =>
{
  const options = [
    { id: 1, name: 'ИЛГЭЭСЭН' },
    { id: 2, name: 'БУЦААСАН' },
    { id: 3, name: 'ЗӨВШӨӨРСӨН' },
    { id: 4, name: 'ТАТГАЛЗСАН' },
  ]

  return options
}

/** 1 => 01 болгох Format */
export function zeroFill(number)
{
  return ('0' + number).slice(-2);
}


/** Тойрох хуудас төрлийн жагсаалт */
export const get_routingslip_list = () => {
  const datas = []
  const list = [
    'Шилжиж явсан',
    'Сургуулиас гарсан',
    'Төгсөх',
  ]
  list.map((list, idx) => {
    var data = { id: idx + 1, name: list }
    datas.push(data)
  })

  return datas
}

/** Хандах эрхийн жагсаалт */

export const permission_type_option = () => {
  const options = [
    { id: 1, name: 'Хичээлийн хуваарийн эрх' },
    { id: 2, name: 'Шалгалтын онооны эрх' },
    { id: 3, name: 'Диплом хэвлэх' },
    { id: 4, name: 'Сорил1-ийн онооны эрх' },
    { id: 5, name: 'Сорил2-ийн онооны эрх' },
    { id: 6, name: 'Багшийн онооны эрх' },
    { id: 7, name: 'Багшийн 70 оноо татах эрх' },
    { id: 8, name: 'Оюутны хичээл сонголтын эрх' },

  ]
  return options

}

// Асуултын төрлийн жагсаалт//
export const get_kind_list = () => {
  const datas = []
  const list = [
    'Нэг сонголт',
    'Олон сонголт',
    'Тийм, Үгүй сонголт',
    'Үнэлгээ',
    'Бичвэр',
  ]
  list.map((list, idx) => {
    var data ={id: idx+1, name:list}
    datas.push(data)
  })
  return datas
}


export const prof_general_direct = () => {
  " Мэргэжлийн ерөнхий чиглэл "
  const options = [
    { id: 1, name: 'Боловсрол' },
    { id: 2, name: 'Урлаг, хүмүүнлэг' },
    { id: 3, name: 'Нийгмийн шинжлэх ухаан, мэдээлэл, сэтгүүл зүй' },
    { id: 4, name: 'Бизнес, удирдахуй, хууль, эрх зүй' },
    { id: 5, name: 'Байгалийн шинжлэх ухаан, математик, статистик' },
    { id: 6, name: 'Мэдээлэл, харилцааны технологи' },
    { id: 7, name: 'Инженер, үйлдвэрлэл, барилга угсралт' },
    { id: 8, name: 'Хөдөө аж ахуй, ой, загасны аж ахуй, мал эмнэлэг' },
    { id: 9, name: 'Эрүүл мэнд, нийгмийн халамж' },
    { id: 10, name: 'Үйлчилгээ' },
  ]
  return options
}

export const mental_type = () => {
    "Хөгжлийн бэрхшээлийн төрөл "
    const options = [
      { id: 1, name: 'Харааны' },
      { id: 2, name: 'Сонсголын' },
      { id: 3, name: 'Ярианы' },
      { id: 4, name: 'Хөдөлгөөний' },
      { id: 5, name: 'Сэтгэцийн' },
      { id: 6, name: 'Хавсарсан' },
      { id: 7, name: 'Бусад' }
    ]
    return options
}

export const pay_type = () => {
    "Төлбөр төлөлт төрөл"
    const options = [
      { id: 1, name: 'Засгийн газар хоорондын тэтгэлэг' },
      { id: 2, name: 'Төрөөс үзүүлэх тэтгэлэг' },
      { id: 3, name: 'Боловсролын зээлийн сангийн хөнгөлөлттэй зээл' },
      { id: 4, name: 'Төрөөс үзүүлэх буцалтгүй тусламж' },
      { id: 5, name: 'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг' },
      { id: 6, name: 'Тухайн сургуулийн тэтгэлэг' },
      { id: 7, name: 'Хувийн зардал' },
      { id: 8, name: 'Бусад' }

    ]
    return options
}

// Асуултын төрлийн жагсаалт
export const get_questionype = () => {

	const datas = []
	const list = [
		'Нэг сонголт',
		'Олон сонголт',
		'Тийм, Үгүй сонголт',
		'Үнэлгээ',
		"Бичвэр",
	]

	list.map((list, idx) => {
		var data = {
			id: idx + 1,
			name: list,
		}

		datas.push(data)
	})

	return datas
}

export const get_leveltype = () => {

	const datas = []
	const list = [
		'Хөнгөн',
		'Дунд',
		'Хүнд',
	]

	list.map((list, idx) => {
		var data = {
			id: idx + 1,
			name: list,
		}

		datas.push(data)
	})

	return datas
}

export function fixDatetimeFormat(datetime, isTime=true) {

	if (isTime) {
		var datetime_str = moment(datetime).format('YYYY-MM-DD HH:mm:ss');
	} else {
		var datetime_str = moment(datetime).format('YYYY-MM-DD');
	}

	return datetime_str

}


/** Асуултын хугацааны төрөл */
export const get_questiontimetype = () => {

	const list = [
		{
			id: 'all',
			name: 'Бүгд'
		},
		{
			id: 'waiting',
			name: 'Эхлэх хугацаа болоогүй'
		},
		{
			id: 'progressing',
			name: 'Одоо явагдаж байгаа'
		},
		{
			id: 'finish',
			name: 'Хугацаа дууссан'
		},
	]

	return list
}


export const monthsOption = () =>{

  const months = []

  for (var i = 1; i <= 12; i++) {
      var check_months = { id: i, name: i }
      months.push(check_months);
  }
  return months
}

export const level_option = () => {
  const options = [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    { id: 4, name: '4' },
    { id: 5, name: '5' },
    { id: 6, name: '6' },
  ]
  return options
}

/**  оюутны төлөв  */
export function status(status)
  {
    let color = ''
    let status_name = ''

    if(status === 1)
    {
      color = 'light-success'
      status_name = 'Хүлээн авсан'
    }
    else if (status === 2)
    {
      color = 'light-warning'
      status_name = 'Шалгаж байгаа'
    }
    else if(status === 3){
      color = 'light-danger'
      status_name = 'Татгалзсан'

    }
    else if (status === 4)
    {
      color = 'light-info'
      status_name = 'Зөвшөөрсөн'
    }
    else if (status === 5)
    {
      color = 'light-primary'
      status_name = 'Буцаан олгосон'
    }

    return (
        <Badge color={color} >
            {status_name}
        </Badge>
    )
}

export const get_status = () => {
  const options = [
    { id: 1, name: 'Хүлээн авсан', color: 'success' },
    { id: 2, name: 'Шалгаж байгаа',  color: 'warning' },
    { id: 3, name: 'Татгалзсан',  color: 'danger' },
    { id: 4, name: 'Зөвшөөрсөн', color: 'info' },
    { id: 5, name: 'Буцаан олгосон', color: 'primary' },
  ]
  return options
}

export const get_state = () => {
  const options = [
    { id: 1, name: 'Хүсэлт илгээгдсэн', color: 'success' },
    { id: 2, name: 'Татгалзсан',  color: 'danger' },
    { id: 3, name: 'Зөвшөөрсөн', color: 'info' },
    { id: 4, name: 'Бусад', color: 'primary' },
  ]
  return options
}

/** БМ хүсэлтийн төлөв  */
export function state_names(state)
  {
    let color = ''
    let state_name = ''

    if(state=== 1)
    {
      color = 'light-warning'
      state_name = 'Хүсэлт илгээгдсэн'
    }
    else if(state === 2){
      color = 'light-danger'
      state_name = 'Татгалзсан'

    }
    else if (state === 3)
    {
      color = 'light-info'
      state_name = 'Зөвшөөрсөн'
    }
    else if (state === 4)
    {
      color = 'light-primary'
      state_name = 'Бусад'
    }

    return (
        <Badge color={color} >
            {state_name}
        </Badge>
    )

  }
export const get_states = () => {
  const options = [
    { id: 1, name: 'Хүсэлт илгээгдсэн', color: 'success' },
    { id: 2, name: 'Татгалзсан',  color: 'danger' },
    { id: 3, name: 'Зөвшөөрсөн', color: 'info' },
  ]
 return options
}

export const zeroToNumber = (max) =>
{
    const too = []
    for (let index = 0; index < max; index++) {
        too.push(index)
    }
    return too
}

export const assess_type = () => {
	const options = [
		{ id: 1, name: 'Хамгийн өндөр оноо' },
		{ id: 2, name: 'Дундаж оноо' },
	]

	return options
}


export const challenge_types = () => {
	const options = [
		{ id: 1, name: 'Сорил 1' },
		{ id: 2, name: 'Сорил 2' },
		{ id: 3, name: 'Улирлын шалгалт' },
		{ id: 4, name: 'Өөрийгөө сорих тест' },
	]

	return options
}

export const get_emp_state = () =>
{
  const options = [
    { id: 1, name: 'Ажиллаж байгаа' },
    { id: 2, name: 'Халагдсан' },
    { id: 3, name: 'Гарсан' },
  ]

  return options
}

export const get_print_type = () => {

	const option = [
		{ id: 1, name: 'см'},
    { id: 2, name: 'мм'},
	]

	return option
}

// тэтгэлэгийн төрөл
export const stipent_is_own_or_other = () =>
{
  const options = [
    { id: 1, name: 'Дотоод тэтгэлэг' },
    { id: 2, name: 'Гадны тэтгэлэг' },
  ]

  return options
}

export const score_type = () => {
	const options = [
		{ id: 1, name: 'Суурь шалгалт' },
		{ id: 2, name: 'Дагалдах шалгалт' },
	]

	return options
}

export const material_type = () => {
	const options = [
		{ id: 1, name: 'Файл' },
		{ id: 2, name: 'Видео' },
		{ id: 3, name: 'Зураг' },
		{ id: 4, name: 'Audio' },
	]

	return options
}