
import { createContext, useState } from "react";


const ActiveYearContext = createContext();

export default ActiveYearContext;

/**
    ** Идэвхитэй буюу хичээлийн жил болон улирлыг авах context
    * @param {String}           setYearContext           Идэвхитэй жилийг авна
    * @param {String}           cyear_name               Тухайн идэвхитэй жил
    * @param {String}           setSeasonContext         Сонгосон улирлын id-г авна
    * @param {String}           context_season_id        Тухайн улирлын id
    * @param {String}           setSeasonNameContext     Улирлын нэрийг авна
    * @param {String}           cseason_name             Улирлын нэр
*/

export const ActiveYearContextProvider = ({ children }) => {

    const [ cyear_name, setYearContext ] = useState('')
    const [ cseason_id, setSeasonContext ] = useState('')
    const [ cseason_name, setSeasonNameContext ] = useState('')
    const [active_week, setActiveWeek ] = useState('')

    return (
        <ActiveYearContext.Provider value={{ cyear_name, setYearContext, cseason_id, cseason_name, active_week,  setSeasonContext, setSeasonNameContext, setActiveWeek }}>
            {children}
        </ActiveYearContext.Provider>
    );
};
