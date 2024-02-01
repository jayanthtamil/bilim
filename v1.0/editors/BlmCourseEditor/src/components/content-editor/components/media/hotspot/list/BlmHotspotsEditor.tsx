import React, { ChangeEvent, MouseEvent, useState } from "react";
import clsx from "clsx";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { Checkbox, Drawer, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaHotspot, MediaHotspotItem } from "types";
import { findObject, reorderArray } from "utils";
import BlmHotspotCard from "./card";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  data: MediaHotspot;
  onSave?: (data: MediaHotspot) => void;
  onClose?: (event: MouseEvent) => void;
}

const getDraggableStyle = (draggableStyle: any) => ({
  userSelect: "none",
  ...draggableStyle,
});

function BlmHotspotsEditor(props: CompProps) {
  const { data, onSave, onClose, openConfirmDialog } = props;
  const [state, setState] = useState({ hotspot: data, isEdited: false });
  const { hotspot, isEdited } = state;
  const { prerequisite, items, groups } = hotspot;
  const { t } = useTranslation("content-editor");

  const saveChanges = () => {
    if (onSave) {
      onSave(hotspot);
    }
  };

  const updateChange = (newHotspot: MediaHotspot) => {
    setState({ hotspot: newHotspot, isEdited: true });
  };

  const getItemGroup = (item: MediaHotspotItem) => {
    const { groupId } = item;

    if (groupId && groups.enabled) {
      return findObject(groups.items, groupId, "id");
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newHotspot = { ...hotspot };

    if (name === "prerequisite") {
      newHotspot[name] = value;
    }

    updateChange(newHotspot);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newHotspot = {
      ...hotspot,
      items: reorderArray(items, result.source.index, result.destination.index),
    };

    updateChange(newHotspot);
  };

  const handleSave = (event: MouseEvent) => {
    if (isEdited) {
      saveChanges();
    }

    handleClose(event);
  };

  const openSaveConfirmDialog = () => {
    const onOk = (event: MouseEvent) => {
      handleSave(event);
    };
    const onCancel = (event: MouseEvent) => {
      handleClose(event);
    };
    const options = {
      className: "template-editor-warning-dialog",
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    openConfirmDialog(
      `${t("alert.cancel_confirm")}`,
      `${t("alert.save_all_changes")}`,
      onOk,
      onCancel,
      options
    );
  };

  const handleDrawerClose = (event: any) => {
    if (isEdited) {
      openSaveConfirmDialog();
    } else {
      handleClose(event);
    }
  };

  const handleClose = (event: MouseEvent) => {
    if (onClose) {
      onClose(event);
    }
  };

  return (
    <Drawer className="hotspots-editor-drawer" open={true} onClose={handleDrawerClose}>
      <div className="hotspots-editor-wrapper">
        <FormControlLabel
          name="prerequisite"
          label={t("hotspot.prerequisite_order")}
          control={<Checkbox className="checkbox-2" />}
          checked={prerequisite}
          className="hotspots-prerequisite-frm-lbl"
          onChange={handleChange}
        />
        <div className="hotspots-editor-title">{t("hotspot.hotspot_order")}</div>
        <div className="hotspots-editor-list-wrapper">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  className="hotspots-editor-list"
                  {...provided.droppableProps}
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(providedItem, snapshot) => {
                        return (
                          <BlmHotspotCard
                            ref={providedItem.innerRef}
                            key={item.id}
                            data={item}
                            group={getItemGroup(item)}
                            drag={providedItem.dragHandleProps}
                            style={getDraggableStyle(providedItem.draggableProps.style)}
                            className={clsx({ dragging: snapshot.isDragging })}
                            {...providedItem.draggableProps}
                          />
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="hotspots-editor-btn-wrapper">
          <div className="hotspots-editor-save-btn" onClick={handleSave}>
            {t("button.save")}
          </div>
          <div className="hotspots-editor-cancel-btn" onClick={handleClose}>
            {t("button.cancel")}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default BlmHotspotsEditor;
