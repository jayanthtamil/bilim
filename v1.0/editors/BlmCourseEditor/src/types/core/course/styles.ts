import {
  StyleListTypes,
  CourseDisplay,
  NavigationType,
  ColorListTypes,
  FontListTypes,
} from "editor-constants";
import { Tint } from "../template-editor";
import { CMSFile } from "./file";

export class StyleCSSFiles {
  fonts?: string;
  template?: string;
  bootstrap?: string;
  customBootstrap = "./styles/bootstrap-lines.css";
  draftJS = "./styles/custom-draft.css";
}

export interface StylePropertiesConfigJSON {
  title2: boolean;
  description: boolean;
  medias: {
    default: boolean;
    over: boolean;
    sound: boolean;
  };
  misc: {
    [key: string]: boolean;
  };
}

export class StylePropertiesConfig {
  [key: string]: StylePropertiesConfigJSON;
}

export interface StyleMetadataConfigJSON {
  [key: string]: string | string[];
}

export class StyleMetadataConfig {
  [key: string]: StyleMetadataConfigJSON;
}

export interface StyleNavigationConfig {
  type: NavigationType;
  typelist: NavigationType[];
  styleloader: boolean;
  screenmenu: boolean;
  navigationlevel: number;
  toclevel: number;
  screensontoc: boolean;
  linear: boolean;
}

export class StyleConfig {
  name: string;
  framework: string;
  display: CourseDisplay;
  properties?: StylePropertiesConfig;
  metadatas?: StyleMetadataConfig;
  navigation?: StyleNavigationConfig;

  constructor(name = "", framework = "", display: CourseDisplay = CourseDisplay.Desktop) {
    this.name = name;
    this.framework = framework;
    this.display = display;
  }
}

export class StyleListItem {
  name: string = "";
  className: string = "";
  url?: string;
  overUrl?: string;
  tint?: Tint;
  bgTint?: Tint;
  tintOut?: Tint;
  tintOver?: Tint;
}

export class StyleListCategory {
  name: string = "";
  items: StyleListItem[] = [];
}

export class StyleListMap {
  [key: string]: StyleListItem;
}

export type StyleListItems = StyleListCategory[] | StyleListItem[];

export class StyleListConfig {
  items: StyleListItems = [];
  map: StyleListMap = {};
  classNames: string[] = [];
}

export class StyleList {
  [StyleListTypes.MediaImage]?: StyleListConfig;
  [StyleListTypes.MediaSlideshow]?: StyleListConfig;
  [StyleListTypes.MediaSlideshowItem]?: StyleListConfig;
  [StyleListTypes.MediaButton]?: StyleListConfig;
  [StyleListTypes.MediaFlipCardRecto]?: StyleListConfig;
  [StyleListTypes.MediaFlipCardVerso]?: StyleListConfig;
  [StyleListTypes.MediaButtonSummary]?: StyleListConfig;
  [StyleListTypes.MediaHotspotItem]?: StyleListConfig;
  [StyleListTypes.MediaHotspotItemSummary]?: StyleListConfig;
  [StyleListTypes.MediaHotspotItem360]?: StyleListConfig;
  [StyleListTypes.MediaHotspotGroup]?: StyleListConfig;
  [StyleListTypes.MediaHotspotPopover]?: StyleListConfig;
  [StyleListTypes.MediaHotspotTooltip]?: StyleListConfig;
  [StyleListTypes.Button]?: StyleListConfig;
  [StyleListTypes.Sound]?: StyleListConfig;
  [StyleListTypes.MediaVideo]?: StyleListConfig;
}

export class ColorList {
  [ColorListTypes.Text]?: ColorListItem[];
  [ColorListTypes.TextBackground]?: ColorListItem[];
  [ColorListTypes.MediaTint]?: ColorListItem[];
  [ColorListTypes.MediaTintBackground]?: ColorListItem[];
  [ColorListTypes.BackroundMedia]?: ColorListItem[];
  [ColorListTypes.Background]?: ColorListItem[];
  [ColorListTypes.ButtonTintOut]?: ColorListItem[];
  [ColorListTypes.ButtonTintOver]?: ColorListItem[];
}

export class ColorListItem {
  name = "";
  color = "#ffffff";
  alpha = 100;
}

export class FontList {
  [FontListTypes.Text]?: FontListItem[];
}

export class FontListItem {
  name = "";
  fontFamily = "";
}

export class CourseStyle {
  id: string;
  name: string;
  config = new StyleConfig();
  cssFiles = new StyleCSSFiles();
  styles = new StyleList();
  colors = new ColorList();
  fonts = new FontList();
  children: CMSFile[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
