import React, { ChangeEvent, Fragment, ReactElement, useMemo } from "react";
import { Select, MenuItem, Divider, ListItemIcon, ListItemText } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaFormat } from "types";
import { MediaFormats } from "editor-constants";
import {
  AutoIcon,
  ExtraHighIcon,
  ExtraWideIcon,
  FixedHeightIcon,
  FixedSizeIcon,
  FixedWidthIcon,
  FullHeightIcon,
  HighIcon,
  LargeIcon,
  RelativeHeightIcon,
  RoundIcon,
  SquareIcon,
  WideIcon,
} from "assets/icons";
import { BlmSubscriptInput, SubscriptInputChangeEvent } from "shared";
import "./styles.scss";

export type MediaFormatChangeEvent = CustomChangeEvent<MediaFormat>;

export interface CompProps {
  data: MediaFormat;
  formats?: MediaFormats[];
  onChange: (event: MediaFormatChangeEvent) => void;
  isButtonFormater?: boolean;
}

function getLabelAndIcon(format: MediaFormats, t: any) {
  switch (format) {
    case MediaFormats.Square:
      return [`${t("format_opt.square")}`, <SquareIcon />];
    case MediaFormats.Round:
      return [`${t("format_opt.round")}`, <RoundIcon />];
    case MediaFormats.Large:
      return [`${t("format_opt.large")}`, <LargeIcon />];
    case MediaFormats.Wide:
      return [`${t("format_opt.wide")}`, <WideIcon />];
    case MediaFormats.ExtraWide:
      return [`${t("format_opt.extra_wide")}`, <ExtraWideIcon />];
    case MediaFormats.FixedHeight:
      return [`${t("format_opt.fixed_height")}`, <FixedHeightIcon />];
    case MediaFormats.RelativeHeight:
      return [`${t("format_opt.homothety")}`, <RelativeHeightIcon />];
    case MediaFormats.FixedWidth:
      return [`${t("format_opt.fixed_width")}`, <FixedWidthIcon />];
    case MediaFormats.FixedSize:
      return [`${t("format_opt.fixed_size")}`, <FixedSizeIcon />];
    case MediaFormats.High:
      return [`${t("format_opt.high")}`, <HighIcon />];
    case MediaFormats.ExtraHigh:
      return [`${t("format_opt.extra_high")}`, <ExtraHighIcon />];
    case MediaFormats.FullHeight:
      return [`${t("format_opt.full_height")}`, <FullHeightIcon />];
    case MediaFormats.Auto:
      return [`${t("format_opt.auto")}`, <AutoIcon />];
  }
}

function BlmMediaFormat(props: CompProps) {
  const { data, formats = [], onChange, isButtonFormater } = props;
  const { value, width, height, defaultWidth, defaultHeight } = data;
  const currentValue = value || (formats.length && formats[0]) || MediaFormats.Square;
  const showWidth =
    currentValue === MediaFormats.FixedWidth || currentValue === MediaFormats.FixedSize;
  const showHeight =
    currentValue === MediaFormats.FixedHeight ||
    currentValue === MediaFormats.RelativeHeight ||
    currentValue === MediaFormats.FixedSize;
  const { t } = useTranslation("shared");

  const items = useMemo(() => {
    const arr: ReactElement[] = [];
    const dividers = [
      MediaFormats.Round,
      MediaFormats.ExtraWide,
      MediaFormats.FixedSize,
      MediaFormats.FullHeight,
    ];
    let isDivider = false;

    if (formats) {
      Object.values(MediaFormats).forEach((item) => {
        if (formats.includes(item)) {
          if (isDivider) {
            arr.push(<Divider key={item + "divider"} />);
            isDivider = false;
          }

          const [label, icon] = getLabelAndIcon(item, t);

          arr.push(
            <MenuItem key={item} value={item}>
              <ListItemText>{label}</ListItemText>
              <ListItemIcon>{icon}</ListItemIcon>
            </MenuItem>
          );
        }

        if (dividers.includes(item) && arr.length > 0) {
          isDivider = true;
        }
      });
    }

    return arr;
  }, [formats, t]);

  const updateChange = (value: MediaFormat) => {
    if (onChange) {
      onChange({ target: { name: "format", value } });
    }
  };

  const handleChange = (
    event: ChangeEvent<{ name?: string; value: unknown }> | SubscriptInputChangeEvent
  ) => {
    const { name, value } = event.target;
    const newData = { ...data };

    if (name === "format") {
      newData.value = value as MediaFormats;
    } else if (name === "width") {
      newData.width = value as number;
    } else if (name === "height") {
      newData.height = value as number;
    }

    updateChange(newData);
  };

  return (
    <div
      className={`media-format-wrapper ${
        isButtonFormater
          ? data && data.value === MediaFormats.FixedWidth
            ? "button-media-width-format"
            : "button-media-format-wrapper"
          : ""
      }`}
    >
      {showWidth && (
        <Fragment>
          <span>{t("title.width")}</span>
          <BlmSubscriptInput
            name="width"
            min={10}
            max={1000}
            value={width || defaultWidth}
            label="px"
            onChange={handleChange}
          />
        </Fragment>
      )}
      {showHeight && (
        <Fragment>
          <span>{t("title.height")}</span>
          <BlmSubscriptInput
            name="height"
            min={10}
            max={1000}
            value={height || defaultHeight}
            label="px"
            onChange={handleChange}
          />
        </Fragment>
      )}
      <span>{t("format_opt.format")}</span>
      <Select
        name="format"
        value={currentValue}
        MenuProps={{
          className: "media-format-dropdown-menu",
          disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
        }}
        className="media-format-dropdown"
        onChange={handleChange}
      >
        {items}
      </Select>
    </div>
  );
}

export default BlmMediaFormat;
