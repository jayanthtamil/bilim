import { ComponentActionTypes, GotoActionTypes, Positions } from "editor-constants";
import { MediaFile } from "../course";
import { BackgroundMedia } from "./template";

export interface SimpleContentAction {
  simpleContentId?: string;
  option?: string;
  display?: string;
}

export interface DocumentAction {
  document?: MediaFile;
}

export interface LinkAction {
  url: string;
}

export interface MailAction {
  email: string;
}

export interface ReplaceBackgroundAction {
  background?: MediaFile;
  restore?: boolean;
}

export interface ReplaceTargetAction {
  replaceTargetId?: string;
  replaceId?: string;
  restore?: boolean;
}

export interface VideoMarkerAction {
  video: string;
  marker: string | undefined;
}

export interface SoundMarkerAction {
  sound: string;
  marker: string | undefined;
}

export interface GotoAction {
  action?: GotoActionTypes | string;
  gotoId?: string;
}

export interface NavigationAction {
  action?: GotoActionTypes | string;
  gotoId: string;
}

export interface CloseOrExitAction {
  action?: string;
  option?: string;
}

export interface TooltipAction {
  style?: string;
  label?: string;
}

export interface PopoverAction {
  media?: MediaFile;
  title?: string;
  description?: string;
  style?: string;
  position?: Positions;
  button?: PopoverActionButton;
}

export interface PopoverActionButton {
  checked?: boolean;
  label?: string;
  action?: ComponentAction;
}

export interface MediaLayerAction {
  layer?: MediaFile;
}

export interface Goto360Action {
  gotoId?: string;
}

export interface ActionStyle {
  name: string;
  style: string;
}

export interface TemplateNaviationAction {
  always?: boolean;
  next: boolean;
  previous: boolean;
  home: boolean;
}

export interface TemplateSimpleContentAction {
  checked: boolean;
  always?: boolean;
  simpleContentId?: string;
  option?: string;
  display?: string;
}

export interface TemplateBackgroundAction {
  checked: boolean;
  always?: boolean;
  background?: BackgroundMedia;
}

export interface TemplateSoundAction {
  checked: boolean;
  always?: boolean;
  sound?: MediaFile;
  unChecked?: boolean;
}

export interface TemplateBackgroundSoundAction {
  checked: boolean;
  always?: boolean;
  backgroundsounds?: MediaFile;
  unChecked?: boolean;
}

export type ComponentActionValues =
  | SimpleContentAction
  | DocumentAction
  | LinkAction
  | MailAction
  | ReplaceBackgroundAction
  | ReplaceTargetAction
  | VideoMarkerAction
  | SoundMarkerAction
  | GotoAction
  | TooltipAction
  | PopoverAction
  | MediaLayerAction
  | Goto360Action;

export class ComponentAction {
  action = ComponentActionTypes.None;
  value?: ComponentActionValues;
}

export interface TemplateSimpleContentJSON {
  checked: boolean;
  always?: boolean;
  id?: string;
  option?: string;
  display?: string;
}

export interface TemplateBackgroundJSON {
  checked: boolean;
  always?: boolean;
  path?: string;
  pathwebm?: string;
  paththumbnaill?: string;
  tint?: string;
  option1?: string;
  option2?: string;
  parallaxe?: number;
  loop?: boolean;
  restore?: boolean;
}

export interface TemplateSoundJSON {
  checked: boolean;
  always?: boolean;
  path?: string;
}

export interface TemplateLoadJSON {
  always?: boolean;
  hidenext?: boolean;
  hideprevious?: boolean;
  hidehome?: boolean;
  opensimplecontent: TemplateSimpleContentJSON;
  changebackground?: TemplateBackgroundJSON;
  playsound: TemplateSoundJSON;
  stopsound: TemplateStopSoundJSON;
  playbackgroundsound: TemplateSoundJSON;
  stopbackgroundsound: TemplateStopSoundJSON;
}

export interface TemplateStopSoundJSON {
  checked: boolean;
  always?: boolean;
}
export interface TemplateCompleteJSON {
  keepnextkidden?: boolean;
  showprevious?: boolean;
  showhome?: boolean;
  opensimplecontent: TemplateSimpleContentJSON;
  changebackground: TemplateBackgroundJSON;
  playsound: TemplateSoundJSON;
}

export class TemplateAction {
  navigation: TemplateNaviationAction = { next: false, previous: false, home: false };
  simpleContent: TemplateSimpleContentAction = { checked: false };
  background: TemplateBackgroundAction = { checked: false };
  sound: TemplateSoundAction = { checked: false };
  backgroundSound: TemplateBackgroundSoundAction = { checked: false };
}

export class ContentTemplateAction {
  load = new TemplateAction();
  complete = new TemplateAction();
}

export interface TempalteActionView {
  dashboardType: "controlled" | "standard";
  load: {
    always?: { default: boolean };
    navigation?: {
      next: boolean;
      previous: boolean;
      home: boolean;
    };
    simpleContent: boolean;
    background: boolean;
    sound: boolean;
    backgroundSound: boolean;
  };
  complete?: {
    navigation?: {
      next: boolean;
      previous: boolean;
      home: boolean;
    };
    simpleContent: boolean;
    background: boolean;
    sound: boolean;
  };
}
