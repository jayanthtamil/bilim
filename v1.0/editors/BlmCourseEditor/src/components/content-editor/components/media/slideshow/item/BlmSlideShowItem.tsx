import React, {
  MouseEvent,
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLAttributes,
} from "react";
import clsx from "clsx";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaFile, CustomChangeEvent } from "types";
import {
  AcceptedFileTypes,
  ImageDisplayTypes,
  MediaBackgroundPosition,
  MediaPosition,
  Positions,
} from "editor-constants";
import { CoverOptionIcon, ContainOptionIcon, NoResizeOptionIcon } from "assets/icons";
import { BlmMediaPicker, MediaPickerChangeEvent } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import { BlmPosition } from "shared";
import "./styles.scss";

export interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "onChange"> {
  index: number;
  data?: MediaFile;
  option: string;
  position: MediaPosition;
  isLinked: boolean;
  selected: boolean;
  drag?: DraggableProvidedDragHandleProps;
  onChange?: (
    evnet:
      | MediaPickerChangeEvent
      | ChangeEvent<any>
      | CustomChangeEvent<MediaFile | MediaPosition | Positions | MediaBackgroundPosition>
  ) => void;
  onAdd?: (index: number) => void;
  onDuplicate?: (index: number) => void;
  onDelete?: (index: number) => void;
  onClick?: (index: number) => void;
}

const BlmSlideShowItem: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const {
    drag,
    index,
    data,
    option,
    position,
    isLinked,
    selected,
    className,
    onChange,
    onClick,
    onAdd,
    onDuplicate,
    onDelete,
    ...others
  } = props;
  const { element } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");

  const handleClick = (event: MouseEvent) => {
    if (!selected) {
      event.preventDefault();
      event.stopPropagation();

      if (onClick) {
        onClick(index);
      }
    }
  };

  const handleAddClick = (delta: number) => {
    if (onAdd) {
      onAdd(index + delta);
    }
  };

  const handleDuplicateClick = () => {
    if (onDuplicate) {
      onDuplicate(index);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(index);
    }
  };

  return (
    <div
      ref={ref}
      className={clsx("slideshow-item-wrapper", className, {
        selected,
      })}
      {...others}
    >
      <div className="slideshow-item-drag-btn" {...drag} />
      <div className="slideshow-item-duplicate-btn" onClick={handleDuplicateClick} />
      <div className="slideshow-item-delete-btn" onClick={handleDeleteClick} />
      <div className="slideshow-item-lbl" />
      <BlmMediaPicker
        name="media"
        elementId={element!.id}
        acceptedFiles={[AcceptedFileTypes.Image]}
        data={data}
        placeholder="Select media"
        isLinked={isLinked}
        className="media-picker-3"
        onChange={onChange}
        onClickCapture={handleClick}
      />
      <div className="slideshow-item-add-btn left" onClick={() => handleAddClick(0)} />
      <div className="slideshow-item-add-btn right" onClick={() => handleAddClick(1)} />
      <Select
        name="option"
        value={option}
        MenuProps={{
          className: "slideshow-item-option-dropdown-menu",
          disableRestoreFocus: true, //If It is false, BlmBackgroundEditor is not positioned to anchor element after choosing the item
        }}
        className="slideshow-item-option-dropdown"
        onChange={onChange}
      >
        <MenuItem value={ImageDisplayTypes.Cover}>
          <ListItemIcon>
            <CoverOptionIcon />
          </ListItemIcon>
          <ListItemText>{t("list.cover")}</ListItemText>
        </MenuItem>
        <MenuItem value={ImageDisplayTypes.Contain}>
          <ListItemIcon>
            <ContainOptionIcon />
          </ListItemIcon>
          <ListItemText>{t("list.contain")}</ListItemText>
        </MenuItem>
        <MenuItem value={ImageDisplayTypes.NoResize}>
          <ListItemIcon>
            <NoResizeOptionIcon />
          </ListItemIcon>
          <ListItemText>{t("list.no_resize")}</ListItemText>
        </MenuItem>
      </Select>
      <BlmPosition name="position" media="media-item" value={position} onChange={onChange} />
    </div>
  );
};

export default forwardRef(BlmSlideShowItem);
