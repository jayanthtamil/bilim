import React from "react";
import clsx from "clsx";
import { Select, MenuItem } from "@material-ui/core";
import { SelectInputProps } from "@material-ui/core/Select/SelectInput";
import { useTranslation } from "react-i18next";

import { useQuestionEditorCtx } from "components/question-editor/core";
import "./styles.scss";

export interface CompProps {
  name: string;
  title: string;
  simpleContentId: string;
  disabled?: boolean;
  onChange: SelectInputProps["onChange"];
}

function BlmSimpleContentFBItem(props: CompProps) {
  const { name, title, disabled, simpleContentId, onChange } = props;
  const { element } = useQuestionEditorCtx();
  const { t } = useTranslation();

  return (
    <div className={clsx("detailed-feedback-item-wrapper", name)}>
      <div className="detailed-feedback-item-title">{title}</div>
      <Select
        name={name}
        value={simpleContentId}
        disabled={disabled}
        className="detailed-feedback-sp-dropdown"
        onChange={onChange}
      >
        <MenuItem value="none">{t("label.select")}</MenuItem>
        {element?.children.map((item) => {
          return (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
}

export default BlmSimpleContentFBItem;
