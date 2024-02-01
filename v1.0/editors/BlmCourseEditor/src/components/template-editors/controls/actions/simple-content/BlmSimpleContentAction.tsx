import React, { ChangeEvent, Fragment, useMemo } from "react";
import {
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, CustomChangeEvent, TemplateSimpleContentAction } from "types";
import { ElementType, SCActionDisplayTypes } from "editor-constants";
import {
  getSimpleContentLabel,
  SIMPLE_CONTENT_FLAP_ITEMS,
  SIMPLE_CONTENT_POPUP_ITEMS,
} from "utils";
import BlmStructureSelect from "components/structures/select";
import "./styles.scss";

export interface CompProps {
  name: string;
  element: CourseElement;
  data?: TemplateSimpleContentAction;
  onChange?: (event: CustomChangeEvent<TemplateSimpleContentAction>) => void;
}

function getDefaultValue(option?: string, display?: string) {
  if (display) {
    if (option === "popup" && SIMPLE_CONTENT_POPUP_ITEMS.includes(display)) {
      return display;
    } else if (option === "flap" && SIMPLE_CONTENT_FLAP_ITEMS.includes(display)) {
      return display;
    }
  }

  switch (option) {
    case "popup":
      return SCActionDisplayTypes.Large;
    case "flap":
      return SCActionDisplayTypes.LeftMedium;
  }
}

function BlmSimpleContentAction(props: CompProps) {
  const { name, element, data, onChange } = props;
  const { checked = false, simpleContentId, option = "popup", display } = data || {};
  const curDisplay = useMemo(() => getDefaultValue(option, display), [option, display]);
  const { t } = useTranslation("template-editors");

  const updateChange = (newData: TemplateSimpleContentAction) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<string>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData: TemplateSimpleContentAction = {
      ...data,
      checked,
      option,
      display: name !== "option" ? curDisplay : getDefaultValue(option, display),
    };

    if (
      name === "checked" ||
      name === "simpleContentId" ||
      name === "option" ||
      name === "display"
    ) {
      (newData[name] as any) = value;
    }

    updateChange(newData);
  };

  const renderDropDown = () => {
    if (option === "popup" || option === "flap") {
      const arr = option === "popup" ? SIMPLE_CONTENT_POPUP_ITEMS : SIMPLE_CONTENT_FLAP_ITEMS;

      return (
        <Select
          name="display"
          value={curDisplay}
          MenuProps={{ className: "template-sc-action-dropdown-popover" }}
          className="template-sc-action-dropdown"
          onChange={handleChange}
        >
          {arr.map((item, ind) => {
            if (item === "divider") {
              return (
                <Divider key={"divider" + ind} className="template-sc-action-dropdown-divider" />
              );
            } else {
              return (
                <MenuItem key={item} value={item}>
                  {getSimpleContentLabel(item)}
                  <ListItemIcon className={item} />
                </MenuItem>
              );
            }
          })}
        </Select>
      );
    }
  };

  return (
    <div className="template-sc-action-wrapper">
      <FormControlLabel
        name="checked"
        label={t("simple_content_Action.open_simple_content")}
        control={<Checkbox />}
        checked={checked}
        className="template-sc-frm-lbl"
        onChange={handleChange}
      />
      {checked && (
        <Fragment>
          <BlmStructureSelect
            name="simpleContentId"
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
                className="template-sc-option-group"
                onChange={handleChange}
              >
                <FormControlLabel
                  label={t("simple_content_Action.popup")}
                  control={<Radio className="radio-3" />}
                  value="popup"
                  className="template-sc-frm-ctrl"
                />
                <FormControlLabel
                  label={t("simple_content_Action.flap")}
                  control={<Radio className="radio-3" />}
                  value="flap"
                  className="template-sc-frm-ctrl"
                />
              </RadioGroup>
              {renderDropDown()}
            </Fragment>
          )}
        </Fragment>
      )}
    </div>
  );
}

export default BlmSimpleContentAction;
