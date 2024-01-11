// ** React Imports
import React, { useContext, useEffect } from 'react'
import { Outlet } from "react-router-dom"

// ** Core Layout Import
// !Do not remove the Layout import
import Layout from "@layouts/VerticalLayout"

// ** Menu Items Array
import navigation from "@src/navigation/vertical"

import AuthContext from '@context/AuthContext'

const VerticalLayout = (props) => {
    const { user } = useContext(AuthContext)


    useEffect(() => {
        navigation.map((menus) => {
            if(menus.children && menus.children.length > 0 && user && Object.keys(user).length > 0) {
                /** ----------------------------- Сургалт ---------------------------- */

                /** Хичээлийн стандарт */
                if(!user.permissions.includes('lms-study-lessonstandart-read')) {
                    var children = menus.children.filter(child => child.id !== 'study1')
                    menus.children = children
                }
                /** Мэргэжлийн тодорхойлолт */
                if(!user.permissions.includes('lms-study-profession-read')) {
                    var children = menus.children.filter(child => child.id !== 'study2')
                    menus.children = children
                }
                /** Сургалтын төлөвлөгөө */
                if(!user.permissions.includes('lms-study-learningplan-read')) {
                    var children = menus.children.filter(child => child.id !== 'study3')
                    menus.children = children
                }

                /** ----------------------------Лавлах сан ------------------------------- */

                /** Сургууль */
                if(!user.permissions.includes('lms-reference-school-read')) {
                    var children = menus.children.filter(child => child.id !== 'reference1')
                    menus.children = children
                }
                /** Тэнхим*/
                if(!user.permissions.includes('lms-reference-departments-read')) {
                    var children = menus.children.filter(child => child.id !== 'reference2')
                    menus.children = children
                }
                /** Багш */
                if(!user.permissions.includes('lms-reference-teacher-read')) {
                    var children = menus.children.filter(child => child.id !== 'reference3')
                    menus.children = children
                }

                /** ----------------------------Оюутан ------------------------------- */

                /** Анги бүлгийн бүртгэл */
                if(!user.permissions.includes('lms-student-group-read')) {
                    var children = menus.children.filter(child => child.id !== 'student1')
                    menus.children = children
                }
                /** Оюутны бүртгэл */
                if(!user.permissions.includes('lms-student-register-read')) {
                    var children = menus.children.filter(child => child.id !== 'student2')
                    menus.children = children
                }
                /** Чөлөөний бүртгэл */
                if(!user.permissions.includes('lms-student-leave-read')) {
                    var children = menus.children.filter(child => child.id !== 'student3')
                    menus.children = children
                }
                /** Шилжилтийн бүртгэл */
                if(!user.permissions.includes('lms-student-movement-read')) {
                    var children = menus.children.filter(child => child.id !== 'student4')
                    menus.children = children
                }
                /** Төгсөлт */
                if(!user.permissions.includes('lms-student-graduate-read')) {
                    var children = menus.children.filter(child => child.id !== 'student5')
                    menus.children = children
                }
                /** Боловсролын зээлийн сан */
                if(!user.permissions.includes('lms-student-loanfund-read')) {
                    var children = menus.children.filter(child => child.id !== 'student7')
                    menus.children = children
                }
                /** Оюутаны хавсралт, төгсөлтийн ажил */
                if(!user.permissions.includes('lms-student-graduate-read')) {
                    var children = menus.children.filter(child => child.id !== 'student10')
                    menus.children = children
                }
                /** Оюутан тодорхойлолт */
                if(!user.permissions.includes('lms-student-definition-read')) {
                    var children = menus.children.filter(child => child.id !== 'student11')
                    menus.children = children
                }

                /** ----------------------------- Тохиргоо ---------------------------- */

                /** Ажиллах жил */
                if(!user.permissions.includes('lms-settings-аctiveyear-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel0')
                    menus.children = children
                }
                /** Боловсролын зэрэг */
                if(!user.permissions.includes('lms-settings-degree-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel1')
                    menus.children = children
                }
                /** Суралцах хэлбэр */
                if(!user.permissions.includes('lms-settings-learningstatus-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel2')
                    menus.children = children
                }
                /** Оюутны бүртгэлийн хэлбэр */
                if(!user.permissions.includes('lms-settings-registerstatus-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel3')
                    menus.children = children
                }
                /** Хичээлийн ангилал */
                if(!user.permissions.includes('lms-settings-lessoncategory-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel4')
                    menus.children = children
                }
                /** Хичээлийн бүлэг */
                if(!user.permissions.includes('lms-settings-lessongroup-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel9')
                    menus.children = children
                }
                /** Улирал */
                if(!user.permissions.includes('lms-settings-season-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel10')
                    menus.children = children
                }
                /** Үнэлгээний бүртгэл */
                if(!user.permissions.includes('lms-settings-score-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel11')
                    menus.children = children
                }
                /** ЭЕШ-ын хичээлийн бүртгэл */
                if(!user.permissions.includes('lms-settings-admissionlesson-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel12')
                    menus.children = children
                }
                /** Төлбөрийн хөнгөлөлтийн төрөл */
                if(!user.permissions.includes('lms-settings-discounttype-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel13')
                    menus.children = children
                }
                /** Улс */
                if(!user.permissions.includes('lms-settings-country-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsCountry13')
                    menus.children = children
                }
                /** Тодорхойлолтын гарын үсэг */
                if(!user.permissions.includes('lms-settings-signature-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel14')
                    menus.children = children
                }

                /** Эрх */
                if(!user.is_superuser) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel15')
                    menus.children = children
                }

                /** Role */
                if(!user.permissions.includes('role-read')) {
                    var children = menus.children.filter(child => child.id !== 'settingsLevel16')
                    menus.children = children
                }

                /** ----------------------------- Хичээлийн хуваарь ---------------------------- */

                /** Хичээлийн байрны бүртгэл */
                if(!user.permissions.includes('lms-timetable-building-read')) {
                    var children = menus.children.filter(child => child.id !== 'timetable1')
                    menus.children = children
                }
                /** Өрөөний бүртгэл */
                if(!user.permissions.includes('lms-timetable-room-read')) {
                    var children = menus.children.filter(child => child.id !== 'timetable2')
                    menus.children = children
                }
                /** Цагийн хуваарь */
                if(!user.permissions.includes('lms-timetable-register-read')) {
                    var children = menus.children.filter(child => child.id !== 'timetable3')
                    menus.children = children
                }
                /** Шалгалтын хуваарь */
                if(!user.permissions.includes('lms-timetable-exam-read')) {
                    var children = menus.children.filter(child => child.id !== 'timetable4')
                    menus.children = children
                }
                /** Дахин шалгалт */
                if(!user.permissions.includes('lms-timetable-examrepeat-read')) {
                    var children = menus.children.filter(child => child.id !== 'timetable5')
                    menus.children = children
                }

                /** ----------------------------- Дүнгийн бүртгэл ---------------------------- */

                /** Дүнгийн бүртгэл */
                if(!user.permissions.includes('lms-score-read')) {
                    var children = menus.children.filter(child => child.id !== 'score1')
                    menus.children = children
                }
                /** Дүйцүүлсэн дүн */
                if(!user.permissions.includes('lms-score-correspond-read')) {
                    var children = menus.children.filter(child => child.id !== 'score2')
                    menus.children = children
                }
                /** Дахин шалгалт */
                if(!user.permissions.includes('lms-score-restudy-read')) {
                    var children = menus.children.filter(child => child.id !== 'score3')
                    menus.children = children
                }
                /** Өмнөх улирлын дүн */
                if(!user.permissions.includes('lms-score-restudy-read')) {
                    var children = menus.children.filter(child => child.id !== 'score4')
                    menus.children = children
                }

                /** ----------------------------- Сургалтын төлбөр ---------------------------- */

                /** Төлбөрийн тохиргоо */
                if(!user.permissions.includes('lms-payment-settings-read')) {
                    var children = menus.children.filter(child => child.id !== 'studypayment1')
                    menus.children = children
                }
                /** Төлбөрийн гүйлгээ */
                if(!user.permissions.includes('lms-payment-balance-read')) {
                    var children = menus.children.filter(child => child.id !== 'studypayment2')
                    menus.children = children
                }
                /** Төлбөрийн эхний үлдэгдэл */
                if(!user.permissions.includes('lms-payment-beginbalance-read')) {
                    var children = menus.children.filter(child => child.id !== 'studypayment3')
                    menus.children = children
                }
                /** Төлбөрийн тооцоо */
                if(!user.permissions.includes('lms-payment-estimate-read')) {
                    var children = menus.children.filter(child => child.id !== 'studypayment4')
                    menus.children = children
                }
                /** Төлбөрийн хөнгөлөлт */
                if(!user.permissions.includes('lms-payment-discount-read')) {
                    var children = menus.children.filter(child => child.id !== 'studypayment5')
                    menus.children = children
                }

                /** ------------------------ Захиалга -------------------------------- */

                /** Номын сан */
                if(!user.permissions.includes('lms-order-library-read')) {
                    var children = menus.children.filter(child => child.id !== 'order1')
                    menus.children = children
                }
                /** Спорт заал */
                if(!user.permissions.includes('lms-order-sporthall-read')) {
                    var children = menus.children.filter(child => child.id !== 'order2')
                    menus.children = children
                }
                /** Фитнесс */
                if(!user.permissions.includes('lms-order-fitness-read')) {
                    var children = menus.children.filter(child => child.id !== 'order3')
                    menus.children = children
                }
                /** Эмнэлэг */
                if(!user.permissions.includes('lms-order-hospital-read')) {
                    var children = menus.children.filter(child => child.id !== 'order4')
                    menus.children = children
                }

                /** ----------------------------- Тэтгэлэг ---------------------------- */

                /** Тэтгэлэг бүртгэл */
                if(!user.permissions.includes('lms-stipend-read')) {
                    var children = menus.children.filter(child => child.id !== 'stipend1')
                    menus.children = children
                }
                /** Тэтгэлэгийн хүсэлт */
                if(!user.permissions.includes('lms-stipend-request-read')) {
                    var children = menus.children.filter(child => child.id !== 'stipend2')
                    menus.children = children
                }

                /** ----------------------------- Дотуур байр ---------------------------- */

                /** Өрөөний төрөл */
                if(!user.permissions.includes('lms-dormitory-roomtype-read')) {
                    var children = menus.children.filter(child => child.id !== 'dormitory1')
                    menus.children = children
                }
                /** Өрөөний бүртгэл*/
                if(!user.permissions.includes('lms-dormitory-rooms-read')) {
                    var children = menus.children.filter(child => child.id !== 'dormitory2')
                    menus.children = children
                }
                /** Төлбөрийн тохиргоо */
                if(!user.permissions.includes('lms-dormitory-paymentconfig-read')) {
                    var children = menus.children.filter(child => child.id !== 'dormitory3')
                    menus.children = children
                }

                /** Дотуур байрны бүртгэл */
                if(!user.permissions.includes('lms-dormitory-request-read')) {
                    var children = menus.children.filter(child => child.id !== 'dormitory4')
                    menus.children = children
                }

                /** Дотуур байрны тооцоо */
                if(!user.permissions.includes('lms-dormitory-estimate-read')) {
                    var children = menus.children.filter(child => child.id !== 'dormitory5')
                    menus.children = children
                }

                /** ----------------------------- Өргөдөл ---------------------------- */

                /** Шийдвэрлэх нэгж */
                if(!user.permissions.includes('lms-decide-unit-read')) {
                    var children = menus.children.filter(child => child.id !== 'complaint1')
                    menus.children = children
                }
                /** Өргөдөл */
                if(!user.permissions.includes('lms-request-application-read')) {
                    var children = menus.children.filter(child => child.id !== 'complaint2')
                    menus.children = children
                }
                /** Дүнгийн дүйцүүлэлтийн хүсэлт */
                if(!user.permissions.includes('lms-request-correspond-read')) {
                    var children = menus.children.filter(child => child.id !== 'complaint3')
                    menus.children = children
                }
                /** Чөлөөний хүсэлт */
                if(!user.permissions.includes('lms-request-vacation-read')) {
                    var children = menus.children.filter(child => child.id !== 'complaint4')
                    menus.children = children
                }
                /** Тойрох хуудас */
                if(!user.permissions.includes('lms-request-routingslip-read')) {
                    var children = menus.children.filter(child => child.id !== 'complaint5')
                    menus.children = children
                }

                /** ----------------------------- Хүсэлт ---------------------------- */

                /** Олон нийтийн ажлын хүсэлт*/
                if(!user.permissions.includes('lms-wish-volunteer-read')) {
                    var children = menus.children.filter(child => child.id !== 'request1')
                    menus.children = children
                }
                /** Олон нийтийн ажлын хүсэлт*/
                if(!user.permissions.includes('lms-wish-club-read')) {
                    var children = menus.children.filter(child => child.id !== 'request2')
                    menus.children = children
                }
                /** Олон нийтийн ажлын хүсэлт*/
                if(!user.permissions.includes('lms-wish-tutor-read')) {
                    var children = menus.children.filter(child => child.id !== 'request3')
                    menus.children = children
                }

                /** ----------------------------- Хэвлэх ---------------------------- */

                /** Хичээл сонголтын нэрс */
                if(!user.permissions.includes('lms-print-choice-read')) {
                    var children = menus.children.filter(child => child.id !== 'print1')
                    menus.children = children
                }
                /** Хичээлийн хуваарь */
                if(!user.permissions.includes('lms-print-schedule-read')) {
                    var children = menus.children.filter(child => child.id !== 'print2')
                    menus.children = children
                }
                /** Дүнгийн жагсаалт */
                if(!user.permissions.includes('lms-print-score-read')) {
                    var children = menus.children.filter(child => child.id !== 'print4')
                    menus.children = children
                }
                /** Голч дүн */
                if(!user.permissions.includes('lms-print-gpa-read')) {
                    var children = menus.children.filter(child => child.id !== 'print5')
                    menus.children = children
                }
                /** Төгсөлтийн тушаал */
                if(!user.permissions.includes('lms-print-graduate-read')) {
                    var children = menus.children.filter(child => child.id !== 'print6')
                    menus.children = children
                }
                /** Элсэлтийн тушаал */
                if(!user.permissions.includes('lms-print-admission-read')) {
                    var children = menus.children.filter(child => child.id !== 'print7')
                    menus.children = children
                }

                /** ----------------------------- Үйлчилгээ ---------------------------- */
                /** Зар мэдээ */
                if(!user.permissions.includes('lms-service-news-read')) {
                    var children = menus.children.filter(child => child.id !== 'service')
                    menus.children = children
                }

                /**------------------------------------"Цагийн тооцоо"----------------------------*/
                /** Цагийн ачаалал */
                if(!user.permissions.includes('lms-credit-volume-read')) {
                    var children = menus.children.filter(child => child.id !== 'credit1')
                    menus.children = children
                }
                /** Цагийн тооцоо */
                if(!user.permissions.includes('lms-credit-estimation-read')) {
                    var children = menus.children.filter(child => child.id !== 'credit2')
                    menus.children = children
                }

                /** Хичээл тулгалт */
                if(!user.permissions.includes('lms-credit-confrontation-read')) {
                    var children = menus.children.filter(child => child.id !== 'credit3')
                    menus.children = children
                }
                /** Цагийн багшийн тооцоо */
                if(!user.permissions.includes('lms-credit-parttime-read')) {
                    var children = menus.children.filter(child => child.id !== 'credit5')
                    menus.children = children
                }
                /** Цагийн тооцоо тохиргоо */
                if(!user.permissions.includes('lms-credit-settings-read')) {
                    var children = menus.children.filter(child => child.id !== 'credit4')
                    menus.children = children
                }
                /** ----------------------------- Хандах эрх ---------------------------- */
                /** Багшийн дүнгийн эрх */
                if(!user.permissions.includes('lms-role-teacher-score-read')) {
                    var children = menus.children.filter(child => child.id !== 'role1')
                    menus.children = children
                }
                /** Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх*/
                if(!user.permissions.includes('lms-role-choice-payment-read')) {
                    var children = menus.children.filter(child => child.id !== 'role2')
                    menus.children = children
                }

                /** Бусад эрх */
                if(!user.permissions.includes('lms-role-other-read')) {
                    var children = menus.children.filter(child => child.id !== 'role3')
                    menus.children = children
                }

                /** Тохиргоо хийх  эрх */
                if(!user.permissions.includes('lms-role-settings-read')) {
                    var children = menus.children.filter(child => child.id !== 'role4')
                    menus.children = children
                }

                /** ----------------------------- Судалгаа ---------------------------- */
                /** Судалгаа бүртгэх */
                if(!user.permissions.includes('lms-survey-read')) {
                    var children = menus.children.filter(child => child.id !== 'surveymain')
                    menus.children = children
                }

                /** ----------------------------- Багшийг үнэлэх ---------------------------- */
                /** Судалгааны асуулт */
                if(!user.permissions.includes('lms-survey-question-read')) {
                    var children = menus.children.filter(child => child.id !== 'evaluation1')
                    menus.children = children
                }

                /** Эрдэм шинжилгээ асуулт */
                if(!user.permissions.includes('lms-science-read')) {
                    var science_ids = ['science1', 'science2', 'science3', 'science4', 'science5', 'science6', 'science7', 'science8', 'science9','science10']
                    var children = menus.children.filter(child => !science_ids.includes(child.id))
                    menus.children = children
                }
            }
        })
    },[])

    useEffect(() => {
        /**  Хэрвээ дэд цэс байхгүй бол үндсэн цэсийг ч устгана */
        navigation.map((menus, idx) => {
            if(menus.children && menus.children.length < 1) {
                delete navigation[idx]
            }
        })
    },[navigation])

    return (
        <Layout menuData={navigation} {...props}>
            <Outlet />
        </Layout>
    )
}

export default VerticalLayout
