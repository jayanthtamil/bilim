import React, { useState, MouseEvent, useEffect, useMemo } from "react";
import clsx from "clsx";
import { Button, Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, CustomChangeEvent, Theme } from "types";
import { ElementType } from "editor-constants";
import { filterElements, getEvaluationChildren } from "utils";
import BlmThemeListItem from "./theme-list-item";
import { ContainerProps } from "./themes-container";
import "./themes-styles.scss";

export type ThemeChangeEvent = CustomChangeEvent<string>;

export interface CompProps extends ContainerProps {
  element: CourseElement;
  theme: string | null;
  onChange: (event: ThemeChangeEvent) => void;
}

function BlmThemes(props: CompProps) {
  const { element, theme, themes, onChange } = props;
  const [selectedItem, setSelectedItem] = useState<Theme | undefined>();
  const [showList, setShowList] = useState(false);
  const evaluations = useMemo(() => getEvaluationChildren(element).length, [element]);
  const { t } = useTranslation("domain");
  const questions = useMemo(() => {
    const arr = filterElements(element.children, [ElementType.Question]);

    return arr.reduce((arr, question) => {
      const name = question.template?.theme;

      if (name && !arr.includes(name)) {
        arr.push(name);
      }

      return arr;
    }, [] as string[]);
  }, [element]);
  const isEditable =
    theme &&
    (theme !== "None" || (evaluations === 0 && questions.length <= 1 && questions[0] !== "None"));

  useEffect(() => {
    if (!theme && evaluations !== 0) {
      updateChange("None");
    }
  });

  const updateChange = (value: string) => {
    if (onChange) {
      onChange({ target: { name: "theme", value } });
    }
  };

  const handleItemClick = (item: Theme) => {
    setSelectedItem(item);
  };

  const handleThemeClick = () => {
    if (isEditable) {
      setShowList(true);
    }
  };

  const handleValidateBtnClick = (event: MouseEvent) => {
    if (selectedItem) {
      updateChange(selectedItem.name);
      setShowList(false);
    }
  };

  const getCurrentThemes = () => {
    if (themes) {
      const allowed: string[] = [];

      if (theme) {
        if (theme !== "None" && evaluations !== 0) {
          allowed.push("None", theme);
        } else if (questions.length === 1) {
          allowed.push("None", questions[0]);
        }
      }

      return themes.filter((item) => allowed.length === 0 || allowed.includes(item.name));
    } else {
      return [];
    }
  };

  if (!showList && theme) {
    return (
      <div className="theme-name-container">
        <span>{t("themes.theme")} : </span>
        <span className="theme-name">{theme}</span>
        <span
          className={clsx("theme-edit-btn", { disabled: !isEditable })}
          onClick={handleThemeClick}
        />
      </div>
    );
  } else if (themes) {
    return (
      <div className="themes-list-container">
        <div className="themes-list-title">
          <span>{t("themes.select")}</span>
          <Tooltip
            interactive
            placement="right-start"
            title={`${t("themes.tooltip")}`}
            classes={{ popper: "evaluation-tooltip-popper" }}
          >
            <span className="alert-icon" />
          </Tooltip>
        </div>
        <div className="themes-list">
          {getCurrentThemes().map((theme) => {
            return (
              <BlmThemeListItem
                key={theme.id}
                data={theme}
                selected={theme === selectedItem}
                onClick={handleItemClick}
              />
            );
          })}
        </div>
        <Button
          disableRipple={true}
          disabled={!Boolean(selectedItem)}
          className="theme-validate-btn"
          onClick={handleValidateBtnClick}
        >
          {t("themes.validate")}
        </Button>
      </div>
    );
  } else {
    return null;
  }
}

export default BlmThemes;
