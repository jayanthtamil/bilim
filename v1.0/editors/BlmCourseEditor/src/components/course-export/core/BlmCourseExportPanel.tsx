import React, { Fragment } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseExport } from "types";
import { Tabs } from "shared/material-ui";
import { BlmCourseLMSExport, BlmCourseTranslationExport, BlmCourseWebExport } from "../controls";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  courseId: string;
  anchorEle: HTMLElement;
  onClose?: () => void;
}

const modifiers = {
  offset: {
    offset: "10,26",
    enabled: true,
  },
  flip: {
    enabled: false,
  },
  keepTogether: {
    enabled: false,
  },
  arrow: {
    enabled: false,
  },
  preventOverflow: {
    enabled: false,
  },
  hide: {
    enabled: false,
  },
};

function BlmCourseExportPanel(props: CompProps) {
  const { open, courseId, anchorEle, onClose, getCourseExport } = props;
  const { t } = useTranslation("export");

  const handleExport = (data: CourseExport) => {
    getCourseExport(courseId, data).then((result) => {
      const { file_uri } = result.payload;

      if (file_uri) {
        window.open(file_uri);
        closePanel();
      }
    });
  };

  const closePanel = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleBackdropClose = () => {
    closePanel();
  };

  return (
    <Fragment>
      <Backdrop
        open={open}
        className="course-export-panel-backdrop"
        onClick={handleBackdropClose}
      />
      <Popper
        open={open}
        placement="bottom-end"
        modifiers={modifiers}
        anchorEl={open ? anchorEle : null}
        className="course-export-panel"
      >
        <div className="course-export-panel-container">
          <div className="course-export-panel-anchor-btn" />
          <div className="course-export-panel-close-btn" onClick={handleBackdropClose} />
          <Tabs className="course-export-tabs">
            <BlmCourseWebExport label={t("tabs.web")} onExport={handleExport} />
            <BlmCourseLMSExport label={t("tabs.lms")} onExport={handleExport} />
            <BlmCourseTranslationExport label={t("tabs.translation")} />
          </Tabs>
        </div>
      </Popper>
    </Fragment>
  );
}
export default BlmCourseExportPanel;
