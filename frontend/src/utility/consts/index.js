
/** Хүсэлт шийдвэрлэх нэгж */
export const COMPLAINT_UNIT_BMA_ID = 11                     // Бүртгэл мэдээллийн алба ID
export const COMPLAINT_ALLOW = 3                            // Хүсэлт зөвшөөрсөн ID

export const VOLUNTEER_ACTION_TYPE = 4                      // Олон нийтийн ажил

export const LABEL_COLOR = "#2661D4"                        // highcharts

export const GRAPHIC_LABEL = {
    align: "end",
    backgroundColor: LABEL_COLOR,
    color: "#fff",
    offset: 12,
    borderRadius: 4,
    padding: 5,
    display: function (context) {
        return context.dataset.data[context.dataIndex] !== 0
    },
}
// Дүнгийн шинжилгээ 1 хуудасны багшийн index
export const TEACHER_IDX = 0

export const HOR_LABEL = {
    align: "center",
    backgroundColor: LABEL_COLOR,
    color: "#fff",
    borderRadius: 4,
    font: {
        size: 9
    },
    display: function (context) {
        return context.dataset.data[context.dataIndex] >= 2
    },
}

export const COLORS = [
    'rgba(4, 45, 132, 0.94)',
    'rgba(153, 102, 255)',
    'rgba(255, 206, 86)',
    'rgba(75, 192, 192)',
    'rgba(54, 162, 235)',
    'rgba(255, 159, 64)',
    'rgb(128,128,128)',
]