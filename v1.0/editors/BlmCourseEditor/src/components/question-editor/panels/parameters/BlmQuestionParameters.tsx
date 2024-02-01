import React, { ChangeEvent, useState } from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, QuestionParameters } from "types";
import { BlmSubscriptInput } from "shared";
import { BlmAutoComplete } from "shared/material-ui";
import {
  QuestionEditorDispatch,
  updateQuestionParameters,
} from "components/question-editor/reducers";
import BlmStructureSelect from "components/structures/select";
import "./styles.scss";

interface CompProps {
  data: QuestionParameters;
  dispatch: QuestionEditorDispatch;
}

const weights = ["1", "2", "3"];

function BlmQuestionParameters(props: CompProps) {
  const { data, dispatch } = props;
  const { relatedTo, weight, mandatory, eliminatory, useforscoring, timer } = data;
  const [state, setState] = useState({ relatedTo, weight, timer });
  const isRelatedTo = relatedTo !== undefined;
  const isWeight = weight !== undefined && weight !== 0;
  const isTimer = timer !== undefined && timer !== 0;
  const { t } = useTranslation("question-editor");

  const handleChange = (
    event: ChangeEvent<{}> | CustomChangeEvent<number | string | undefined>
  ) => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: QuestionParameters = { ...data };

    if (name === "relatedToChk") {
      newData.relatedTo = value ? state.relatedTo || "none" : undefined;
    } else if (name === "relatedTo") {
      newData.relatedTo = value as string;
    } else if (name === "weightChk") {
      newData.weight = value ? state.weight || 1 : undefined;
    } else if (name === "weight") {
      newData.weight = value as unknown as number;
    } else if (name === "mandatory") {
      newData.mandatory = value as boolean;
    } else if (name === "eliminatory") {
      newData.eliminatory = value as boolean;
    } else if (name === "useForScoring") {
      newData.useforscoring = value as boolean;
    } else if (name === "timerChk") {
      newData.timer = value ? state.timer || 10 : undefined;
    } else if (name === "timer") {
      newData.timer = value as unknown as number;
    }

    if (name === "relatedTo" || name === "weight" || name === "timer") {
      setState({ ...state, [name]: value });
    }

    if (dispatch) {
      dispatch(updateQuestionParameters(newData));
    }
  };

  return (
    <div className="question-parameters-wrapper">
      <FormGroup className="question-parameters-form-group">
        <FormControlLabel
          name="relatedToChk"
          label={t("parameters.related_to")}
          control={<Checkbox className="checkbox-3" />}
          checked={isRelatedTo}
          className="question-parameters-form-ctrl-lbl"
          onChange={handleChange}
        />
        {isRelatedTo && (
          <BlmStructureSelect
            name="relatedTo"
            value={data.relatedTo}
            className="question-parameters-sc-dropdown"
            onChange={handleChange}
          />
        )}
        <div className="question-parameters-weight-dropdown-box">
          <FormControlLabel
            name="weightChk"
            label={t("parameters.weight")}
            control={<Checkbox className="checkbox-3" />}
            checked={isWeight}
            className="question-parameters-form-ctrl-lbl"
            onChange={handleChange}
          />
          {isWeight && (
            <BlmAutoComplete
              name="weight"
              value={weight}
              min={1}
              max={9}
              options={weights}
              onChange={handleChange}
            />
          )}
        </div>
        <FormControlLabel
          name="mandatory"
          label={t("parameters.mandatory")}
          control={<Checkbox className="checkbox-3" />}
          checked={mandatory || false}
          className="question-parameters-form-ctrl-lbl"
          onChange={handleChange}
        />
        <FormControlLabel
          name="eliminatory"
          label={t("parameters.eliminatory")}
          control={<Checkbox className="checkbox-3" />}
          checked={eliminatory || false}
          className="question-parameters-form-ctrl-lbl"
          onChange={handleChange}
        />
        <FormControlLabel
          name="useForScoring"
          label={t("parameters.scoring")}
          control={<Checkbox className="checkbox-3" />}
          checked={useforscoring || false}
          className="question-parameters-form-ctrl-lbl"
          onChange={handleChange}
        />
        <FormControlLabel
          name="timerChk"
          label={t("label.timer")}
          control={<Checkbox className="checkbox-3" />}
          checked={isTimer}
          className="question-parameters-form-ctrl-lbl"
          onChange={handleChange}
        />
        {isTimer && (
          <BlmSubscriptInput
            name="timer"
            label={t("label.sec")}
            min={1}
            max={180}
            value={timer || 10}
            className="question-parameters-timer-txt"
            onChange={handleChange}
          />
        )}
      </FormGroup>
    </div>
  );
}

export default BlmQuestionParameters;
