import React, { ChangeEvent, useState } from "react";
import { Checkbox, FormControlLabel, Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseExportComponent, CourseLMSExport } from "types";
import {
  CourseExportOrientation,
  CourseExportPrerequisite,
  CourseExportTypes,
  LMSExportPackage,
  LMSExportVesrion,
} from "editor-constants";
import "./styles.scss";

export interface CompProps extends CourseExportComponent {}

function BlmCourseLMSExport(props: CompProps) {
  const { onExport } = props;
  const [data, setData] = useState(new CourseLMSExport());
  const { version, pkg, prerequisite, orientation, exit } = data;
  const { t } = useTranslation("export");

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData = { ...data };

    if (
      name === "version" ||
      name === "pkg" ||
      name === "prerequisite" ||
      name === "orientation" ||
      name === "exit"
    ) {
      (newData[name] as any) = value;
    }

    setData(newData);
  };

  const handleExportClick = () => {
    if (onExport) {
      onExport({ type: CourseExportTypes.LMS, options: data });
    }
  };

  return (
    <div className="course-lms-export-container">
      <span className="course-lms-version-lbl">{t("version")}</span>
      <span className="course-lms-package-lbl">{t("package")}</span>
      <Select
        name="version"
        value={version}
        MenuProps={{
          className: "course-lms-version-dropdown-menu",
        }}
        className="course-lms-version-dropdown"
        onChange={handleChange}
      >
        <MenuItem value={LMSExportVesrion.Default}>{t("version_list.scorm_2004")}</MenuItem>
        <MenuItem value={LMSExportVesrion.Scrom_1_2}>{t("version_list.scorm_1")}</MenuItem>
      </Select>
      <Select
        name="pkg"
        value={pkg}
        MenuProps={{
          className: "course-lms-package-menu",
        }}
        className="course-lms-package-dropdown"
        onChange={handleChange}
      >
        <MenuItem value={LMSExportPackage.Full}>{t("package_list.full_sco")}</MenuItem>
      </Select>
      <span className="course-lms-prerequisite-lbl">{t("prerequisite")}</span>
      <span className="course-lms-exit-lbl">{t("exit")}</span>
      <Select
        name="prerequisite"
        value={prerequisite}
        MenuProps={{
          className: "course-lms-prerequisite-dropdown-menu",
        }}
        className="course-lms-prerequisite-dropdown"
        onChange={handleChange}
      >
        <MenuItem value={CourseExportPrerequisite.Default}>
          {t("prerequisite_list.defined_course")}
        </MenuItem>
        <MenuItem value={CourseExportPrerequisite.Noprerequisite}>
          {t("prerequisite_list.no_prerequisite")}
        </MenuItem>
      </Select>
      <FormControlLabel
        name="exit"
        label={t("force_close")}
        control={<Checkbox />}
        checked={exit}
        className="mui-radio-form-ctrl-lbl-1 course-lms-exit-frm-ctrl"
        onChange={handleChange}
      />
      <span className="course-lms-orientation-lbl">{t("mobile_orientation")}</span>
      <Select
        name="orientation"
        value={orientation}
        MenuProps={{
          className: "course-lms-orientation-dropdown-menu",
        }}
        className="course-lms-orientation-dropdown"
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
      <div className="course-lms-export-button" onClick={handleExportClick}>
        {t("buttons.export_lms")}
      </div>
    </div>
  );
}

export default BlmCourseLMSExport;
