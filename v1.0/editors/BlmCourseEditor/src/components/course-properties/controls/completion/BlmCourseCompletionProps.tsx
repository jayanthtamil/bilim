import React, { ChangeEvent, Fragment } from "react";
import { Checkbox, FormControlLabel, FormGroup, Radio, RadioGroup } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseCompletionProps, CourseNavigationProps, CourseProps } from "types";
import { CompletionType } from "editor-constants";
import { toBoolean } from "utils";
import { BlmSubscriptInput, SubscriptInputChangeEvent } from "shared";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: CourseProps & { completion: CourseCompletionProps; navigation: CourseNavigationProps };
  onChange?: (data: CourseProps) => void;
}

function BlmCourseCompletioProps(props: CompProps) {
  const { data, onChange } = props;
  const { completion, navigation } = data;
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
    let newData;

    if (completion.actions.hasOwnProperty(name)) {
      newData = {
        ...data,
        completion: { ...completion, actions: { ...completion.actions, [name]: value } },
      };
    } else {
      if (name === "completion") {
        newData = {
          ...data,
          completion: { ...completion, [name]: value },
        };
      } else {
        newData = {
          ...data,
          navigation: { ...navigation, [name]: name === "prerequisite" ? toBoolean(value) : value },
        };
      }
    }

    updateChange(newData);
  };

  return (
    <div className="course-completion-props-container">
      <div className="completion-props-container">
        <div className="crs-completion-title">{t("completion.title")}</div>
        <Fragment>
          <RadioGroup
            name="completion"
            value={completion.completion}
            className="crs-completion-radio-group"
            onChange={handleChange}
          >
            <FormControlLabel
              label={t("completion.screen_displayed")}
              control={<Radio className="radio-4" />}
              value={CompletionType.ScreenDisplayed}
              className="crs-completion-form-ctrl-lbl"
            />
            <FormControlLabel
              label={t("completion.screen_undisplayed")}
              control={<Radio className="radio-4" />}
              value={CompletionType.ScreenUndisplayed}
              className="crs-completion-form-ctrl-lbl"
            />
            <FormControlLabel
              label={t("completion.action")}
              control={<Radio className="radio-4" />}
              value={CompletionType.ByAction}
              className="crs-completion-form-ctrl-lbl"
            />
          </RadioGroup>
          {completion.completion === CompletionType.ByAction && (
            <FormGroup className="crs-completion-form-group">
              <FormControlLabel
                name="all_button_clicked"
                label={t("completion.all_button")}
                control={<Checkbox />}
                checked={completion.actions.all_button_clicked}
                className="crs-completion-form-ctrl-lbl"
                onChange={handleChange}
              />
              <FormControlLabel
                name="video_complete"
                label={t("completion.video_complete")}
                control={<Checkbox />}
                checked={completion.actions.video_complete}
                className="crs-completion-form-ctrl-lbl"
                onChange={handleChange}
              />
              <FormControlLabel
                name="sound_complete"
                label={t("completion.sound_complete")}
                control={<Checkbox />}
                checked={completion.actions.sound_complete}
                className="crs-completion-form-ctrl-lbl"
                onChange={handleChange}
              />
              <FormControlLabel
                name="animation_complete"
                label={t("completion.animation_complete")}
                control={<Checkbox />}
                checked={completion.actions.animation_complete}
                className="crs-completion-form-ctrl-lbl"
                onChange={handleChange}
              />
              <FormControlLabel
                name="interaction_complete"
                label={t("completion.interaction_complete")}
                control={<Checkbox />}
                checked={completion.actions.interaction_complete}
                className="crs-completion-form-ctrl-lbl"
                onChange={handleChange}
              />
              <FormControlLabel
                name="timer"
                label={t("completion.timer")}
                control={<Checkbox />}
                checked={completion.actions.timer}
                className="crs-completion-form-ctrl-lbl"
                onChange={handleChange}
              />
              {completion.actions.timer && (
                <BlmSubscriptInput
                  name="timer_duration"
                  label={t("completion.timer_info")}
                  min={0}
                  max={60}
                  value={completion.actions.timer_duration}
                  className="crs-completion-timer-duration-txt"
                  onChange={handleChange}
                />
              )}
            </FormGroup>
          )}
        </Fragment>
      </div>
      <RadioGroup
        name="prerequisite"
        value={navigation.prerequisite}
        className="prerequisite-props-container"
        onChange={handleChange}
      >
        <div className="prerequisite-title">{t("prerequisite.title")}</div>
        <FormControlLabel
          label={t("prerequisite.all_chapter")}
          control={<Radio className="radio-4" />}
          value={false}
          className="prerequisite-option mui-radio-form-ctrl-lbl-1"
        />
        <FormControlLabel
          label={`${t("prerequisite.chapters_order")}`}
          control={<Radio className="radio-4" />}
          value={true}
          className="prerequisite-option mui-radio-form-ctrl-lbl-1"
        />
      </RadioGroup>
    </div>
  );
}

export default BlmCourseCompletioProps;
