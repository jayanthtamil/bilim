import React, { ChangeEvent, Fragment, useMemo } from "react";
import clsx from "clsx";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, CustomChangeEvent, SimpleContentAction } from "types";
import { ElementType, SCActionDisplayTypes } from "editor-constants";
import {
  getMediaTargets,
  getSimpleContentLabel,
  SIMPLE_CONTENT_FLAP_ITEMS,
  SIMPLE_CONTENT_POPUP_ITEMS,
} from "utils";
import BlmStructureSelect from "components/structures/select";
import { useContentEditorCtx } from "components/content-editor/core";
import "./styles.scss";
import { ContainerProps } from "./simple-content-action-container";
import { getElement } from "utils";

export interface CompProps {
  data?: SimpleContentAction;
  type?: "standard" | "limited";
  onChange?: (event: CustomChangeEvent<SimpleContentAction>) => void;
}

function getDefaultValue(option?: string, display?: string, targets?: { id?: string }[]) {
  if (display) {
    if (option === "popup" && SIMPLE_CONTENT_POPUP_ITEMS.includes(display)) {
      return display;
    } else if (option === "flap" && SIMPLE_CONTENT_FLAP_ITEMS.includes(display)) {
      return display;
    } else if (
      option === "target" &&
      !SIMPLE_CONTENT_POPUP_ITEMS.includes(display) &&
      !SIMPLE_CONTENT_FLAP_ITEMS.includes(display)
    ) {
      return display;
    }
  }

  switch (option) {
    case "popup":
      return SCActionDisplayTypes.Large;
    case "flap":
      return SCActionDisplayTypes.LeftMedium;
    case "target":
      return targets?.length === 1 ? targets[0].id : undefined;
  }
}

function BlmSimpleContentAction(props: CompProps & ContainerProps) {
  const { data, type, onChange, structure } = props;
  const { element, template } = useContentEditorCtx();
  const { simpleContentId, option = "popup", display } = data || {};
  const { t } = useTranslation("content-editor");
  
  const targets = useMemo(() => getMediaTargets(template!), [template]);
  const curDisplay = useMemo(
    () => getDefaultValue(option, display, targets),
    [display, option, targets]
  );

  const updateChange = (newData: SimpleContentAction) => {
    if (onChange) {
      onChange({ target: { name: "simpleContent", value: newData } });
    }
  };

  const handleChange = (
    event: CustomChangeEvent<string> | ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target as { name: string; value: string };
    const newData = {
      simpleContentId,
      option,
      display: name !== "option" ? curDisplay : getDefaultValue(value, display, targets),
    };

    if (name === "simpleContent") {
      newData.simpleContentId = value;
    } else if (name === "option" || name === "display") {
      newData[name] = value;
    }

    updateChange(newData);
  };

  const renderDropDown = () => {
    if (option === "popup" || option === "flap") {
      const templateType: CourseElement | undefined =
        structure && simpleContentId ? getElement(structure, simpleContentId) : undefined;

      const arr = option === "popup" ? SIMPLE_CONTENT_POPUP_ITEMS : SIMPLE_CONTENT_FLAP_ITEMS;

      return (
        <Select
          name="display"
          value={curDisplay}
          MenuProps={{ className: "simple-action-dropdown-popover" }}
          className="simple-action-dropdown"
          onChange={handleChange}
        >
          {arr.map((item, ind) => {
            if (
              templateType?.type === "simple_page" &&
              (item === "popover_small" || item === "popover_medium" || item === "divider")
            ) {
              return true;
            }

            if (item === "divider") {
              return <Divider key={"divider" + ind} className="simple-action-dropdown-divider" />;
            } else {
              return (
                <MenuItem key={item} value={item} className="simple-action-dropdown-item">
                  {getSimpleContentLabel(item)}
                  <ListItemIcon className={item} />
                </MenuItem>
              );
            }
          })}
        </Select>
      );
    } else if (option === "target") {
      return (
        <Fragment>
          <Select
            name="display"
            value={curDisplay ?? "none"}
            MenuProps={{ PopoverClasses: { root: "simple-action-dropdown-popover" } }}
            className="simple-action-dropdown"
            onChange={handleChange}
          >
            {targets.length !== 1 && (
              <MenuItem value="none">
                {targets.length ? t("target_option.select_a_target") : t("target_option.no_target")}
              </MenuItem>
            )}
            {targets.map((item) => (
              <MenuItem key={item.id} value={item.id} className="simple-action-dropdown-item">
                <ListItemIcon className="target" />
                {item.value.name}
              </MenuItem>
            ))}
          </Select>
          {targets.length === 0 && (
            <div className="simple-action-warning-lbl">
              <span>{t("target_option.no_target")}.</span>
              <span>{t("target_option.transform_media")}</span>
            </div>
          )}
        </Fragment>
      );
    }
  };

  return (
    <div className={clsx("simple-action-wrapper", type)}>
      <BlmStructureSelect
        name="simpleContent"
        element={element}
        structures={{ show: false }}
        annexes={{ show: true }}
        selectables={[
          ElementType.SimplePage,
          ElementType.SimpleContent,
          ElementType.Page,
          ElementType.Screen,
        ]}
        value={simpleContentId}
        className="structure-select-with-icons"
        onChange={handleChange}
      />
      {simpleContentId && (
        <Fragment>
          <RadioGroup
            name="option"
            value={option}
            className="simple-action-option-group"
            onChange={handleChange}
          >
            <FormControlLabel
              label={t("open_simplecontent_opt.popup")}
              control={<Radio className="radio-3" />}
              value="popup"
              className="simple-action-frm-ctrl"
            />
            <FormControlLabel
              label={t("open_simplecontent_opt.flap")}
              control={<Radio className="radio-3" />}
              value="flap"
              className="simple-action-frm-ctrl"
            />
            {/* {type !== "limited" && (
              <FormControlLabel
                label={t("open_simplecontent_opt.below")}
                control={<Radio className="radio-3" />}
                value="below"
                className="simple-action-frm-ctrl"
              />
            )} */}
            <FormControlLabel
              label={t("open_simplecontent_opt.target")}
              control={<Radio className="radio-3" />}
              value="target"
              className="simple-action-frm-ctrl"
            />
          </RadioGroup>
          {renderDropDown()}
        </Fragment>
      )}
    </div>
  );
}

export default BlmSimpleContentAction;
