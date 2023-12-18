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
                                {
                                    var splitted = []
                                    var column_key = column.key

                                    var foriegn_key = false
                                    if (column_key.includes('.')) {
                                        foriegn_key = true
                                        splitted = column_key.split('.')
                                    }

                                    if (column?.editable && column?.component) {
                                        return (
                                            <td key={`score-${idx2}${idx}`} className={ 'd-flex flex-column' + column?.center && column.center ? 'd-flex justify-content-center': ''}>
                                                <column.component rowIdx={idx} colIdx={idx2} row={row} column={column} datas={datas} params={params} {...props}/>
                                            </td>
                                        )
                                    } else if (foriegn_key && splitted.length > 1) {
                                        return (
                                            <td key={`score-${idx2}${idx}`} className={ column?.center && column.center ? 'text-center': ''}>{(foriegn_key && splitted.length > 1) ?  row[splitted[0]] ? row[splitted[0]][splitted[1]] : '' : row[column.key]}</td>
                                        )
                                    } else {
                                        return (
                                            <td key={`score-${idx2}${idx}`} className={ column?.center && column.center ? 'text-center': ''}>{row[column.key]}</td>
                                        )
                                    }

                                }
                        )}
                    </tr>
            )}
        </tbody>
    )
}
