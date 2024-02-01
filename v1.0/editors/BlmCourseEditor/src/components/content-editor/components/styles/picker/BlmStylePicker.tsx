import React, { Fragment, useState } from "react";
import clsx from "clsx";
import { Drawer } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { StyleListCategory, StyleListItem, CustomChangeEvent, ComponentStyle } from "types";
import { StyleListTypes } from "editor-constants";
import { isStyleCategories } from "utils";
import BlmStyleApplyButton from "../button";
import BlmStylePickerItem from "./item";
import { ContainerProps } from "./container";
import "./styles.scss";

export type StylePickerChangeEvent = CustomChangeEvent<string>;

export interface CompProps extends ContainerProps {
  type: StyleListTypes;
  name: string;
  label?: string;
  value?: string;
  style?: ComponentStyle;
  showApplyIcon?: boolean;
  showApplyStyle?: boolean;
  onChange?: (event: StylePickerChangeEvent) => void;
  onApplyClick?: (style: string) => void;
}

function BlmStylePicker(props: CompProps) {
  const {
    type,
    name,
    value,
    style,
    label,
    showApplyIcon,
    showApplyStyle = true,
    styleConfig,
    onChange,
    onApplyClick,
  } = props;
  const { items, map, classNames } = styleConfig || {};
  const [open, setOpen] = useState(false);
  const currentStyle = classNames && (value && classNames.includes(value) ? value : classNames[0]);
  const currentItem = map && currentStyle ? map[currentStyle] : undefined;
  const { t } = useTranslation("content-editor");

  const updateChange = (value: string) => {
    if (onChange) {
      onChange({ target: { name, value } });
    }
  };

  const handleItemClick = (item: StyleListItem) => {
    setOpen(false);
    updateChange(item.className);
  };

  const handleCollapseClick = () => {
    setOpen(!open);
  };

  const renderItems = (items: StyleListItem[]) => {
    return (
      <div className="style-picker-items-wrapper">
        {items.map((item, ind) => (
          <BlmStylePickerItem
            key={ind}
            data={item}
            selected={item.className === currentStyle}
            onClick={handleItemClick}
          />
        ))}
      </div>
    );
  };

  const renderCategories = (categories: StyleListCategory[]) => {
    return categories.map((category, ind) => {
      const { name, items } = category;

      return (
        <div key={ind} className="style-picker-categories-wrapper">
          <div className="style-picker-category-title">{name}</div>
          {renderItems(items)}
        </div>
      );
    });
  };

  if (items) {
    return (
      <Fragment>
        <div className={clsx("style-picker-wrapper", type, { "has-over": currentItem?.overUrl })}>
          <div className="style-picker-style-wrapper" onClick={handleCollapseClick}>
            <div className="style-picker-preview-wrapper">
              {currentItem && (
                <Fragment>
                  <img src={currentItem.url} alt={currentItem.name} />
                  {currentItem.overUrl && <img src={currentItem.overUrl} alt={currentItem.name} />}
                </Fragment>
              )}
            </div>
            <div className="style-picker-expand-icon" />
          </div>
          {showApplyStyle && (
            <BlmStyleApplyButton
              label={label}
              styleName={currentStyle}
              style={style}
              showIcon={showApplyIcon}
              onClick={onApplyClick}
            />
          )}
        </div>
        {open && (
          <Drawer open={open} className={clsx("styles-modal", type)} onClose={handleCollapseClick}>
            <div className="styles-modal-content">
              <div className="styles-modal-title">{t("style.select_style")}</div>
              <div className="styles-modal-close-btn" onClick={handleCollapseClick} />
              <div className="styles-modal-scroller custom-scrollbar">
                {isStyleCategories(items) ? renderCategories(items) : renderItems(items)}
              </div>
            </div>
          </Drawer>
        )}
      </Fragment>
    );
  } else {
    return null;
  }
}

export default BlmStylePicker;
