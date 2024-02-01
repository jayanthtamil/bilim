import React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Select, MenuItem } from "@material-ui/core";
import { SelectProps } from "@material-ui/core/Select";
import { FeedbackDisplayType } from "editor-constants";
import "./styles.scss";

export interface CompProps extends Pick<SelectProps, "name" | "value" | "onChange" | "className"> {}

function BlmFeedbackDisplay(props: CompProps) {
  const { name, value, className, onChange } = props;
  const { t } = useTranslation("shared");

  return (
    <Select
      name={name}
      value={value}
      className={clsx("feedback-display-dropdown", className)}
      onChange={onChange}
    >
      <MenuItem value={FeedbackDisplayType.InPopup}>{t("feedback_display.popup")}</MenuItem>
      <MenuItem value={FeedbackDisplayType.BelowPartpage}>
        {t("feedback_display.below_partpage")}
      </MenuItem>
      <MenuItem value={FeedbackDisplayType.NextPage}>{t("feedback_display.next_page")}</MenuItem>
    </Select>
  );
}

export default BlmFeedbackDisplay;
