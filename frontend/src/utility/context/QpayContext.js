import { createContext, useContext, useState } from "react";

const QpayContext = createContext();

export const QpayProvider = ({ children }) => {

    const [handleAction, setHandleAction] = useState(null);
    const [handleExitModalAction, setHandleExitModalAction] = useState(null);

    return (
        <QpayContext.Provider value={{ handleAction, setHandleAction, handleExitModalAction, setHandleExitModalAction }}>
            {children}
        </QpayContext.Provider>
    );
};

/**
    ** Төлбөр төлөгдсөний дараа дуудах функц дамжуулах context
    * @param {String}           setHandleAction                 Дамжуулах функцийг хадгалах
    * @param {String}           handleAction                    Дамжуулах функц
    * @param {String}           setHandleExitModalAction        Төлбөр амжилтгүй болсон үед дуудах функцийг хадгалах
    * @param {String}           handleExitModalAction           Төлбөр амжилтгүй болсон үед дуудах функц
*/
export const useQpay = () => useContext(QpayContext);
