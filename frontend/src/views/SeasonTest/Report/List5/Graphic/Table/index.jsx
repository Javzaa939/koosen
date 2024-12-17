import React, { useCallback } from "react";

/**
 * @param {} props
 */
const AnalysisTable = (props) => {
    const data = props?.data ?? {};
    const chartData = data.data ?? [];
    const names = data.names ?? [];
    const extraData = props?.extra ?? {};

    const makeRow = useCallback(() => {
        const rows = names.map((name, idx) => {
            const item = chartData.find((e) => e.name === name);
            return {
                id: idx + 1,
                lesson: extraData.lesson,
                teacher: extraData.teacher,
                year: extraData.year,
                season: extraData.season,
                assesment: name,
                percent: item?.percent ?? 0,
                count: item?.count ?? 0,
                realPercent: item?.realPercent ?? 0,
            };
        });
        rows.push({
            id: rows.length + 1,
            assesment: "Нийт",
            percent: rows
                .reduce((total, e) => (total += parseFloat(e.realPercent)), 0)
                .toFixed(2),
            count: rows.reduce((total, e) => (total += e.count), 0),
        });
        return rows;
    }, [props?.data]);

    const rows = makeRow();

    const columns = [
        { field: "id", label: "№", width: "5%" },
        { field: "lesson", label: "Хичээлийн код", width: "20%" },
        { field: "teacher", label: "Багшийн нэр", width: "15%" },
        { field: "year", label: "Хичээлийн жил", width: "10%" },
        { field: "season", label: "Улирал", width: "10%" },
        { field: "assesment", label: "Үнэлгээ", width: "10%" },
        { field: "percent", label: "Үнэлгээний эзлэх хувь", width: "15%" },
        { field: "count", label: "Оюутны тоо", width: "15%" },
    ];

    return (
        <div style={{ padding: "16px" }}>
            <h3>Хүснэгтэн байдлаар</h3>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "center",
                }}
            >
                {/* Table Header */}
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.field}
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "8px",
                                    backgroundColor: "#f2f2f2",
                                    width: col.width,
                                }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            {columns.map((col) => (
                                <td
                                    key={col.field}
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                    }}
                                >
                                    {row[col.field] ?? "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnalysisTable;
