import React, { ChangeEvent, Fragment, useMemo } from "react";
import clsx from "clsx";
import { RadioGroup, FormGroup, FormControlLabel, Checkbox, Radio } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CompletionProps,
  CourseElement,
  CourseElementProps,
  ElementPropsComponent,
  PrerequisiteProps,
} from "types";
import { CompletionType, ElementType } from "editor-constants";
import { getPreviousElements } from "utils";
import { BlmSubscriptInput, SubscriptInputChangeEvent } from "shared";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ElementPropsComponent, ContainerProps {
  element: CourseElement;
  type?: "prerequisite";
}

function BlmCompletionPrerequisiteProps(props: CompProps) {
  const { type, course, element, data, onChange } = props;
  const { isCompletion } = data;
  const crsCompletion = course?.completion;
  const crsNavigation = course?.navigation;
  const completion = data.completionJSON!;
  const prerequisite = data.prerequisiteJSON!;
  const siblings = useMemo(() => getPreviousElements(element), [element]);
  const isPartPage = element.type === ElementType.PartPage;
  const { t } = useTranslation("properties");

  const completionJSON: CompletionProps = useMemo(() => {
    if (completion.completion === CompletionType.None && crsCompletion?.completion) {
      return {
        ...completion,
        completion: crsCompletion.completion,
        actions: {
          ...completion.actions,
          ...crsCompletion.actions,
        },
      };
    }

    return completion;
  }, [crsCompletion, completion]);

  const prerequisiteJSON: PrerequisiteProps = useMemo(() => {
    const ids = siblings.map((element) => element.id);

    return {
      ...prerequisite,
      checked: siblings.length > 0 && prerequisite.checked,
      siblings:
        !prerequisite.siblings && crsNavigation?.prerequisite && ids.length
          ? [ids[ids.length - 1]]
          : prerequisite.siblings?.filter((id) => ids.includes(id)) || [],
    };
  }, [crsNavigation, prerequisite, siblings]);

  const updateChange = (newData: CourseElementProps) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: ChangeEvent<{}> | SubscriptInputChangeEvent) => {
    const target = event.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    const newData: CourseElementProps = {
      ...data,
      completionJSON,
      prerequisiteJSON,
    };

    if (name === "completion-chk") {
      newData.isCompletion = value as boolean;
    } else if (name === "prerequisite_chk") {
      newData.prerequisiteJSON = { ...prerequisiteJSON, checked: value as boolean };
    } else if (name === "siblings_chk") {
      const id = target.value;
      const newSiblings = [...(prerequisiteJSON.siblings || [])];
      const ind = newSiblings.indexOf(id);

      if (value && ind === -1) {
        newSiblings.push(id);
      } else if (!value && ind !== -1) {
        newSiblings.splice(ind, 1);
      }

      newData.prerequisiteJSON = { ...prerequisiteJSON, siblings: newSiblings };
    } else if (completionJSON.actions.hasOwnProperty(name)) {
      newData.completionJSON = {
        ...completionJSON,
        actions: {
          ...completionJSON.actions,
          [name]: value,
        },
      };
    } else {
      newData.completionJSON = {
        ...completionJSON,
        [name]: value,
      };
    }

    updateChange(newData);
  };

  return (
    <div className={clsx("completion-prerequisite-props-container", type)}>
      {type !== "prerequisite" && (
        <Fragment>
          <FormControlLabel
            name="completion-chk"
            label={t("completion.title")}
            control={<Checkbox />}
            checked={isCompletion}
            className="completion-chk-ctrl-lbl"
            onChange={handleChange}
          />
          {isCompletion && (
            <Fragment>
              <RadioGroup
                name="completion"
                value={completionJSON.completion}
                className="completion-radio-group"
                onChange={handleChange}
              >
                <FormControlLabel
                  label={t("completion.screen_displayed")}
                  control={<Radio />}
                  value={CompletionType.ScreenDisplayed}
                  className="completion-form-ctrl-lbl"
                />
                <FormControlLabel
                  label={t("completion.screen_undisplayed")}
                  control={<Radio />}
                  value={CompletionType.ScreenUndisplayed}
                  className="completion-form-ctrl-lbl"
                />
                <FormControlLabel
                  label={t("completion.action")}
                  control={<Radio />}
                  value={CompletionType.ByAction}
                  className="completion-form-ctrl-lbl"
                />
              </RadioGroup>
              {completionJSON.completion === CompletionType.ByAction && (
                <FormGroup className="completion-form-group">
                  <FormControlLabel
                    name="all_button_clicked"
                    label={t("completion.all_button")}
                    control={<Checkbox />}
                    checked={completionJSON.actions.all_button_clicked}
                    className="completion-form-ctrl-lbl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="video_complete"
                    label={t("completion.video_complete")}
                    control={<Checkbox />}
                    checked={completionJSON.actions.video_complete}
                    className="completion-form-ctrl-lbl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="sound_complete"
                    label={t("completion.sound_complete")}
                    control={<Checkbox />}
                    checked={completionJSON.actions.sound_complete}
                    className="completion-form-ctrl-lbl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="animation_complete"
                    label={t("completion.animation_complete")}
                    control={<Checkbox />}
                    checked={completionJSON.actions.animation_complete}
                    className="completion-form-ctrl-lbl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="interaction_complete"
                    label={t("completion.interaction_complete")}
                    control={<Checkbox />}
                    checked={completionJSON.actions.interaction_complete}
                    className="completion-form-ctrl-lbl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="timer"
                    label={t("completion.timer")}
                    control={<Checkbox />}
                    checked={completionJSON.actions.timer}
                    className="completion-form-ctrl-lbl"
                    onChange={handleChange}
                  />
                  {completionJSON.actions.timer && (
                    <BlmSubscriptInput
                      name="timer_duration"
                      label={t("completion.timer_info")}
                      min={0}
                      max={60}
                      value={completionJSON.actions.timer_duration}
                      className="completion-timer-duration-input"
                      onChange={handleChange}
                    />
                  )}
                </FormGroup>
              )}
            </Fragment>
          )}
        </Fragment>
      )}
      {!isPartPage && (
        <>
          <FormControlLabel
            name="prerequisite_chk"
            label={t("prerequisite.title")}
            control={<Checkbox />}
            checked={prerequisiteJSON.checked}
            disabled={siblings.length === 0}
            className="prerequisite-chk-ctrl-lbl"
            onChange={handleChange}
          />
          {prerequisiteJSON.checked && (
            <FormGroup className="prerequisite-form-group" onChange={handleChange}>
              {siblings.map((element) => (
                <FormControlLabel
                  key={element.id}
                  name="siblings_chk"
                  label={element.name}
                  control={<Checkbox />}
                  checked={prerequisiteJSON.siblings?.includes(element.id)}
                  value={element.id}
                  className="prerequisite-form-ctrl-lbl"
                  onChange={handleChange}
                />
              ))}
            </FormGroup>
          )}
        </>
      )}
    </div>
  );
}

export default BlmCompletionPrerequisiteProps;
