import i18next from "i18next";
import {
  ComponentAction,
  DocumentAction,
  LinkAction,
  SimpleContentAction,
  ReplaceBackgroundAction,
  ReplaceTargetAction,
  GotoAction,
  CourseStructure,
  PopoverAction,
  TooltipAction,
  MediaLayerAction,
  MailAction,
  Goto360Action,
  NavigationAction,
  CloseOrExitAction,
  VideoMarkerAction,
  SoundMarkerAction,
} from "types";
import {
  CloseOrExitTypes,
  ComponentActionTypes,
  GotoActionTypes,
  SCActionDisplayTypes,
} from "editor-constants";
import { getElement } from "./element";

export function isSimpleContentAction(
  action: ComponentAction
): action is ComponentAction & { value?: SimpleContentAction } {
  return action.action === ComponentActionTypes.OpenSimpleConent;
}

export function isDocumentAction(
  action: ComponentAction
): action is ComponentAction & { value?: DocumentAction } {
  return action.action === ComponentActionTypes.OpenDocument;
}

export function isLinkAction(
  action: ComponentAction
): action is ComponentAction & { value?: LinkAction } {
  return action.action === ComponentActionTypes.OpenLink;
}

export function isMailAction(
  action: ComponentAction
): action is ComponentAction & { value?: MailAction } {
  return action.action === ComponentActionTypes.MailTo;
}

export function isReplaceBackgroundAction(
  action: ComponentAction
): action is ComponentAction & { value?: ReplaceBackgroundAction } {
  return action.action === ComponentActionTypes.ReplaceBackground;
}

export function isReplaceTargetAction(
  action: ComponentAction
): action is ComponentAction & { value?: ReplaceTargetAction } {
  return action.action === ComponentActionTypes.ReplaceTarget;
}

export function isGotoAction(
  action: ComponentAction
): action is ComponentAction & { value?: GotoAction } {
  return action.action === ComponentActionTypes.Goto;
}

export function isNavigationAction(
  action: ComponentAction
): action is ComponentAction & { value?: NavigationAction } {
  return action.action === ComponentActionTypes.Navigation;
}

export function isCloseOrExit(
  action: ComponentAction
): action is ComponentAction & { value?: CloseOrExitAction } {
  return action.action === ComponentActionTypes.CloseOrExit;
}

export function isTooltipAction(
  action: ComponentAction
): action is ComponentAction & { value?: TooltipAction } {
  return action.action === ComponentActionTypes.Tooltip;
}

export function isPopoverAction(
  action: ComponentAction
): action is ComponentAction & { value?: PopoverAction } {
  return action.action === ComponentActionTypes.Popover;
}

export function isMediaLayerAction(
  action: ComponentAction
): action is ComponentAction & { value?: MediaLayerAction } {
  return action.action === ComponentActionTypes.MediaLayer;
}

export function isGoto360Action(
  action: ComponentAction
): action is ComponentAction & { value?: Goto360Action } {
  return action.action === ComponentActionTypes.Goto360;
}

export function isVideoMarker(
  action: ComponentAction
): action is ComponentAction & { value?: VideoMarkerAction } {
  return action.action === ComponentActionTypes.VideoMarker;
}

export function isAudioMaker(
  action: ComponentAction
): action is ComponentAction & { value?: SoundMarkerAction } {
  return action.action === ComponentActionTypes.AudioMarker;
}

function getElementName(structure?: CourseStructure, id?: string) {
  if (structure && id) {
    return getElement(structure, id)?.name;
  }
}

function getGotoLabel(action?: GotoActionTypes | string) {
  switch (action) {
    case GotoActionTypes.Previous:
      return i18next.t("content-editor:go_to_opt.previous");
    case GotoActionTypes.Next:
      return i18next.t("content-editor:go_to_opt.next");
    case GotoActionTypes.Home:
      return i18next.t("content-editor:go_to_opt.home");
    case GotoActionTypes.LastLocation:
      return i18next.t("content-editor:go_to_opt.last_location");
    case GotoActionTypes.RedoEvaluation:
      return i18next.t("content-editor:go_to_opt.redo_evaluation");
    case GotoActionTypes.PageScreen:
      return i18next.t("content-editor:go_to_opt.page_screen");
    case GotoActionTypes.PreviousPartPage:
      return i18next.t("content-editor:go_to_opt.previous_partpage");
    case GotoActionTypes.NextPartPage:
      return i18next.t("content-editor:go_to_opt.next_partpage");
    case GotoActionTypes.PreviousAnchor:
      return i18next.t("content-editor:go_to_opt.previous_anchor");
    case GotoActionTypes.NextAnchor:
      return i18next.t("content-editor:go_to_opt.next_anchor");
    case GotoActionTypes.Top:
      return i18next.t("content-editor:go_to_opt.top");
    default:
      return undefined;
  }
}

const getCloseOrExitLabel = (action?: CloseOrExitTypes | string) => {
  switch (action) {
    case CloseOrExitTypes.ClosePopup:
      return i18next.t("content-editor:close_or_exit.close_pop_up");
    case CloseOrExitTypes.CloseFlap:
      return i18next.t("content-editor:close_or_exit.close_flap");
    case CloseOrExitTypes.CloseBelow:
      return i18next.t("content-editor:close_or_exit.close_below");
    case CloseOrExitTypes.ExitCourse:
      return i18next.t("content-editor:close_or_exit.exit_course");
    default:
      return undefined;
  }
};

