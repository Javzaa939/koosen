import React, { Fragment, useState, useEffect, useContext } from "react";

import {
  Col,
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  Row,
  Spinner,
  Label,
  CardBody,
  Table,
} from "reactstrap";

import { useTranslation } from "react-i18next";

import { ChevronDown, Search, FileText } from "react-feather";

import { useForm, Controller } from "react-hook-form";

import Select from "react-select";

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import classnames from "classnames";

import SchoolContext from "@context/SchoolContext";

import { generateLessonYear, ReactSelectStyles } from "@utils";
import { utils, writeFile } from "xlsx-js-style";

const AllReport = () => {
  var values = {
    profession: "",
    lesson_year: "",
    group: "",
    lesson_season: "",
  };

  const { t } = useTranslation();
  const { school_id } = useContext(SchoolContext);
  const [select_value, setSelectValue] = useState(values);
  const [yearOption, setYear] = useState([]);
  const [datas, setDatas] = useState([]);
  const [cheaders, setHeaders] = useState([]);
  const [isMapRendering, setIsMapRendering] = useState(false);
  const [seasons, setSeasons] = useState([]);

  // Loader
  const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });
  const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({
    isFullScreen: false,
  });

  const [profession_option, setProfessionOption] = useState([]);
  const [groupOption, setGroup] = useState([]);

  // ** Hook
  const {
    control,
    formState: { errors },
  } = useForm({});

  // Api
  const getListApi = useApi().print.score;
  const groupApi = useApi().student.group;
  const seasonApi = useApi().settings.season;
  const professionApi = useApi().study.professionDefinition;

  // Улирлын жагсаалт авах
  async function getSeasons() {
    const { success, data } = await fetchData(seasonApi.get());
    if (success) {
      setSeasons(data);
    }
  }

  // Мэргэжлийн жагсаалтын getList функц боловсролын зэргээс хамаарч жагсаалтаа авна. Шаардлагагүй үед хоосон string явуулна.
  async function getProfession() {
    const { success, data } = await fetchData(
      professionApi.getList("", "", "")
    );
    if (success) {
      setProfessionOption(data);
    }
  }

  // Ангийн жагсаалт
  async function getGroup() {
    const { success, data } = await fetchData(
      groupApi.getList("", "", select_value.profession)
    );
    if (success) {
      setGroup(data);
    }
  }

  useEffect(() => {
    setYear(generateLessonYear(5));
    getProfession();
    getGroup();
    getSeasons();
  }, [select_value, school_id]);

  // to show loader while mapping is processing
  useEffect(() => {
    if (datas?.datas?.length) {
      requestAnimationFrame(() => {
        setIsMapRendering(false);
      });
    }
  }, [datas]);

  async function getDatas() {
    const { success, data } = await allFetch(
      getListApi.getPrint(
        select_value.profession,
        select_value.group,
        select_value.lesson_year,
        select_value.lesson_season
      )
    );
    if (success && data?.datas.length > 0) {
      var one_data = data?.datas[0];
      var headers = [];
      Object.keys(one_data).forEach((c) =>
        headers.push({
          key: c,
          name: c,
        })
      );
      setDatas(data);
      setHeaders(headers);
    }
  }

  function convertV2() {
    const data = datas?.datas;
    const keys = Object.keys(data?.[0] || {});

    // #region to add empty rows that may be filled by header data (not header of table, it is header of document)
    const HEADER_HEIGHT = 4;

    const headerCells = Array.from({ length: HEADER_HEIGHT }, (_, idx) => {
      const obj = {
        " ": "",
        "№": "",
      };
      keys.forEach((data) => {
        obj[data] = "";
      });
      return obj;
    });
    // #endregion

    // to add additional empty row
    const blank = () => {
      const obj = {
        " ": "",
        "№": "",
      };
      keys.forEach((data) => {
        obj[data] = "";
      });
      return obj;
    };

    // to add additional empty row and add indexes for rows with student names. For data rows
    const key_prefix = [blank(), ...data]?.map((data, vidx) => ({
      " ": "",
      "№":
        vidx === 0 ||
        vidx === 1 ||
        !data["Нэр"] ||
        !data["Оюутны код"] ||
        !data["Регистрийн дугаар"]
          ? ""
          : vidx - 1,
      ...data,
    }));

    // to merge empty rows with data rows
    const combo = [...headerCells, ...key_prefix];

    // to add all to sheet
    const worksheet = utils.json_to_sheet(combo);

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const prefix = [
      " ",
      "№",
      ...keys.map((key) => key.replace(/^.*?_-_-_/, "")), // to cut out unique key addon from keys names
    ];

    // to add headers: №	Овог	Нэр	Оюутны код. They are merged so their first row is 5
    utils.sheet_add_aoa(worksheet, [prefix], { origin: "A5" });

    // to add headers-lesson names. They are merged so their first row is 6
    // because of merge in different rows unnecessary values are hided by cells-merge effect, therefore  code-lines with a5 a6 looks same
    utils.sheet_add_aoa(worksheet, [prefix], { origin: "A6" });

    // #region define styles
    const textCellStyle = {
      border: {
        top: { style: "thin", color: { rgb: "ffffff" } },
        bottom: { style: "thin", color: { rgb: "ffffff" } },
        left: { style: "thin", color: { rgb: "ffffff" } },
        right: { style: "thin", color: { rgb: "ffffff" } },
      },
      font: {
        sz: 10,
      },
    };

    const numberCellStyle = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
        // wrapText: true
      },
      font: {
        sz: 9,
      },
    };

    const rotatedTextStyle = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
      alignment: {
        vertical: "center",
        horizontal: "center",
        textRotation: 90,
        wrapText: true,
      },
      font: {
        sz: 9,
      },
    };

    const notRotatedTextStyle = { ...rotatedTextStyle };
    notRotatedTextStyle.alignment = { ...notRotatedTextStyle.alignment };
    notRotatedTextStyle.alignment.textRotation = 0;

    const footerBorder = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "ffffff" } },
        left: { style: "thin", color: { rgb: "ffffff" } },
        right: { style: "thin", color: { rgb: "ffffff" } },
        wrapText: true,
      },
      font: {
        sz: 10,
      },
    };

    const bottomBorder = {
      border: {
        top: { style: "thin", color: { rgb: "ffffff" } },
        bottom: { style: "thin", color: { rgb: "0000000" } },
        left: { style: "thin", color: { rgb: "ffffff" } },
        right: { style: "thin", color: { rgb: "ffffff" } },
        wrapText: true,
      },
      font: {
        sz: 10,
        italic: true,
      },
    };

    // const rightBorder = {
    //     border: {
    //         top: { style: "thin", color: { rgb: "ffffff" } },
    //         bottom: { style: "thin", color: { rgb: "ffffff" } },
    //         left: { style: "thin", color: { rgb: "ffffff" } },
    //         right: { style: "thin", color: { rgb: "0000000" } },
    //         wrapText: true
    //     },
    //     font: {
    //         sz: 10,
    //         italic: true
    //     }

    // };
    // #endregion

    const columns_count_prefix = prefix.length - keys.length; // columns: '', '№'
    const columns_count_before_lessons_after_prefix = 4; // columns: ovog, ner, oyutny kod, rd
    const columns_count_lessons = datas?.lessons_length; // columns: lessons
    const columns_count_kr = 4; // columns: sudalsan, toocson
    const columns_count_assessments = 8; // columns: assessment letters
    const columns_count_grades = 6; // columns: grade letters
    const columns_count_letters_sum = 1; // columns: Хичээлийн тоо
    const columns_count_quality_success = 2; // columns: Амжилт, Чанар
    const column_length = prefix.length; // total columns count

    // #region style of document header
    const startRow = 0;
    const endRow = HEADER_HEIGHT - 1;
    const startCol = 0;
    const endCol = column_length - 1;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellAddress = utils.encode_cell({ r: row, c: col });

        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = {};
        }
        worksheet[cellAddress].s =
          row === HEADER_HEIGHT ? bottomBorder : textCellStyle;

        // to remove default header cells to move it to different row. So additional empty row added
        worksheet[cellAddress].v = "";
      }
    }
    // #endregion

    const styleRow = HEADER_HEIGHT;
    const sendRow = HEADER_HEIGHT + data?.length + 1;
    const styleCol = 1;
    const sendCol = column_length - 1;
    const columns_count_before_kr =
      columns_count_prefix +
      columns_count_before_lessons_after_prefix +
      columns_count_lessons;
    const columns_count_before_letters_sum =
      columns_count_prefix +
      columns_count_before_lessons_after_prefix +
      columns_count_lessons +
      columns_count_kr +
      columns_count_assessments +
      columns_count_grades;

    for (let row = styleRow; row <= sendRow; row++) {
      for (let col = styleCol; col <= sendCol; col++) {
        const cellNum = utils.encode_cell({ r: row, c: col });

        if (!worksheet[cellNum]) {
          worksheet[cellNum] = {};
        }

        // to rotate lessons names. in 6th row (index is 5) only lesson names displayed, so condition is just with whole row
        if (row === HEADER_HEIGHT + 1) worksheet[cellNum].s = rotatedTextStyle;
        // to rotate sudalsan kr and toocson kr columns
        else if (
          row === HEADER_HEIGHT &&
          (col === columns_count_before_kr ||
            col === columns_count_before_kr + 1 ||
            col === columns_count_before_kr + 2 ||
            col === columns_count_before_kr + 3)
        )
          worksheet[cellNum].s = rotatedTextStyle;
        // to wrap text in "Хичээлийн тоо" column
        else if (
          row === HEADER_HEIGHT &&
          col >= columns_count_before_letters_sum &&
          col <=
            columns_count_before_letters_sum + columns_count_quality_success
        )
          worksheet[cellNum].s = notRotatedTextStyle;
        // to style rest cells
        else worksheet[cellNum].s = numberCellStyle;
      }
    }

    // const fRow = HEADER_HEIGHT;
    // const fendRow = HEADER_HEIGHT + data?.length;

    // for (let row = fRow; row <= fendRow; row++) {
    //     const cellNum = utils.encode_cell({ r: row, c: 0 });

    //     if (!worksheet[cellNum]) {
    //         worksheet[cellNum] = {};
    //     }

    //     worksheet[cellNum].s = rightBorder;
    // }

    // #region to merge cells
    const seasonHeaderMerge =
      datas?.seasons && datas?.seasons.length > 0
        ? datas.seasons.map((val, i) => {
            const previousLength = datas.seasons
              .slice(0, i)
              .reduce((sum, season) => sum + (season.count || 0), 0);

            const cellNum = utils.encode_cell({
              r: HEADER_HEIGHT,
              c: i === 0 ? 6 : previousLength + 6,
            });

            const seasonCellStyle = {
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
              },
              alignment: {
                horizontal: "center",
              },
              font: {
                sz: 9,
              },
            };

            if (worksheet[cellNum]) {
              if (val?.season) {
                // #region to get season name
                let year_season = val.season.split("-");
                const season_id = Number(year_season[2]);
                const season_name = seasons.find(
                  (item) => item.id === season_id
                )?.season_name;
                year_season = `${year_season[0]}-${year_season[1]}-${season_name}`;
                // #endregion

                worksheet[cellNum].v = year_season;
                worksheet[cellNum].s = seasonCellStyle;
              }
            }

            return {
              s: {
                r: HEADER_HEIGHT,
                c: i === 0 ? 6 : 6 + previousLength,
              },
              e: {
                r: HEADER_HEIGHT,
                c: 6 + previousLength + (val.count || 0) - 1,
              },
            };
          })
        : [];
    // const lessonsMerge = Array.from({ length: datas?.lessons_length }, (_, vidx) => {
    //     return(
    //         {
    //             s: {
    //                 r: HEADER_HEIGHT,
    //                 c: 5 + vidx
    //             },
    //             e: {
    //                 r: HEADER_HEIGHT + 1,
    //                 c: 5 + vidx,
    //             }
    //         }
    //     )
    // })

    // to set last columns merge options that after lesson names columns
    const last_columns = Array.from(
      {
        length:
          columns_count_kr +
          columns_count_assessments +
          columns_count_grades +
          columns_count_letters_sum +
          columns_count_quality_success,
      },
      (value, index) => {
        return {
          s: { r: HEADER_HEIGHT, c: columns_count_before_kr + index },
          e: { r: HEADER_HEIGHT + 2, c: columns_count_before_kr + index },
        };
      }
    );

    worksheet["!merges"] = [
      // first column
      {
        s: { r: HEADER_HEIGHT, c: 1 },
        e: { r: HEADER_HEIGHT + 2, c: 1 },
      },
      {
        s: { r: HEADER_HEIGHT, c: 2 },
        e: { r: HEADER_HEIGHT + 2, c: 2 },
      },
      {
        s: { r: HEADER_HEIGHT, c: 3 },
        e: { r: HEADER_HEIGHT + 2, c: 3 },
      },
      {
        s: { r: HEADER_HEIGHT, c: 4 },
        e: { r: HEADER_HEIGHT + 2, c: 4 },
      },
      {
        s: { r: HEADER_HEIGHT, c: 5 },
        e: { r: HEADER_HEIGHT + 2, c: 5 },
      },

      // Season merge
      ...seasonHeaderMerge,
      // ...lessonsMerge,

      // last columns
      ...last_columns,
    ];
    // #endregion

    // 3 is first 3 columns
    // 2 is sudalsan and toocson kr columns
    // 8 is 8 columns with assessment letters
    // etc

    // #region to set sizes
    // to set lesson names columns width
    const phaseZeroCells = Array.from(
      { length: columns_count_lessons },
      (_) => {
        return { wch: 8 };
      }
    );

    // to set kr, letters columns width
    const phaseTwoCells = Array.from(
      {
        length:
          columns_count_kr + columns_count_assessments + columns_count_grades,
      },
      (_) => {
        return { wch: 3 };
      }
    );

    // to set "Хичээлийн тоо" column width
    const letters_sum_col = Array.from(
      { length: columns_count_letters_sum },
      (_) => {
        return { wch: 8 };
      }
    );

    // widths
    worksheet["!cols"] = [
      { wch: 3 }, // first column
      { wch: 3 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }, // fifth column
      ...phaseZeroCells,
      ...phaseTwoCells,
      ...letters_sum_col,
    ];

    // heights
    worksheet["!rows"] = [
      { hpx: 10 }, // first row
      { hpx: 10 },
      { hpx: 20 }, // group name is here
      { hpx: 10 },
      { hpx: 10 }, // season names are here
      { hpx: 150 }, // fifth row. rotated lesson names are here
    ];

    worksheet["B3"].v = datas?.group_name
      ? `Анги бүлгийн нэр: ${datas?.group_name}`
      : "";
    writeFile(workbook, "Ангийн нийт дүн.xlsx");
  }

  return (
    <Fragment>
      <Card>
        {isLoading && Loader}
        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
          <CardTitle tag="h4">{t("Дүнгийн нэгдсэн тайлан")}</CardTitle>
        </CardHeader>
        <Row className="mx-0 mt-50 ps-1">
          <Col md={2}>
            <Label className="form-label" for="profession">
              {t("Хөтөлбөр")}
            </Label>
            <Select
              name="profession"
              id="profession"
              classNamePrefix="select"
              isClearable
              className={classnames("react-select", {
                "is-invalid": errors.profession,
              })}
              isLoading={isLoading}
              placeholder={`-- Сонгоно уу --`}
              options={profession_option || []}
              value={profession_option.find(
                (c) => c.id === select_value.profession
              )}
              noOptionsMessage={() => "Хоосон байна"}
              onChange={(val) => {
                if (val?.id) {
                  setSelectValue((current) => {
                    return {
                      ...current,
                      profession: val?.id,
                    };
                  });
                } else {
                  setSelectValue((current) => {
                    return {
                      ...current,
                      profession: "",
                    };
                  });
                }
              }}
              styles={ReactSelectStyles}
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => option.full_name}
            />
          </Col>
          <Col md={2} className="">
            <Label className="form-label" for="group">
              {t("Анги")}
            </Label>
            <Select
              name="group"
              id="group"
              classNamePrefix="select"
              isClearable
              className={classnames("react-select", {
                "is-invalid": errors.group,
              })}
              isLoading={isLoading}
              placeholder={`-- Сонгоно уу --`}
              options={groupOption || []}
              value={groupOption.find((c) => c.id === select_value.group)}
              noOptionsMessage={() => "Хоосон байна"}
              onChange={(val) => {
                if (val?.id) {
                  setSelectValue((current) => {
                    return {
                      ...current,
                      group: val?.id,
                    };
                  });
                } else {
                  setSelectValue((current) => {
                    return {
                      ...current,
                      group: "",
                    };
                  });
                }
              }}
              styles={ReactSelectStyles}
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => option.name}
            />
          </Col>
          <Col sm={6} md={2} className="mb-1 ms-1">
            <Label className="form-label me-1" for="lesson_year">
              {t("Хичээлийн жил")}
            </Label>
            <Select
              name="lesson_year"
              id="lesson_year"
              classNamePrefix="select"
              isClearable
              className={"react-select"}
              isLoading={isLoading}
              options={yearOption || []}
              placeholder={t("-- Сонгоно уу --")}
              noOptionsMessage={() => t("Хоосон байна")}
              styles={ReactSelectStyles}
              value={yearOption.find((e) => e.id === select_value.lesson_year)}
              isMulti
              onChange={(val) => {
                if (val && val.length > 0) {
                  setSelectValue((current) => ({
                    ...current,
                    lesson_year: val.map((item) => item.id), // Store an array of IDs
                  }));
                } else {
                  setSelectValue((current) => ({
                    ...current,
                    lesson_year: [], // Ensure it's an empty array, not an empty string
                  }));
                }
              }}
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => option.name}
            />
          </Col>
          <Col sm={6} md={2} className="mb-1 ms-1">
            <Label className="form-label me-1" for="lesson_season">
              {t("Хичээлийн улирал")}
            </Label>
            <Select
              name="lesson_season"
              id="lesson_season"
              classNamePrefix="select"
              isClearable
              className={"react-select"}
              isLoading={isLoading}
              options={seasons || []}
              placeholder={t("-- Сонгоно уу --")}
              noOptionsMessage={() => t("Хоосон байна")}
              styles={ReactSelectStyles}
              value={seasons.find((e) => e.id === select_value.lesson_season)}
              onChange={(val) => {
                if (val?.id) {
                  setSelectValue((current) => {
                    return {
                      ...current,
                      lesson_season: val?.id,
                    };
                  });
                } else {
                  setSelectValue((current) => {
                    return {
                      ...current,
                      lessons_season: "",
                    };
                  });
                }
              }}
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => option.season_name}
            />
          </Col>
          <Col sm={6} md={3} className="d-flex gap-5 py-1 ms-3">
            <Button
              color="primary"
              onClick={() => getDatas()}
              size="sm"
              disabled={!(select_value.group && select_value.lesson_year)}
            >
              <FileText size={15} /> Хайх
            </Button>
            <Button
              color="primary"
              onClick={() => convertV2()}
              size="sm"
              disabled={datas.length === 0}
            >
              <FileText size={15} /> Excel Татах
            </Button>
          </Col>
        </Row>
        {isTableLoading ? (
          Loader
        ) : (
          <Card>
            <CardBody style={{ overflowX: "auto" }}>
              <div style={{ minHeight: "400px" }}>
                <Table bordered striped responsive>
                  <thead>
                    <tr>
                      <th>№</th>
                      {cheaders.map((head, hidx) => (
                        <th key={hidx}>
                          {
                            head?.name.replace(
                              /^.*?_-_-_/,
                              ""
                            ) /* to cut out unique key addon from keys names*/
                          }
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datas?.datas?.map((data, index) => (
                      <tr key={index}>
                        <td>{index === 0 ? "" : index}</td>

                        {cheaders.map((header, cindex) => {
                          return <td key={cindex}>{data[header.key]}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}
      </Card>
    </Fragment>
  );
};

export default AllReport;
