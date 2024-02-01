import React, {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLAttributes,
  MouseEvent,
  useLayoutEffect,
  Fragment,
} from "react";
import clsx from "clsx";
import clamp from "lodash/clamp";
import { MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaTrackCue } from "types";
import { MediaCueActions, MediaCuePositions, MediaTrackTypes } from "editor-constants";
import { BlmAutoTextAraa } from "shared";
import BlmStructureSelect from "components/structures/select";
import BlmSynchroActionItem from "../action-item";
import "./styles.scss";

export interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "onClick"> {
  type: MediaTrackTypes;
  data: MediaTrackCue;
  index: number;
  maxTime: number;
  selected?: boolean;
  invalid?: boolean;
  elementId?: string;
  measure?: () => void;
  onClick?: (data: MediaTrackCue) => void;
  onChange?: (data: MediaTrackCue, index: number) => void;
  onDelete?: (data: MediaTrackCue) => void;
}

const BlmCueListItem: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const {
    type,
    data,
    index,
    maxTime,
    selected = false,
    invalid = false,
    className,
    elementId,
    measure,
    onClick,
    onChange,
    onDelete,
    ...others
  } = props;
  const { position, content, action } = data;
  const text = unescape(data.text);
  const { t } = useTranslation("shared");

  useLayoutEffect(() => {
    if (measure) {
      measure();
    }
  }, [text, measure]);

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<string>) => {
    const { name, value } = event.target;
    const newData = { ...data, [name]: value };

    if (name === "action" && value === MediaCueActions.ScrollVPauseC) {
      const endTime = isNaN(newData.endTime) ? newData.startTime + 2 : newData.endTime;

      newData.endTime = clamp(endTime, newData.startTime + 0.1, maxTime - 0.1);
    }

    if (onChange) {
      onChange(newData, index);
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (onDelete) {
      onDelete(data);
    }
  };

  const renderChildren = () => {
    if (type === MediaTrackTypes.Subtitles || type === MediaTrackTypes.Labels) {
      return (
        <Fragment>
          <BlmAutoTextAraa
            name="text"
            maxLength={200}
            spellCheck={false}
            value={text}
            className="cue-item-txt"
            onChange={handleChange}
          />
          {type === MediaTrackTypes.Labels && (
            <Select
              name="position"
              value={position}
              MenuProps={{
                disableRestoreFocus: true,
                autoFocus: false,
                className: "cue-item-position-menu",
              }}
              className={clsx("cue-item-position-dropdown", position)}
              onMouseDown={handleMouseDown}
              onChange={handleChange}
            >
              <MenuItem value={MediaCuePositions.TopLeft} className={MediaCuePositions.TopLeft} />
              <MenuItem
                value={MediaCuePositions.BottomLeft}
                className={MediaCuePositions.BottomLeft}
              />
              <MenuItem value={MediaCuePositions.TopRight} className={MediaCuePositions.TopRight} />
              <MenuItem
                value={MediaCuePositions.BottomRight}
                className={MediaCuePositions.BottomRight}
              />
            </Select>
          )}
        </Fragment>
      );
    } else if (type === MediaTrackTypes.Markers) {
      return (
        <input
          type="text"
          name="text"
          value={text}
          className="cue-item-txt"
          onChange={handleChange}
        />
      );
    } else if (type === MediaTrackTypes.Contents) {
      return (
        <Fragment>
          <BlmStructureSelect
            name="content"
            value={content}
            placeholder={t("cue_list.simple_content")}
            structures={{ show: false }}
            element={elementId}
            className="structure-select-with-icons"
            onChange={handleChange}
          />
          <Select
            name="action"
            value={action}
            MenuProps={{
              disableRestoreFocus: true,
              autoFocus: false,
              className: "cue-item-action-menu",
            }}
            className="cue-item-action-dropdown"
            renderValue={(value: any) => (
              <BlmSynchroActionItem value={value} data={data} className="Mui-selected" />
            )}
            onMouseDown={handleMouseDown}
            onChange={handleChange}
          >
            <BlmSynchroActionItem value={MediaCueActions.ScrollVScrollC} data={data} />
            <BlmSynchroActionItem value={MediaCueActions.PauseVScrollC} data={data} />
            <BlmSynchroActionItem value={MediaCueActions.ScrollVPauseC} data={data} />
          </Select>
        </Fragment>
      );
    }
  };

  return (
    <div
      ref={ref}
      className={clsx("cue-item-wrapper", type, className, {
        selected,
        invalid,
      })}
      {...others}
    >
      <div className="cue-item-txt-wrapper" onClick={handleClick}>
        {renderChildren()}
        <div className="cue-item-delete-btn" onClick={handleDeleteClick} />
      </div>
    </div>
  );
};

export default forwardRef(BlmCueListItem);
