import { MutableRefObject } from "react";

import { ComponentTypes, MediaFormats, MediaVariants } from "editor-constants";
import { SimpleObject } from "../others";
import { MediaFile } from "../course";
import {
  MediaFormat,
  MediaImage,
  MediaSlideshow,
  MediaCustom,
  MediaTarget,
  MediaButton,
  MediaVideo,
  ExternalVideo,
  StandardVideo,
  MediaFlipCard,
  SynchroVideo,
  MediaHotspot360,
  MediaHotspot,
  MediaHotspotPlain,
} from "./media";
import { Tint } from "./template";
import { ComponentAction } from "./actions";

export interface TextEditorComponent {
  setFocus: () => void;
  toggleInlineStyle: (inlineStyle: string) => void;
  applyInlineStyle: (inlineStyle: string, value: string) => void;
  removeInlineStyle: (inlineStyle: string) => void;
  toggleAlignment: (textAlign: string) => void;
  toggleBlockType: (blockType: string) => void;
  clearStyles: () => void;
}

export type TextEditorRef = MutableRefObject<TextEditorComponent | null>;

export class BaseComponent<T = string> {
  id?: string;
  mapping?: string;
  value?: T;
  type = ComponentTypes.Base;
  isEditable = true;
  isDeletable = false;
  isDeactivated?: boolean;
  isEdited = false;
  frameStyle?: CSSStyleDeclaration;
  constructor(value?: T) {
    this.value = value;
  }
}

export class TextComponent extends BaseComponent<string> {
  type = ComponentTypes.Text;
}

export class QuestionMediaComponent<T = MediaFile> extends BaseComponent<T> {
  type = ComponentTypes.Media;
}

export class QuestionCustomComponent extends QuestionMediaComponent {
  options?: MediaConfigJSON;
  config?: MediaConfig;
  format = new MediaFormat();
}

export type MediaComponentValues =
  | MediaImage
  | MediaSlideshow
  | MediaButton
  | MediaFlipCard
  | MediaCustom
  | MediaTarget
  | MediaVideo
  | ExternalVideo
  | StandardVideo
  | SynchroVideo
  | MediaHotspotPlain
  | MediaHotspot
  | MediaHotspot360;

export interface MediaConfigJSON {
  mediatype: string;
  format: string;
  style: string;
  saveincss?: boolean;
  parameters?: { autostart: boolean; loop: boolean } | { id: string; server: string };
}

export interface MediaConfigOptions {
  horizontal: string;
  vertical: string;
  zoom: boolean;
}

export interface MediaConfig {
  variant: MediaVariants[];
  format: MediaFormats[];
  style?: SimpleObject;
  saveInCSS: boolean;
}

export class MediaComponent extends BaseComponent<MediaComponentValues> {
  repeaterId?: string;
  isCreated = false;
  type = ComponentTypes.Media;
  variant?: MediaVariants;
  options?: MediaConfigJSON;
  options2?: MediaConfigOptions;
  config?: MediaConfig;
  classList?: Array<string>;
  format = new MediaFormat();
  hasApplyStyle = true;
}

export class ButtonValue {
  background?: MediaFile;
  inline?: MediaFile;
  title = "";
  description = "";
  caption = "";
  label = "";
  number = "";
  clickAction = new ComponentAction();
  overAction = new ComponentAction();
  style = new ComponentStyle();
}

export class ButtonOptions {
  format = new MediaFormat();
  config?: MediaConfig;
}

export class ButtonComponent extends BaseComponent<ButtonValue> {
  repeaterId?: string;
  isCreated = false;
  type = ComponentTypes.Button;
  value = new ButtonValue();
  classList?: Array<string>;
  hasApplyStyle = true;
  buttonOptions = new ButtonOptions();
}

export interface SoundConfigJSON {
  parameters?: { autostart: boolean; local: boolean };
}

export class SoundValue {
  media?: MediaFile;
  image?: MediaFile;
  title = "";
  description = "";
  caption = "";
  autoPlay = false;
  localPlay = true;
  style = new ComponentStyle();
}

export class SoundComponent extends BaseComponent<SoundValue> {
  repeaterId?: string;
  isCreated = false;
  type = ComponentTypes.Sound;
  value = new SoundValue();
  options?: SoundConfigJSON;
  classList?: Array<string>;
  hasApplyStyle = true;
}

export interface RepeaterOptionsJSON {
  [key: string]: { type: string; label: string; min: number; max: number; css_variable: string };
}

export interface RepeaterConfigJSON {
  allowcomponent: ComponentTypes;
  default_class: string;
  max_items: number;
  min_items: number;
  repeater_options?: RepeaterOptionsJSON;
  media_options: MediaConfigJSON;
  duplicate: boolean;
  saveincss?: boolean;
}

export type RepeaterValues = MediaComponent | ButtonComponent | SoundComponent;

export class RepeaterComponent<T = RepeaterValues> extends BaseComponent<T[]> {
  type = ComponentTypes.Repeater;
  allowComponent?: ComponentTypes;
  minimum = 0;
  maximum = 0;
  defaultClass?: string;
  options?: RepeaterOptionsJSON;
  variables?: { [key: string]: unknown };
}

export class MediaRepeaterComponent extends RepeaterComponent<MediaComponent> {
  mediaConfig?: MediaConfigJSON;
  saveInCSS: boolean = false;
}

export class ButtonRepeaterComponent extends RepeaterComponent<ButtonComponent> {
  duplicate?: boolean;
}

export class SoundRepeaterComponent extends RepeaterComponent<SoundComponent> {}

export class ComponentStyle {
  style?: string;
  tint?: Tint;
  bgTint?: Tint;
  hasLight = false;
  width?: string;
  tintOver?: Tint;
  tintOut?: Tint;
  hasDarkOut = false;
  hasDarkOver = false;
  isShadow = false;
}
