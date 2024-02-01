import React, { ChangeEvent, Fragment } from "react";
import { FormControlLabel, Switch, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { StyleListTypes } from "editor-constants";
import { ComponentStyle, CustomChangeEvent, Tint } from "types";
import { BlmTintPicker } from "shared";
import BlmStylePicker, { StylePickerProps } from "../picker";
import { ContainerProps } from "./container";
import "./styles.scss";

export type StyleTintPickerChangeEvent = CustomChangeEvent<ComponentStyle>;

export interface CompProps extends ContainerProps, Omit<StylePickerProps, "style" | "onChange"> {
  data: ComponentStyle;
  tintTitle?: string;
  tintSubTitle?: string;
  tintBgTitle?: string;
  showBgTint?: boolean;
  onChange?: (event: StyleTintPickerChangeEvent) => void;
}

const defaultTint: Tint = { alpha: 50 };

function BlmStyleTintPicker(props: CompProps) {
  const { t } = useTranslation("content-editor");
  const {
    type,
    name,
    data,
    tintTitle = t("label.tint"),
    tintSubTitle = t("title.opacity"),
    tintBgTitle = t("style.secondary_tint_opacity"),
    showBgTint = false,
    styleConfig,
    tintColors,
    bgTintColors,
    buttonTintOut,
    buttonTintOver,
    onChange,
    ...others
  } = props;
    const { map, classNames } = styleConfig || {};
  const { style, tint, bgTint, tintOver, tintOut, hasLight, hasDarkOut, hasDarkOver, isShadow } =
    data;
  const currentStyle = classNames && (style && classNames.includes(style) ? style : classNames[0]);
  const currentItem = map && currentStyle ? map[currentStyle] : undefined;
  const updateChange = (value: ComponentStyle) => {
    if (onChange) {
      onChange({ target: { name, value } });
    }
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<Tint | string>) => {
    const target = event.target;
    const {
      name,
      type: typeVal,
      checked,
    }: { name: string; type: string; checked: boolean } = target;
    const value = typeVal === "checkbox" ? target.checked : target.value;
    const newData = { ...data };

    if (name === "style") {
      newData.style = value as string;
    } else if (name === "tint" || name === "bgTint" || name === "tintOut" || name === "tintOver") {
      newData[name] = value as Tint;
    } else if (name === "light") {
      newData.hasLight = !(value as boolean);
    } else if (name === "lightOut") {
      newData.hasDarkOut =
        type === StyleListTypes.MediaButton || type === StyleListTypes.MediaButtonSummary
          ? (!value as boolean)
          : (value as boolean);
    } else if (name === "lightOver") {
      newData.hasDarkOver =
        type === StyleListTypes.MediaButton || type === StyleListTypes.MediaButtonSummary
          ? (!value as boolean)
          : (value as boolean);
    } else if (name === "shadow") {
      newData.isShadow = checked;
    }

    updateChange(newData);
  };

  return (
    <div className="style-tint-picker-wrapper">
      <BlmStylePicker
        type={type}
        name="style"
        value={style}
        style={data}
        onChange={handleChange}
        {...others}
      />
      {currentItem && (
        <div className="style-picker-params-wrapper">
          <div className="style-picker-lbl">{t("style.style_name")} :</div>
          <div className="style-picker-name">{currentItem.name}</div>

          {type !== StyleListTypes.Button &&
            type !== StyleListTypes.MediaButton &&
            type !== StyleListTypes.MediaVideo &&
            type !== StyleListTypes.MediaButtonSummary && (
              <>
                <BlmTintPicker
                  title={tintTitle}
                  subTitle={tintSubTitle}
                  data={tint}
                  defaultTint={currentItem.tint || defaultTint}
                  colors={tintColors}
                  onChange={handleChange}
                />
                {showBgTint && (
                  <Fragment>
                    <div className="style-picker-bg-tint-lbl">{tintBgTitle}</div>
                    <BlmTintPicker
                      name="bgTint"
                      data={bgTint}
                      defaultTint={currentItem.bgTint || defaultTint}
                      colors={bgTintColors}
                      onChange={handleChange}
                    />
                  </Fragment>
                )}
                <div className="style-picker-image-box">
                  <span className="style-picker-image-lbl">{t("label.image")}</span>
                  <span className="style-picker-light-lbl">{t("label.light")}</span>
                  <FormControlLabel
                    name="light"
                    label={t("label.dark")}
                    control={<Switch className="switch-2" />}
                    checked={!hasLight}
                    className="style-picker-img-switch-ctrl"
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

          {(type === StyleListTypes.Button ||
            type === StyleListTypes.MediaButton ||
            type === StyleListTypes.MediaButtonSummary) && (
            <>
              {(type === StyleListTypes.MediaButton ||
                type === StyleListTypes.MediaButtonSummary) && (
                <>
                  <BlmTintPicker
                    title={tintTitle}
                    subTitle={tintSubTitle}
                    outOver={"OUT"}
                    data={tint}
                    defaultTint={currentItem.tint || defaultTint}
                    colors={tintColors}
                    onChange={handleChange}
                  />
                  <BlmTintPicker
                    title={tintTitle}
                    subTitle={tintSubTitle}
                    name="bgTint"
                    outOver={"OVER"}
                    data={bgTint}
                    defaultTint={currentItem.bgTint || defaultTint}
                    colors={bgTintColors}
                    onChange={handleChange}
                  />
                </>
              )}
              {type === StyleListTypes.Button && (
                <>
                  <BlmTintPicker
                    title={tintTitle}
                    subTitle={tintSubTitle}
                    name="tintOut"
                    outOver={"OUT"}
                    data={tintOut}
                    defaultTint={currentItem.tintOut || defaultTint}
                    colors={buttonTintOut}
                    onChange={handleChange}
                  />
                  <BlmTintPicker
                    title={tintTitle}
                    subTitle={tintSubTitle}
                    name="tintOver"
                    outOver={"OVER"}
                    data={tintOver}
                    defaultTint={currentItem.tintOver || defaultTint}
                    colors={buttonTintOver}
                    onChange={handleChange}
                  />
                </>
              )}

              <div className="style-picker-image-box">
                <span className="style-picker-light-lbl">{t("label.light")}</span>
                <FormControlLabel
                  name="lightOut"
                  label={t("label.dark")}
                  control={<Switch className="switch-2" />}
                  checked={type === StyleListTypes.Button ? hasDarkOut : !hasDarkOut}
                  className="style-picker-img-switch-ctrl"
                  onChange={handleChange}
                />
              </div>
              <div className="style-picker-image-box-over">
                <span className="style-picker-light-lbl">{t("label.light")}</span>
                <FormControlLabel
                  name="lightOver"
                  label={t("label.dark")}
                  control={<Switch className="switch-2" />}
                  checked={type === StyleListTypes.Button ? hasDarkOver : !hasDarkOver}
                  className="style-picker-img-switch-ctrl"
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {(type === StyleListTypes.Button ||
            type === StyleListTypes.MediaButton ||
            type === StyleListTypes.MediaImage ||
            type === StyleListTypes.MediaVideo ||
            type === StyleListTypes.Sound ||
            type === StyleListTypes.MediaButtonSummary) && (
                          <FormControlLabel
              name="shadow"
              control={<Checkbox className="switch-2" />}
              checked={isShadow}
              label={t("label.shadow")}
              className={`${"style-shadow-" + type}`}
              onChange={handleChange}
            />
                      )}
        </div>
      )}
    </div>
  );
}
export default BlmStyleTintPicker;
