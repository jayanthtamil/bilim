import React, { MouseEvent, useState } from "react";
import clsx from "clsx";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { Drawer } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaHotspot, MediaHotspotGroupItem, MediaHotspotGroups } from "types";
import { StyleListTypes } from "editor-constants";
import {
  createShortUUID,
  getRandomColor,
  removeObject,
  reorderArray,
  updateObject,
  validateHotspotGroups,
} from "utils";
import { BlmStylePicker } from "../../../styles";
import BlmHotspotGroupCard from "./card";
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

function BlmHotspotGroupsEditor(props: CompProps) {
  const { data, onSave, onClose, openDialog, openConfirmDialog } = props;
  const [state, setState] = useState({ hotspot: data, isEdited: false });
  const { hotspot, isEdited } = state;
  const { groups } = hotspot;
  const { items, style } = groups;
  const { t } = useTranslation("content-editor");

  const validateGroups = (callback: Function) => {
    try {
      validateHotspotGroups(groups);
    } catch (error) {
      if (openDialog) {
        openDialog(`${t("alert.warning")}`, (error as Error).message);
      }
      return;
    }

    callback();
  };

  const saveChanges = () => {
    if (onSave) {
      onSave(hotspot);
    }
  };

  const updateChange = (newGroups: MediaHotspotGroups) => {
    setState({ hotspot: { ...hotspot, groups: newGroups }, isEdited: true });
  };

  const updateItems = (newItems: MediaHotspotGroupItem[]) => {
    updateChange({ ...groups, items: newItems });
  };

  const handleChange = (event: CustomChangeEvent<string>) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.value;
    const newGroups = { ...groups };

    if (name === "style") {
      newGroups[name] = value;
    }

    updateChange(newGroups);
  };

  const handleItemChange = (item: MediaHotspotGroupItem) => {
    const newItems = updateObject(items, "id", item.id, item);

    updateItems(newItems);
  };

  const handleItemDelete = (item: MediaHotspotGroupItem) => {
    const newItems = removeObject(items, item);

    updateItems(newItems);
  };

  const handleAddClick = () => {
    const id = createShortUUID();
    const name = `Group ${items.length + 1}`;
    const color = getRandomColor();
    const item = new MediaHotspotGroupItem(id, name, color);

    updateItems([...items, item]);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newItems = reorderArray(items, result.source.index, result.destination.index);

    updateItems(newItems);
  };

  const handleSave = (event: MouseEvent) => {
    validateGroups(() => {
      if (isEdited) {
        saveChanges();
      }

      handleClose(event);
    });
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
    <Drawer className="hotspot-groups-editor-drawer" open={true} onClose={handleDrawerClose}>
      <div className="hotspot-groups-editor-wrapper">
        <div className="hotspot-groups-title">{t("hotspot.group_list")}</div>
        <div className="hotspot-groups-style-title">{t("title.style")}</div>
        <div className="hotspot-groups-list-wrapper">
          <div className="hotspot-groups-list-scroller">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    className="hotspot-groups-list"
                    {...provided.droppableProps}
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(providedItem, snapshot) => {
                          return (
                            <BlmHotspotGroupCard
                              ref={providedItem.innerRef}
                              key={item.id}
                              data={item}
                              showDelete={items.length > 2}
                              drag={providedItem.dragHandleProps}
                              style={getDraggableStyle(providedItem.draggableProps.style)}
                              className={clsx({ dragging: snapshot.isDragging })}
                              onChange={handleItemChange}
                              onDelete={handleItemDelete}
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
          <div className="hotspot-groups-add-btn" onClick={handleAddClick} />
        </div>
        <BlmStylePicker
          type={StyleListTypes.MediaHotspotGroup}
          name="style"
          value={style}
          showApplyStyle={false}
          onChange={handleChange}
        />
        <div className="hotspot-groups-save-btn" onClick={handleSave}>
          {t("button.save")}
        </div>
        <div className="hotspot-groups-cancel-btn" onClick={handleClose}>
          {t("button.cancel")}
        </div>
      </div>
    </Drawer>
  );
}

export default BlmHotspotGroupsEditor;
