
import Settings from './Settings'
import Score from './Score'
import Study from './Study'
// import Report from './Report'
import Student from './Student'
import Request from './Request'
import TimeTable from './TimeTable'
// import StudyPayment from './StudyPayment'
import Reference from './Reference'
import Print from './Print'
import Stipend from './Stipend'
import Calendar from './Calendar'
// import Dormitory from './Dormitory'
// import Order from './Order'
import Service from './Service'
import Credit from './Credit'
import Survey from './Survey'
import TeacherEvaluation from './TeacherEvaluation'
import Role from './Role'
// import Science from './Science'
import Statistic from './Statistic'

export default [
  ...Calendar,
  ...Reference,
  ...Study,
  ...Student,
  ...Credit,
  ...TimeTable,
  ...Score,
  ...Statistic,
  // ...StudyPayment,
  ...Stipend,
  // ...Dormitory,
  ...Survey,
  // ...TeacherEvaluation,
  // ...Request,
  // ...Order,
  ...Service,
  ...Print,
  // ...Report,
  ...Settings,
  ...Role,
  // ...Science
]
