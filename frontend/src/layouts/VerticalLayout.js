// ** React Imports
import React, { useContext, useEffect, useState } from 'react'
import { Outlet } from "react-router-dom"

// ** Core Layout Import
// !Do not remove the Layout import
import Layout from "@layouts/VerticalLayout"

// ** Menu Items Array
import navigation from "@src/navigation/vertical"

import AuthContext from '@context/AuthContext'

const VerticalLayout = (props) =>
{
    const { user } = useContext(AuthContext)

    const [ cNavigation, setCNavigation ] = useState(navigation)
    const [ isEnd, setIsEnd ] = useState(false)

    /**
     * Хэрэглэгчийн эрх дотор байна уу гэдгийг шалгах
     * @param {Array} saveData Хадгалах утга
     * @param {Array} menus Layouts утга
     * @param {String | Boolean} checkPerm User perm-ийн шүүж шалганаа
     * @param {String} idName children-ий шалгах утга
     */
    function checkPerm(saveData, menus=[], checkPerm, idName='')
    {
        // is_superuser гэж шалгаж байгаа бол
        if (typeof checkPerm == 'boolean' && checkPerm)
        {
            var navChildren = menus.navChildren.filter(child => child.id === idName)
            if (navChildren.length > 0)
            {
                saveData = [...saveData, ...navChildren]
            }
        }
        // тухайн нэвтэрсэн хэрэглэгчийн эрхүүдээс
        else if(user.permissions.includes(checkPerm))
        {
            var navChildren = menus.navChildren.filter(child => child.id === idName)
            if (navChildren.length > 0)
            {
                saveData = [...saveData, ...navChildren]
            }
        }

        return saveData
    }

    useEffect(
        () =>
        {
            if(Object.keys(user).length > 0) {

                navigation.map((menus) =>
                {
                    if (menus && menus.navChildren && menus.navChildren.length > 0 && user && Object.keys(user).length > 0)
                    {

                        let childrenDatas = []

                        /** ----------------------------- Сургалт ---------------------------- */

                        /** Хичээлийн стандарт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'permission-read', 'permission-list')

                        /** Мэргэжлийн тодорхойлолт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-study-lessonstandart-read', 'study1')

                        /** Мэргэжлийн тодорхойлолт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-study-profession-read', 'study2')

                        /** Сургалтын төлөвлөгөө */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-study-learningplan-read', 'study3')

                        /** ----------------------------Лавлах сан ------------------------------- */

                        /** Сургууль */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-reference-school-read', 'reference1')

                        /** Тэнхим*/
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-reference-departments-read', 'reference2')

                        /** Багш */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-reference-teacher-read', 'reference3')

                        /** ---------------------------- Элсэлт------------------------------- */

                        /** Элсэлт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-elselt-read', 'elselt0')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-elselt-read', 'elselt1')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-elselt-read', 'elselt2')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-elselt-read', 'elselt3')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-elselt-read', 'elselt4')

                        /** ----------------------------Оюутан ------------------------------- */

                        /** Анги бүлгийн бүртгэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-group-read', 'student1')

                        /** Оюутны бүртгэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-register-read', 'student2')

                        /** Чөлөөний бүртгэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-leave-read', 'student3')

                        /** Шилжилтийн бүртгэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-movement-read', 'student4')

                        /** Төгсөлт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-graduate-read', 'student5')

                        /** Боловсролын зээлийн сан */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-loanfund-read', 'student7')

                        /** Оюутаны хавсралт, төгсөлтийн ажил */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-graduate-read', 'student10')

                        /** Оюутан тодорхойлолт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-student-definition-read', 'student11')

                        /** Элсэлтийн тушаал */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-print-admission-read', 'student19')
                        /** ----------------------------- Тохиргоо ---------------------------- */

                        /** Ажиллах жил */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-settings-employee-read', 'settings_employee')

                        /** Боловсролын зэрэг */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-settings-student-read', 'settings_student')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-settings-mail-read', 'settings_mail')

                        /** Эрх */
                        childrenDatas = checkPerm(childrenDatas, menus, user.is_superuser, 'settingsLevel15')

                        /** Role */
                        childrenDatas = checkPerm(childrenDatas, menus, 'role-read', 'settingsLevel16')

                        /** ----------------------------- Хичээлийн хуваарь ---------------------------- */

                        /** Цагийн хуваарь */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-timetable-register-read', 'timetable3')

                        /** Шалгалтын хуваарь */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-timetable-exam-read', 'timetable4')

                        /** Дахин шалгалт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-timetable-examrepeat-read', 'timetable5')

                        /** ----------------------------- Дүнгийн бүртгэл ---------------------------- */

                        /** Дүнгийн бүртгэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-score-read', 'score1')

                        /** Дүйцүүлсэн дүн */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-score-correspond-read', 'score2')

                        /** Дахин шалгалт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-score-restudy-read', 'score3')

                        /** Өмнөх улирлын дүн */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-score-restudy-read', 'score4')

                        /** ----------------------------- Сургалтын төлбөр ---------------------------- */

                        /** Төлбөрийн тохиргоо */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-payment-settings-read', 'studypayment1')

                        /** Төлбөрийн гүйлгээ */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-payment-balance-read', 'studypayment2')

                        /** Төлбөрийн эхний үлдэгдэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-payment-beginbalance-read', 'studypayment3')

                        /** Төлбөрийн тооцоо */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-payment-estimate-read', 'studypayment4')

                        /** Төлбөрийн хөнгөлөлт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-payment-discount-read', 'studypayment5')

                        /** ------------------------ Захиалга -------------------------------- */

                        /** Номын сан */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-order-library-read', 'order1')

                        /** Спорт заал */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-order-sporthall-read', 'order2')

                        /** Фитнесс */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-order-fitness-read', 'order3')

                        /** Эмнэлэг */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-order-hospital-read', 'order4')

                        /** ----------------------------- Тэтгэлэг ---------------------------- */

                        /** Тэтгэлэг бүртгэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-stipend-read', 'stipend1')

                        /** Тэтгэлэгийн хүсэлт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-stipend-request-read', 'stipend2')

                        /** ----------------------------- Дотуур байр ---------------------------- */

                        /** Өрөөний төрөл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-dormitory-roomtype-read', 'dormitory1')

                        /** Өрөөний бүртгэл*/
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-dormitory-rooms-read', 'dormitory2')

                        /** Төлбөрийн тохиргоо */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-dormitory-paymentconfig-read', 'dormitory3')

                        /** Дотуур байрны бүртгэл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-dormitory-request-read', 'dormitory4')

                        /** Дотуур байрны тооцоо */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-dormitory-estimate-read', 'dormitory5')

                        /** ----------------------------- Өргөдөл ---------------------------- */

                        /** Шийдвэрлэх нэгж */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-decide-unit-read', 'complaint1')

                        /** Өргөдөл */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-request-application-read', 'complaint2')

                        /** Дүнгийн дүйцүүлэлтийн хүсэлт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-request-correspond-read', 'complaint3')

                        /** Чөлөөний хүсэлт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-request-vacation-read', 'complaint4')

                        /** Тойрох хуудас */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-request-routingslip-read', 'complaint5')

                        /** ----------------------------- Хүсэлт ---------------------------- */

                        /** Олон нийтийн ажлын хүсэлт*/
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-wish-volunteer-read', 'request1')

                        /** Олон нийтийн ажлын хүсэлт*/
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-wish-club-read', 'request2')

                        /** Олон нийтийн ажлын хүсэлт*/
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-wish-tutor-read', 'request3')

                        /** ----------------------------- Хэвлэх ---------------------------- */

                        /** Хичээл сонголтын нэрс */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-print-choice-read', 'print1')

                        /** Хичээлийн хуваарь */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-print-schedule-read', 'print2')

                        /** Дүнгийн жагсаалт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-print-score-read', 'print4')

                        /** Голч дүн */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-print-gpa-read', 'print5')

                        /** Төгсөлтийн тушаал */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-print-graduate-read', 'print6')

                        /** Элсэлтийн тушаал */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-print-admission-read', 'print7')

                        /**------------------------------------"Цагийн тооцоо"----------------------------*/
                        /** Цагийн ачаалал */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-credit-volume-read', 'credit1')

                        /** Цагийн тооцоо */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-credit-estimation-read', 'credit2')

                        /** Хичээл тулгалт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-credit-confrontation-read', 'credit3')

                        /** Цагийн багшийн тооцоо */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-credit-parttime-read', 'credit5')

                        /** Цагийн тооцоо тохиргоо */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-credit-settings-read', 'credit4')

                        /** ----------------------------- Хандах эрх ---------------------------- */
                        /** Багшийн дүнгийн эрх */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-role-teacher-score-read', 'role1')

                        /** Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх*/
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-role-choice-payment-read', 'role2')

                        /** Бусад эрх */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-role-other-read', 'role3')

                        /** Тохиргоо хийх  эрх */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-role-settings-read', 'role4')

                        /** ----------------------------- Судалгаа ---------------------------- */
                        /** Судалгаа бүртгэх */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-survey-read', 'surveymain')

                        /** ----------------------------- Багшийг үнэлэх ---------------------------- */
                        /** Судалгааны асуулт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-survey-question-read', 'evaluation1')

                        /** Эрдэм шинжилгээ асуулт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science1')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science2')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science3')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science4')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science5')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science6')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science7')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science8')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science9')
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-science-read', 'science10')

                        /** ----------------------------- Шалгалт цэс ---------------------------- */
                        /** Шалгалтын асуулт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-exam-question-read', 'question')

                        /** Шалгалт */
                        childrenDatas = checkPerm(childrenDatas, menus, 'lms-exam-read', 'create')

                        menus.children = childrenDatas
                    }
                })

                cNavigation.map((menus, idx) =>
                {
                    /** navChildren-тай menu-д нэгч хүүхэд эрх нь таарахгүй бол тэрийг устгана */
                    if (menus.navChildren && (menus && menus.children && menus.children.length < 1))
                    {
                        delete cNavigation[idx];
                    }
                    /** Дан ганцаар байдаг бол permission шалгана */
                    else
                    {
                        /** Хуанли */
                        if (menus.id === 'calendar' && !user.permissions?.includes('lms-calendar-read')) delete cNavigation[idx];

                        /** Зар мэдээ */
                        if (menus.id === 'service' && !user.permissions?.includes('lms-service-news-read')) delete cNavigation[idx];

                        /** Статистик */
                        if (menus.id === 'statistic' && !user.permissions?.includes('lms-statistic-read')) delete cNavigation[idx];

                        /** Хандах эрх */
                        if (menus.id === 'role' && !user.permissions?.includes('role-read')) delete cNavigation[idx];
                    }
                })

                setIsEnd(true)
            }
        },
        [user]
    )

    return (
        <>
            {
                isEnd
                ?
                    <Layout menuData={cNavigation} {...props}>
                        <Outlet />
                    </Layout>
                :
                    null
            }
        </>
    )
}

export default VerticalLayout