const getVideoMarkerValue = (markerAction: VideoMarkerAction | undefined) => {
  return markerAction?.video ? `Video ${markerAction?.video}-Marker ${markerAction?.marker}` : "";
};

const getAudioMarkerValue = (markerAction: SoundMarkerAction | undefined) => {
  if (markerAction?.sound === "101") {
    return markerAction?.sound ? `Background Sound-Marker ${markerAction?.marker}` : "";
  } else {
    return markerAction?.sound ? `Audio ${markerAction?.sound}-Marker ${markerAction?.marker}` : "";
  }
};

export function getActionDetails(action?: ComponentAction, structure?: CourseStructure) {
  if (action) {
    if (isSimpleContentAction(action)) {
      return [
        i18next.t("content-editor:actions.open_simple"),
        getElementName(structure, action.value?.simpleContentId),
      ];
    } else if (isDocumentAction(action)) {
      return [i18next.t("content-editor:actions.open_document"), action.value?.document?.name];
    } else if (isLinkAction(action)) {
      return [i18next.t("content-editor:actions.open_http"), action.value?.url];
    } else if (isMailAction(action)) {
      return [i18next.t("content-editor:actions.mail_to"), action.value?.email];
    } else if (isReplaceBackgroundAction(action)) {
      return [
        i18next.t("content-editor:actions.replace_background"),
        action.value?.background?.name,
      ];
    } else if (isReplaceTargetAction(action)) {
      return [
        i18next.t("content-editor:actions.replace_target"),
        getElementName(structure, action.value?.replaceId),
      ];
    } else if (isNavigationAction(action)) {
      if (action.value?.action === GotoActionTypes.PageScreen) {
        return [
          i18next.t("content-editor:actions.navigation"),
          getElementName(structure, action.value?.gotoId),
        ];
      }
      return [i18next.t("content-editor:actions.navigation"), getGotoLabel(action.value?.action)];
    } else if (isGotoAction(action)) {
      return [
        i18next.t("content-editor:actions.goto"),
        getElementName(structure, action.value?.gotoId),
      ];
    } else if (isCloseOrExit(action)) {
      return [
        i18next.t("content-editor:actions.closeorexit"),
        getCloseOrExitLabel(action.value?.action),
      ];
    } else if (isVideoMarker(action)) {
      return [i18next.t("content-editor:actions.video_marker"), getVideoMarkerValue(action.value)];
    } else if (isAudioMaker(action)) {
      return [i18next.t("content-editor:actions.audio_marker"), getAudioMarkerValue(action.value)];
    }
  }

  return [];
}

export const SIMPLE_CONTENT_POPUP_ITEMS = [
  SCActionDisplayTypes.Full,
  SCActionDisplayTypes.Large,
  SCActionDisplayTypes.Medium,
  SCActionDisplayTypes.Small,
  "divider",
  SCActionDisplayTypes.PopoverSmall,
  SCActionDisplayTypes.PopoverMedium,
];

export const SIMPLE_CONTENT_FLAP_ITEMS = [
  SCActionDisplayTypes.LeftLarge,
  SCActionDisplayTypes.LeftMedium,
  SCActionDisplayTypes.LeftSmall,
  "divider",
  SCActionDisplayTypes.RightLarge,
  SCActionDisplayTypes.RightMedium,
  SCActionDisplayTypes.RightSmall,
  "divider",
  SCActionDisplayTypes.Top,
  SCActionDisplayTypes.Bottom,
];

export function getSimpleContentLabel(item: string) {
  switch (item) {
    case SCActionDisplayTypes.LeftLarge:
      return i18next.t("content-editor:popup_option.left_large");
    case SCActionDisplayTypes.LeftMedium:
      return i18next.t("content-editor:popup_option.left_medium");
    case SCActionDisplayTypes.LeftSmall:
      return i18next.t("content-editor:popup_option.left_small");
    case SCActionDisplayTypes.RightLarge:
      return i18next.t("content-editor:popup_option.right_large");
    case SCActionDisplayTypes.RightMedium:
      return i18next.t("content-editor:popup_option.right_medium");
    case SCActionDisplayTypes.RightSmall:
      return i18next.t("content-editor:popup_option.right_small");
    case SCActionDisplayTypes.Top:
      return i18next.t("content-editor:popup_option.top");
    case SCActionDisplayTypes.Bottom:
      return i18next.t("content-editor:popup_option.bottom");
    case SCActionDisplayTypes.Full:
      return i18next.t("content-editor:popup_option.full");
    case SCActionDisplayTypes.Large:
      return i18next.t("content-editor:popup_option.large");
    case SCActionDisplayTypes.Medium:
      return i18next.t("content-editor:popup_option.medium");
    case SCActionDisplayTypes.Small:
      return i18next.t("content-editor:popup_option.small");
    case SCActionDisplayTypes.PopoverSmall:
      return i18next.t("content-editor:popup_option.popover_small");
    case SCActionDisplayTypes.PopoverMedium:
      return i18next.t("content-editor:popup_option.popover_medium");
  }
}
