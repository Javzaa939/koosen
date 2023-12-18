import { createContext, useState } from "react";
import { initialModal } from "@lms_components/Modal";

import { AlertCircle } from "react-feather";

export const ModalContext = createContext()

export default function ModalContextProvider({ children })
{
    const [show, setShow] = useState(false)
    const [modal, setModal] = useState(initialModal)

    /** Модал хаах товч дарахад
     * @param {function} callback товч дарсны дараа ажиллах функц
    */
    const onClose = (callback) => {
        setShow(false)

        if (callback) {
            callback()
        }
    }

    /**
    * return Модал буцаана

    * @param {Object} header Модалын толгой хэсэг
        header: {
            show: true, Толгой хэсэг байх эсэх
            title: "", Гарчиг
            comp: null Component дамжуулна
        }
    * @param {Object} body Модалын бие хэсэг Component, HTML код дамжуудах боломжтой.
    * @param {Object} footer Модалын хөл хэсэг. show=True үед default БУЦАХ, ТИЙМ гэсэн товч гарч ирнэ
    * @param {Object} btnClose Буцах товч
    * @param {Object} btnAction Үйлдэл хийх товч
    * @param {boolean} keyboard Дэлгэц дээр дарахад модал алга болох эсэх
    * @param {boolean} backdrop Модал гарч ирэх үед дэлгэц disable болох эсэх. backdrop='static' модал хаахаас өмнө өөр үйлдэл хийх боломжгүй.
    * @param {string} size Модалын хэмжээ. sm || md || lg
    * @param {boolean} center Модал дэлгэцийн гол хэсэгт гарч ирэх эсэх

    * Анхааруулга
    *  1. keyboard, backdrop 2 хамтдаа ажиллана.
    */
    const setDisplay = (modal) =>
    {
        setShow(true)
        setModal
        (
            modal
        )
    }

    /**
     * Анхааруулгын модал харуулах функц.
     * @param {string} type Модал төрөл. Жишээ нь warning || danger || success
     * @param {string} question Модал дээр харагдах асуулт эсвэл мэдээлэл байж болно.
     * @param {function} onClick Тийм товч дарагдах үед хийгдэх функц
     * @param {string} btnVariant Товчны сонголт. Жишээ нь warning || danger || success товчнб өнгө өөрчлөгдөх болно
     * @param {string} btnText Товчны нэр
     * @param {string} btnClassName Товчны className
     * @param {boolean} btnShow false үед зөюхөн буцах товч харагдана.
    */
    const showWarning = (modal) =>
    {
        setShow(true)

        const handleAction = () =>
        {
            if (modal.onClick)
            {
                modal.onClick()
            }
            onClose()
        }

        setModal(
            {
                ...initialModal,
                header: {
                    show: modal?.header?.show || true,
                    title: modal?.header?.title || ''
                },
                size: "sm",
                body:<div className="d-flex flex-column bd-highlight">
                    <div className="pt-0 bd-highlight text-center">
                        {modal.question || 'Уг үйлдэлийг хийхдээ итгэлтэй байна уу?'}
                    </div>
                </div>,
                btnAction: {
                    show: typeof modal.btnShow === 'boolean' ? modal.btnShow : true,
                    icon: modal.btnIcon || "",
                    on: () => handleAction(),
                    className: modal.btnClassName || "",
                    text: modal.btnText || "Тийм",
                    type: "button",
                    color: modal.btnVariant || 'warning',
                },
                handleHide: modal.handleHide || null
            }
        )
    }


    return (
        <ModalContext.Provider value={{ show, modal, setDisplay, onClose, setShow, showWarning, setModal }}>
            {children}
        </ModalContext.Provider>
    );
}

