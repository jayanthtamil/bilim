import { MediaFile } from "../course";
import {
  ButtonRepeaterComponent,
  MediaRepeaterComponent,
  SoundRepeaterComponent,
  ButtonComponent,
  MediaComponent,
  SoundComponent,
  TextComponent,
} from "./component";
import { TemplateCompleteJSON, TemplateLoadJSON } from "./actions";
import { Tint } from "./template";

export class TemplateRepeater {
  medias?: MediaRepeaterComponent[];
  buttons?: ButtonRepeaterComponent[];
  sounds?: SoundRepeaterComponent[];
}

export class ContentTemplate {
  texts: TextComponent[] = [];
  medias: MediaComponent[] = [];
  buttons: ButtonComponent[] = [];
  sounds: SoundComponent[] = [];
  repeater = new TemplateRepeater();
}

export interface TemplateOptionsJSON {
  relative_chapter?: string;
  sound?: string;
  parallax?: number;
  onload?: TemplateLoadJSON;
  oncomplete?: TemplateCompleteJSON;
}

export interface TemplateScrollOptionsJSON {
  fixedtransitioneffects?: boolean;
  parallaxecomponents?: boolean;
}

export interface TemplateEditorBackgroundJSON {
  main?: MediaFile;
  webm?: MediaFile;
  image?: MediaFile;
}

export interface TemplateEditorOptionsJSON {
  media?: { main: MediaFile; tint?: Tint };
  onLoad?: {
    background?: TemplateEditorBackgroundJSON;
    sound?: MediaFile;
    backgroundsounds?: MediaFile;
  };
  onComplete?: {
    background?: TemplateEditorBackgroundJSON;
    sound?: MediaFile;
  };
}
