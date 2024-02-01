import React, { ChangeEvent, Fragment, useEffect, useMemo, useState } from "react";
import { Checkbox, Drawer, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { ComponentAction, CustomChangeEvent, MediaFile, PopoverAction } from "types";
import {
  AcceptedFileTypes,
  ComponentActionTypes,
  Positions,
  StyleListTypes,
} from "editor-constants";
import {
  getHotspotActions,
  hasSameActionStyles,
  isMediaComponent,
  isMediaHotspot,
  isMediaHotspot360,
  validatePopoverAction,
} from "utils";
import { BlmPosition } from "shared";
import { BlmMediaPicker } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { useHotspot360Context } from "../../../media/hotspot/360";
import { BlmStylePicker } from "../../../styles";
import BlmActions from "../../main";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  data?: PopoverAction;
  onSave?: (data: PopoverAction) => void;
  onApplyStyle?: (style: string) => void;
  onClose?: () => void;
}

interface EditorState {
  popover?: PopoverAction;
  appliedStyle?: string;
  isEdited: boolean;
}

function BlmPopoverActionEditor(props: CompProps) {
  const { data, stylePopoverConfig, onSave, onApplyStyle, onClose, openConfirmDialog, openDialog } =
    props;
  const [state, setState] = useState<EditorState>({ popover: data, isEdited: false });
  const { element, component, template } = useContentEditorCtx();
  const { selectedId } = useHotspot360Context();
  const { popover, appliedStyle, isEdited } = state;
  const { classNames } = stylePopoverConfig || {};
  const { media, title, description, style, position = Positions.Top, button } = popover || {};
  const { checked = false, label, action } = button || {};
  const currentStyle = classNames && (style && classNames.includes(style) ? style : classNames[0]);
  const { t } = useTranslation("content-editor");

  const hotspot = useMemo(() => {
    if (component && isMediaComponent(component)) {
      if (isMediaHotspot(component)) {
        return component.value;
      } else if (selectedId && isMediaHotspot360(component)) {
        return component.value.items.find((item) => item.id === selectedId);
      }
    }
  }, [component, selectedId]);

  const actions = useMemo(() => {
    if (hotspot) {
      const arr = getHotspotActions<PopoverAction>(hotspot, ComponentActionTypes.Popover);

      return arr.filter((item) => item.value !== data);
    }

    return [];
  }, [hotspot, data]);

  const isLinked = useMemo(() => {
    if (component && data && isMediaComponent(component) && isMediaHotspot360(component)) {
      return (
        component.value.items.findIndex((item) => {
          const actions = getHotspotActions<PopoverAction>(item, ComponentActionTypes.Popover);

          return (
            actions.findIndex((action) => {
              return action.value !== data && action.value.media?.id === data.media?.id;
            }) !== -1
          );
        }) !== -1
      );
    }

    return false;
  }, [component, data]);

  const showApplyIcon = useMemo(() => {
    return appliedStyle
      ? appliedStyle === currentStyle
      : Boolean(currentStyle && hasSameActionStyles(actions, currentStyle));
  }, [actions, currentStyle, appliedStyle]);

  useEffect(() => {
    setState({ popover: data, isEdited: false });
  }, [data]);

  const saveChanges = () => {
    if (onSave && popover) {
      onSave(popover);
    }

    if (onApplyStyle && appliedStyle) {
      onApplyStyle(appliedStyle);
    }

    setState({ popover, isEdited: false });
  };

  const updateChange = (newPopover: PopoverAction) => {
    setState({ popover: newPopover, appliedStyle, isEdited: true });
  };

  const validateData = (callback: Function) => {
    if (template && (!popover || isEdited)) {
      try {
        validatePopoverAction(popover, template);
      } catch (error) {
        openDialog(`${t("alert.warning")}`, (error as Error).message);
        return;
      }
    }

    callback();
  };

  const handleChange = (
    event:
      | ChangeEvent<any>
      | CustomChangeEvent<MediaFile | Positions | ComponentAction | string | undefined>
  ) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newPopover = {
      media,
      title,
      description,
      style: currentStyle,
      position,
      button: { checked, label, action },
    };

    if (
      name === "media" ||
      name === "title" ||
      name === "description" ||
      name === "style" ||
      name === "position"
    ) {
      newPopover[name] = value;
    } else if (name === "checked" || name === "label" || name === "action") {
      (newPopover.button[name] as any) = value;
    }

    updateChange(newPopover);
  };

  const handleApplyClick = (style: string) => {
    if (!showApplyIcon && actions.length > 0) {
      setState({
        popover: { ...popover, style },
        appliedStyle: style,
        isEdited: true,
      });
    }
  };

  const openSaveConfirmDialog = () => {
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog(
      `${t("alert.cancel_confirm")}`,
      `${t("alert.save_all_changes")}`,
      handleSave,
      handleClose,
      options
    );
  };

  const handleDrawerClose = (event: any) => {
    if (isEdited) {
      openSaveConfirmDialog();
    } else {
      handleClose();
    }
  };

  const handleSave = () => {
    validateData(() => {
      if (isEdited) {
        saveChanges();
      }
      handleClose();
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Drawer open={true} className="popover-action-editor-drawer" onClose={handleDrawerClose}>
      <div className="popover-action-editor-wrapper">
        <div className="popover-header-wrapper">
          <div className="popover-title-lbl">{t("popup_option.popover_options")}</div>
          <div className="popover-close-btn" onClick={handleSave} />
        </div>
        <div className="popover-content-wrapper">
          <BlmMediaPicker
            name="media"
            elementId={element!.id}
            data={media}
            isLinked={isLinked}
            acceptedFiles={[AcceptedFileTypes.Image]}
            placeholder="Select media"
            className="media-picker-3"
            onChange={handleChange}
          />
          <input
            type="text"
            name="title"
            value={title || ""}
            placeholder={t("label.title")}
            className="popover-title-txt"
            onChange={handleChange}
          />
          <textarea
            name="description"
            value={description || ""}
            placeholder={t("label.description")}
            className="popover-description-txt"
            onChange={handleChange}
          />
          <BlmStylePicker
            type={StyleListTypes.MediaHotspotPopover}
            name="style"
            value={currentStyle}
            label={t("popup_option.apply_popover")}
            showApplyIcon={showApplyIcon}
            onChange={handleChange}
            onApplyClick={handleApplyClick}
          />
          <BlmPosition type="limited" name="position" value={position} onChange={handleChange} />
          <span className="popover-action-position-lbl">{t("label.position")}</span>
          <FormControlLabel
            name="checked"
            label={t("label.action")}
            control={<Checkbox className="checkbox-2" />}
            checked={checked}
            className="popover-action-frm-lbl"
            onChange={handleChange}
          />
          {checked && (
            <Fragment>
              <input
                type="text"
                name="label"
                value={label || ""}
                placeholder={t("popup_option.button_label")}
                className="popover-action-lbl-txt"
                onChange={handleChange}
              />
              <BlmActions
                type="hotspot-popover"
                name="action"
                data={action}
                onChange={handleChange}
              />
            </Fragment>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default BlmPopoverActionEditor;
