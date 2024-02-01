import React, { ChangeEvent } from "react";
import clsx from "clsx";
import { FormControlLabel, RadioGroup, Radio, Select, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { QuestionPropositionInfo } from "types";
import { QuestionPropositionInfoTypes, TemplateEditorOptionTypes } from "editor-constants";
import { useQuestionEditorCtx } from "components/question-editor/core";
import "./styles.scss";

export interface CompProps {
  data: QuestionPropositionInfo;
  isEditable?: boolean;
  onChange: (data: QuestionPropositionInfo) => void;
}

function BlmQuestionPropositionInfo(props: CompProps) {
  const { data, isEditable = true, onChange } = props;
  const {
    type,
    simple: { title, text },
    simpleContentId,
  } = data;
  const { element } = useQuestionEditorCtx();
  const { t } = useTranslation("question-editor");

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const newData: QuestionPropositionInfo = { ...data };

    if (name === "infoType") {
      newData.type = value;
    } else if (name === "title") {
      newData.simple.title.value = value;
    } else if (name === "text") {
      newData.simple.text.value = value;
    } else if (name === "simpleContent") {
      newData.simpleContentId = value;
    }

    if (onChange) {
      onChange(newData);
    }
  };

  const renderOptions = () => {
    if (type === QuestionPropositionInfoTypes.None) {
      return (
        <div className="question-proposition-info-none">
          <span>{t("main.add_info")}</span>
        </div>
      );
    } else if (type === QuestionPropositionInfoTypes.Simple) {
      return (
        <div className="question-proposition-info-simple">
          <input
            name="title"
            type="text"
            value={title.value || ""}
            disabled={!title.isEditable}
            className="question-proposition-info-title"
            onChange={handleChange}
          />
          <div className="question-proposition-info-title-hr" />
          <textarea
            name="text"
            value={text.value || ""}
            disabled={!text.isEditable}
            className="question-proposition-info-descrition"
            onChange={handleChange}
          />
        </div>
      );
    } else if (type === QuestionPropositionInfoTypes.Detailed) {
      return (
        <Select
          name="simpleContent"
          value={simpleContentId}
          disabled={!isEditable}
          className="question-proposition-info-simple-dropdown"
          onChange={handleChange}
        >
          <MenuItem value={TemplateEditorOptionTypes.None}>
            {t("main.select_simple_content")}
          </MenuItem>
          {element?.children.map((item) => {
            return (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            );
          })}
        </Select>
      );
    }
  };

  return (
    <div className={clsx("question-proposition-info-wrapper", { disabled: !isEditable })}>
      <div className="question-proposition-info-lbl">
        <span>{t("main.info")}</span>
      </div>
      <RadioGroup
        name="infoType"
        value={type}
        className="question-proposition-info-grp"
        onChange={handleChange}
      >
        <FormControlLabel
          label={t("main.options.none")}
          control={<Radio className="radio-2" />}
          value={QuestionPropositionInfoTypes.None}
          disabled={!isEditable}
        />
        <FormControlLabel
          label={t("main.options.simple")}
          control={<Radio className="radio-2" />}
          value={QuestionPropositionInfoTypes.Simple}
          disabled={!isEditable}
        />
        <FormControlLabel
          label={t("main.options.detailed")}
          control={<Radio className="radio-2" />}
          value={QuestionPropositionInfoTypes.Detailed}
          disabled={!isEditable}
        />
      </RadioGroup>
      <div className="question-proposition-info-main">{renderOptions()}</div>
    </div>
  );
}

export default BlmQuestionPropositionInfo;
