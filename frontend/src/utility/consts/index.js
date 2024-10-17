
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