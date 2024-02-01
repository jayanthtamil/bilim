import React, { ChangeEvent, Fragment } from "react";
import { Checkbox, FormControlLabel, MenuItem, Select, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseNavigationProps, CourseProps, StyleConfig } from "types";
import { NavigationType } from "editor-constants";
import { SubscriptInputChangeEvent } from "shared";
import "./styles.scss";

export interface CompProps {
  label: string;
  config?: StyleConfig;
  data: CourseProps & { navigation: CourseNavigationProps };
  onChange?: (data: CourseProps) => void;
}

const labels = [
  "0 - No home",
  "1 - Home page",
  "2 - Home page + Chapter Summary",
  "3 - 3 levels of summary",
  "4 - 4 levels of summary",
];

function BlmCourseNavigationProps(props: CompProps) {
  const { config, data, onChange } = props;
  const { navigation } = data;
  const { navigationlevel = 0, toclevel = 1 } = config?.navigation || {};
  const { t } = useTranslation("course-props");

  const updateChange = (newData: CourseProps) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: ChangeEvent<any> | SubscriptInputChangeEvent) => {
    const { target } = event;
    const value =
      "type" in target && target.type === "checkbox" && "checked" in target
        ? target.checked
        : target.value;
    const name = target.name;

    const newData = {
      ...data,
      navigation: { ...navigation, [name]: value },
    };

    updateChange(newData);
  };

  const createNavigationLevels = () => {
    const items = [];

    for (let i = 0; i <= navigationlevel; i++) {
      items.push(
        <MenuItem key={i} value={i}>
          {labels[i]}
        </MenuItem>
      );
    }

    return items;
  };

  const createTOCLevels = () => {
    const items = [];

    for (let i = 1; i <= toclevel; i++) {
      items.push(
        <MenuItem key={i} value={i}>
          {i}
        </MenuItem>
      );
    }

    return items;
  };

  return (
    <div className="course-navigation-props-container">
      <div className="navigation-props-container">
        <div className="navigation-title">{t("tabs.navigation")}</div>
        <div className="navigation-unlinear-lbl">{t("navigation.unlinear")}</div>
        <FormControlLabel
          name="linear"
          label={t("navigation.linear")}
          control={<Switch className="switch-1" />}
          checked={navigation.linear}
          className="navigation-linear-frm-lbl"
          onChange={handleChange}
        />
        {navigation.type === NavigationType.Style && (
          <Fragment>
            <div className="navigation-summary-lbl">{t("navigation.summary_level")}</div>
            <Select
              name="navigationlevel"
              value={navigation.navigationlevel}
              className="navigation-summary-dropdown select-2"
              onChange={handleChange}
            >
              {createNavigationLevels()}
            </Select>
          </Fragment>
        )}
      </div>
      <div className="burger-props-container">
        <FormControlLabel
          name="burger"
          label={t("navigation.burger")}
          control={<Checkbox />}
          checked={navigation.burger}
          className="burger-frm-lbl"
          onChange={handleChange}
        />
        {navigation.burger && (
          <Fragment>
            <FormControlLabel
              name="screensontoc"
              label={t("navigation.screen_toc")}
              control={<Checkbox />}
              checked={navigation.screensontoc}
              className="toc-screen-frm-lbl"
              onChange={handleChange}
            />
            <div className="toc-level-lbl">{t("navigation.toc_levels")}</div>
            <Select
              name="toclevel"
              value={navigation.toclevel}
              className="toc-level-dropdown select-2"
              onChange={handleChange}
            >
              {createTOCLevels()}
            </Select>
          </Fragment>
        )}
      </div>
    </div>
  );
}

export default BlmCourseNavigationProps;
