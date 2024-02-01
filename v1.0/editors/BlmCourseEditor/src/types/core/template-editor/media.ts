import {
  MediaFormats,
  ImageDisplayTypes,
  MediaTrasitions,
  Positions,
  HotspotDisplayTypes,
  TargetBackgroundDisplay,
  MediaCueActions,
  MediaCuePositions,
  MediaPosition,
} from "editor-constants";
import { MediaFile } from "../course";
import { ComponentAction } from "./actions";
import { ComponentStyle } from "./component";

export class MediaFormat {
  value?: MediaFormats;
  width?: number;
  height?: number;
  defaultWidth = 250;
  defaultHeight = 250;
}

export class MediaImage {
  media?: MediaFile;
  title = "";
  description = "";
  caption = "";
  isZoom = false;
  option = ImageDisplayTypes.Cover;
  style = new ComponentStyle();
  position = MediaPosition.Center;
}

export class MediaSlideshow {
  items: MediaSlideshowItem[] = [];
  style?: string;
  slideStyle = new ComponentStyle();
}

export class MediaSlideshowItem {
  id = "";
  media?: MediaFile;
  title = "";
  description = "";
  caption = "";
  option = ImageDisplayTypes.Cover;
  clickAction = new ComponentAction();
  position = MediaPosition.Center;
}

export class MediaButton {
  out?: MediaFile;
  over?: MediaFile;
  click?: MediaFile;
  icon?: MediaFile;
  title = "";
  description = "";
  caption = "";
  label = "";
  number = "";
  duration = "";
  option = ImageDisplayTypes.Cover;
  clickAction = new ComponentAction();
  overAction = new ComponentAction();
  style = new ComponentStyle();
  position = MediaPosition.Center;
}

export class FlipCardSide {
  media?: MediaFile;
  icon?: MediaFile;
  title = "";
  description = "";
  caption = "";
  label = "";
  number = "";
  duration = "";
  option = ImageDisplayTypes.Cover;
  style = new ComponentStyle();
  position = MediaPosition.Center;
}

export class MediaFlipCard {
  recto = new FlipCardSide();
  verso = new FlipCardSide();
  flipAction = false;
  clickAction = new ComponentAction();
  overAction = new ComponentAction();
}

export class MediaCustom {
  media?: MediaFile;
}

export class MediaTarget {
  name = "";
  template?: string;
  transition = MediaTrasitions.Fade;
  background = TargetBackgroundDisplay.Template;
}

export class MediaVideo {
  title = "";
  description = "";
  caption = "";
}

export class ExternalVideo {
  url = "";
  id?: string;
  server?: string;
  thumbnail?: string;
}

export class StandardVideo {
  main?: MediaFile;
  webm?: MediaFile;
  image?: MediaFile;
  title = "";
  description = "";
  caption = "";
  autoPlay = false;
  loop = false;
  option = ImageDisplayTypes.Contain;
  style = new ComponentStyle();
}

export class SynchroVideo {
  main?: MediaFile;
  webm?: MediaFile;
  labels?: MediaTrackCue[];
  contents?: MediaTrackCue[];
}

export class MediaTrackCue {
  startTime: number;
  endTime: number;
  text: string;
  content?: string;
  position?: MediaCuePositions;
  action?: MediaCueActions;

  constructor(startTime = 0, endTime = 0, text = "") {
    this.startTime = startTime;
    this.endTime = endTime;
    this.text = text;
  }
}

export class MediaHotspotPlain {
  media?: MediaFile;
}

export class MediaHotspot {
  id = "1";
  name = "";
  media?: MediaFile;
  prerequisite = false;
  groups = new MediaHotspotGroups();
  display = new MediaHotspotDisplay();
  items: MediaHotspotItem[] = [];
  style?: string;
}

export class MediaHotspot360 {
  items: MediaHotspot[] = [];
}

export class MediaHotspotDisplay {
  type = HotspotDisplayTypes.Contain;
  centerImage = true;
  allowZoom = true;
  miniView = false;
}

export class MediaHotspotGroups {
  enabled = false;
  style?: string;
  items = [
    new MediaHotspotGroupItem("1", "Group 1", "#8c2f1c"),
    new MediaHotspotGroupItem("2", "Group 2", "#2725a5"),
  ];
}

export class MediaHotspotGroupItem {
  id: string;
  name: string;
  color: string;

  constructor(id: string, name: string, color: string = "0xFF0000") {
    this.id = id;
    this.name = name;
    this.color = color;
  }
}

export class MediaHotspotItem {
  id = "1";
  x = 0;
  y = 0;
  z = 0;
  name = "Hotspot";
  groupId?: string;
  media?: MediaFile;
  position = Positions.Top;
  size = 1;
  hasDark = true;
  callToAction = false;
  style?: string;
  clickAction = new ComponentAction();
  overAction = new ComponentAction();
}

export interface MediaHotspotOptionsJSON {
  prerequisite: boolean;
  centeronclick?: boolean;
  allowzoom?: boolean;
  miniview?: boolean;
}
