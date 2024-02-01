import { CMSFolderTypes, MIMEType } from "editor-constants";

export class CMSFolder {
  id: string;
  title: string;
  type: CMSFolderTypes = CMSFolderTypes.ContentFolder;
  link: string | null = null;
  child: CMSFolder | null = null;

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }
}

export class CMSFile {
  name: string;
  path: string;
  isFolder: boolean = false;
  content: string | null = null;
  children: CMSFile[] | null = null;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }
}

export class MediaFile {
  id: string;
  name: string;
  type: MIMEType;
  url: string;
  rootFile: string;
  waveform?: string;
  subtitle?: MediaFile;
  marker?: MediaFile;

  constructor(id: string, name: string, type: MIMEType, url: string, rootFile: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.url = url;
    this.rootFile = rootFile;
  }
}

export interface AnimationTranslation {
  id: string;
  text: string;
}

export interface AnimationOption {
  name: string;
  type: string;
  value: string | boolean | number;
  min?: number;
  max?: number;
  list_values?: string;
}

export interface AnimationOptions {
  [key: string]: AnimationOption;
}

export class AnimationAttachment {
  id: string = "";
  name: string = "";
  url: string = "";
  type?: MIMEType;
  subtitle?: AnimationAttachment;
}

export class AnimationMedia {
  translations: AnimationTranslation[] = [];
  options?: AnimationOptions;
  attachments: AnimationAttachment[] = [];
}

export interface MediaWavesurfer {
  currentTime: number;
  scrollTime: number;
  currentDuration: number;
  pxPerSec: number;
  duration: number;
  width: number;
}
