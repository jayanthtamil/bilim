import React from "react";

import { TextComponent } from "types";
import { BlmTextComponentEditor } from "components/content-editor/components";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateTextComponent } from "components/content-editor/reducers";
import "./styles.scss";

export interface CompProps {
  texts: TextComponent[];
  isDark: boolean;
}

function BlmContentText(props: CompProps) {
  const { texts, isDark } = props;
  const { dispatch } = useContentEditorCtx();

  const updateChange = (newData: TextComponent) => {
    if (dispatch) {
      dispatch(updateTextComponent(newData));
    }
  };

  const handleTextChange = (newData: TextComponent) => {
    updateChange(newData);
  };

  return (
    <div className="content-text-wrapper">
      <div className="content-text-title">Texts</div>
      <div className="content-text-list">
        {texts.map((text) => (
          <BlmTextComponentEditor
            key={text.id}
            data={text}
            isDark={isDark}
            onChange={handleTextChange}
          />
        ))}
      </div>
    </div>
  );
}

export default BlmContentText;
