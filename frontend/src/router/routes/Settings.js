import { lazy } from "react";

const ProfessionalDegree = lazy(() => import("@views/Settings/ProfessionalDegree"))
const Learning = lazy(() => import("@views/Settings/Learning"))
const StudentRegisterType = lazy(() => import("@views/Settings/StudentRegisterType"))
const DiscountType = lazy(() => import("@views/Settings/DiscountType"))
const LessonCategory = lazy(() => import("@views/Settings/LessonCategory"))
const LessonGroup = lazy(() => import("@views/Settings/LessonGroup"))
const Season = lazy(() => import("@views/Settings/Season"))
const Score = lazy(() => import("@views/Settings/Score"))
const ActiveYear = lazy(() => import("@views/Settings/ActiveYear"))
const AdmissionLesson = lazy(() => import("@views/Settings/AdmissionLesson"))
const Country = lazy(() => import("@views/Settings/Country"))
const Student = lazy(() => import("@views/Settings/StudentSettings"))
const Teacher = lazy(() => import("@views/Settings/TeacherSettings"))
const Other = lazy(() => import("@views/Settings/OtherSettings"))
const Signature = lazy(() => import("@views/Settings/Signature"))

const SettingsRoutes = [
    {
        path: 'settings/student/',
        element: <Student />
    },
    {
        path: 'settings/teacher/',
        element: <Teacher />
    },
    {
        path: 'settings/other/',
        element: <Other />
    },
    {
        path: 'settings/studentregitertype/',
        element: <StudentRegisterType />
    },
    {
        path: 'settings/discounttype/',
        element: <DiscountType />
    },
    {
        path: 'settings/lessoncategory/',
        element: <LessonCategory />
    },
    {
        path: 'settings/lessongroup/',
        element: <LessonGroup />
    },
    {
        path: 'settings/season/',
        element: <Season />
    },
    {
        path: 'settings/score/',
        element: <Score />
    },
    {
        path: 'settings/admissionlesson/',
        element: <AdmissionLesson />
    },
    {
        path: 'settings/country/',
        element: <Country />
    },
    {
        path: 'settings/signature/',
        element: <Signature />
    },
]

export default SettingsRoutes
