import React from "react";
import { ListItemText, ListItemIcon, MenuItem } from "@material-ui/core";

import { BackgroundOptionTypes, BackgroundOption2Types } from "editor-constants";
import { MaskOptionIcon, ParallaxOptionIcon, StandardOptionIcon } from "assets/icons";
import { BGMediaDisplayTypes } from "./BlmBackgroundMedia";

const IMAGE_OPTIONS = [
  BackgroundOptionTypes.Standard,
  BackgroundOptionTypes.Parallax,
  BackgroundOptionTypes.Mask,
];
const PAGE_IMAGE_OPTIONS = [
  BackgroundOptionTypes.Scroll,
  BackgroundOptionTypes.Parallax,
  BackgroundOptionTypes.Fixed,
];
const VIDEO_OPTIONS = [BackgroundOptionTypes.Autoplay, BackgroundOptionTypes.Scroll];
const IMAGE_OPTIONS2 = [
  BackgroundOption2Types.FullWidth,
  BackgroundOption2Types.NoResize,
  BackgroundOption2Types.Repeat,
];
const IMAGE_OPTIONS3 = [
  BackgroundOption2Types.Cover,
  BackgroundOption2Types.NoResize,
  BackgroundOption2Types.Repeat,
];

export const getOptions = (type: BGMediaDisplayTypes, hasVideo: boolean) => {
  if (hasVideo) {
    return VIDEO_OPTIONS;
  } else if (type === "page" || type === "page-action") {
    return PAGE_IMAGE_OPTIONS;
  } else {
    return IMAGE_OPTIONS;
  }
};

export const getOptions2 = (option: BackgroundOptionTypes) => {
  return option === BackgroundOptionTypes.Fixed ? IMAGE_OPTIONS3 : IMAGE_OPTIONS2;
};

export const getDefaultOption = <T,>(arr: T[], value: T) => {
  return arr.includes(value) ? value : arr[0];
};

const getItem = (option: BackgroundOptionTypes | BackgroundOption2Types) => {
  switch (option) {
    case BackgroundOptionTypes.Standard:
      return { label: "Standard", icon: <StandardOptionIcon /> };
    case BackgroundOptionTypes.Parallax:
      return { label: "Parallax", icon: <ParallaxOptionIcon /> };
    case BackgroundOptionTypes.Mask:
      return { label: "Mask", icon: <MaskOptionIcon /> };
    case BackgroundOptionTypes.Scroll:
      return { label: "Scroll", icon: <StandardOptionIcon /> };
    case BackgroundOptionTypes.Fixed:
      return { label: "Fixed", icon: <MaskOptionIcon /> };
    case BackgroundOptionTypes.Autoplay:
      return { label: "Autoplay", icon: null };
    case BackgroundOption2Types.FullWidth:
      return { label: "100% Width", icon: null };
    case BackgroundOption2Types.Cover:
      return { label: "Cover", icon: null };
    case BackgroundOption2Types.NoResize:
      return { label: "No Resize", icon: null };
    case BackgroundOption2Types.Repeat:
      return { label: "Repeat", icon: null };
    default:
      return { label: "None", icon: null };
  }
};

export const createItems = (
  options: BackgroundOptionTypes[] | BackgroundOption2Types[],
  hasIcon: boolean
) => {
  const items = [];

  for (const option of options) {
    const { label, icon } = getItem(option);

    items.push(
      <MenuItem key={option} value={option}>
        {hasIcon && icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText>{label}</ListItemText>
      </MenuItem>
    );
  }

  return items;
};
