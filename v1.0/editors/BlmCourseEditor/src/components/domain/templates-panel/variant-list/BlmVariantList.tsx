import React, { useState, useMemo, MouseEvent, ChangeEvent, useContext, Fragment } from "react";
import clsx from "clsx";
import { Checkbox, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { TemplateBase } from "types";
import TemplatesPanelContext from "../TemplatesPanelContext";
import BlmVariantListItem from "./variant-list-item";
import "./variant-list.scss";
import {
  TemplateWidthChangeEvent,
  TemplateLengthChangeEvent,
} from "components/template-editors/controls";
import { TemplateSize, CourseElement } from "types";
import { ElementType } from "editor-constants";

export interface CompProps {
  title: string;
  data: TemplateBase[];
  show: boolean;
  selectedVariant?: TemplateBase;
  isBgChecked?: boolean;
  substitude?: TemplateBase;
  showWarning?: boolean;
  showMoreButton?: boolean;
  onBgChange?: (isSelected: boolean) => void;
  onMoreClick?: (event: MouseEvent) => void;
  onCloseClick: (event: MouseEvent) => void;
  size?: any;
  element?: CourseElement | any;
  onChange?: (data: TemplateSize) => void;
}

interface SizeEditorState {
  size: TemplateSize | null;
  isEdited: boolean;
}

function BlmVariantList(props: CompProps) {
  const {
    title,
    data,
    show,
    selectedVariant: pSelectedVariant,
    isBgChecked: pIsBgChecked = false,
    substitude,
    showWarning = false,
    showMoreButton = false,
    onBgChange,
    onMoreClick,
    onCloseClick,
    size,
    element,
    onChange,
  } = props;
  if (size) {
    var { isFullscreen, width, margin, padding } = size;
  }
  const { onAddTemplateClick } = useContext(TemplatesPanelContext);
  const [selectedVariant, setSelectedVariant] = useState(pSelectedVariant);
  const [isBgChecked, setIsBgChecked] = useState(pIsBgChecked);
  const { t } = useTranslation("domain");

  const hasDarkVariant = useMemo(() => {
    return data.some((item) => {
      if (item.thumbnailDark && item.thumbnailDark !== "") {
        return true;
      }
      return false;
    });
  }, [data]);

  const handleBgSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;

    setIsBgChecked(checked);

    if (onBgChange) {
      onBgChange(checked);
    }
  };

  const handleItemClick = (variant: TemplateBase) => {
    setSelectedVariant(variant);

    if (onAddTemplateClick) {
      onAddTemplateClick(variant, isBgChecked);
    }
  };

  const handleCloseClick = (event: MouseEvent) => {
    if (onCloseClick) {
      onCloseClick(event);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | TemplateWidthChangeEvent | TemplateLengthChangeEvent
  ) => {
    if (width && padding && margin && isFullscreen !== undefined) {
      const target = event.target;
      const { name } = target;
      const value = "checked" in target ? target.checked : target.value;
      const newData: any = {
        ...data,
        width: { ...width },
        margin: { ...margin },
        padding: { ...padding }
      };
      if (name === "fullscreen") {
        newData.isFullscreen = value as boolean;
      }
      updateChange(newData);
    }
  };
  const updateChange = (newData: TemplateSize) => {
    if (onChange) {
      onChange(newData);
    }
  };


  return (
    <div
      className={clsx("variant-list-panel", {
        show: show,
      })}
    >
      <div className="variant-list-header">
        <span className="variant-title">{title}</span>
        <span className="variant-info">{t("variant_list.variants")}</span>
        <div
          className={
            element?.type === ElementType.PartPage || element?.type === ElementType.SimplePartPage
              ? "variant-flex"
              : "variant-flex-end"
          }
        >
          {(element?.type === ElementType.PartPage ||
            element?.type === ElementType.SimplePartPage) && (
            <div className="variant_total_check">
              <Checkbox
                name="fullscreen"
                checked={isFullscreen}
                className="variant_check"
                onChange={handleChange}
              />
              <strong className="variant_full_screen">{t("variant_list.full_screen")}</strong>
            </div>
          )}
          <div className="variant-switch">
            {hasDarkVariant && (
              <Fragment>
                <span className="variant-bg-lbl">{t("label.background")} </span>
                <span className="variant-bg-switch-lbl light">{t("label.light")}</span>
                <Switch
                  checked={isBgChecked}
                  onChange={handleBgSwitchChange}
                  className="switch-3 variant-bg-switch-ctrl"
                />
                <span className="variant-bg-switch-lbd dark">{t("label.dark")}</span>
              </Fragment>
            )}
          </div>
        </div>
      </div>
      <div className="variant-list-close-btn" onClick={handleCloseClick} />
      <div className="variant-list-scroller custom-scrollbar">
        <div className="variant-list-wrapper ">
          {data.map((variant) => (
            <BlmVariantListItem
              key={variant.id}
              data={variant}
              bgChecked={!showWarning && isBgChecked}
              selected={variant.id === selectedVariant?.id}
              showWarning={showWarning}
              onClick={handleItemClick}
            />
          ))}
          {substitude && (
            <Fragment>
              <span className="variant-list-substitue-lbl">{t("variant_list.substitue")}</span>
              <BlmVariantListItem
                key={substitude.id}
                data={substitude}
                bgChecked={isBgChecked}
                selected={substitude.id === selectedVariant?.id}
                onClick={handleItemClick}
              />
            </Fragment>
          )}
        </div>
        {showMoreButton && (
          <div className="variant-list-more-btn" onClick={onMoreClick}>
            {t("variant_list.more_template")}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlmVariantList;
