import React, { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useAnchorButtonStyle } from "./styles";

interface CompProps {
  name: string;
  hasAnchor: boolean;
  className?: string;
  onNameChange: (name: string) => void;
  onAnchorChange: (hasAnchor: boolean) => void;
}

function BlmAnchorBtn(props: CompProps) {
  const { name, hasAnchor, className, onNameChange, onAnchorChange } = props;
  const [title, setTitle] = useState(name);
  const classes = useAnchorButtonStyle();
  const { t } = useTranslation("templates");

  useEffect(() => {
    setTitle(name);
  }, [name, setTitle]);

  const handleAnchorClick = () => {
    if (onAnchorChange) {
      onAnchorChange(!hasAnchor);
    }
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setTitle(value);
  };

  const updateTitle = () => {
    if (name !== title && onNameChange) {
      onNameChange(title);
    }
  };

  const handleTitleBlur = () => {
    updateTitle();
  };

  const handleTitleKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === 13) {
      updateTitle();
    }
  };

  return (
    <div
      className={clsx(classes.root, className, {
        [classes.hasAnchor]: hasAnchor,
      })}
      title={t("part_page_tool.anchor")}
    >
      {hasAnchor && (
        <input
          type="text"
          value={title}
          className={classes.anchorTxt}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
        />
      )}
      <div className={classes.anchorBtn} onClick={handleAnchorClick} />
    </div>
  );
}
export default BlmAnchorBtn;
