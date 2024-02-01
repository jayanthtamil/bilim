import React, { MouseEvent, ChangeEvent, useState } from "react";
import clsx from "clsx";
import { Collapse } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { TemplateSize, TemplateLength } from "types";
import { TemplateWidthTypes } from "editor-constants";
import {
  BlmTemplateWidth,
  BlmTemplateLength,
  TemplateWidthChangeEvent,
  TemplateLengthChangeEvent,
} from "components/template-editors/controls";
import "./styles.scss";

export interface CompProps {
  data: TemplateSize;
  onChange: (data: TemplateSize) => void;
  onCloseClick: (event: MouseEvent) => void;
}

function BlmTemplateSize(props: CompProps) {
  const { data, onChange, onCloseClick } = props;
  const { isFullscreen, width, margin, hasInnerContainer, padding } = data;
  const [isExpanded] = useState(true);
  const { t } = useTranslation("template-editors");

  const updateChange = (newData: TemplateSize) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | TemplateWidthChangeEvent | TemplateLengthChangeEvent
  ) => {
    const target = event.target;
    const { name } = target;
    const value = "checked" in target ? target.checked : target.value;
    const newData: TemplateSize = {
      ...data,
      width: { ...width },
      margin: { ...margin },
      padding: { ...padding },
    };

    if (name === "fullscreen") {
      newData.isFullscreen = value as boolean;
    } else if (name === "type") {
      newData.width.type = value as TemplateWidthTypes;
    } else if (name === "width") {
      newData.width.width = value as TemplateLength;
    } else if (
      name === "left" ||
      name === "top" ||
      name === "right" ||
      name === "bottom" ||
      name === "margin"
    ) {
      const newMargin = value as TemplateLength | any;
      if (name === "margin" && !newMargin.test) {
        newData.margin.top.value = newMargin.value;
      } else if (name === "top" && !newMargin.test) {
        newData.padding.top.value = newMargin.value;
      } else if (name === "bottom" && !newMargin.test) {
        newData.padding.bottom.value = newMargin.value;
      } else {
        newData.margin[name] = newMargin;
      }
    }

    updateChange(newData);
  };

  const handleCloseClick = (event: MouseEvent) => {
    if (onCloseClick) {
      onCloseClick(event);
    }
  };

  return (
    <div
      className={clsx("template-size-expand-panel", {
        expanded: isExpanded,
      })}
    >
      <div className="template-list-close-btn" onClick={handleCloseClick} />
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <div className="template-size-expand-content">
          {isFullscreen ? (
            <div className="template-height-fullscreen" />
          ) : hasInnerContainer ? (
            <div className="template-height-template">
              <div className="template-width-wrapper">
                <div className="template-width-title-box">
                  <span>{t("template_size.content")}</span>
                  <span>{t("template_size.width")}</span>
                </div>
                <div className={clsx("template-width-content", width.type)}>
                  <BlmTemplateWidth
                    type={TemplateWidthTypes.Full}
                    isSelected={width.type === "full"}
                    onChange={handleChange}
                  />
                  <BlmTemplateWidth
                    type={TemplateWidthTypes.Left}
                    isSelected={width.type === "left"}
                    onChange={handleChange}
                  />
                  <BlmTemplateWidth
                    type={TemplateWidthTypes.Center}
                    isSelected={width.type === "center"}
                    onChange={handleChange}
                  />
                  <BlmTemplateWidth
                    type={TemplateWidthTypes.Right}
                    isSelected={width.type === "right"}
                    onChange={handleChange}
                  />
                  <BlmTemplateLength
                    name="width"
                    type="middle"
                    switchLeft="%"
                    switchRight="px"
                    data={width.width}
                    selected={width.width.isSelected}
                    values={width.width.value}
                    className="template-width-ctrl"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="template-height-hr" />
              <div className="template-margin-wrapper">
                <div className="template-margin-title-box">
                  <span>{t("template_size.margin")}</span>
                </div>

                <div className="template-shift-title-box">
                  <span>{t("template_size.template_shift")}</span>
                  <BlmTemplateLength
                    name="margin"
                    type="top"
                    title={t("template_size.title.temp_shift")}
                    label="px"
                    switchLeft="inner"
                    switchRight="outer"
                    data={margin.top}
                    paddingTop={padding.top}
                    selected={margin.top.isSelected}
                    values={margin.top.value}
                    className="template-shift-ctrl"
                    allowNegative={true}
                    onChange={handleChange}
                  />
                </div>
                <div className={clsx("template-margin-content", width.type)}>
                  <BlmTemplateLength
                    name="top"
                    type="top"
                    title={t("template_size.title.top")}
                    label="px"
                    switchLeft="inner"
                    switchRight="outer"
                    data={padding.top}
                    paddingTop={padding.top}
                    selected={margin.top.isSelected}
                    values={padding.top.value}
                    className="template-top-margin-ctrl"
                    allowNegative={margin.top.isSelected}
                    onChange={handleChange}
                  />
                  <BlmTemplateLength
                    name="left"
                    type="middle"
                    title={t("template_size.title.left")}
                    switchLeft="%"
                    switchRight="px"
                    data={margin.left}
                    selected={margin.left.isSelected}
                    values={margin.left.value}
                    className="template-left-margin-ctrl"
                    onChange={handleChange}
                  />
                  <BlmTemplateLength
                    name="right"
                    type="middle"
                    title={t("template_size.title.right")}
                    switchLeft="%"
                    switchRight="px"
                    data={margin.right}
                    selected={margin.right.isSelected}
                    values={margin.right.value}
                    className="template-right-margin-ctrl"
                    onChange={handleChange}
                  />
                  <BlmTemplateLength
                    name="bottom"
                    type="bottom"
                    title={t("template_size.title.bottom")}
                    label="px"
                    switchLeft="inner"
                    switchRight="outer"
                    data={padding.bottom}
                    paddingTop={padding.bottom}
                    selected={margin.bottom.isSelected}
                    values={padding.bottom.value}
                    allowNegative={margin.bottom.isSelected}
                    className="template-bottom-margin-ctrl"
                    onChange={handleChange}
                  />
                  <div className="template-margin-icon" />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </Collapse>
    </div>
  );
}
export default BlmTemplateSize;
