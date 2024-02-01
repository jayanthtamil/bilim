import React, { ChangeEvent } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElementProps, ElementPropsComponent } from "types";
import { ContainerProps } from "./container";
import "./styles.scss";

interface CompProps extends ElementPropsComponent, ContainerProps {}

function BlmSummaryGeneralProps(props: CompProps) {
  const { data, config, onChange } = props;
  const { navigation } = config || {};
  const { screenMenu } = navigation || {};
  const { styleSummary, screenSummary = screenMenu } = data;
  const { t } = useTranslation("properties");

  const updateChange = (newData: CourseElementProps) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const { target } = event;
    const name = target.name as string;
    const value = target.checked;
    const newData = { ...data, styleSummary, screenSummary };

    if (name === "screenSummary") {
      newData[name] = value;
    } else if (name === "styleSummary") {
      newData[name] = !value;
    }

    updateChange(newData);
  };

  return (
    <div className="summary-general-props-container">
      <FormControlLabel
        name="screenSummary"
        label={t("summary_general.display_screen")}
        control={<Checkbox />}
        checked={screenSummary}
        className="summary-general-screen-frm-lbl"
        onChange={handleChange}
      />
      <FormControlLabel
        name="styleSummary"
        label={t("summary_general.deactivate_summary")}
        control={<Checkbox />}
        checked={!styleSummary}
        className="summary-general-deactivate-frm-lbl"
        onChange={handleChange}
      />
    </div>
  );
}

export default BlmSummaryGeneralProps;
