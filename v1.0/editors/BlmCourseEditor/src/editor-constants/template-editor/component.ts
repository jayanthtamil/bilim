export enum ComponentTypes {
  Base = "base",
  Text = "text",
  Media = "media",
  Button = "button",
  Sound = "audio",
  Repeater = "repeater",
}

export enum MediaVariants {
  Image = "image",
  Slideshow = "slideshow",
  Button = "button",
  FlipCard = "flipcard",
  Video = "video",
  VideoExternal = "video_external",
  VideoStandard = "video_standard",
  SynchroVideo = "synchrovideo",
  Custom = "custom",
  Target = "target",
  HotspotPlain = "hotspot_plain",
  Hotspot = "hotspot",
  Hotspot360 = "hotspot360",
}

export enum MediaFormats {
  Square = "square",
  Round = "round",
  Large = "large",
  Wide = "wide",
  ExtraWide = "extrawide",
  FixedHeight = "pixelheight",
  FixedWidth = "pixelwidth",
  RelativeHeight = "relativeheight",
  FixedSize = "pixelheightandwidth",
  High = "high",
  ExtraHigh = "extrahigh",
  FullHeight = "fullheight",
  Auto = "auto",
}

export enum MediaTrasitions {
  Fade = "fade",
  WipeLeft = "wipeleft",
  WipeDown = "wipedown",
  None = "none",
}

export enum MediaTypes {
  Main = "main",
  Webm = "webm",
  Image = "image",
}

export enum MediaPlayerTypes {
  Video = "video",
  Audio = "audio",
  Lottie = "lottie",
}

export enum MediaTrackTypes {
  Subtitles = "subtitles",
  Markers = "markers",
  Labels = "labels",
  Contents = "contents",
}

export enum MediaCuePositions {
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

export enum MediaCueActions {
  ScrollVScrollC = "scrollvideo_scrollcontent",
  PauseVScrollC = "scrollvideo_pausecontent",
  ScrollVPauseC = "pausevideo_scrollcontent",
}

export enum StyleListTypes {
  MediaImage = "media-image",
  MediaSlideshow = "media-slideshow",
  MediaSlideshowItem = "media-slideshow-item",
  MediaVideo = "media-video",
  MediaButton = "media-button",
  MediaButtonSummary = "media-button-summary",
  MediaHotspotItem = "media-hotspot-item",
  MediaHotspotItemSummary = "media-hotspot-item-summary",
  MediaHotspotItem360 = "media-hotspot-item-360",
  MediaHotspotGroup = "media-hotspot-group",
  MediaHotspotPopover = "media-hotspot-popover",
  MediaHotspotTooltip = "media-hotspot-tooltip",
  MediaFlipCardRecto = "media-flipcard-recto",
  MediaFlipCardVerso = "media-flipcard-verso",
  Button = "button",
  Sound = "sound",
}

export enum ColorListTypes {
  Text = "text",
  TextBackground = "texthighlighted",
  MediaTint = "mediatint",
  MediaTintBackground = "mediaundertexttint",
  BackroundMedia = "backgroundmediatint",
  Background = "backgroundcolor",
  ButtonTintOut = "buttontintout",
  ButtonTintOver = "buttontintover",
}

export enum FontListTypes {
  Text = "text",
}

export enum ComponentActionTypes {
  None = "none",
  OpenSimpleConent = "openac",
  OpenDocument = "opendocument",
  OpenLink = "httplink",
  MailTo = "mailto",
  ReplaceBackground = "replacebackground",
  ReplaceTarget = "target",
  VideoMarker = "videomarker",
  AudioMarker = "audiomarker",
  Animation = "animation",
  Goto = "goto",
  Expert = "expert",
  Tooltip = "tooltip",
  Popover = "openpopover",
  MediaLayer = "medialayer",
  Goto360 = "goto360",
  Navigation = "navigation",
  CloseOrExit = "closeexit",
}

export enum GotoActionTypes {
  Previous = "previous",
  Next = "next",
  Home = "home",
  LastLocation = "lastlocation",
  RedoEvaluation = "redoeval",
  Top = "top",
  PageScreen = "courseelement",
  PreviousPartPage = "previouspartpage",
  NextPartPage = "nextpartpage",
  PreviousAnchor = "previousanchor",
  NextAnchor = "nextanchor",
}

export enum CloseOrExitTypes {
  ClosePopup = "closepopup",
  CloseFlap = "closeflap",
  CloseBelow = "closebelow",
  ExitCourse = "exitcourse",
}

export enum SCActionDisplayTypes {
  LeftLarge = "left_large",
  LeftMedium = "left_medium",
  LeftSmall = "left_small",
  RightLarge = "right_large",
  RightMedium = "right_medium",
  RightSmall = "right_small",
  Top = "top",
  Bottom = "bottom",
  Full = "full",
  Large = "large",
  Medium = "medium",
  Small = "small",
  PopoverSmall = "popover_small",
  PopoverMedium = "popover_medium",
}
