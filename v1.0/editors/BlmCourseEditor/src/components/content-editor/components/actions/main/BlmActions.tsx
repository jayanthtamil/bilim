import React, { ChangeEvent, useMemo } from "react";
import { Select, MenuItem, Divider } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  ActionStyle,
  ComponentAction,
  ComponentActionValues,
  ContentTemplateAction,
  CustomChangeEvent,
  GotoAction,
} from "types";
import { ComponentActionTypes, ElementType, StyleListTypes } from "editor-constants";
import {
  isDocumentAction,
  isLinkAction,
  isSimpleContentAction,
  isReplaceBackgroundAction,
  isReplaceTargetAction,
  isNavigationAction,
  isPopoverAction,
  isTooltipAction,
  isMediaLayerAction,
  isMailAction,
  isGoto360Action,
  isGotoAction,
  isCloseOrExit,
  isVideoMarker,
  isAudioMaker,
} from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { getDefaultComponentStyle } from "components/content-editor/reducers";
import BlmSimpleContentAction from "../simple-content";
import BlmLinkAction from "../link";
import BlmMailAction from "../mail";
import BlmDocumentAction from "../document";
import BlmReplaceBackgroundAction from "../replace-background";
import BlmReplaceTargetAction from "../replace-target";
// import BlmGotoAction from "../goto";
import BlmTooltipAction from "../tooltip";
import BlmPopoverAction from "../popover";
import BlmMediaLayerAction from "../media-layer";
import BlmGoto360Action from "../goto-360";
import { getActionItems } from "../utils";
import "./styles.scss";
import BlmNavigationAction from "../navigation/BlmNavigationAction";
import BlmButtonActionGoto from "../newgoto";
import BlmCloseOrExit from "../closeandexit/BlmCloseOrExit";
import BlmVideoMarkerAction from "./videomarker";
import BlmAudioMarkerAction from "./audiomarker";

export interface CompProps {
  name: string;
  data?: ComponentAction;
  type?:
    | "over"
    | "slideshow"
    | "hotspot"
    | "hotspot-over"
    | "hotspot-360"
    | "hotspot-360-over"
    | "hotspot-popover";
  onChange?: (event: CustomChangeEvent<ComponentAction>) => void;
  onApplyStyle?: (event: CustomChangeEvent<ActionStyle>) => void;
  temp?: ContentTemplateAction | undefined;
}

function BlmActions(props: CompProps) {
  const { name, data, type, temp, onChange, onApplyStyle } = props;
  const { action = ComponentActionTypes.None } = data || {};
  const { element } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");

  const items = useMemo(() => {
    const arr = getActionItems(type, true);

    return arr.map((item, ind) => {
      if (typeof item !== "string") {
        return (
          <MenuItem key={ind} value={item.type}>
            {t(item.key)}
          </MenuItem>
        );
      } else if (item === "divider") {
        return <Divider key={ind} />;
      } else {
        return (
          <div key={ind} className="actions-dropdown-divider-title">
            {item}
          </div>
        );
      }
    });
  }, [type, t]);

  const updateChange = (newData: ComponentAction) => {
    if (onChange) {
      onChange({ target: { name, value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<ComponentActionValues>) => {
    const { name, value } = event.target;
    const newData: ComponentAction = { action, ...data };

    if (name === "action") {
      newData.action = value;

      if (newData.action === ComponentActionTypes.Tooltip) {
        newData.value = { style: getDefaultComponentStyle(StyleListTypes.MediaHotspotTooltip) };
      }
    } else if (
      name === "simpleContent" ||
      name === "document" ||
      name === "link" ||
      name === "mail" ||
      name === "replaceBackground" ||
      name === "target" ||
      name === "goto" ||
      name === "tooltip" ||
      name === "popover" ||
      name === "mediaLayer" ||
      name === "goto360" ||
      name === "closeexit" ||
      name === "videomarker" ||
      name === "audiomarker"
    ) {
      newData.value = value;
    }
    if (newData.action === "target" && newData.value === undefined) {
      newData.value = {
        restore: true,
      };
    } else if (newData.action === "replacebackground" && newData.value === undefined) {
      newData.value = {
        restore: true,
      };
    }
    updateChange(newData);
  };

  const handleApplyStyle = (event: CustomChangeEvent<string>) => {
    const target = event.target;

    if (onApplyStyle) {
      onApplyStyle({ target: { name, value: { name: target.name, style: target.value } } });
    }
  };

  const renderChildern = () => {
    if (!data) {
      return undefined;
    } else if (isSimpleContentAction(data)) {
      return (
        <BlmSimpleContentAction
          data={data.value}
          type={type === "hotspot" || type === "hotspot-popover" ? "limited" : "standard"}
          onChange={handleChange}
        />
      );
    } else if (isDocumentAction(data)) {
      return <BlmDocumentAction data={data.value} onChange={handleChange} />;
    } else if (isLinkAction(data)) {
      return <BlmLinkAction data={data.value} onChange={handleChange} />;
    } else if (isMailAction(data)) {
      return <BlmMailAction data={data.value} onChange={handleChange} />;
    } else if (isReplaceBackgroundAction(data)) {
      return <BlmReplaceBackgroundAction data={data.value} name={name} onChange={handleChange} />;
    } else if (isReplaceTargetAction(data)) {
      return <BlmReplaceTargetAction data={data.value} name={name} onChange={handleChange} />;
    } else if (isGotoAction(data)) {
      return <BlmButtonActionGoto data={data.value} onChange={handleChange} />;
    } else if (isTooltipAction(data)) {
      return (
        <BlmTooltipAction
          data={data.value}
          onChange={handleChange}
          onApplyStyle={handleApplyStyle}
        />
      );
    } else if (isPopoverAction(data)) {
      return (
        <BlmPopoverAction
          data={data.value}
          onChange={handleChange}
          onApplyStyle={handleApplyStyle}
        />
      );
    } else if (isMediaLayerAction(data)) {
      return <BlmMediaLayerAction data={data.value} onChange={handleChange} />;
    } else if (isGoto360Action(data)) {
      return <BlmGoto360Action data={data.value} onChange={handleChange} />;
    } else if (isNavigationAction(data)) {
      return (
        <BlmNavigationAction
          data={data.value as GotoAction}
          showNavigation={type !== "hotspot" && type !== "hotspot-popover"}
          showPage={
            element?.type === ElementType.PartPage || element?.type === ElementType.SimplePartPage
          }
          showRedoEval={
            element?.parent?.type === ElementType.Feedback &&
            element?.type === ElementType.SimpleContent
          }
          onChange={handleChange}
        />
      );
    } else if (isCloseOrExit(data)) {
      return <BlmCloseOrExit data={data.value} onChange={handleChange} />;
    } else if (isVideoMarker(data)) {
      return (
        <BlmVideoMarkerAction
          data={data.value}
          onChange={handleChange}
          name="video"
          action="videomarker"
        />
      );
    } else if (isAudioMaker(data)) {
      return (
        <BlmAudioMarkerAction
          data={data.value}
          onChange={handleChange}
          name="audio"
          action="audiomarker"
          temp={temp}
        />
      );
    }
  };

  return (
    <div className="component-actions-wrapper">
      <Select
        name="action"
        value={action}
        MenuProps={{
          className: "actions-dropdown-menu",
        }}
        className="actions-dropdown"
        onChange={handleChange}
      >
        {items}
      </Select>
      {renderChildern()}
    </div>
  );
}

export default BlmActions;
