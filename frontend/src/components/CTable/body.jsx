import React from 'react'

export default function CBody(props) {
    const {
        headers,
        datas,
        currentPage,
        rowsPerPage,
        params,
        pagination
    } = props

    return (
        <tbody>
            {
                datas && datas.map((row, idx) =>
                    <tr key={idx}>
                        <td>{pagination ? ((currentPage-1) * rowsPerPage + idx + 1) : idx + 1}</td>
                        {
                            headers.map((column, idx2) =>
                                // мөр засах үед
                                column.editable
                                ?
                                    column.component
                                    ?
                                        <td key={`score-${idx2}${idx}`} className={ 'd-flex flex-column' + column?.center && column.center ? 'd-flex justify-content-center': ''}>
                                            <column.component rowIdx={idx} colIdx={idx2} row={row} column={column} datas={datas} params={params} {...props}/>
                                        </td>
                                    :
                                        <td key={`score-${idx2}${idx}`} className={ column?.center && column.center ? 'text-center': ''}>{row[column.key]}</td>
                                :
                                    <td key={`score-${idx2}${idx}`} className={ column?.center && column.center ? 'text-center': ''}>{row[column.key]}</td>
                        )}
                    </tr>
            )}
        </tbody>
    )
}
