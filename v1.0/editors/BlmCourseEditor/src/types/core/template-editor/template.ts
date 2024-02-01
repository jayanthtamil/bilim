import { MouseEvent } from "react";

import {
  BackgroundOption2Types,
  BackgroundOptionTypes,
  BackgroundSizeTypes,
  TemplateWidthTypes,
  ImageDisplayTypes,
  MediaBackgroundPosition,
} from "editor-constants";
import { MediaFile } from "../course";

export interface TemplateEditorComponent {
  isEdited: boolean;
  saveOnClose: (event: MouseEvent) => void;
  revert: () => void;
}

export interface PropertiesEditorComponent {
  isEdited: boolean;
  save: () => void;
  revert: () => void;
}

export class TemplateLength {
  value = "0";
  isSelected = false;
}

export class TemplateWidth {
  type: TemplateWidthTypes = TemplateWidthTypes.Full;
  width = new TemplateLength();
}

export class GlobalVal {
  value = false;
}
export class TemplateMargin {
  top = new TemplateLength();
  left = new TemplateLength();
  right = new TemplateLength();
  bottom = new TemplateLength();
  margin = new TemplateLength();
  globalTop = new GlobalVal();
}

export class TemplatePadding {
  top = new TemplateLength();
  bottom = new TemplateLength();
}
export class TemplateSize {
  width = new TemplateWidth();
  margin = new TemplateMargin();
  padding = new TemplatePadding();
  isFullscreen = false;
  hasInnerContainer = false;
}

export class Tint {
  color?: string;
  alpha?: number;
}

export class BackgroundMedia {
  main?: MediaFile;
  webm?: MediaFile;
  image?: MediaFile;
  tint = new Tint();
  option = BackgroundOptionTypes.None;
  optionValue: number | boolean = 0;
  option2 = BackgroundOption2Types.None;
  restore?: boolean;
  option3 = ImageDisplayTypes.Cover;
  position = MediaBackgroundPosition.Center;
}

export class PartPageBackground {
  media = new BackgroundMedia();
  tint = new Tint();
  mediaSize = BackgroundSizeTypes.Large;
  colorSize = BackgroundSizeTypes.Large;
}

export class ScreenBackground {
  media = new BackgroundMedia();
  tint = new Tint();
}
