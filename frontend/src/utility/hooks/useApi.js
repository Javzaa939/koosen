import axios from "axios";

import { useContext, useEffect } from "react";
import useToast from "@hooks/useToast";
import { useNavigate } from 'react-router-dom'

import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from '@context/ActiveYearContext'
import { library } from "@fortawesome/fontawesome-svg-core";

const multiPart = { headers: { 'content-type': 'multipart/form-data' } }
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


export const notif_instance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    withCredentials: true, // Хүсэлт болгонд ээр cookie явуулах нь
    xsrfHeaderName: 'X-CSRFTOKEN',
    xsrfCookieName: 'csrftoken',
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
});


export const able_instance = axios.create({
    baseURL: process.env.REACT_APP_ABLE_URL,
    withCredentials: true,
    xsrfHeaderName: 'X-CSRFTOKEN',
    xsrfCookieName: 'csrftoken',
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.kc3xuhFLonTzyzu4WzKlJETwuQaNPdX6hKeOuXHywWU"
    },
});


/**
	* @param {boolean} isDisplay Toast гаргах эсэх
 */
function useApi(isDisplay=false) {

	// Toast нэмэх функц
	const addToast = useToast()

	const { school_id } = useContext(SchoolContext)
	const { cyear_name, cseason_id } = useContext(ActiveYearContext)
	const navigate = useNavigate()

	// Хуудас шилжихэд өмнөх хүсэлтийг зогсоох
	const controller = new AbortController()

	const source = axios.CancelToken.source();
	const instance = axios.create({
		baseURL: process.env.REACT_APP_SERVER_URL,
		withCredentials: true, // Хүсэлт болгонд ээр cookie явуулах нь
		cancelToken: source.token,
		signal: controller.signal,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json",
		},
	});

    instance.defaults.headers.put['X-CSRFToken'] = getCookie('csrftoken')
    instance.defaults.headers.post['X-CSRFToken'] = getCookie('csrftoken')
    instance.defaults.headers.delete['X-CSRFToken'] = getCookie('csrftoken')

	/*
        Response дата
    */
	instance.interceptors.response.use(
		function (rsp) {
			const data = rsp?.data;
			const text = data?.info
			// хүсэлт амжилттай болоод info ирэх үед
			if (data?.success && text) {
				var type = 'success'
				if (!isDisplay) {
					if (data.code === "INF_007") {
						type='warning'
					}

					addToast(
						{
							type: type,
							text: text
						}
					)
				}
			}
			else if(!data?.success) {
				// Toast дээр error харуулах
				const err_message = data.error
				if (!isDisplay) {
					if(err_message){
						addToast(
							{
								type: 'error',
								text: err_message
							}
						)
					}
				}
			}

			return data

		},

		function (error) {

			// axios huseltiig abort hiisen uyd uildel hiihgv
            if(error.message === 'canceled')
            {
                return { success: false }
            }

			var err = error?.response?.data
			var status_code = error?.response?.status

            if ([401, 403].indexOf(status_code) !== -1) {
                navigate('/login')
            }
			else {
				if (!isDisplay) {
					addToast(
						{
							type: 'error',
							text: err?.message || 'Алдаа гарлаа. Системийн админд хандана уу.'
						}
					)
				}
            }
            return Promise.reject(err);
        }
    );

	useEffect(
        () =>
        {
            return () =>
            {
                controller.abort()
            }
        },
        []
    )

	return {
		source,
		instance,

		//  Хэрэглэгчийн мэдээлэл
		user: {
			get: (limit, page, sort, search) => instance.get(`/user/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
            post: data => instance.post('/user/', data),
			getOne: (pk) => instance.get(`/user/${pk}/`),
            put: (data, pk) => instance.put(`/user/${pk}/`, data),

			refresh_token: (user_id) => instance.post(`/user/token-refresh/${user_id}`),
            new_user_password: (token, data) => instance.post(`/user/new-user-password/${token}`, data),
            logged: () => instance.get('/user/logged/'),
			login: (data) => instance.post(`/user/login/`, data),
			logout: () => instance.get(`/user/logout/`),
			forgotPassword: (data) => instance.post(`/user/forgot-password`, data),
			changePassword: (data, pk) => instance.put(`/user/change-password/${pk}`, data),

			// Цэсний хандах эрх
			getMenu: (menu) => instance.get(`/user/menu/?menu=${menu}`),

		},
		menu:{
			get: () => instance.get(`/core/menu/`),
		},
		signature: {
			get: (typeNumber, school='') => instance.get(`/student/signature/?type=${typeNumber}&school_id=${school ? school: school_id}`),
			getGraduate: (typeNumber, school_id='') => instance.get(`/student/signature/?type=${typeNumber}&school_id=${school_id}`),
			post: (data) => instance.post(`/student/signature/`, data),
			put: (data, pk) => instance.put(`/student/signature/${pk}/`, data),
			delete: (pk) => instance.delete(`/student/signature/${pk}/`),
			changeorder: (data, typeNumber) => instance.post(`/student/signature/changeorder/?type=${typeNumber}`, data)
		},
		settings: {
			/** Бололвсролын зэрэг */
			professionaldegree: {
				get: () => instance.get(`/settings/professionaldegree/`),
				post: data => instance.post('/settings/professionaldegree/', data),
				getOne: (pk) => instance.get(`/settings/professionaldegree/${pk}/`),
				put: (data, pk) => instance.put(`/settings/professionaldegree/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/professionaldegree/${pk}/`),

			},
			/** Суралцах хэлбэр */
			learning: {
				get: () => instance.get(`/settings/learning/`),
				post: data => instance.post('/settings/learning/', data),
				getOne: (pk) => instance.get(`/settings/learning/${pk}/`),
				put: (data, pk) => instance.put(`/settings/learning/${pk}/`, data),
				delete: (pk) => instance.delete(`settings/learning/${pk}/`),
			},
			/** Оюутны бүртгэлийн төрөл */
			studentRegisterType: {
				get: () => instance.get(`/settings/studentregister/`),
				post: data => instance.post('/settings/studentregister/', data),
				getOne: (pk) => instance.get(`/settings/studentregister/${pk}/`),
				put: (data, pk) => instance.put(`/settings/studentregister/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/studentregister/${pk}/`),
			},
			/** Хичээлийн ангилал */
			lessonCategory: {
				get: () => instance.get(`/settings/lessoncategory/`),
				post: data => instance.post('/settings/lessoncategory/', data),
				getOne: (pk) => instance.get(`/settings/lessoncategory/${pk}/`),
				put: (data, pk) => instance.put(`/settings/lessoncategory/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/lessoncategory/${pk}/`),

			},
			/** Хичээлийн төрөл */
			lessonType: {
				get: () => instance.get(`/settings/lessontype/`),
				post: data => instance.post('/settings/lessontype/', data),
				getOne: (pk) => instance.get(`/settings/lessontype/${pk}/`),
				delete: (id) => instance.delete(`/settings/lessontype/${id}/`),
			},
			/** Хичээлийн түвшин */
			lessonLevel: {
				get: () => instance.get(`/settings/lessonlevel/`),
				post: data => instance.post('/settings/lessonlevel/', data),
				getOne: (pk) => instance.get(`/settings/lessonlevel/${pk}/`),
				put: (data, pk) => instance.put(`/settings/lessonlevel/${pk}/, data`),
			},
			/** Хичээлийн бүлэг */
			lessonGroup: {
				get: () => instance.get(`/settings/lessongroup/`),
				post: data => instance.post('/settings/lessongroup/', data),
				getOne: (pk) => instance.get(`/settings/lessongroup/${pk}/`),
				put: (data, pk) => instance.put(`/settings/lessongroup/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/lessongroup/${pk}/`),

			},
			/** улирал */
			season: {
				get: () => instance.get(`/settings/season/`),
				post: data => instance.post('/settings/season/', data),
				getOne: (pk) => instance.get(`/settings/season/${pk}/`),
				put: (data, pk) => instance.put(`/settings/season/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/season/${pk}/`),

			},
			/** Дүн */
			score: {
				get: () => instance.get(`/settings/score/`),
				post: data => instance.post('/settings/score/', data),
				getOne: (pk) => instance.get(`/settings/score/${pk}/`),
				put: ( data, pk) => instance.put(`/settings/score/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/score/${pk}/`),

			},
			activeyear:{
				get: () => instance.get(`/settings/activeyear/`),
				post: data => instance.post('/settings/activeyear/', data),
				getOne: (pk) => instance.get(`/settings/activeyear/${pk}/`),
				delete: (id) => instance.delete(`/settings/activeyear/${id}/`),
				put: (data, pk) => instance.put(`/settings/activeyear/${pk}/`, data),
				getActiveYear: () => instance.get(`/settings/activeyear/active/`),
			},
			/* ЭЕШ-ын хичээл */
			admissionlesson:{
				get: () => instance.get(`/settings/admissionlesson/`),
				post: data => instance.post('/settings/admissionlesson/', data),
				getOne: (pk) => instance.get(`/settings/admissionlesson/${pk}/`),
				put: (data, pk) => instance.put(`/settings/admissionlesson/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/admissionlesson/${pk}/`),

			},
			/* Төлбөрийн хөнгөлөлтийн төрөл */
			discountType:{
				get: () => instance.get(`/settings/discounttype/`),
				post: data => instance.post('/settings/discounttype/', data),
				getOne: (pk) => instance.get(`/settings/discounttype/${pk}/`),
				put: (data, pk) => instance.put(`/settings/discounttype/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/discounttype/${pk}/`),

			},
			/* Улсын нэр */
			country:{
				get: () => instance.get(`/settings/country/`),
				post: data => instance.post('/settings/country/', data),
				getOne: (pk) => instance.get(`/settings/country/${pk}/`),
				put: (data, pk) => instance.put(`/settings/country/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/country/${pk}/`),

			},
			/** Тодорхойлолтын гарын үсэг */
			signature: {
				get: () => instance.get(`/settings/signature/`),
				getDataTable: () => instance.get(`/settings/signature/data-table/`),
				getTable: (typeId) => instance.get(`/settings/signature/table/?typeId=${typeId}`),
				changeorder: (data, typeNumber) => instance.post(`/settings/signature/changeorder/?type=${typeNumber}`, data),
				post: (data) => instance.post('/settings/signature/', data),
				getOne: (pk) => instance.get(`/settings/signature/${pk}/`),
				put: (data, pk) => instance.put(`/settings/signature/${pk}/`, data),
				delete: (id) => instance.delete(`/settings/signature/${id}/`),
			},
			/** Эрх */
			permission: {
				get: (limit, page, sort, search) => instance.get(`/settings/permission/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				post: (data) => instance.post(`/settings/permission/`, data),
				put: (pk, data) => instance.put(`/settings/permission/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/permission/${pk}/`),
				list: () => instance.get(`/settings/permission/list/`),
			},
			/** Role */
			role: {
				get: () => instance.get(`/settings/role/`),
				post: (data) => instance.post(`/settings/role/`, data),
				put: (pk, data) => instance.put(`/settings/role/${pk}/`, data),
				delete: (pk) => instance.delete(`/settings/role/${pk}/`),
			},
			/* Хэвлэх тохиргоо */
			print:{
				get: () => instance.get(`/settings/print/`),
				post: data => instance.post('/settings/print/', data),
				getOne: (pk) => instance.get(`/settings/print/${pk}/`),
				put: (data, pk) => instance.put(`/settings/print/${pk}/`, data),
				delete: (id) => instance.delete(`/settings/print/${id}/`),
			},
			/* Дүрэм журмын файлын тохиргоо */
			rule:{
				get: (limit='Бүгд', page=1, sort='', search='', school=school_id || '') => instance.get(`/settings/rule/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&schoolId=${school}`),
				put: (data) => instance.put(`/settings/rule/`, data),
				delete: (id) => instance.delete(`/settings/rule/${id}/`),
			},

			/* Дүнгийн үсгэн үнэлгээ тохиргоо */
			gradeletter:{
				get: () => instance.get(`/settings/grade/`),
				post: data => instance.post(`/settings/grade/`, data),
				getOne: (pk) => instance.get(`/settings/grade/${pk}/`),
				put: (data, pk) => instance.put(`/settings/grade/${pk}/`, data),
				delete: (id) => instance.delete(`/settings/grade/${id}/`),
			},
		},
		/** Сургалт */
		study: {
			/** Хичээлийн стандарт */
			lessonStandart: {
				getList: (schoolid, dep_id) => {
					if (dep_id === undefined)
						dep_id=''
					if (schoolid === undefined)
						schoolid=''
					return instance.get(`/learning/lessonstandart/list/?school=${schoolid}&department=${dep_id}`)
				},

				// Хичээлийн хуваарьт зориулж хичээлийн лист авах
				getTimetableList: () => {
					return instance.get(`/learning/lessonstandart/timetable-list/?school=${school_id}&lesson_year=${cyear_name}&lesson_season=${cseason_id}`)
				},

				getListAll: (profession='', search='') => instance.get(`/learning/lessonstandart/list/?profession=${profession}&search=${search}`),
				getLessonListByTeacher: (profession='', teacher='') => instance.get(`/learning/lessonstandart/list/teacher/?dep=${profession}&teacher=${teacher}`),
				getOneProfessionList: (profession) => instance.get(`/learning/lessonstandart/list/profession/${profession}/`),

				get: (limit, page, sort, search, dep_id, category_id) => instance.get(`/learning/lessonstandart/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${dep_id}&category=${category_id}&schoolId=${school_id}`),
				post: data => instance.post('/learning/lessonstandart/', data),
				put: (data, pk) => instance.put(`/learning/lessonstandart/${pk}/`, data),
				getOne: (pk) => instance.get(`/learning/lessonstandart/${pk}/`),
				delete: (pk) => instance.delete(`/learning/lessonstandart/${pk}/`),
				getStudentLesson: (selected_student) => {
					return instance.get(`/learning/lessonstandart/student/list/?student=${selected_student}`)
				},
				getStudentDiplomaLessons: (selectedStudent) => instance.get(`/learning/lessonstandart/diploma/list/?student=${selectedStudent}`),
				getType: (pk) => instance.get(`/learning/lessonstandart/type/${pk}/`),
				getLessonsGroup: (group) => instance.get(`/learning/lessonstandart/group/${group}/`),
				getExam: (lesson_year=cyear_name, lesson_season=cseason_id) => instance.get(`/learning/lessonstandart/list/exam/?lesson_year=${lesson_year}&lesson_season=${lesson_season}`),

				titleplan: {
					get: (lessonID) => instance.get(`/learning/lessonstandart/titleplan/${lessonID}/`),
					post: data => instance.post('/learning/lessonstandart/titleplan/', data),
					put: (data, pk,lessonID) => instance.put(`/learning/lessonstandart/titleplan/${lessonID}/${pk}/`, data),
					getOne: (lessonID) => instance.get(`/learning/lessonstandart/titleplan/${lessonID}/`),
				},
				getGroup: (lesson, cource) => instance.get(`/learning/lessonstandart/group/score/${lesson}/?level=${cource}`),
				updateGroupScore: (lesson, data) => instance.put(`/learning/lessonstandart/group/score/${lesson}/`, data),
				getSearchList: (search, school_id = '') => instance.get(`learning/lessonstandart/search/?sSschool=${school_id}&search=${search}`),
				getSelectLessons: (state, school_id = '', is_active='') => instance.get(`learning/lessonstandart/select_bottom/?state=${state}&is_active=${is_active}&school_id=${school_id}`),


			},
			/** Хичээлийн тодорхойлолт */
			professionDefinition: {
				getList: (degreeId, department, confirm_year) => {
					var department_id = ''
					var confirm_year_id = ''
					if (department) department_id = department
					if (confirm_year) confirm_year_id = confirm_year
					return instance.get(`/learning/profession/list/?degreeId=${degreeId}&department=${department_id}&confirm_year=${confirm_year_id}&schoolId=${school_id}`)
				},
				get: (limit, page, sort, search, degree, department) => instance.get(`/learning/profession/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&degree=${degree}&department=${department}&schoolId=${school_id}`),
				post: data => instance.post('/learning/profession/', data),
				put: (data, pk) => instance.put(`/learning/profession/${pk}/`, data),
				putIntroduction: (data, pk) => instance.put(`/learning/profession/intro/${pk}/`, data),
				getOne: (pk) => instance.get(`/learning/profession/${pk}/`),
				deleteIntro: (pk) => instance.delete(`/learning/profession/${pk}/`),
				putScore: (data, pk,) => instance.put(`/learning/profession/score/${pk}/`, data),
				deleteScore: (pk) => instance.delete(`/learning/profession/score/${pk}/`),
				getAddScoreOne: (pk) => instance.get(`/learning/profession/score/${pk}/`),
				getjustProfession: () => instance.get(`/learning/profession/justprofession/?school=${school_id}`),

				// Танилцуулга дээр зураг хадгалах
				saveFile: data => instance.post(`/learning/profession/file/`, data),
				delete: (pk) => instance.delete(`/learning/profession/file/${pk}/`),
			},
			/** Сургалтын төлөвлөгөө */
			plan: {
				get: (limit, page, sort, search) => instance.get(`/learning/plan/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				search: (salbar, level, type, profession, limit, page, sort, search) => instance.get(`/learning/plan/list/${salbar}/${level}/${type}/${profession}/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				post: data => instance.post('/learning/plan/', data),
				put: (data, pk) => instance.put(`/learning/plan/${pk}/`, data),
				getOne: (pk) => instance.get(`/learning/plan/${pk}/`),
				delete: (pk) => instance.delete(`/learning/plan/${pk}/`),

				getPlan: (department, school, profession, level, type) => instance.get(`/learning/profession/plan/?department=${department}&school=${school}&profession=${profession}&level=${level}&type=${type}`),
				getPlanFromProfession: (profession) => instance.get(`/learning/plan/profession/?profession=${profession}&school=${school_id}`),
				postPlan: data => instance.post('/learning/profession/plan/', data),
				deletePlan: (pk) => instance.delete(`/learning/profession/plan/${pk}/`),

				printGetPlan: (department, profession, group, student, season) =>  instance.get(`/learning/profession/print/plan/?department=${department}&profession=${profession}&group=${group}&student=${student}&season=${season}&lesson_year=${cyear_name}&lesson_season=${cseason_id}`),

				putCopyProfession: (data) => instance.put(`/learning/profession/copy/`, data),
			},
			confirmyear: {
				get: () => instance.get(`/learning/confirmyear/`),
			},
			lesson: {

				studentlist:{
					get: (lesson, assignment='') =>
						instance.get(
							`/learning/lesson/studentlist/?lesson=${lesson}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&assignment=${assignment}`
						),
				},

				studentHomeWork: {
					/** Тухайн даалгаврын хариултууд */
					getStudentHomework: (student, assignment) =>
						instance.get(
							`/learning/lesson/homework/?student=${student}&assignment=${assignment}`
						),
					put: (pk, data) =>
						instance.put(
							`/learning/lesson/homework/${pk}/`, data
						),

					multiplePut: (data) =>
						instance.put(
							`/learning/lesson/assignment/score/`, data
						),
				},

				get: (stype = "one") =>
					instance.get(
						`/learning/lesson/list/?year=${cyear_name}&season=${cseason_id}&stype=${stype}`
					),
				getOne: (lessonId='') =>
					instance.get(`/learning/lesson/getone/`),

				/* Тухайн тэнхимийн бүх хичээлийг авах */
				getAll: (teacherId) =>
					instance.get(`/learning/lesson/getall/?teacher=${teacherId}`),

				getKreditZadargaa: (lessonId) =>
					instance.get(`/learning/lesson/kredit/${lessonId}/`),

				getMaterials: (lessonId, type='', weekId='') =>
					instance.get(`/learning/lesson/material/${lessonId}/?lesson_type=${type}&week=${weekId}`),

				postSedev: (lessonId, data, type) =>
					instance.post(`/learning/lesson/sedev/${lessonId}/?type=${type}`, data),

				postMaterialFile: (lessonId, data) =>
					instance.post(`/learning/lesson/material/${lessonId}/`, data),

				editMaterial: (id, data) =>
					instance.put(`/learning/lesson/material/${id}/`, data),

				postGeneralMaterial: (lessonId, data) =>
					instance.post(`/learning/lesson/material/general/${lessonId}/`, data),

				postAssignmentMaterial: (lessonId, data) =>
					instance.post(`/learning/lesson/material/assignment/${lessonId}/`, data),

				getAssignmentMaterial: (lessonId) =>
					instance.get(`/learning/lesson/material/assignment/${lessonId}/`),

				postEditorImage: (lessonId, data) =>
					instance.post(`/learning/lesson/editor/image/${lessonId}/`, data),

				deleteMaterial: (id) =>
					instance.delete(`/learning/lesson/material/${id}/`),

				postLessonImage: (id, data) =>
					instance.post(`/learning/lesson/image/${id}/`, data),

				getSedevAll: (lessonId) =>
					instance.get(`/learning/lesson/sedev/${lessonId}/`),

				sendMaterial: (lessonId, data) => instance.post(`/learning/lesson/material/send-material/${lessonId}/`, data),

				getLekts: (lessonId) => instance.get(`/learning/lesson/material/send-material/${lessonId}/`),

				// ХБА хичээлийн лекц батлуулах хүсэлт
				getApproveMaterial: (page, limit, sort, search, type, teacherId, lessonId) =>
					instance.get(`learning/lesson/approve/?page=${page}&limit=${limit}&type=${type}&sorting=${sort}&search=${search}&teacher=${teacherId}&lesson=${lessonId}`),

				postAnswer: (data) =>
					instance.post(`learning/lesson/approve/`, data),

				getChallenge: () =>
					instance.get(`learning/lesson/challenge/`),
			},
		},
		/** hrms-ээс */
		hrms: {
			/** Системийн хандалт*/
			get: (type) => instance.get(`/core/sys-info/?stype=${type}`),
			/** Үндсэн сургууль */
			school: {
				get: () => instance.get(`/core/school/`),
				put: (data) => instance.put(`/core/school/`, data),
			},
			/** Бүрэлдэхүүн сургууль */
			subschool: {
				get: (search='') => instance.get(`/core/subschool/?search=${search}`),
				getOne: (pk) => instance.get(`/core/subschool/${pk}/`),
				put: (data, pk) => instance.put(`/core/subschool/${pk}/`, data),
				post: data => instance.post(`/core/subschool/`, data),
				delete: (pk) => instance.delete(`/core/subschool/${pk}/`),
			},
			/** Тэнхим */
			department: {
				get: () => instance.get(`/core/department/?school=${school_id}`),
				getSelectSchool: (school) => instance.get(`/core/department/?school=${school ? school : school_id}`),

				// тэнхимийн эрхлэгчийн мэдээлэл
				getRegister: (search='') => instance.get(`/core/department/register/?school=${school_id}&search=${search}`),
				getRegisterOne: (pk) => instance.get(`/core/department/register/${pk}/`),
				putRegister: (data, pk) => instance.put(`/core/department/register/${pk}/`, data),
				postRegister: data => instance.post(`/core/department/register/`, data),
				delete: (pk) => instance.delete(`/core/department/register/${pk}/`),

				leaderList: () => instance.get(`/core/leader/list/?school=${school_id}`),

				getOne: (pk) => instance.get(`/core/department/${pk}/`),
				getTeachers: (pk) => instance.get(`/core/department/teacher/${pk}/`),
				// сургуулиас хамаарч хөтөлбөрийн багийн жагсаалт авах нь
				getDepartList: (sub_org) => instance.get(`/learning/school/list/${sub_org}/`),
				// хөтөлбөрийн багаас хамаарч мэргэжлийн жагсаалт авах нь
				getProfList: (depId) => instance.get(`/learning/prof/list/${depId}/`),
				// мэргэжлээс хамаарч ангийн жагсаалт авах нь
				getGroupList: (profId) => instance.get(`/learning/group/list/${profId}/`),

			},
			/** Багш */
			teacher: {
				get: (dep_id) => {
					var depId = ''
					if (dep_id) depId = dep_id
					return instance.get(`/core/teacher/?department=${depId}&school=${school_id}`)
				},
				getAll: (dep_id) => {
					var depId = ''
					if (dep_id) depId = dep_id
					return instance.get(`/core/teacher/all/?department=${depId}&school=${school_id}`)
				},
				getPartTeacher: () => { return instance.get(`/core/teacher/part/?school=${school_id}`) },
				getSelectSchool: (school) => instance.get(`/core/teacher/?school=${school}`),
				postRegister: (data) => instance.post(`/core/teacher/create/`, data),
				putRegister: (data, id) => instance.put(`/core/teacher/create/${id}/`, data),
				getList: (limit, page, sort, search, sub_org, salbar, position="", state="") => instance.get(`/core/teacher/list/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&sub_org=${sub_org}&salbar=${salbar}&position=${position}&state=${state}`),
				getOne: (pk) => instance.get(`/core/teacher/${pk}/`),
				getLongList: () => instance.get(`/core/teacher/longlist/`),
				getSchoolFilter: (school_id) => instance.get(`/core/teacher/listschoolfilter/?school=${school_id}`),

				resetPassword: (id) => instance.put(`/core/teacher/reset-password/${id}/`),
				/** Хичээлээс хамаарах багшийн жагсаалт */
				getTeacher: (lesson_id) => {
					var lesson = ''
					if (lesson_id) {
						lesson = lesson_id
					}
					return instance.get(`/core/teacher/lesson/?lesson=${lesson}&school=${school_id}`)
				},
				getLessonToTeacher: (lesson_id) => {
					var lesson = ''
					if (lesson_id) {
						lesson = lesson_id
					}
					return instance.get(`/core/teacher/lessonteach/?lesson=${lesson}`)
				},
				getTeacherOne: (pk) => instance.get(`/core/reference/teachers/info/${pk}/`),

				delete: (pk) => instance.delete(`/core/teacher/${pk}/`)
			},
			/** Улс */
			country: {
				get: () => instance.get(`/core/country/`),
				getOne: (pk) => instance.get(`/core/country/${pk}/`),
			},
			/** Аймаг */
			unit1: {
				get: () => instance.get(`/core/aimaghot/`),
				getOne: (pk) => instance.get(`/core/aimaghot/${pk}/`),
			},
			/** Сум */
			unit2: {
				get: (unit1) => instance.get(`/core/sumduureg/${unit1}/`),
				getOne: (pk) => instance.get(`/core/sumduureg/${pk}/`),
			},
			/** Баг */
			unit3: {
				get: (unit2) => instance.get(`/core/baghoroo/${unit2}/`),
				getOne: (pk) => instance.get(`/core/baghoroo/${pk}/`),
			},

			/** Албан тушаал */
			position: {
				get: () => instance.get(`/core/position/`),
				getAll: () => instance.get(`/core/position/all/`),
			},

		},
		/** оюутан */
		student: {
			/* Оюутны бүртгэл */
			get: (limit, page, sort, search, department, degree, profession, group, join_year, status, level, isPayed=''
				) => instance.get(`/student/info/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${department}&degree=${degree}&profession=${profession}&group=${group}&join_year=${join_year}&schoolId=${school_id}&status=${status}&level=${level}&isPayed=${isPayed}`),
			getDefinition: (limit, page, sort, search) => instance.get(`/student/definition/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}`),
			getGraduate1: (limit, page, sort, search, department, degree, profession, group) => instance.get(`/student/info/graduate1/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${department}&degree=${degree}&profession=${profession}&group=${group}`),
			getDefinitionLite: (limit, page, sort, search, group, profession, department, status='') => instance.get(`/student/definition/lite/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}&group=${group}&department=${department}&profession=${profession}&status=${status}`),
			download: ( search, department, degree, profession, group, join_year, status, level, isPayed='') => instance.get(`/student/info/download/?search=${search}&department=${department}&degree=${degree}&profession=${profession}&group=${group}&join_year=${join_year}&schoolId=${school_id}&status=${status}&level=${level}&isPayed=${isPayed}`),
			getDefinitionStudent: (type, id) => instance.get(`/student/definition/value/?type=${type}&id=${id}`),
			definition: {
				getYear: (code) => instance.get(`/student/definition/season/option/?code=${code}`),
				getSum: (data) => instance.post(`student/definition/sum/`, data),
			},
			getStudentCommandList: () =>instance.get(`/student/graduate/list/?year=${cyear_name}&season=${cseason_id}`),

			// Төгссөн оюутны бүртгэл
			getGraduate1: (limit, page, sort, search, department, degree, profession, group) => instance.get(`/student/info/graduate1/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${department}&degree=${degree}&profession=${profession}&group=${group}`),

			getList: (state, lesson, teacher, class_id) => {
				var lesson_id = ''
				var teacher_id = ''
				var classId = ''
				if (lesson) lesson_id = lesson
				if (teacher) teacher_id = teacher
				if (class_id) classId = class_id

				return instance.get(`/student/info/list/?state=${state}&lesson=${lesson_id}&teacher=${teacher_id}&class_id=${classId}&school=${school_id}`)
			},
			getSimpleList: () => instance.get(`/student/info/simplelist/`),
			getGraduate: (depId, degree, group) => instance.get(`/student/info/graduate/?department=${depId}&degree=${degree}&group=${group}&school=${school_id}`),
			postGraduate: (data) => instance.post(`/student/graduation/group/`, data),
			postCommand: (data) => instance.post(`/student/command/`, data),
			putRegNumAndDiplom: (data, pk) => instance.put(`/student/regisanddiplom/${pk}/`, data),

			getStudent: (department, degree, profession, group, join_year) => instance.get(`/student/info/list/?department=${department}&degree=${degree}&profession=${profession}&group=${group}&join_year=${join_year}&school=${school_id}`),
			getGroup: (groups, type) => {
				var group_ids = ''
				for(var i of groups) {
					group_ids += `&group_ids=${i}`
				}
				return instance.get(`/student/info/group/?${group_ids}&type=${type}`)
			},
			getRemoveGroup: (groups, type) => {
				var group_ids = ''
				for(var i of groups) {
					group_ids += `&group_ids=${i}`
				}
				return instance.get(`/student/info/group/?${group_ids}&type=${type}`)
			},
			getStudentCommandList: () =>instance.get(`/student/graduate/list/?year=${cyear_name}&season=${cseason_id}&school=${school_id}`),
			post: data => instance.post('/student/info/', data),
			getOne: (pk, type) => instance.get(`/student/info/detail/${pk}/?type=${type}`),
			put: (data, pk, type) => instance.put(`/student/info/detail/${pk}/?type=${type}&school=${school_id}`, data),
			delete: pk => instance.delete(`/student/info/${pk}/`),
			getStudentOne: (pk) => instance.get(`/student/info/all/${pk}/?year=${cyear_name}&season=${cseason_id}`),

			scoreRegister: (id) => instance.get(`/student/score-register/?id=${id}`),
			calculateGpaDimploma: (id) => instance.get(`/student/calculate-gpa-diploma/?id=${id}`),
			calculateGpaDimplomaAdd: (id, data) => instance.post(`/student/calculate-gpa-diploma/?id=${id}`, data),
			calculateGpaDimplomaGet: (studentId) => instance.get(`/student/gpa-diploma-values/?id=${studentId}`),

			getLessonStudent: (student) => instance.get(`/student/score-lesson/${student}/`),
			// оюутны жагсаалт import хийх
			postImportStudent: data => instance.post(`/student/import/`, data),
			// дата оруулах
			postStudentImportData: data => instance.post(`/student/postData/`, data),

			// Голч бодуулах загвараар ангийн хүүхдүүдийн загварыг хадгалах
			calculateGpaGroupGraduation: data => instance.post(`/student/calculate-gpa-diploma/group/`, data),

			postConfig: data => instance.post(`/student/calculate-gpa-diploma/config/`, data),
			getConfig: (group, type) => instance.get(`/student/calculate-gpa-diploma/config/?group=${group}&type=${type}`),

			/* Анги бүлгийн бүртгэл */
			group:{
				getList: (departId, degree, profession, joined_year, level='') => {
					var degree_id = ''
					var profession_id = ''
					var join_year = ''
					var depart_id = ''
					if (departId) depart_id = departId
					if (degree ) degree_id = degree
					if (profession ) profession_id = profession
					if (joined_year ) join_year = joined_year
					return instance.get(`/student/group/list/?department=${depart_id}&degree=${degree_id}&profession=${profession_id}&join_year=${join_year}&schoolId=${school_id}&level=${level}`)
				},
				getEditList: (pk) => instance.get(`/student/group/list/${pk}/`),
				get: (limit, page, sort, search, only_study, department, degree, profession, join_year) => instance.get(`/student/group/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&salbar=${department}&degree=${degree}&profession=${profession}&join=${join_year}&school=${school_id}&study=${only_study}`),
				post: data => instance.post('/student/group/', data),
				getOne: (pk) => instance.get(`/student/group/one/${pk}/`),
				put: (data, pk) => instance.put(`/student/group/one/${pk}/`, data),
				delete: (pk) => instance.delete(`/student/group/one/${pk}/`),

				getTimetableList: (lesson) => instance.get(`/student/group/timetable/${lesson}/?school=${school_id}`),

				/** Багшаас хамаарах ангийн жагсаалт */
				getGroup: (teacher) => instance.get(`/student/group/class/?teacher=${teacher}`),

				/** Бүх сургуулийн анги */
				getAllList: (profession) => {
					var profession_id = ''
					if (profession ) profession_id = profession
					return instance.get(`/student/group/list/?profession=${profession_id}`)
				},

				getLesson: (id) => instance.get(`/student/group/lesson/${id}/`),
				getExam: (id='', isShowAll='', profession='') => instance.get(`/student/group/exam/?exam=${id}&isShowAll=${isShowAll}&profession=${profession}`),
				getLessonFromExamToGroup: ({id=''}) => instance.get(`/student/group/exam-to-group/lesson/${id}/`),
				getGroupByTeacherScore: (profession='') => instance.get(`/student/group/teacherscore/?profession=${profession}`),
			},
			/** Оюутны гэр бүлийн байдал */
			family: {
				get: (student) => instance.get(`/student/family/${student}/`),
				post: data => instance.post(`/student/family/`, data),
				put: (data, pk, student) => instance.put(`/student/family/${student}/${pk}/`, data),
				delete: (student, pk) => instance.delete(`/student/family/${student}/${pk}/`)
			},
			/** Оюутны боловсрол */
			education: {
				get: (student) => instance.get(`/student/education/${student}/`),
				post: data => instance.post(`/student/education/`, data),
				put: (data, pk, student) => instance.put(`/student/education/${student}/${pk}/`, data),
				delete: (student, pk) => instance.delete(`/student/education/${student}/${pk}/`)
			},
			/** Оюутны хаяг */
			address: {
				get: (student) => instance.get(`/student/address/${student}/`),
				post: (data, student) => instance.post(`/student/address/${student}/`, data),
			},
			/** Оюутны ЭЕШ-ийн оноо */
			admissionScore: {
				get: (student) => instance.get(`/student/admission/${student}/`),
				post: data => instance.post(`/student/admission/`, data),
				put: (data, pk, student) => instance.put(`/student/admission/${student}/${pk}/`, data),
				delete: (student, pk) => instance.delete(`/student/admission/${student}/${pk}/`)
			},
			/** Оюутны шилжилт хөдөлгөөн явсан*/
			movement: {
				get: (limit, page, sort, search, checked) => instance.get(`/student/movement/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}&checked=${checked}`),
				post: data => instance.post('/student/movement/', data),
				getOne: (pk) => instance.get(`/student/movement/${pk}/`),
				put: (data, pk) => instance.put(`/student/movement/${pk}/`, data),
				delete: (pk) => instance.delete(`/student/movement/${pk}/`),
			},
			/** Оюутны шилжилт хөдөлгөөн ирсэн*/
			arrived: {
				get: (limit, page, sort, search, start, end, statement) => instance.get(`/student/arrive/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}&start=${start}&end=${end}&statement=${statement}`),
				post: data => instance.post('/student/arrive/', data),
				getOne: (pk) => instance.get(`/student/arrive/${pk}/`),
				put: (data, pk) => instance.put(`/student/arrive/${pk}/`, data),
				delete: (pk) => instance.delete(`/student/arrive/${pk}/`),
				postArrive: (data, pk) => instance.post(`/student/arrive/approve/${pk}/`, data)
			},

			/** Оюутны чөлөөний бүртгэл */
			leave: {
				get: (limit, page, sort, search, year, state) => instance.get(`/student/leave/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}&year=${year}&state=${state}`),
				post: data => instance.post('/student/leave/', data),
				getOne: (pk) => instance.get(`/student/leave/${pk}/`),
				put: (data, pk) => instance.put(`/student/leave/${pk}/`, data),
				delete: (pk) => instance.delete(`/student/leave/${pk}/`),
				putMany: (data) => instance.put(`/student/leave-students/`, data),
			},

			/** Оюутны төгсөлтийн бүртгэл */
			graduate: {
				get: (limit, page, sort, search, department, degree, group) => instance.get(`/student/graduation/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}&department=${department}&degree=${degree}&group=${group}`),
				post: data => instance.post('/student/graduation/', data),
				getOne: (pk) => instance.get(`/student/graduation/${pk}/`),
				put: (data, pk) => instance.put(`/student/graduation/${pk}/`, data),
				delete: (pk) => instance.delete(`/student/graduation/${pk}/`),
				postFile: (data) => instance.post('/student/graduation/import/', data),

				/** Дипломын QR татах */
				qr: (group) => instance.get(`/student/graduation/qr/?group=${group}`),

				/** Уйгаржин-р хичээлийн нэр хөрвүүлэх */
				lessonUigConvert: (group) => instance.get(`/student/graduation/uigarjin/convert/?group=${group}`),
				engConvert: (group) => instance.get(`/student/graduation/english/convert/?group=${group}`),
			},

			/** Боловсролын зээлийн сан */
			eduloanfund: {
				get: (limit, page, sort, search, degree, group) => instance.get(`/student/edu_loan_fund/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&degree=${degree}&group=${group}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),

			},

			/** Гадаад оюутны виз шийдвэрлэх */
			viz: {
				get:(limit, page,school, departId, profId, groupId, status) =>
				{
					var schools = ''
					var depart = ''
					var profIds = ''
					var viz_status = ''
					var groups = ''
					if (school) schools = school
					if (departId) depart = departId
					if (profId) profIds = profId
					if (groupId) groups = groupId
					if (status) viz_status = status
					return instance.get(`/student/viz-status/?page=${page}&limit=${limit}&school=${schools}&department=${depart}&profession=${profIds}&group=${groups}&status=${viz_status}`)

				},

				post: data => instance.post(`/student/viz-status/`, data),
				put: (data) => instance.put(`/student/viz-status/`, data),

			},

			/** Тайлан */
			report: {
				get: (currentYear) => instance.get(`/student/report/?school=${school_id}&currentYear=${currentYear}`),
				getGroup: () => instance.get(`/student/group/dashboard/?school=${school_id}&`),
				getCourse: () => instance.get(`/student/course/?school=${school_id}&`),
				getProfession: () => instance.get(`/student/profession/?school=${school_id}&`),
				getProvince: () => instance.get(`/student/province/?school=${school_id}&`),
				getSchool: () => instance.get(`/student/school/?school=${school_id}&`),
				getPayment: (template='') => instance.get(`/student/report/payment/?school=${school_id}&template=${template}`),
			},
			/** Суралцагчийн медал */
			medal: {
				get: (student) => instance.get(`/student/medal/${student}/`),
				post: (data, student) => instance.post(`/student/medal/${student}/`, data),
			},
		},

		/** Цагийн хуваарь */
		timetable: {

			/* Хичээлийн хуваарь экселд зориулсан нь */
			excel:{
				get: () => instance.get(`/timetable/print/?school=${school_id}`),
			},

			/* Хичээлийн байр */
			building:{
				get: () => instance.get(`/timetable/building/`),
				post: data => instance.post('/timetable/building/', data),
				getOne: (pk) => instance.get(`/timetable/building/${pk}/`),
				put: (data, pk) => instance.put(`/timetable/building/${pk}/`, data),
				delete: (pk) => instance.delete(`/timetable/building/${pk}/`),
			},
			/* Хичээлийн өрөө */
			room:{
				getList: (room_type='') => instance.get(`/timetable/room/list/?room_type=${room_type}`),
				get: () => instance.get(`/timetable/room/`),
				post: data => instance.post('/timetable/room/', data),
				getOne: (pk) => instance.get(`/timetable/room/${pk}/`),
				put: (data, pk) => instance.put(`/timetable/room/${pk}/`, data),
				delete: (pk) => instance.delete(`/timetable/room/${pk}/`),
			},
			/* Цагийн хуваарийн бүртгэл */
			register:{
				get: (limit, page, sort, search, day, group,
				lesson, teacher, time, checked, type, isOptional) => instance.get(`/timetable/register/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&day=${day}&group=${group}&lesson=${lesson}&teacher=${teacher}&time=${time}&school=${school_id}&checked=${checked}&type=${type}&isOptional=${isOptional}&lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				getCalendar: (isCalendar, selectedValue, stype, optionFilter, isVolume) => instance.get(`/timetable/register-new/?school=${school_id}&year=${cyear_name}&season=${cseason_id}&isCalendar=${isCalendar}&selectedValue=${selectedValue}&type=${stype}&option=${optionFilter}&is_volume=${isVolume}`),
				getCalendarKurats: (isCalendar, selectedValue, stype, start, end, optionFilter) => instance.get(`/timetable/register1/kurats/?school=${school_id}&year=${cyear_name}&season=${cseason_id}&isCalendar=${isCalendar}&selectedValue=${selectedValue}&type=${stype}&start=${start}&end=${end}&option=${optionFilter}`),
				// getSearchSelect: (selectType) => instance.get(`/timetable/resource/select/?school=${school_id}&year=${cyear_name}&season=${cseason_id}&stype=${selectType}`),
				post: (data, type) => instance.post(`/timetable/register/?type=${type}`, data),
				getOne: (pk) => instance.get(`/timetable/register/${pk}/`),
				getPotok: (lesson, potok) => instance.get(`/timetable/list/?lesson=${lesson}&potok=${potok}&school=${school_id}&year=${cyear_name}&season=${cseason_id}`),
				put: (data, pk) => instance.put(`/timetable/register/${pk}/`, data),
				delete: (pk) => instance.delete(`/timetable/register/${pk}/`),
				selectionDatas: (selectType, selectedValue, optionFilter, isVolume) => instance.get(`/timetable/resource1/?school=${school_id}&year=${cyear_name}&season=${cseason_id}&stype=${selectType}&selectedValue=${selectedValue}&option=${optionFilter}&is_volume=${isVolume}`),
				setEvent: (data, id) => instance.put(`/timetable/event/${id}/`, data),
				moveEvent: (data, id) => instance.put(`/timetable/register/new/${id}/`, data),
				saveFile: (data) => instance.post(`/timetable/file/`, data)
			},
			// Шалгалтын хуваарь
			exam:{
				get: (limit, page, sort, search, type, teacher) => instance.get(`/timetable/examtimetable/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}&stype=${type}&teacher=${teacher}`),
				post: data => instance.post('/timetable/examtimetable/', data),
				getOne: (pk) => instance.get(`/timetable/examtimetable/${pk}/?school=${school_id}`),
				put: (data, pk) => instance.put(`/timetable/examtimetable/${pk}/`, data),
				delete: (pk) => instance.delete(`/timetable/examtimetable/${pk}/`),

				create: () => instance.get('/timetable/examtimetable/create/'),

				// Тухайн хичээлийг үзэж буй оюутнуудын жагсаалт авах api
				getExamStudent: (lesson, room_capacity, examId='') =>
					instance.get(`/student/info/lesson/${lesson}/?group_limit=${room_capacity}&schoolId=${school_id}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&exam=${examId}`),

				getList: (is_online='') => instance.get(`/timetable/examtimetable/list/?school=${school_id}&is_online=${is_online}`),
				getStudentExamScore:(pk, lesson) => instance.put(`/timetable/examtimetable/score/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}&lesson=${lesson}`),

			},
			// Дахин шалгалтын бүртгэл
			re_exam:{
				get:(limit, page, sort, search, status,teacher) =>
					instance.get(`/timetable/exam_repeat/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&status=${status}&teacher=${teacher}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
				getList: () => instance.get(`/timetable/exam_repeat/list/`),
				getExamsList: (pk) => instance.get(`/timetable/exam_repeat/list_exam/${pk}/`),
				post: data => instance.post('/timetable/exam_repeat/', data),
				getOne: (pk) => instance.get(`/timetable/exam_repeat/${pk}/`),
				put: (data, pk) => instance.put(`/timetable/exam_repeat/${pk}/`, data),
				delete: (pk) => instance.delete(`/timetable/exam_repeat/${pk}/`),
				getExamStudent: (cdata,lesson) => instance.post(`/timetable/exam_repeat/list_exam/students/${lesson}/`,cdata),
				getExamStudentList: (pk) => instance.get(`/timetable/exam_repeat/list_exam/students/${pk}/`,),
				getStudentExamScore:(pk, lesson) => instance.put(`/timetable/exam_repeat/score/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}&lesson=${lesson}`),
				postOneStudent:(pk,student) => instance.post(`/timetable/exam_repeat/list_exam/one_student/${pk}/`,student),
				// Тухайн оюутаны хичээлийн дүнг харуулах
				getStudentLessonScore:(student, lesson) => instance.get(`/timetable/exam_repeat/score/${student}/${lesson}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
			}

		},
		// /** Сургалтын төлбөр */
		// payment: {
		// 	/* Сургалтын төлбөрийн эхний үлдэгдэл */
		// 	beginbalance:{
		// 		// get: () => instance.get(`/payment/beginbalance/`),
		// 		get: (limit, page, sort, search, departId, degree, joined_year, group, is_iluu) =>
		// 			instance.get(`/payment/beginbalance/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${departId}&degree=${degree}&joined_year=${joined_year}&group=${group}&school=${school_id}&is_iluu=${is_iluu}`),
		// 		post: data => instance.post('/payment/beginbalance/', data),
		// 		getOne: (pk) => instance.get(`/payment/beginbalance/${pk}/`),
		// 		put: (data, pk) => instance.put(`/payment/beginbalance/${pk}/`, data),
		// 		delete: (pk) => instance.delete(`/payment/beginbalance/${pk}/`),
		// 	},
		// 	/* Сургалтын төлбөрийн тохиргоо */
		// 	paymentsetting:{
		// 		// get: () => instance.get(`/payment/paymentsettings/`),
		// 		get: (limit, page, sort, search, degree, join_year) =>
		// 			instance.get(`/payment/paymentsettings/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}&degree=${degree}&join_year=${join_year}`),
		// 		post: data => instance.post('/payment/paymentsettings/', data),
		// 		getOne: (pk) => instance.get(`/payment/paymentsettings/${pk}/`),
		// 		put: (data, pk) => instance.put(`/payment/paymentsettings/${pk}/`, data),
		// 		delete: (pk) => instance.delete(`/payment/paymentsettings/${pk}/`),
		// 	},
		// 	/* Сургалтын төлбөрийн гүйлгээ */
		// 	paymentbalance: {
		// 		get: (limit, page, sort, search, departId, degree, joined_year, group, flag) =>
		// 			instance.get(`/payment/paymentbalance/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${departId}&degree=${degree}&joined_year=${joined_year}&group=${group}&school=${school_id}&flag=${flag}`),
		// 		post: data => instance.post('/payment/paymentbalance/', data),
		// 		getOne: (pk) => instance.get(`/payment/paymentbalance/${pk}/`),
		// 		put: (data, pk) => instance.put(`/payment/paymentbalance/${pk}/`, data),
		// 		delete: (pk) => instance.delete(`/payment/paymentbalance/${pk}/`),
		// 	},
		// 	estimate: {
		// 		get: (limit, page, sort, search, departId, degree, joined_year, group) =>
		// 			instance.get(`/payment/estimate/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${departId}&degree=${degree}&joined_year=${joined_year}&group=${group}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
		// 		post: () => instance.post(`/payment/estimate/?lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
		// 	},
		// 	/* Сургалтын төлбөрийн хөнгөлөлт */
		// 	discount: {
		// 		get: (limit, page, sort, search) =>
		// 			instance.get(`/payment/discount/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
		// 		post: data => instance.post(`/payment/discount/`, data),
		// 		getOne: (pk) => instance.get(`/payment/discount/${pk}/`),
		// 		put: (data, pk) => instance.put(`/payment/discount/${pk}/`, data),
		// 		delete: (pk) => instance.delete(`/payment/discount/${pk}/`),
		// 	},
		// 	/* Сургалтын төлбөрийн улирлын хаалт */
		// 	seasonclosed:{
		// 		getIsClosed: () => instance.get(`/payment/seasonclosed/?lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`)
		// 	},
		// },
		/**Дүнгийн бүртгэл*/
		score: {
			print: {
				get: (studentId, year, season) => instance.get(`/score/print/${studentId}/?year=${year}&season=${season}`),
				getByLesson: (lesson_id='', data) => instance.put(`/score/print/?exam=${lesson_id}`, data),
				getByReExam: (lesson_id='', data) => instance.put(`/score/print/re_exam/?exam=${lesson_id}`, data)
			},
			correspond:{
				get: (limit, page, sort, search) =>
					instance.get(`/score/correspond/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
				post: data => instance.post('/score/correspond/', data),
				getOne: (pk) => instance.get(`/score/correspond/${pk}/`),
				put: (data, pk) => instance.put(`/score/correspond/${pk}/`, data),
				delete: (pk) => instance.delete(`/score/correspond/${pk}/`),

			},

			register:{
				get: ( limit, page, sort, search, group, lesson, teacher) =>
					instance.get(`/score/register/list/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson=${lesson}&teacher=${teacher}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&group=${group}&school=${school_id}`),

				post: data => instance.post('/score/register/', data),

				getOne: (pk) => instance.get(`/score/register/${pk}/`),
				put: (data, pk) => instance.put(`/score/register/${pk}/`, data),
				delete: (pk) => instance.delete(`/score/register/${pk}/`),

				download: (lesson, teacher, group) => instance.get(`/score/register/download/?teacher=${teacher}&lesson=${lesson}&group=${group}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),

				postOldScore: (data) => instance.post(`/score/register/old/`, data),
				postOldScoreV2: (data) => instance.post(`/score/register/old/v2/`, data),
				postImportData: (data) => instance.post(`/score/register/import/`, data),

				putScore: (id, data) => instance.put(`score/register/old/${id}/`, data),
				refresh: (group) => instance.get(`/score/register/refresh/${group}/`),
				// student: (search, group, lesson, teacher) =>
				// 	instance.get(`/score/register/student/?search=${search}&lesson=${lesson}&teacher=${teacher}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&group=${group}&school=${school_id}`)
				challenge: (lesson, exam,is_repeat) => instance.get(`/score/register/challenge/${lesson}/?exam=${exam}&is_repeat=${is_repeat}`),
				deleteScoreRegister: data => instance.post('/score/register/delete/', data)
			},

			rescore:{
				get:(search, status, lesson_id, sort) =>
					instance.get(`/score/rescore/?search=${search}&status=${status}&lesson=${lesson_id}&sorting=${sort}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
				post: data => instance.post('/score/rescore/', data),
				getOne: (pk) => instance.get(`/score/rescore/${pk}/`),
				put: (data, pk) => instance.put(`/score/rescore/${pk}/`, data),

				// Тухайн оюутаны хичээлийн дүнг харуулах
				student:(search, status, lesson_id) => instance.get(`/score/rescore/student/?search=${search}&status=${status}&lesson=${lesson_id}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
			},

			// based on TeacherScore model
			teacherScore: {
				get: ({limit='Бүгд', page=1, sort='', search='', school=school_id || '', lesson='', is_fall='', data}) => instance.put(`/score/teacher-score/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school}&lesson=${lesson}&isFall=${is_fall}`, data),
				getReportSchool: () => instance.get(`/score/teacher-score/report/school/`),
			},

			teacher: {
				get: ( limit, page, sort, search, group, lesson, teacher) =>
					instance.get(`/score/register/teacher/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson=${lesson}&teacher=${teacher}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&group=${group}&school=${school_id}`),
				post: data => instance.post('/score/register/teacher/', data),
				getStudentData:(lesson, teacher, group) => instance.get(`/score/student/list/?teacher=${teacher}&lesson=${lesson}&group=${group}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
			},
		},
		/*Хэвлэх*/
		print:{
			choice:{
				get:(limit, page, sort, search,lesson,teacher,group) =>
				instance.get(`/print/choice/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson=${lesson}&teacher=${teacher}&group=${group}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
			},
			schedule:{
				get:(limit, page, sort, search, teacher, group, room, student) =>
				instance.get(`/print/schedule/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&teacher=${teacher}&group=${group}&student=${student}&room=${room}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
			},
			/** Голч дүн */
			gpa:{
				get:(limit, page, sort, search, degree, department, group, profession, year, season, status) =>
				instance.get(`/print/gpa/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&degree=${degree}&group=${group}&department=${department}&profession=${profession}&lesson_year=${year}&lesson_season=${season}&school=${school_id}&status=${status}`),
				getProp: (limit, page, sort, search, degree, department, profession, status, level) =>
					instance.get(`/print/gpa-profession/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&degree=${degree}&status=${status}&department=${department}&profession=${profession}&level=${level}&school=${school_id}`),

				post: ( profession, status, level) => instance.post(`/print/gpa-profession/?profession=${profession}&status=${status}&level=${level}`)
			},
			/* Дүнгийн жагсаалт*/
			score:{
				getList:(limit, page, sort,search, department, group, radio, chosenYear, chosenSeason, chosenLesson) =>
					instance.get(`/print/group/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&department=${department}&group=${group}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}&is_season=${radio}&chosen_year=${chosenYear}&chosen_season=${chosenSeason}&lesson=${chosenLesson}`),
				getListNoLimit:(group, radio, chosenYear, chosenSeason) => {
					var years = ''
					var seasons = ''
					for (var i of chosenYear) {
						years += `&chosen_year=${i}`
					}
					for (var j of chosenSeason) {
						seasons += `&chosen_season=${j}`
					}

					return(
						instance.get(`/print/groupnolimit/?group=${group}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&is_season=${radio}${years}${seasons}`)
					)
				},
				getPrint:(profession,group,lesson_year,lesson_season) => {
					var years = ''
					for(var i of lesson_year) {
						years += `&lesson_year=${i}`
					}
					return instance.get(`/print/groupnolimit/all/?profession=${profession}&season=${lesson_season}&group=${group}${years}`)
				},

				// Ангийн жагсаалт авах api
				// сургуулийн query явуулж filter-дэж болно
				getGroupList:( school ) =>
					instance.get(`/print/groupsubschool/?school=${school}`),

				getLessonList:(limit, page, sort,search,lesson,lesson_year, lesson_season, group) =>
					instance.get(`/print/lesson/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson=${lesson}&select_year=${lesson_year}&select_season=${lesson_season}&group=${group}&school=${school_id}`),
				getStudentList:(limit, page, sort,search,group,lesson_year, lesson_season,  start, end, lesson='') =>
					instance.get(`/print/student/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&group=${group}&select_year=${lesson_year}&select_season=${lesson_season}&school=${school_id}&start=${start}&end=${end}&lesson=${lesson}`),
			},
			/** Төгсөлтийн ажил*/
			graduationwork:{
				get:(limit, page, sort, search, degree, department, group, profession, learning) =>
				instance.get(`/print/graduationwork/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&degree=${degree}&group=${group}&department=${department}&profession=${profession}&learning=${learning}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
			},
			/** Элсэлтийн тушаал*/
			admission:{
				get:(limit, page, sort, search, admission, profession) =>
				instance.get(`/print/admission/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&admission=${admission}&profession=${profession}`),
				put: (data) => instance.put(`/print/admission/`, data),
			},
			/** Элсэлтийн тушаал*/
			admissionprint:{
				get:(degree, department, group, profession, learning) =>
				instance.get(`/print/admission/print/?degree=${degree}&group=${group}&department=${department}&profession=${profession}&learning=${learning}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}`),
			},
		},
		/* Тэтгэлэг бүртгэх */
		stipend:{
			register:{
				get:(limit, page, sort, search) =>
					instance.get(`/stipend/register/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				post: data => instance.post(`/stipend/register/`, data),
				getOne: (pk) => instance.get(`/stipend/register/${pk}/`),
				put: (data, pk) => instance.put(`/stipend/register/${pk}/`, data),
				delete: (pk) => instance.delete(`/stipend/register/${pk}/`),

				saveFile: data => instance.post(`/stipend/register/file/`, data),
			},
			request:{
				get:(limit, page, sort, search, solved, stipend) => {
					var stipent = ''
					if (stipend) {
						stipent = stipend
					}
					return instance.get(`/stipend/request/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&schoolId=${school_id}&solved=${solved}&stipend=${stipent}`)
				},
				getOne: (pk) => instance.get(`/stipend/request/${pk}/`),
				put: (data, pk) => instance.put(`/stipend/request/${pk}/`, data),
			},
			information:{
				get:() =>
				instance.get(`/stipend/information/`),
			}
		},
		/** Сургалтын хуанли */
		calendar: {
			get: (searchType) => {
				var check_ids = ''
				for(var i of searchType) {
					check_ids += `&scopeType=${i}`
				}
				return instance.get(`/calendar/info/?schoolId=${school_id}${check_ids}`)
			},
			post: data => instance.post(`/calendar/info/`, data),
			getOne: (pk) => instance.get(`/calendar/info/${pk}/`),
			put: (data, pk) => instance.put(`/calendar/info/${pk}/`, data),
			delete: (pk) => instance.delete(`/calendar/info/${pk}/`),

			/** Олон нийтийн ажилд орлцох үйл ажилагаа */
			getVolentuur: () => instance.get(`/calendar/volentuur/`),
			getVolentuur: () => instance.getOne(`/calendar/volentuur/${pk}/`),

			getAccessHistory: () => instance.get(`/user/access-history/`),

			accessHistoryStudent: {
				get: ({
					limit = 'Бүгд',
					page = 1,
					sort = '',
					search = '',
					outTime='',
					deviceType='',
				}) => instance.get(`/user/access-history/student/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&outTime=${outTime}&deviceType=${deviceType}`),
				getOne: (pk = '') => instance.get(`/user/access-history/student/${pk}/`),
				putCloseSessions: (idList) => instance.put(`/user/access-history/student/?mode=closeSessions`, idList),
			},

		},
		/** Дотуур байр */
		dormitory: {
			/** Хүсэлт шийдвэрлэх */
			request: {
				get: (limit, page, sort, search, school_id, class_id, roomtype_id, room, solvedId) => instance.get(`/dormitory/request/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school_id=${school_id}&class_id=${class_id}&lesson_year=${cyear_name}&roomtype=${roomtype_id}&room=${room}&solved=${solvedId}`),
				// post: data => instance.post(`/dormitory/request/`, data),
				getOne: (pk) => instance.get(`/dormitory/request/${pk}/`),
				put: (data, pk) => instance.put(`/dormitory/request/${pk}/`, data),
				post: (data) => instance.post(`/dormitory/request/`, data),
				// delete: (pk) => instance.delete(`/dormitory/request/${pk}/`),
				another: {
					get: (limit, page, sort, search) => instance.get(`/dormitory/request/another/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}`),
					getOne: (pk) => instance.get(`/dormitory/request/another/${pk}/`),
					post: (data) => instance.post(`/dormitory/request/another/`, data),
					put: (data, pk) => instance.put(`/dormitory/request/another/${pk}/`, data),
				},
				rent: {
					get: (limit, page, sort, search, is_teacher) => instance.get(`/dormitory/request/rent/?is_teacher=${is_teacher}&page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}`),
					getOne: (pk) => instance.get(`/dormitory/request/rent/${pk}/`),
					post: (data) => instance.post(`/dormitory/request/rent/`, data),
					put: (data, pk) => instance.put(`/dormitory/request/rent/${pk}/`, data),
				},
			},

			/** Өрөөний төрөл */
			duurgelt: {
				get: () => instance.get(`/dormitory/duurgelt/`)
			},

			/** Өрөөний төрөл */
			type: {
				get: (limit, page, sort, search) => instance.get(`/dormitory/type/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				getList: () => instance.get(`/dormitory/type/list/`),
				post: data => instance.post(`/dormitory/type/`, data),
				getOne: (pk) => instance.get(`/dormitory/type/${pk}/`),
				put: (data, pk) => instance.put(`/dormitory/type/${pk}/`, data),
				delete: (pk) => instance.delete(`/dormitory/type/${pk}/`),
				fileDelete: (pk) => instance.delete(`/dormitory/type/file/${pk}/`),
			},
			/** Өрөө */
			room: {
				get: (limit, page, sort, search, roomtype, gender) => instance.get(`/dormitory/room/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&room_type=${roomtype}&gender=${gender}`),
				getList: (room_type='') => instance.get(`/dormitory/room/list/?room_type=${room_type}`),
				post: data => instance.post(`/dormitory/room/`, data),
				getOne: (pk) => instance.get(`/dormitory/room/${pk}/`),
				put: (data, pk) => instance.put(`/dormitory/room/${pk}/`, data),
				delete: (pk) => instance.delete(`/dormitory/room/${pk}/`),
			},
			/** Төлбөрийн тохиргоо */
			payment: {
				get: (limit, page, sort, search, room_type, lesson_year) => instance.get(`/dormitory/payment/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&room_type=${room_type}&lesson_year=${lesson_year}`),
				post: data => instance.post(`/dormitory/payment/`, data),
				getOne: (pk) => instance.get(`/dormitory/payment/${pk}/`),
				put: (data, pk) => instance.put(`/dormitory/payment/${pk}/`, data),
				delete: (pk) => instance.delete(`/dormitory/payment/${pk}/`),
			},
			/** Төлбөрийн тооцоо */
			estimate: {
				our: {
					get: (limit, page, sort, search, school_id, roomtype_id, room) => instance.get(`/dormitory/estimate/our/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&school=${school_id}&roomtype=${roomtype_id}&room=${room}`),
					put: (data, pk) => instance.put(`/dormitory/estimate/our/${pk}/`, data),
				},
				another: {
					get: (limit, page, sort, search, roomtype_id, room) => instance.get(`/dormitory/estimate/another/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&roomtype=${roomtype_id}&room=${room}`),
					getOne: (pk) => instance.get(`/dormitory/estimate/another/${pk}/`),
					put: (data, pk) => instance.put(`/dormitory/estimate/another/${pk}/`, data),
				},
				family: {
					get: (limit, page, sort, search, year, month, payment_type, is_teacher) => instance.get(`/dormitory/estimate/family/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&year=${year}&month=${month}&payment_type=${payment_type}&is_teacher=${is_teacher}`),
					post: (data='') => instance.post(`/dormitory/estimate/family/`, data),
					put: (data, pk) => instance.put(`/dormitory/estimate/family/${pk}/`, data),
				},
			},
			/** Бараа материал */
			inv: {
					getList:() => instance.get(`/dormitory/inventory/list/`)
				},
			/** Ажилтан */
			employee: {
				getList:() => instance.get(`/dormitory/employee/list/`)
			},
			/** Дотуур байр БМ хүсэлт илгээх */
			inv_request:{
				get:(limit, page, sort, search, stateId) => instance.get(`/dormitory/inventory/request/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&state=${stateId}`),
				post:(data) => instance.post(`/dormitory/inventory/request/`, data, multiPart),
				getOne:(pk) => instance.get(`/dormitory/inventory/request/${pk}/`),
				put:(data, pk) => instance.put(`/dormitory/inventory/request/${pk}/`, data, multiPart),
				delete: (pk) => instance.delete(`/dormitory/inventory/request/${pk}/`),
			},

			/** Төлбөрийн гүйлгээ */
			transaction: {
				get: (limit, page, sort, search, paymentType) => instance.get(`/dormitory/transaction/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&paymentType=${paymentType}`),
				post: data => instance.post(`/dormitory/transaction/`, data),
				getOne: (pk) => instance.get(`/dormitory/transaction/${pk}/`),
				put: (data, pk) => instance.put(`/dormitory/transaction/${pk}/`, data),
				delete: (pk) => instance.delete(`/dormitory/transaction/${pk}/`),
			},
		},
		/** Хүсэлт */
		request: {
			/** Хүсэлт шийдвэрлэх нэгж */
			unit: {
				get: (limit, page, sort, search, unit) => instance.get(`/request/unit/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&unit=${unit}`),
				post: data => instance.post(`/request/unit/`, data),
				getOne: (pk) => instance.get(`/request/unit/${pk}/`),
				put: (data, pk) => instance.put(`/request/unit/${pk}/`, data),
				delete: (pk) => instance.delete(`/request/unit/${pk}/`),
			},
			/** Өргөдөлийн төрөл */
			complaint: {
				get: (limit, page, sort, search, solved, complaintTypeId, menu) => instance.get(`/request/complaint/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&solved=${solved}&complaint_type_id=${complaintTypeId}&lesson_year=${cyear_name}&menu=${menu}`),
				post: (data, menu_id) => instance.post(`/request/answercomplaint/?menu=${menu_id}`, data),
				getOne: (pk, menu_id) => instance.get(`/request/complaint/${pk}/?menu=${menu_id}`),
			},
			/** Чөлөөний хүсэлт */
			leave: {
				get: (limit, page, sort, search, menu_id, leave_type_id) => instance.get(`/request/leave/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&menu=${menu_id}&leave_type_id=${leave_type_id}`),
				post: (data, menu_id) => instance.post(`/request/leaveanswer/?menu=${menu_id}`, data),
				getOne: (pk, menu_id) => instance.get(`/request/leave/${pk}/?menu=${menu_id}`),
			},
			/** Дүнгийн дүйцүүлэлт хийх хүсэлт */
			correspond: {
				get: (limit, page, sort, search, menu, solved) => instance.get(`/request/correspond/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&menu=${menu}&solved=${solved}`),
				getLessonData: (pk) => instance.get(`/request/correspond/lesson/${pk}/`),
				getOne: (pk) => instance.get(`/request/correspond/${pk}/`),
				post: (data) => instance.post(`/request/correspond/`, data),
				put: (data, pk) => instance.put(`/request/correspond/${pk}/`, data),
				delete: (pk) => instance.delete(`/request/correspond/${pk}/`),

				// Хэвлэх
				getPrintOne: (pk) => instance.get(`/request/correspond/print/${pk}/`),

				postAnswer: (data, menu) => instance.post(`/request/correspond/answer/?menu=${menu}`, data),
				getAnswer: (pk) => instance.get(`/request/correspond/answer/${pk}/`),
				// Араг зүйч батлах
				postApprove: (pk, data) => instance.post(`/request/correspond/approve/${pk}/`, data)
			},
			/** Олон нийтийн ажилд оролцох хүсэлтийн шийдвэр */
			volunteer: {
				get: (limit, page, sort, search) => instance.get(`/request/volunteer/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				getOne: (pk) => instance.get(`/request/volunteer/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				put: (data, pk) => instance.put(`/request/volunteer/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
			},
			/** Клуб */
			club: {
				get: (limit, page, sort, search, type_id='') => instance.get(`/request/club/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&type_id=${type_id}`),
				post: data => instance.post(`/request/club/`, data),
				getOne: (pk) => instance.get(`/request/club/${pk}/`),
				put: (data, pk) => instance.put(`/request/club/${pk}/`, data),
				delete: (pk) => instance.delete(`/request/club/${pk}/`),
				getList: () => instance.get(`/request/club/list/`),

				// Бүртгүүлсэн оюутнуудын жагсаалт
				getRegisterStudent: (limit, page, sort, search, club) => instance.get(`/request/club/student/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&club=${club}`),
				getOneRegisterStudent: (pk) => instance.get(`/request/club/student/${pk}/`),
				putRegisterStudent: (pk, data) => instance.put(`/request/club/student/${pk}/`, data),
			},

			/** Тойрох хуудас */
			routing: {
				get: (limit, page, sort, search, menu_id, type_id) => instance.get(`/request/routing/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&menu=${menu_id}&type=${type_id}`),
				post: (data, menu_id) => instance.post(`/request/routing/answer/?menu=${menu_id}`, data),
				getOne: (pk, menu_id) => instance.get(`/request/routing/${pk}/?menu=${menu_id}`),
			},
			/** Багшийн туслахаар ажиллах хүсэлт */
			tutor: {
				get: (limit, page, sort, search) => instance.get(`/request/tutor/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				getOne: (pk) => instance.get(`/request/tutor/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				put: (data, pk) => instance.put(`/request/tutor/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
			},
		},

		/** Захиалга */
		order: {
			/** Спорт заал */
			sports: {
				get: (room='') => instance.get(`/order/sport/?room=${room}`),
				post: data => instance.post(`/order/sport/`, data),
				getOne: (pk) => instance.get(`/order/sport/${pk}/`),
				put: (data, pk) => instance.put(`/order/sport/${pk}/`, data),
				delete: (pk) => instance.delete(`/order/sport/${pk}/`),
			},
			/** Эмнэлэг */
			hospital: {
				get: (limit='', page='', sort='', search='', is_today='', flag='') => instance.get(`/order/hospital/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&is_today=${is_today}&flag=${flag}`),
			},
			/** Бялдаржуулах төв */
			gym: {
				// Төлбөрийн тохиргоо
				get: (limit='', page='', sort='', search='') => instance.get(`/order/gym/payment/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				getList: () => instance.get(`/order/gym/payment/list/`),
				post: data => instance.post(`/order/gym/payment/`, data),
				getOne: (pk) => instance.get(`/order/gym/payment/${pk}/`),
				put: (data, pk) => instance.put(`/order/gym/payment/${pk}/`, data),
				delete: (pk) => instance.delete(`/order/gym/payment/${pk}/`),

				// Бүртгүүлсэн оюутнуудын жагсаалт
				getRegisterStudent: (limit, page, sort, search, gym_payment_id) => instance.get(`/order/gym/student/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&gym_payment_id=${gym_payment_id}`),
				getOneRegisterStudent: (pk) => instance.get(`/order/gym/student/${pk}/`),
			},
			/** Номын сан */
			library: {
				get: (limit='', page='', sort='', search='', room='', is_today='', flag_id='') => instance.get(`/order/library/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&room=${room}&is_today=${is_today}&flag=${flag_id}`),
				post: data => instance.post(`/order/library/`, data),
				getOne: (pk) => instance.get(`/order/library/${pk}/`),
				put: (data, pk) => instance.put(`/order/library/${pk}/`, data),
				delete: (pk) => instance.delete(`/order/library/${pk}/`),
			},
		},
		/** Үйлчилгээ */
		service: {
			news: {
				get: (limit, page, sort, search) => instance.get(`/service/news/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				post: data => instance.post(`/service/news/`, data),
				getOne: (pk) => instance.get(`/service/news/${pk}/`),
				put: (data, pk) => instance.put(`/service/news/${pk}/`, data),
				delete: (pk) => instance.delete(`/service/news/${pk}/`),
				// File save
				saveFile: data => instance.post(`/service/news/file/`, data),

				//Зар
				getAd: (limit, page, sort, search) => instance.get(`/service/news/ad/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				getOneAd: (pk) => instance.get(`/service/news/ad/${pk}/`),
			},
		},
		/** Цагийн тооцоо */
		credit: {

			// Цагийн ачаалал
			volume: {
				get: (limit, page, sort, search, dep_id, year, teacherId, season) => instance.get(`/credit/volume/?page=${page}&limit=${limit}&sorting=${sort}&school=${school_id}&department=${dep_id}&lesson_year=${year}&teacher=${teacherId}&search=${search}&lesson_season=${season}`),
				post: data => instance.post(`/credit/volume/?lesson_year=${cyear_name}`, data),
				estimate: (dep_id, year, season, teacher)=> instance.post(`/credit/volume/estimate/?dep_id=${dep_id}&schoolId=${school_id}&lesson_year=${year}&season=${season}&teacher=${teacher}`),
				getOne: (pk) => instance.get(`/credit/volume/${pk}/`),
				put: (data, pk) => instance.put(`/credit/volume/${pk}/`, data),
				delete: (pk) => instance.delete(`/credit/volume/${pk}/`),
				printGet: (dep_id, year, teacherId) => instance.get(`/credit/volume/print/?school=${school_id}&department=${dep_id}&lesson_year=${year}&teacher=${teacherId}`),
			},
			settings: {
				get: (limit, page, search, type) =>
					instance.get(`/credit/settings/?page=${page}&limit=${limit}&search=${search}&type=${type}`),
				getAll: (type) =>
					instance.get(`/credit/settings/all/?type=${type}`),
				post: (data) =>
					instance.post(`/credit/settings/`, data),

				put: (data, pk) =>
					instance.put(`/credit/settings/${pk}/`, data),

				delete: (pk) => instance.delete(`/credit/settings/${pk}/`),
			},
			performance: {
				get: (limit, page, search) =>
					instance.get(`/credit/settings/performance/?page=${page}&limit=${limit}&search=${search}`),

				post: (data) =>
					instance.post(`/credit/settings/performance/`, data),

				put: (data, pk) =>
					instance.put(`/credit/settings/performance/${pk}/`, data),

				delete: (pk) => instance.delete(`/credit/settings/performance/${pk}/`),
			},

			parttime: {
				get: (limit, page, month) => {
					var mount_ids = ''
					for(var i of month) {
						mount_ids += `&month=${i}`
					}
					return instance.get(`/credit/part-time/?page=${page}&limit=${limit}${mount_ids}&school=${school_id}`)
				}
			},

			// A цагийн тооцоо
			estimation : {
				get: (limit, page,  search, season, dep_id, teacherId) => instance.get(`credit/a_estimation/?page=${page}&limit=${limit}&search=${search}&lesson_year=${cyear_name}&lesson_season=${season}&department=${dep_id}&teacher=${teacherId}&school=${school_id}`),
				post: data => instance.post(`credit/a_estimation/?lesson_year=${cyear_name}`, data),

				// А цагийн тооцоо бодох
				estimate: (department, season, teacher) => instance.post(`credit/a_estimation/estimate/?season=${season}&department=${department}&teacher=${teacher}`),

				// Танхимийн бус цагийн төрөл авах
				getChamberType: (editId) => instance.get(`credit/a_estimation/chamber/?timeestimate=${editId}`),

				postChamber: (data) => instance.post(`credit/a_estimation/chamber/`, data),
			}
		},

		// Хандах эрх
		role :{
			/** Зөвхөн 1 багшийн дүн оруулах хандах эрх */
			teacherscore:{
				get: (limit, page, sort, search, teacher_id) => instance.get(`permissions/teachers/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&teacher=${teacher_id}`),
				getOne: (pk) => instance.get(`permissions/teachers/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				/**зөвхөн багшийн мэдээлэл */
				getTeacher: () => instance.get(`permissions/teacher_info/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				/**зөвхөн багшийн заах хичээлүүдийг авах */
				getLesson: (teacher)  => instance.get(`permissions/lesson_info/?lesson_year=${cyear_name}&lesson_season=${cseason_id}&teacher=${teacher}`),
				/**зөвхөн багшийн заах хичээлүүдийн дүгнэх хэлбэр авах */
				getType: (teacher_id, lesson_id)  => instance.get(`permissions/type/?teacher=${teacher_id}&lesson=${lesson_id}`),
				post: data => instance.post(`permissions/teachers/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
				put: (data, pk) => instance.put(`permissions/teachers/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
				delete: (pk) => instance.delete(`permissions/teachers/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),

			},
			other:{
				get: (limit, page, sort, search, other_id) => instance.get(`permissions/other/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&other=${other_id}`),
				getOne: (pk) => instance.get(`permissions/other/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				post: data => instance.post(`permissions/other/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
				put: (data, pk) => instance.put(`permissions/other/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
				delete: (pk) => instance.delete(`permissions/other/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),

			},
			/** Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх */
			student:{
				get: (limit, page, sort, search, student) => instance.get(`permissions/student/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${cyear_name}&lesson_season=${cseason_id}&student=${student}`),
				getOne: (pk) => instance.get(`permissions/student/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
				getStudent: (search) => instance.get(`permissions/students/?lesson_year=${cyear_name}&lesson_season=${cseason_id}&search=${search}`),
				getSelectStudents: (state) => instance.get(`permissions/students/select_bottom/?lesson_year=${cyear_name}&lesson_season=${cseason_id}&state=${state}`),
				post: data => instance.post(`permissions/student/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
				put: (data, pk) => instance.put(`permissions/student/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`, data),
				delete: (pk) => instance.delete(`permissions/student/${pk}/?lesson_year=${cyear_name}&lesson_season=${cseason_id}`),
			},
			// Хандах эрх шалгах
			check: {
				get: (type) => instance.get(`permissions/check/?permission_type=${type}`)
			},

			crontab: {
				get: ( page, limit, search ) => instance.get(`permissions/crontab/?page=${page}&limit=${limit}&search=${search}`),
				post: ( datas ) => instance.post(`permissions/crontab/`, datas),
				delete: (pk) => instance.delete(`permissions/crontab/${pk}/`),
				limit: (pk) => instance.get(`permissions/crontab/limit/${pk}/`),
				active: (pk) => instance.get(`permissions/crontab/active/${pk}/`),
			}
		},
		challenge: {
			get: (page, limit, lesson, type, teacher, search, is_season=false, lesson_year=cyear_name, lesson_season=cseason_id, challenge_type=1) =>
				instance.get(`learning/challenge/?page=${page}&limit=${limit}&lesson=${lesson}&type=${type}&teacher=${teacher}&search=${search}&season=${is_season}&school=${school_id}&lesson_year=${lesson_year}&lesson_season=${lesson_season}&challenge_type=${challenge_type}`),
			getTeacherList: (limit, page, sort, search, sub_org, salbar, position="", is_season=false, type='') => instance.get(`/learning/teacher/list/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&sub_org=${sub_org}&salbar=${salbar}&position=${position}&season=${is_season}&type=${type}`),
			getTeacherLessonList: (limit, page, sort, search, teacher_id, exam_type=2) => instance.get(`/learning/teacher/lesson/list/${teacher_id}/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&exam_type=${exam_type}`),
			getAll: (challenge) => {
				var c_challenge = ''
				if (challenge) c_challenge = challenge
				return instance.get(`learning/challenge/all/?challenge=${c_challenge}`)
			},
			putSelectedTest: (data, pk) => instance.put(`learning/challenge/add/${pk}/`, data),
			postTest: (data, season='') => instance.post(`learning/challenge/add/?season=${season}`, data),
			getSelect: (type, lesson) =>
				instance.get(`learning/challenge/select/?type=${type}&year=${cyear_name}&season=${cseason_id}&lesson=${lesson}`),

			post: (data) =>
				instance.post(`learning/challenge/?year=${cyear_name}&season=${cseason_id}`, data),

			put: (data, id) =>
				instance.put(`learning/challenge/${id}/?year=${cyear_name}&season=${cseason_id}`, data),

			delete: (id) =>
				instance.delete(`learning/challenge/${id}/`),

			send: (id) =>
				instance.get(`learning/challenge/send/${id}/`),

			// ХБА шалгалт батлуулах хүсэлт
			getApprove: (page, limit, sort, search, type, teacherId, lessonId) =>
				instance.get(`learning/challenge/approve/?page=${page}&limit=${limit}&type=${type}&sorting=${sort}&search=${search}&teacher=${teacherId}&lesson=${lessonId}`),

			postAnswer: (data) =>
				instance.post(`learning/challenge/approve/`, data),
			timetable : () => instance.get(`learning/challenge/timetable/`),
			getQuestionList: (id) => instance.get(`learning/challenge/add/question/list/?id=${id}`),

			getAddStudent: (page, limit, search,challenge) => instance.get(`learning/challenge/add/student/?page=${page}&limit=${limit}&search=${search}&challenge=${challenge}`),
			deleteStudent: (student, challenge) => instance.delete(`learning/challenge/add/student/${challenge}/${student}/`),

			postSedevCount: (data) => instance.post(`learning/challenge/add/sedev/count/`, data),
			postLevelCount: (data) => instance.post(`learning/challenge/add/level/count/`, data),
			deleteLevelCount: (pk) => instance.delete(`learning/challenge/add/level/count/${pk}/`),

			deleteQuestion: (pk) => instance.delete(`learning/challenge/add/sedev/count/${pk}/`),

			getQuestionAll: (id) => instance.get(`learning/challenge/questions/${id}/`),
			getStudents: (search) => instance.get(`learning/challenge/student/?search=${search}`),
			updateChallengeStudentsScore: ({exam=''}) => instance.put(`learning/challenge/students-score/`, exam),
			putTest: (data) => instance.put(`learning/challenge/add/student/`, data),
			putTestKind: (data, id) => instance.put(`learning/challenge/add/student/addKind/${id}/?year=${cyear_name}&season=${cseason_id}`, data),

			deleteTest: (data) => instance.post(`learning/challenge/add/student/delete/`, data),

			//Шалгалт өгсөн хүүхдүүдийн дэлгэрэнгүй мэдээлэл
			getDetailOne: (pk) => instance.get(`learning/challenge/details/one/${pk}/`),
			getDetail: (page, limit, search, test_id) => instance.get(`learning/challenge/details/?page=${page}&limit=${limit}&search=${search}&test_id=${test_id}`),
			getTestResult: (cdata) => instance.post(`learning/challenge/result/`,cdata),
			getDifficultyLevels: () => instance.get(`learning/challenge/questions/difficulty_levels/`),
			getReport: ({page=1, limit='Бүгд', sort='', search='', report_type='', exam='', group='', profession='', student='', lesson_year='', lesson_season=''}) => instance.get(`learning/challenge/report/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&report_type=${report_type}&exam=${exam}&group=${group}&profession=${profession}&student=${student}&school=${school_id}&lesson_year=${lesson_year}&lesson_season=${lesson_season}`),
			getDetailTable: (page,limit,search,department,group,test_id,student_id, lesson_year, lesson_season) => instance.get(`learning/challenge/details/table/?page=${page}&limit=${limit}&search=${search}&test_id=${test_id}&department=${department}&group=${group}&student_id=${student_id}&lesson_year=${lesson_year}&lesson_season=${lesson_season}`),

			chart1: (dep, year, season, teacher, lesson) => instance.get(`learning/challenge/analysis/?dep=${dep}&year=${year}&season=${season}&teacher=${teacher}&lesson=${lesson}`),
			chart2: (dep, year, season, teacher, lesson) => instance.get(`learning/challenge/analysis2/?dep=${dep}&year=${year}&season=${season}&teacher=${teacher}&lesson=${lesson}`),

			question: {
				get: (page, limit, lessonId, subjectId, search) =>
					instance.get(`learning/questions/?page=${page}&limit=${limit}&lesson=${lessonId}&subject=${subjectId}&search=${search}`),

				getOne: (page, limit, search, question_id) => instance.get(`learning/questions/subject/?page=${page}&limit=${limit}&search=${search}&question_id=${question_id}`),

				getList: (checked_ids, count, type) => {
					var check_ids = ''
					for(var i of checked_ids) {
						check_ids += `&checked=${i}`
					}
					return instance.get(`learning/questions/list/?count=${count}&type=${type}${check_ids}`)
				},

				post: (data) =>
					instance.post(`learning/questions/?year=${cyear_name}&season=${cseason_id}`, data),

				put: (data, pk) =>
					instance.put(`learning/questions/${pk}/?year=${cyear_name}&season=${cseason_id}`, data),
				putTestQuestions: (data, pk, type='question') =>
					instance.put(`learning/questions/${pk}/?year=${cyear_name}&season=${cseason_id}&type=${type}`, data),

				delete: (delete_ids) =>
				{
					var remove_ids = ''
					if (!Array.isArray(delete_ids)) delete_ids = [delete_ids]

					for(var i of delete_ids) {
						remove_ids += `&delete=${i}`
					}
					return instance.delete(`learning/questions/?year=${cyear_name}&season=${cseason_id}${remove_ids}`)
				},
				getByTitle: (page, limit, search, titleId, teacher_id, stype='', level='',  is_graduate=false, is_elselt=false) => instance.get(`learning/questions/title/${teacher_id}/?page=${page}&limit=${limit}&search=${search}&titleId=${titleId}&stype=${stype}&level=${level}&is_graduate=${is_graduate}&is_elselt=${is_elselt}`),
				getTitle: (lesson='', is_season=false, teacher_id=0, examType='') => instance.get(`learning/questions/title/list/${teacher_id}/?lesson=${lesson}&season=${is_season}&examType=${examType}`),
				getLevel: (lesson='') => instance.get(`learning/questions/level/list/?lesson=${lesson}`),
				postTitle: (datas) => instance.post(`learning/questions/title/`, datas),
				postTestQuestions: (data) =>
					instance.post(`learning/questions/test/?year=${cyear_name}&season=${cseason_id}`, data),
				getTestList: (challengeType) => {
					return instance.get(`learning/questions/test/list/?challengeType=${challengeType}`)
				},
				getOneTitle: (id) => instance.get(`learning/questions/title/${id}/?titleId=${id}`),
				postExcel:(datas) => instance.post(`learning/questions/excel/` , datas),


			},

			graduate: {
				getTitle: () => instance.get(`learning/graduate/title/`),
				postTitle: (data) =>  instance.post(`learning/graduate/title/`, data),
				getSubTitle: (main='') => instance.get(`learning/graduate/sub-title/?main=${main}`),
				postSubTitle: (data) =>  instance.post(`learning/graduate/sub-title/`, data),
				getQuestion: (title) => instance.get(`learning/graduate/question/?title=${title}`),

				deleteTitle : (id) => instance.delete(`learning/graduate/title/${id}/`),
				deleteSubTitle : (id) => instance.delete(`learning/graduate/sub-title/${id}/`),
			},

			psychologicalTestQuestion:{
				getOneTitle: (id) => instance.get(`learning/psychological_test_question/title/${id}/`),
				getByTitle: (page, limit, search, titleId) => instance.get(`learning/psychological_test_question/title/?page=${page}&limit=${limit}&search=${search}&titleId=${titleId}`),
				getTitle: () => instance.get(`learning/psychological_test_question/title/list/`),
				postTitle: (datas) => instance.post(`learning/psychological_test_question/title/`, datas),
				putTitle: (id, datas) => instance.put(`learning/psychological_test_question/title/${id}/`, datas),
				deleteTitle: (id) => instance.delete(`learning/psychological_test_question/title/${id}/`),

				getList: () => instance.get(`learning/psychological_test_question/list/`),

				get: (page, limit, userId, search) =>
					instance.get(`learning/psychological_test_question/?page=${page}&limit=${limit}&lesson=${userId}&search=${search}`),
				post: (data) =>
					instance.post(`learning/psychological_test_question/?year=${cyear_name}&season=${cseason_id}`, data),
				put: (data, pk, type="question") =>
					instance.put(`learning/psychological_test_question/${pk}/?year=${cyear_name}&season=${cseason_id}&type=${type}`, data),
				delete: (delete_id) => instance.delete(`learning/psychological_test_question/?year=${cyear_name}&season=${cseason_id}&delete=${delete_id}`)
			},

			psychologicalTest:{
				get: (limit, page, sort, search, scope) => instance.get(`learning/psychological_test/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&scope=${scope}`),
				getOne: (pk) => instance.get(`learning/psychological_test/${pk}/`),
				post: (cdatas) => instance.post('learning/psychological_test/', cdatas),
				put: (data, pk) => instance.put(`learning/psychological_test/${pk}/`, data),
				delete: (pk) => instance.delete(`learning/psychological_test/${pk}/`),

				getOptions: () => instance.get(`learning/psychological_test/options/`),
				getScope: (limit, page, search, test_id) => instance.get(`learning/psychological_test/scope_list/?page=${page}&limit=${limit}&search=${search}&test_id=${test_id}`),

				// populates participant adding inputs
				getSelect: (scope, mode, state, select1, select2, search) => instance.get(`learning/psychological_test/scope_option/?scope=${scope}&school=${school_id}&mode=${mode}&state=${state}&select1=${select1}&select2=${select2}&search=${search}`),

				putAddScope: (data, pk) => {
					data['school_id'] = school_id
					return instance.put(`learning/psychological_test/add_scope/${pk}/`, data)
				},
				deleteParticitant: (pk, test_id) => instance.delete(`learning/psychological_test/add_scope/${pk}/?test_id=${test_id}`)
			},

			psychologicalTestOne:{
				get: (limit, page, test_id) => instance.get(`learning/psychological_test_one/?page=${page}&limit=${limit}&test_id=${test_id}`),
				post: (data, pk) => instance.post(`learning/psychological_test_one/${pk}/`, data),
				delete: (pk, test_id) => instance.delete(`learning/psychological_test_one/${pk}/?test_id=${test_id}`)
			},

			psychologicalTestResult:{
				get: (limit, page, sort, search, scope) => instance.get(`learning/psychological_test_result/?page=${page}&limit=${limit}&sort=${sort}&search=${search}&scope=${scope}`),
				getParticipants: (limit, page, search, test_id) => instance.get(`learning/psychological_test_result_participants/?page=${page}&limit=${limit}&search=${search}&test_id=${test_id}`),
				getResult: (cdata) => instance.post(`learning/psychological_test_result_show/`,cdata),

				excelResult:(adm) => instance.get(`learning/psychological_test_result_excel/?adm=${adm}`),
				iqExcelResult:(adm)=>instance.get(`learning/iq_test_result_excel/?adm=${adm}`)

			},
			report:{
				get: (test_id, dep, group) => instance.get(`learning/challenge/report/chart/?school=${school_id}&test=${test_id}&department=${dep}&group=${group}`),
			},
		},

		// Судалгаа
		survey:{

			studentlist:{
				get: () => instance.get(`/student/info/?page=1&limit=${10}`)
			},

			surveyrange:{
				// types болон selected_value дамжиж ирэх үед back-руу дамжуулна
				get: ({ limit='Бүгд', page=1, types='', selectedValue='' }) => instance.get(`survey/surveyrange/?limit=${limit}&page=${page}&types=${types}&selected_value=${selectedValue}`),
			},
			get:(limit, page, selectedTime, search) => instance.get(`survey/?limit=${limit}&page=${page}&time_type=${selectedTime}&search=${search}`),
			getList: (search) => instance.get(`survey/list/?search=${search}`),
			getOne: (pk) => instance.get(`survey/${pk}/`),
			post: (cdatas) => instance.post('survey/', cdatas),
			put: (data, pk) => instance.put(`survey/${pk}/`, data),
			delete: (pk) => instance.delete(`survey/${pk}/`),

			pollee:{
				get: (id) => instance.get(`/survey/pollee/${id}/`)
			}
		},

		// Багшийн үнэлгээний асуулт
		evaluation: {
			register: {
				get: (limit, page, sort, search) => instance.get(`/survey/questions/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				post: (data) => instance.post('/survey/questions/', data),
				put: (data, pk) => instance.put(`/survey/questions/${pk}/`, data),
				delete: (pk) => instance.delete(`/survey/questions/${pk}/`)
			}
		},

		// Эрдэм шинжилгээ
		science: {
			paper: {
				get: (limit, page, sort, search, salbar,teacher,publish_year,category='') => instance.get(`/science/papers/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&sub_org=${school_id}&salbar=${salbar}&teachers=${teacher}&published_year=${publish_year}&category=${category}`),
				category: {
					getList: ()=>instance.get(`/science/papers/category/`)
				},
			},
			notes: {
				get: (limit, page, sort, search, category, salbar) => instance.get(`/science/notes/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&category=${category}&salbar=${salbar}`),
				values:{
					getList: ()=>instance.get(`/science/notes/values/`)
				},
			},

			quotation: {
				get: (limit, page, sort, search,salbar,category, quotation_year) => instance.get(`/science/quotation/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&salbar=${salbar}&category=${category}&quotation_year=${quotation_year}`),
			},

			invention: {
				get: (limit, page, sort, search, salbar,teacher,publish_year,category='') => instance.get(`/science/invention/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&sub_org=${school_id}&salbar=${salbar}&teachers=${teacher}&published_year=${publish_year}&category=${category}`),
				category: {
					getList: ()=>instance.get(`/science/inventioncategory/list/`)
				},
			},

			project: {
				get: (limit, page, sort, search, salbar,teacher,start_date,category,sub_category='') => instance.get(`/science/project/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&salbar=${salbar}&teacher=${teacher}&start_date=${start_date}&category=${category}&sub_category=${sub_category}`),
				category: {
					getList: () => instance.get(`/science/project/category/`)
				},
			},

			settings: {
				get: (type) => instance.get(`/science/settings/?type=${type}`),
				post: (type, datas) => instance.post(`/science/settings/?type=${type}`, datas),
				put: (type, datas) => instance.put(`/science/settings/?type=${type}`, datas),
				delete: (type, id) => instance.delete(`/science/settings/${id}/?type=${type}`),
			},

			student: {
				get: (limit, page, sort, search) => instance.get(`/science/student/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
			},

			patent: {
				get: (limit, page, sort, search) => instance.get(`/science/patent/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
			},
			estimate: {
				get: (limit, page, sort, search, salbar) => instance.get(`/science/estimate/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school_id}&salbar=${salbar}`)
			},

			report: {
				get: (year) => instance.get(`/science/report/?year=${year}`),
			}
		},

		status: {
			db1:{
				get: () => instance.get(`/statistic/db1/`),
			},
			db3:{
				get: () => instance.get(`/statistic/db3/`),
			},
			db4:{
				get: () => instance.get(`/statistic/db4/`),
			},
			db5:{
				get: () => instance.get(`/statistic/db5/`),
			},
			db6:{
				get: () => instance.get(`/statistic/db6/`),
			},
			db7:{
				get: () => instance.get(`/statistic/db7/`),
			},
			db8:{
				get: () => instance.get(`/statistic/db8/`),
			},
			db9:{
				get: () => instance.get(`/statistic/db9/`),
			},
			db10:{
				get: () => instance.get(`/statistic/db10/`),
			},
			db11:{
				get: () => instance.get(`/statistic/db11/`),
			},
			db12:{
				get: () => instance.get(`/statistic/db12/`),
			},
			db13:{
				get: () => instance.get(`/statistic/db13/`),
			},
			db14:{
				get: () => instance.get(`/statistic/db14/`),
			},
			db15:{
				get: () => instance.get(`/statistic/db15/`),
			},
			db16:{
				get: () => instance.get(`/statistic/db16/`),
			},
			db17:{
				get: () => instance.get(`/statistic/db17/`),
			}
		},
		calendarCard: {
			get: () => instance.get(`/core/calendarCard/?school=${school_id}`),
		},
		calendarNews: {
			get: () => instance.get(`/service/news/calendar/`),
		},
		studentPass: {
			changePass: (pk)=> instance.put(`/student/defaultPass/${pk}/`),
		},
		studentRights: {
			toggleRightsActivation: (pk) => instance.put(`/student/rightActivation/${pk}/`),
		},
		activeYearAndSeason: {
			get: () => instance.get(`/settings/year-season/`)
		},
		calendar1: {
			get: () => instance.get('/core/calendar1/'),
		},

		elselt: {
			get: (limit, page, sort, search, lesson_year, is_store) => instance.get(`/elselt/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year=${lesson_year}&is_store=${is_store}`),
			getAll: () => instance.get(`/elselt/all/`),
			getActiveAll: () => instance.get(`/elselt/all/active/`),
			post: (data) => instance.post('/elselt/', data),
			put: (data, id) => instance.put(`/elselt/${id}/`, data),
			delete: (id) => instance.delete(`/elselt/${id}/`),
			putFirst: (id, data) => instance.put(`/elselt/first/${id}/`, data),
			getAdmissionList: () => instance.get(`elselt/admission/list/?lesson_year=${cyear_name}`),
			profession: {
				get: (elselt_id) => instance.get(`/elselt/profession/?elselt=${elselt_id}`),
				post: (data) => instance.post('/elselt/profession/', data),
				delete: (id, elselt_id) => instance.delete(`/elselt/profession/${id}/?elselt=${elselt_id}`),
				postShalguur: (datas) => instance.post(`/elselt/profession/shalguur/`, datas),

				// Элсэлт явагдаж байгаа хөтөлбөрийн жагсаалт
				getList: (elselt) => instance.get(`/elselt/profession/list/?elselt=${elselt}`),
				putPropState: (datas) => instance.put(`/elselt/profession/`, datas)
			},
			sysinfo: {
				get: () => instance.get(`/elselt/sysinfo/`),
				put: (id, data) =>
					id
					?
						instance.put(`/elselt/sysinfo/${id}/`, data)
					:
						instance.post(`/elselt/sysinfo/`, data),
			},
			admissionpayment: {
				get: (limit, page, sort, search, admission, profession_id, dedication, degree) => instance.get(`/elselt/payment/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&admission=${admission}&profession_id=${profession_id}&dedication=${dedication}&degree=${degree}`),
				getOne: (pk) => instance.get(`/elselt/payment/${pk}/`),
			},
			admissionuserdata: {
				get: (limit, page, sort, search, lesson_year_id, profession_id, unit1_id, gender, state, gpa_state, age_state, justice_state='', is_justice='', now_state='', start_date, end_date) =>
					instance.get(`/elselt/admissionuserdata/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year_id=${lesson_year_id}&profession_id=${profession_id}&unit1_id=${unit1_id}&gender=${gender}&state=${state}&gpa_state=${gpa_state}&age_state=${age_state}&justice_state=${justice_state}&is_justice=${is_justice}&now_state=${now_state}&start_date=${start_date}&end_date=${end_date}`),
				getOne: (pk) => instance.get(`/elselt/admissionuserdata/${pk}/`),
				put: (data, id) => instance.put(`/elselt/admissionuserdata/${id}/`, data),
				putDesc: (data, id) => instance.put(`/elselt/desc/${id}/`, data),
				getAll: (profession) => instance.get(`/elselt/admissionuserdata/profession/?profession=${profession}`),
				all: {
					put: (data) => instance.put(`/elselt/admissionuserdata/all/`, data),
				},
				email: {
					get: (limit, page, sort, search, lesson_year_id, profession_id, unit1_id, gender, state, gpa_state, start_date, end_date) => instance.get(`/elselt/admissionuserdata/email/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year_id=${lesson_year_id}&profession_id=${profession_id}&unit1_id=${unit1_id}&gender=${gender}&state=${state}&gpa_state=${gpa_state}&start_date=${start_date}&end_date=${end_date}`),
					post: (data) => instance.post(`/elselt/admissionuserdata/email/`, data),
				},
				message: {
					get: (limit, page, sort, search, lesson_year_id, profession_id, unit1_id, gender, state, gpa_state, start_date, end_date) => instance.get(`/elselt/admissionuserdata/message/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year_id=${lesson_year_id}&profession_id=${profession_id}&unit1_id=${unit1_id}&gender=${gender}&state=${state}&gpa_state=${gpa_state}&start_date=${start_date}&end_date=${end_date}`),
					post: (data) => instance.post(`/elselt/admissionuserdata/message/`, data),
					send: (data) => instance.put(`/elselt/admissionuserdata/message/`, data),
				},
				gpa:{
					get: (limit, lesson_year_id, profession_id, gpa) => instance.get(`/elselt/admissionuserdata/gpa_check/?limit=${limit}&lesson_year_id=${lesson_year_id}&profession_id=${profession_id}&gpa=${gpa}`)
				},
				eyesh:{
					get: (limit,lesson_year_id,profession_id) => instance.get(`/elselt/admissionuserdata/eyesh_check/?limit=${limit}&lesson_year_id=${lesson_year_id}&profession_id=${profession_id}`)
				},
				gpaconfirm: {
					get:(limit , lesson_year_id , profession_id , gpa) => instance.get(`/elselt/admissionuserdata/gpa_check/confirm/?limit=${limit}&lesson_year_id=${lesson_year_id}&profession_id=${profession_id}&gpa=${gpa}`)
				}
			},
			gpa: {
				put: (data, id) => instance.put(`/elselt/gpa/${id}/`, data)
			},
			dashboard: {
				get: (elselt) => instance.get(`/elselt/dashboard/?elselt=${elselt}`),
				excel: (elselt) => instance.get(`/elselt/dashboard/excel/?elselt=${elselt}`)
			},
			health: {
				anhan:{
					get: (limit, page, sort, search, state, elselt, profession, gender, start_date, end_date) => instance.get(`/elselt/health/anhan/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&state=${state}&elselt=${elselt}&profession=${profession}&gender=${gender}&start_date=${start_date}&end_date=${end_date}`),
					post: (cdata) => instance.post(`/elselt/health/anhan/`, cdata),
					put: (id, cdata) => instance.put(`/elselt/health/anhan/${id}/`, cdata)
				},
				professional:{
					get: (limit, page, sort, search,lesson_year_id, profession_id, state, gender, start_date, end_date) => instance.get(`/elselt/health/professional/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&lesson_year_id=${lesson_year_id}&profession_id=${profession_id}&state=${state}&gender=${gender}&start_date=${start_date}&end_date=${end_date}`),
					post: (cdata) => instance.post(`/elselt/health/professional/`, cdata),
					put: (id, cdata) => instance.put(`/elselt/health/professional/${id}/`, cdata)
				},
				physical:{
					get: (limit, page, sort, search, state, elselt, profession, gender, start_date , end_date) => instance.get(`/elselt/health/physical/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&state=${state}&elselt=${elselt}&profession=${profession}&gender=${gender}&start_date=${start_date}&end_date=${end_date}`),
					post: (cdata) => instance.post(`/elselt/health/physical/`, cdata),
					put: (id, cdata) => instance.put(`/elselt/health/physical/${id}/`, cdata)
				},
			},
			justice: {
				get: (limit, page, sort, search, justice_state, elselt, profession, gender) => instance.get(`/elselt/justice/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&justice_state=${justice_state}&elselt=${elselt}&profession=${profession}&gender=${gender}`),
				post: (cdata) => instance.post(`/elselt/justice/`, cdata),
				put: (cdata) => instance.put(`/elselt/justice/`, cdata)
			},
			// тэнцсэн элсэгчид
			approve: {
				get: (limit, page, sort, search,admission, profession, gender) => instance.get(`/elselt/approve/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&admission=${admission}&profession=${profession}&gender=${gender}`),
				post: (cdata) => instance.post(`/elselt/approve/`, cdata),

			},
			interview:{
				get: (limit, page, sort, search, state, elselt, profession, gender, start_date , end_date) => instance.get(`/elselt/interview/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&state=${state}&elselt=${elselt}&profession=${profession}&gender=${gender}&start_date=${start_date}&end_date=${end_date}`),
				post: (cdata) => instance.post(`/elselt/interview/`, cdata),
				put: (id, cdata) => instance.put(`/elselt/interview/${id}/`, cdata)
			},
			// цэргийн бэлтгэл тэнцсэн эсэх
			preparation:{
				get: (limit, page, sort, search, state, elselt, profession) => instance.get(`/elselt/preparation/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&state=${state}&elselt=${elselt}&profession=${profession}`),
				post: (cdata) => instance.post(`/elselt/preparation/`, cdata),
				put: (id, cdata) => instance.put(`/elselt/preparation/${id}/`, cdata)
			},
			// Хөтөлбөр,Төлөв лог жагсаалт
			log:{
				get:(limit,page,sort,search,elselt,profession,menu_option)=>instance.get(`/elselt/log/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&elselt=${elselt}&profession=${profession}&menu_option=${menu_option}`)
			},
			hynalt:{
				get: (gender, profession) => instance.get(`/elselt/hynalt_number/?gender=${gender}&profession=${profession}`),
				getIsGender: (profession) => instance.get(`/elselt/hynalt_is_gender/?profession=${profession}`),
				post:(cdata) => instance.post(`/elselt/userscore/`, cdata),
				postPhysical:(cdata) => instance.post(`/elselt/physical/`, cdata),
			},
			// ЭЕШ хэсгийн оноо татах
			eyesh:{
				get : (elselt, profession_id) => instance.get(`/elselt/eyesh/?&elselt=${elselt}&profession=${profession_id}`)
			},
			// ЭЕШ хэсгийн жагсаалт татахebackend/apps/surgalt/views.py
			eyesh_order:{
				put: (id, cdata) => instance.put(`/elselt/admissionuserdata/eyesh/${id}/?school_id=${school_id}`, cdata),
				get: (limit, page, search, lesson_year_id, profession_id , gender, state, yesh_state, yesh_mhb_state) =>
					instance.get(`/elselt/admissionuserdata/eyesh/?page=${page}&limit=${limit}&search=${search}&elselt=${lesson_year_id}&profession=${profession_id}&gender=${gender}&state=${state}&yesh_state=${yesh_state}&yesh_mhb_state=${yesh_mhb_state}`),
			},
			mhb:{
				get: (limit, page, search, yesh_mhb_state) =>
					instance.get(`/elselt/admissionuserdata/mhb/?page=${page}&limit=${limit}&search=${search}&yesh_mhb_state=${yesh_mhb_state}`),
				postExcelImport: (cdata) => instance.post(`/elselt/admissionuserdata/mhb/`, cdata),
			}
		},
		able: {
			getWorker: () => instance.get(`/core/able/get-worker/`),
			getPosition: () => instance.get(`/core/able/get-position/`),
			// getStructure: () => able_instance.get(`/?a=ableApi&tsk=getDeps&key=uia`),

			// getWorker: () => able_instance.get(`/?a=ableApi&tsk=getWorkers&key=uia`),
		},

		online_lesson: {
			get_lessons: (limit='Бүгд', page=1, sort='', search='', school=school_id || '', dep_id='', teacher_id='', start_date='', end_date='') => instance.get(`/online_lesson/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}&school=${school}&dep_id=${dep_id}&teacher_id=${teacher_id}&start_date=${start_date}&end_date=${end_date}`),
			getOne: (pk) => instance.get(`/online_lesson/${pk}/`),

			deletePlan: (pk) => instance.delete(`/online_lesson/plan/${pk}/`),
			postPlan: (pk, data) => instance.put(`/online_lesson/plan/${pk}/`, data),

			lessonRegister: (cdata) => instance.post(`/online_lesson/`, cdata),
			editLesson: (pk, data) => instance.put(`online_lesson/${pk}/`, data),
			delete_lesson: (pk) => instance.delete(`online_lesson/${pk}`),
			test:{
				getAll:(id)=>instance.get(`/online_lesson/test/${id}/`),
				post:(id,data)=>instance.post(`/online_lesson/test/${id}/`,data),
				delete:(id)=>instance.delete(`/online_lesson/test/${id}/`)
			},
			lekts_material: {
				post: (cdata) => instance.post(`/online_lesson/online_week/lekts/`, cdata, multiPart),
				delete: (pk) => instance.delete(`/online_lesson/online_week/lekts/${pk}/`),
			}
		},

		online_week:{
			get: (lesson, week='') => instance.get(`/online_lesson/online_week/?lesson=${lesson}&week=${week}`),
			getOne: (id) => instance.get(`/online_lesson/online_week/${id}/`),
			post: (cdata, id) => instance.post(`/online_lesson/online_week/${id}/`, cdata),
			put: (pk, data) => instance.put(`/online_lesson/online_week/${pk}/`,data),
			delete: (pk) => instance.delete(`/online_lesson/onlone_week/${pk}/`),
			getList: (pk) => instance.get(`/online_lesson/onlone_week/${pk}/`),
		},

		material : {
			get: ({type = "", full_name = "", salbar = "", school_name = ""} = {})=> instance.get(`/online_lesson/material/?type=${type}&full_name=${full_name}&salbar=${salbar}&school_name=${school_name}`),
			getOne: (pk)=> instance.get(`/online_lesson/material/${pk}/`),
			post: (cdata)=> instance.post(`/online_lesson/material/`,cdata),
			delete: (pk)=> instance.delete(`/online_lesson/material/${pk}/`)
		},
		announcement : {
			get : (lessonId) => instance.get(`online_lesson/announcement/${lessonId}/`),
			getAll : (pk) => instance.get(`online_lesson/announcement/?teacher_id=${pk}`),
			getOne : () => instance.get(`online_lesson/announcement/${pk}`),
			delete : (pk) => instance.delete(`online_lesson/announcement/${pk}/`),
			post : (data) => instance.post(`online_lesson/announcement/`,data),
			put : (pk,data) => instance.put(`online_lesson/announcement/${pk}/`,data),
			global_post : (data) => instance.post(`online_lesson/global_announcement/`,data),
		},
		homework : {
			get : (week_id) => instance.get(`online_lesson/online_homework/${week_id}/`),
			getOne : (pk) => instance.get(`online_lesson/online_homework/${pk}/`),
			delete : (pk) => instance.delete(`online_lesson/online_homework/${pk}/`),
			post : (data) => instance.post(`online_lesson/online_homework/`, data, multiPart),
			put : (data, pk) => instance.put(`online_lesson/online_homework/${pk}/`, data, multiPart),
		},
		sent_home_work : {
			get : (week_id) => instance.get(`online_lesson/sent_home_work/${week_id}/`),
			getOne : () => instance.get(`online_lesson/sent_home_work/${pk}`),
			delete : (pk) => instance.delete(`online_lesson/sent_home_work/${pk}`),
			post : (data, weekId) => instance.post(`online_lesson/sent_home_work/${weekId}`,data),
			put : (pk,data) => instance.put(`online_lesson/sent_home_work/${pk}/`,data)
		},
		sent_lecture_file : {
			get : (week_id) => instance.get(`online_lesson/sent_lecture_file/${week_id}/`),
			put : (id) => instance.put(`online_lesson/sent_lecture_file/${id}/`),
			putAll : (id,data) => instance.put(`online_lesson/sent_lecture_file/all/${id}/`,data)
		},
		lesson_list :{
			get : (teacherId) => instance.get(`online_lesson/choose_online_lesson/?teacher_id=${teacherId}`),
		},
		get_group : {
			get: () => instance.get(`online_lesson/get_group/`)
		},
		get_lesson_students: {
			get: (limit, page, search, selectedGroup,lesson_id) => instance.get(`online_lesson/lesson_students/?limit=${limit}&page=${page}&search=${search}&group=${selectedGroup}&lesson_id=${lesson_id}`),
			put: (datas, pk) => instance.put(`online_lesson/lesson_students/${pk}/`, datas),
			delete: (student, pk) => instance.delete(`online_lesson/lesson_students/${pk}/?student=${student}`)
		},
		// Зайн сургалт
		remote:{
			get: (limit, page, sort='', search) => instance.get(`online_lesson/remote/?limit=${limit}&page=${page}&sorting=${sort}&search=${search}`),
			getOne: (id) => instance.get(`online_lesson/remote/${id}/`),
			post : (data) => instance.post(`online_lesson/remote/`,data),
			put : (data, id) => instance.put(`online_lesson/remote/${id}/`,data),
			delete: (id) => instance.delete(`online_lesson/remote/${id}/`),

			students: {
				get: ({ limit = 'Бүгд', page = 1, sort='', search = '', elearnId = '' }) => instance.get(`online_lesson/remote/students/?limit=${limit}&page=${page}&sorting=${sort}&search=${search}&elearnId=${elearnId}`),
				put : (data) => instance.put(`online_lesson/remote/students/`,data),
				delete: (elearnId, id) => instance.delete(`/online_lesson/remote/students/${id}/?elearnId=${elearnId}`),
			},

			onlineInfo: {
				get: ({ limit = 'Бүгд', page = 1, sort='', search = '', elearnId = '' }) => instance.get(`online_lesson/remote/online-info/?limit=${limit}&page=${page}&sorting=${sort}&search=${search}&elearnId=${elearnId}`),
				post : (data) => instance.post(`online_lesson/remote/online-info/`,data),
				put : (data, id) => instance.put(`online_lesson/remote/online-info/${id}/`,data),
				delete: (id) => instance.delete(`online_lesson/remote/online-info/${id}/`),
			},

			onlineSubInfo: {
				get: ({ limit = 'Бүгд', page = 1, sort='', search = '', elearnId = '' }) => instance.get(`online_lesson/remote/online-sub-info/?limit=${limit}&page=${page}&sorting=${sort}&search=${search}&elearnId=${elearnId}`),
				post : (data) => instance.post(`online_lesson/remote/online-sub-info/`,data),
				put : (data, id) => instance.put(`online_lesson/remote/online-sub-info/${id}/`,data),
				delete: (id) => instance.delete(`online_lesson/remote/online-sub-info/${id}/`),
			},

			quezQuestions: {
				get: ({ limit = 'Бүгд', page = 1, sort='', search = '', onlineSubInfoId = '' }) => instance.get(`online_lesson/remote/quez-questions/?limit=${limit}&page=${page}&sorting=${sort}&search=${search}&onlineSubInfoId=${onlineSubInfoId}`),
				post : (data) => instance.post(`online_lesson/remote/quez-questions/`,data),
				put : (data, id) => instance.put(`online_lesson/remote/quez-questions/${id}/`,data),
				delete: (id) => instance.delete(`online_lesson/remote/quez-questions/${id}/`),
			},

			quezChoices: {
				get: ({ limit = 'Бүгд', page = 1, sort='', search = '', onlineSubInfoId = '' }) => instance.get(`online_lesson/remote/quez-choices/?limit=${limit}&page=${page}&sorting=${sort}&search=${search}&onlineSubInfoId=${onlineSubInfoId}`),
				post : (data) => instance.post(`online_lesson/remote/quez-choices/`,data),
				put : (data, id) => instance.put(`online_lesson/remote/quez-choices/${id}/`,data),
				delete: (id) => instance.delete(`online_lesson/remote/quez-choices/${id}/`),
			},
		},

		// суралцагчийн хөтөч
		browser: {
			get: (limit, page) => instance.get(`/browser/structure/?page=${page}&limit=${limit}`),
			getOne: (pk) => instance.get(`/browser/structure/${pk}/`),
			post: (data) => instance.post(`/browser/structure/`, data),
			put: (data, pk) => instance.put(`/browser/structure/${pk}/`, data),
			delete: (pk) => instance.delete(`/browser/structure/${pk}/`),
			getSalbarData: () => instance.get(`browser/salbar/`),

			// суралцагчийн хөгжил
			student_develop: {
				get: (limit, page) => instance.get(`/browser/develop/?page=${page}&limit=${limit}`),
				getOne: (pk) => instance.get(`/browser/develop/${pk}/`),
				post: (data) => instance.post(`/browser/develop/`, data),
				put: (data, pk) => instance.put(`/browser/develop/${pk}/`, data),
				delete: (pk) => instance.delete(`/browser/develop/${pk}/`),
			},

			// номын сан танилцуулга
			library: {
				get: (limit, page) => instance.get(`/browser/library/?page=${page}&limit=${limit}`),
				getOne: (pk) => instance.get(`/browser/library/${pk}/`),
				post: (data) => instance.post(`/browser/library/`, data),
				put: (data, pk) => instance.put(`/browser/library/${pk}/`, data),
				delete: (pk) => instance.delete(`/browser/library/${pk}/`),
			},

			// журам
			rules: {
				get: (limit, page) => instance.get(`/browser/rules/?page=${page}&limit=${limit}`),
				getOne: (pk) => instance.get(`/browser/rules/${pk}/`),
				post: (data) => instance.post(`/browser/rules/`, data),
				put: (data, pk) => instance.put(`/browser/rules/${pk}/`, data),
				delete: (pk) => instance.delete(`/browser/rules/${pk}/`),
			},

			// номын сан цагийн хуваарь
			time: {
				get: (limit, page) => instance.get(`/browser/time/?page=${page}&limit=${limit}`),
				getOne: (pk) => instance.get(`/browser/time/${pk}/`),
				post: (data) => instance.post(`/browser/time/`, data),
				put: (data, pk) => instance.put(`/browser/time/${pk}/`, data),
				delete: (pk) => instance.delete(`/browser/time/${pk}/`),
			},

			// сэтгэл зүйн булан
			psycholocal: {
				get: (limit, page, sort, search) => instance.get(`/browser/psycholocal/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				getOne: (pk) => instance.get(`/browser/psycholocal/${pk}/`),
				post: (data) => instance.post(`/browser/psycholocal/`, data),
				put: (data, pk) => instance.put(`/browser/psycholocal/${pk}/`, data),
				delete: (pk) => instance.delete(`/browser/psycholocal/${pk}/`),
				help:{
					get: (limit, page, sort, search) => instance.get(`/browser/psy/help/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
					getOne: (pk) => instance.get(`/browser/psy/help/${pk}/`),
					post: (data) => instance.post(`/browser/psy/help/`, data),
					put: (data, pk) => instance.put(`/browser/psy/help/${pk}/`, data),
					delete: (pk) => instance.delete(`/browser/psy/help/${pk}/`),
				},
			},

			// эрүүл мэнд
			health: {
				get: (limit, page, sort, search) => instance.get(`/browser/health/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
				getOne: (pk) => instance.get(`/browser/health/${pk}/`),
				post: (data) => instance.post(`/browser/health/`, data),
				put: (data, pk) => instance.put(`/browser/health/${pk}/`, data),
				delete: (pk) => instance.delete(`/browser/health/${pk}/`),
				help:{
					get: (limit, page, sort, search) => instance.get(`/browser/health/help/?page=${page}&limit=${limit}&sorting=${sort}&search=${search}`),
					getOne: (pk) => instance.get(`/browser/health/help/${pk}/`),
					post: (data) => instance.post(`/browser/health/help/`, data),
					put: (data, pk) => instance.put(`/browser/health/help/${pk}/`, data),
					delete: (pk) => instance.delete(`/browser/health/help/${pk}/`),
				},
			},
		},

	}
}

export default useApi;
