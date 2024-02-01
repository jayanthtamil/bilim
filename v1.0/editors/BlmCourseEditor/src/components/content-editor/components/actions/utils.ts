import { ComponentActionTypes } from "editor-constants";

const none = [{ type: ComponentActionTypes.None, key: "actions.no_action" }];
const additionals = [
  "divider",
  "Additional Content",
  { type: ComponentActionTypes.OpenSimpleConent, key: "actions.open_simple_content" },
  { type: ComponentActionTypes.OpenDocument, key: "actions.open_document" },
  { type: ComponentActionTypes.OpenLink, key: "actions.open_http" },
  { type: ComponentActionTypes.MailTo, key: "actions.mail_to" },
];
const hotspotAdditionals = [
  "divider",
  "Additional Content",
  { type: ComponentActionTypes.OpenSimpleConent, key: "actions.open_simple_content" },
];
const targets = [
  "divider",
  "Target",
  { type: ComponentActionTypes.ReplaceBackground, key: "actions.replace_background" },
  { type: ComponentActionTypes.ReplaceTarget, key: "actions.replace_target" },
];
const medias = [
  "divider",
  "Media",
  { type: ComponentActionTypes.VideoMarker, key: "actions.video_marker" },
  { type: ComponentActionTypes.AudioMarker, key: "actions.audio_marker" },
  // { type: ComponentActionTypes.Animation, key: "actions.animation" },
];
const navigations = [
  "divider",
  "Navigation",
  { type: ComponentActionTypes.Goto, key: "actions.goto" },
];
const buttonActionNavigation = [
  "divider",
  "Navigation",
  { type: ComponentActionTypes.Goto, key: "actions.goto" },
  { type: ComponentActionTypes.Navigation, key: "actions.navigation" },
  { type: ComponentActionTypes.CloseOrExit, key: "actions.closeorexit" }
]
const codes = ["divider", "Code", { type: ComponentActionTypes.Expert, key: "actions.expert" }];
const hotspots = [
  "divider",
  "Hotspot",
  { type: ComponentActionTypes.Tooltip, key: "actions.tooltip" },
  { type: ComponentActionTypes.Popover, key: "actions.popover" },
  { type: ComponentActionTypes.MediaLayer, key: "actions.media_layer" },
];
const hotspots360 = [
  "divider",
  "Hotspot",
  { type: ComponentActionTypes.Tooltip, key: "actions.tooltip" },
  { type: ComponentActionTypes.Popover, key: "actions.popover" },
  { type: ComponentActionTypes.Goto360, key: "actions.goto360" },
];

export function getActionItems(type?: string, isAction?: boolean): typeof none {
  if (type === "over") {
    return Array.prototype.concat(none, targets);
  } else if (type === "slideshow") {
    return Array.prototype.concat(none, additionals, codes);
  } else if (type === "hotspot") {
    return Array.prototype.concat(none, hotspotAdditionals, navigations, hotspots);
  } else if (type === "hotspot-over") {
    return Array.prototype.concat(none, hotspots);
  } else if (type === "hotspot-360") {
    return Array.prototype.concat(none, hotspotAdditionals, navigations, hotspots360);
  } else if (type === "hotspot-360-over") {
    return Array.prototype.concat(none, hotspots360);
  } else if (type === "hotspot-popover") {
    return Array.prototype.concat(none, hotspotAdditionals, navigations);
  }

  if (!isAction) {
    return Array.prototype.concat(none, additionals, targets, medias, navigations, codes);
  }
  else {
    return Array.prototype.concat(none, additionals, buttonActionNavigation, targets, medias);
  }
}
