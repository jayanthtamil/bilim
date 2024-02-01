import React, { ChangeEvent, Fragment, useMemo } from "react";
import clsx from "clsx";
import { FormControlLabel, MenuItem, Select, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CustomChangeEvent,
  MediaHotspotItem,
  MediaFile,
  MediaHotspot,
  ComponentAction,
  ActionStyle,
} from "types";
import { AcceptedFileTypes, Positions, StyleListTypes } from "editor-constants";
import { hasSameHotspotItemStyles, updateObject } from "utils";
import { BlmPosition } from "shared";
import { BlmMediaPicker } from "components/shared";
import { BlmRichTextEditor } from "components/component-editor";
import { useContentEditorCtx } from "components/content-editor/core";
import {
  applyHotspotActionStyles,
  applyHotspotItemStyles,
} from "components/content-editor/reducers";
import { BlmStylePicker } from "../../../styles";

import BlmActions, { BlmSwitchActions } from "../../../actions";

import "./styles.scss";


export interface HotspotItemProps {
  type?: "standard" | "panorama";
  data: MediaHotspot;
  item: MediaHotspotItem;
  isLinked?: boolean;
  onChange?: (data: MediaHotspot) => void;
}

const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function BlmHotspotItemProps(props: HotspotItemProps) {
  const { type = "standard", data, item, isLinked, onChange } = props;
  const { items, groups } = data;
  const {
    id,
    name,
    groupId,
    media,
    position,
    size,
    hasDark,
    style,
    clickAction,
    overAction,
  } = item;
  const { element } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");
  const isStandard = type === "standard";
  const styleType = isStandard
    ? element?.isSummary
      ? StyleListTypes.MediaHotspotItemSummary
      : StyleListTypes.MediaHotspotItem
    : StyleListTypes.MediaHotspotItem360;

  const showApplyIcon = useMemo(() => {
    return hasSameHotspotItemStyles(data);
  }, [data]);

  const updateChange = (newData: MediaHotspot) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (
    event:
      | ChangeEvent<any>
      | CustomChangeEvent<MediaFile | ComponentAction | Positions | string | undefined>
  ) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    let newData: MediaHotspot | undefined;

    if (
      name === "name" ||
      name === "groupId" ||
      name === "media" ||
      name === "style" ||
      name === "position" ||
      name === "size" ||
      name === "hasDark" ||
      name === "callToAction" ||
      name === "clickAction" ||
      name === "overAction"
    ) {
      newData = {
        ...data,
        items: updateObject(items, "id", id, { [name]: value }),
      };

      if (name === "style") {
        newData.style = value;
      }
    }

    if (newData) {
      updateChange(newData);
    }
  };

  const handleApplyClick = (style: string) => {
    const newData = applyHotspotItemStyles(data, style);

    updateChange(newData);
  };

  const handleActionApplyStyle = (event: CustomChangeEvent<ActionStyle>) => {
    const { name, value } = event.target;

    if (item && (name === "clickAction" || name === "overAction")) {
      const newData = applyHotspotActionStyles(data, value, item[name]);

      updateChange(newData);
    }
  };

  const handleSwitchClick = () => {
    if (item) {
      const newData = {
        ...data,
        items: updateObject(items, "id", id, {
          clickAction: overAction,
          overAction: clickAction,
        }),
      };

      updateChange(newData);
    }
  };

  return (
    <div className={clsx("hotspot-item-props-wrapper", type)}>
      <div className="hotspot-flex-cont1">
        <Select
          name="groupId"
          value={groupId || ""}
          displayEmpty
          disabled={!groups.enabled}
          className="hotspot-item-group-dropdown"
          onChange={handleChange}
        >
          <MenuItem value="">{t("hotspot.select_group")}</MenuItem>
          {groups.items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div className="hotspot-flex-cont2">
        <div className="hotspot-flex-inner-cont1">
          <BlmStylePicker
            type={styleType}
            name="style"
            value={style}
            label={t("hotspot.apply_hotspot")}
            showApplyIcon={showApplyIcon}
            onChange={handleChange}
            onApplyClick={handleApplyClick}
          />
        </div>
        <div className="hotspot-flex-inner-cont2">
          <div className="hotspot-cont2-contain">
            <div className="hotspot-cont2-item1">
              <BlmMediaPicker
                name="media"
                elementId={element!.id}
                acceptedFiles={[AcceptedFileTypes.Image]}
                data={media}
                isLinked={isLinked}
                className="hotspot-item-image-picker"
                onChange={handleChange}
              />
            </div>
            <div className="hotspot-cont2-item2">
              <div className="hotspot-cont2-item2-subitem">
                <div className="hotspot-cont2-item2-subitem1">
                  <div className="hotspot-item-size-lbl">{t("hotspot.size")}</div>
                </div>
                <div className="hotspot-cont2-item2-subitem2">
                  {isStandard && (
                    <Fragment>
                      <Select
                        name="size"
                        value={size}
                        className="hotspot-item-size-dropdown"
                        onChange={handleChange}
                      >
                        {SIZES.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
            <div className="hotspot-cont2-item3">
              <BlmPosition name="position" value={position} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="hotspot-flex-inner-cont3">
          <BlmRichTextEditor
            key={id}
            name="name"
            value={name}
            className="hotspot-item-name-txt"
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="hotspot-item-theme-box">
        <FormControlLabel
          name="hasDark"
          label={hasDark ? t("label.dark") : t("label.light")}
          control={<Switch className="switch-2" />}
          checked={hasDark}
          className="hotspot-item-dark-switch-ctrl"
          onChange={handleChange}
        />
      </div>
      <div className="hotspot-item-actions-wrapper">
        <div className="hotspot-item-actions-title">{t("label.action")}</div>
        <div className="hotspot-item-actions-lbl">
          {t("label.on")} <span className="hotspot-item-actions-bold-lbl">{t("label.click")}</span>
        </div>
        <div className="hotspot-item-actions-lbl">
          {t("label.on")}{" "}
          <span className="hotspot-item-actions-bold-lbl">{t("label.roll_over")}</span>
        </div>
        <BlmActions
          name="clickAction"
          data={clickAction}
          type={isStandard ? "hotspot" : "hotspot-360"}
          onChange={handleChange}
          onApplyStyle={handleActionApplyStyle}
        />
        <BlmSwitchActions
          left={clickAction}
          right={overAction}
          leftType={isStandard ? "hotspot" : "hotspot-360"}
          rightType={isStandard ? "hotspot-over" : "hotspot-360-over"}
          onClick={handleSwitchClick}
        />
        <BlmActions
          name="overAction"
          data={overAction}
          type={isStandard ? "hotspot-over" : "hotspot-360-over"}
          onChange={handleChange}
          onApplyStyle={handleActionApplyStyle}
        />
      </div>
    </div>
  );
}

export default BlmHotspotItemProps;
