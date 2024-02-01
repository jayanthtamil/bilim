import React, { useMemo } from "react";
import clsx from "clsx";

import { ComponentStyle } from "types";
import { hasSameComponentStyles } from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { applyComponentStyle } from "components/content-editor/reducers";
import "./styles.scss";

export interface CompProps {
  label?: string;
  styleName?: string;
  style?: ComponentStyle;
  showIcon?: boolean;
  onClick?: (styleName: string) => void;
}

function BlmStyleApplyButton(props: CompProps) {
  const { label, styleName, style, showIcon, onClick } = props;
  const { template, component, dispatch } = useContentEditorCtx();

  const showApplyIcon = useMemo(() => {
    return showIcon ?? hasSameComponentStyles(template!, component!);
  }, [showIcon, template, component]);

  const handleClick = () => {
    if (!showApplyIcon) {
      if (onClick && styleName) {
        onClick(styleName);
      } else if (dispatch) {
        dispatch(applyComponentStyle(styleName, style));
      }
    }
  };

  return (
    <div
      className={clsx("style-picker-apply-btn", {
        "show-icon": showApplyIcon,
      })}
      onClick={handleClick}
    >
      {label}
      <div className="style-picker-feedback-icon" />
    </div>
  );
}

export default BlmStyleApplyButton;
