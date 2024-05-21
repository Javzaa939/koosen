import React from 'react';

function TableShow({ rows,  standart_bagts_option }) {

    // Хөлийн дүнгийн нийт кредитийг олж байна
    const totalKredit = rows.reduce((acc, rowData) => {
        const lessonId = rowData.lesson;
        const kredit = lessonId && standart_bagts_option?.find(option => option.id === lessonId)?.kredit;
        return acc + (kredit || 0);
    }, 0);

    // Ромын дугаар луу хөрвүүлж байна
    function toRoman(num) {
        const romanNumerals = {
            1: 'I',
            2: 'II',
            3: 'III',
            4: 'IV',
            5: 'V',
            6: 'VI',
            7: 'VII',
            8: 'VIII',
            9: 'IX',
            10: 'X'
        };

        return romanNumerals[num] || '';
    }

    return (
        <>
            {
                rows.map((rowData, index) => {
                    const { lesson, previous_lesson, group_lesson, season, is_check_score, errors } = rowData;

                    const lessonCode = lesson && standart_bagts_option?.find(option => option.id === lesson)?.code;
                    const lessonName = lesson && standart_bagts_option?.find(option => option.id === lesson)?.name;
                    const kredit = lesson && standart_bagts_option?.find(option => option.id === lesson)?.kredit;

                    return (
                        <tr key={index}>
                            <td className="text-center border-end border-bottom border-dark">{index + 1}</td>
                            <td className="text-center border-end border-bottom border-dark">{lessonCode}</td>
                            <td className="text-left border-end border-bottom border-dark"><span className='ms-1'>{lessonName}</span></td>
                            <td className="text-center border-end border-bottom border-dark">{kredit}</td>
                            <td colSpan={3} className="text-center border-end border-bottom border-dark">
                                {season && season.map((seasonId, idx) => toRoman(seasonId)).join(', ')}
                            </td>

                        </tr>
                    );
                })
            }
            <tr>
                <td colSpan={3} className="text-center border-end border-bottom border-dark">Нийт:</td>
                <td className="text-center border-end border-bottom border-dark" >{totalKredit}</td>
                <td className="text-center border-end border-bottom border-dark" ></td>
            </tr>
        </>
    );
}

export default TableShow;
