import React, { ChangeEvent, useState } from "react";
import { Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseExportComponent, CourseWebExport } from "types";
import {
  CourseExportOrientation,
  CourseExportPrerequisite,
  CourseExportTypes,
} from "editor-constants";
import "./styles.scss";

export interface CompProps extends CourseExportComponent {}

function BlmCourseWebExport(props: CompProps) {
  const { onExport } = props;
  const [data, setData] = useState(new CourseWebExport());
  const { prerequisite, orientation } = data;
  const { t } = useTranslation("export");

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.value;
    const newData = { ...data };

    if (name === "prerequisite" || name === "orientation") {
      (newData[name] as any) = value;
    }

    setData(newData);
  };

  const handleExportClick = () => {
    if (onExport) {
      onExport({ type: CourseExportTypes.Web, options: data });
    }
  };

  return (
    <div className="course-web-export-container">
      <span className="course-web-prerequisite-lbl">{t("prerequisite")}</span>
      <span className="course-web-orientation-lbl">{t("mobile_orientation")}</span>
      <Select
        name="prerequisite"
        value={prerequisite}
        MenuProps={{
          className: "course-web-prerequisite-dropdown-menu",
        }}
        className="course-web-prerequisite-dropdown"
        onChange={handleChange}
      >
        <MenuItem key={CourseExportPrerequisite.Default} value="default">
          {t("prerequisite_list.defined_course")}
        </MenuItem>
        <MenuItem value={CourseExportPrerequisite.Noprerequisite}>
          {t("prerequisite_list.no_prerequisite")}
        </MenuItem>
      </Select>
      <Select
        name="orientation"
        value={orientation}
        MenuProps={{
          className: "course-web-orientation-dropdown-menu",
        }}
        className="course-web-orientation-dropdown"
        onChange={handleChange}
      >
        <MenuItem value={CourseExportOrientation.Free}>
          {t("mobile_orientation_list.free")}
        </MenuItem>
        <MenuItem value={CourseExportOrientation.Portrait}>
          {t("mobile_orientation_list.portrait")}
        </MenuItem>
        <MenuItem value={CourseExportOrientation.Landscape}>
          {t("mobile_orientation_list.landscape")}
        </MenuItem>
      </Select>
      <div className="course-web-export-button" onClick={handleExportClick}>
        {t("buttons.export_web")}
      </div>
    </div>
  );
}

export default BlmCourseWebExport;
