import React, { Fragment, useState } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseCompletionProps, CourseNavigationProps, CourseProps, StyleConfig } from "types";
import { Tabs } from "shared/material-ui";
import {
  BlmCourseGeneralProps,
  BlmCourseNavigationProps,
  BlmCourseCompletionProps,
  BlmCourseEvaluationProps,
  BlmCourseTranslationProps,
  BlmCourseStyleProps,
  BlmCourseLogProps,
} from "../controls";
import { ContainerProps } from "./container";
import "./styles.scss";
import { textArea } from "utils";

export interface CompProps extends ContainerProps {
  open: boolean;
  anchorEle: HTMLElement;
  data: CourseProps;
  onClose?: () => void;
}

const createState = (props: CourseProps, config?: StyleConfig) => {
  let data = {
    ...props,
    navigation: { ...new CourseNavigationProps(), ...config?.navigation, ...props.navigation },
    completion: { ...new CourseCompletionProps(), ...props.completion },
  };

  return { data, isEdited: false };
};

const modifiers = {
  offset: {
    offset: "10,27",
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

function BlmCoursePropertiesPanel(props: CompProps) {
  const {
    open,
    anchorEle,
    config,
    onClose,
    setCourseProperties,
    updateCourseProperties,
    openConfirmDialog,
  } = props;
  const [state, setState] = useState(() => createState(props.data, config));
  const { data, isEdited } = state;
  const { t } = useTranslation();

  const openSaveConfirmDialog = () => {
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog("", `${t("alert.save_changes")}`, handleSave, handleCancel, options);
  };

  const updateTree = (newData?: CourseProps) => {
    if (
      data &&
      (!newData ||
        data.navigation.navigationlevel !== newData.navigation?.navigationlevel ||
        data.isEvaluation !== newData.isEvaluation ||
        data.hasFeedback !== newData.hasFeedback)
    ) {
      setCourseProperties(newData);
    }
  };

  const saveChanges = () => {
    if (isEdited) {
      let newDescription = textArea(data.description, "\n", "<br>");
      data.description = newDescription;

      updateCourseProperties(data);
    }
  };

  const revertChanges = () => {
    updateTree();
  };

  const closePanel = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleChange = (newData: CourseProps) => {
    updateTree(newData);
    setState({
      data: newData as CourseProps & {
        navigation: CourseNavigationProps;
        completion: CourseCompletionProps;
      },
      isEdited: true,
    });
  };

  const handleSave = () => {
    saveChanges();
    closePanel();
  };

  const handleCancel = () => {
    revertChanges();
    closePanel();
  };

  const handleBackdropClose = () => {
    if (isEdited) {
      openSaveConfirmDialog();
    } else {
      closePanel();
    }
  };

  return (
    <Fragment>
      <Backdrop open={open} className="course-props-panel-backdrop" onClick={handleBackdropClose} />
      <Popper
        open={open}
        anchorEl={open ? anchorEle : null}
        placement="bottom-end"
        modifiers={modifiers}
        className="course-props-panel"
      >
        <div className="course-props-panel-container">
          <div className="course-props-panel-anchor-btn" />
          <div className="course-props-panel-close-btn" onClick={handleSave} />
          <Tabs className="course-props-tabs">
            <BlmCourseGeneralProps label={t("tabs.general")} data={data} onChange={handleChange} />
            <BlmCourseNavigationProps
              label={t("tabs.navigation")}
              config={config}
              data={data}
              onChange={handleChange}
            />
            <BlmCourseCompletionProps
              label={t("tabs.completion")}
              data={data}
              onChange={handleChange}
            />
            <BlmCourseEvaluationProps
              label={t("tabs.evaluation")}
              data={data}
              onChange={handleChange}
            />
            <BlmCourseTranslationProps
              label={t("tabs.translation")}
              data={data}
              onChange={handleChange}
            />
            <BlmCourseStyleProps label={t("tabs.style")} data={data} />
            <BlmCourseLogProps label={t("tabs.log")} data={data} />
          </Tabs>
        </div>
      </Popper>
    </Fragment>
  );
}

export default BlmCoursePropertiesPanel;
