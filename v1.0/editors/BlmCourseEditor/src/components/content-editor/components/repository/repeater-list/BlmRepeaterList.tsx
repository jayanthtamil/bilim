import React, { Fragment, FunctionComponent, MouseEvent, useState } from "react";
import clsx from "clsx";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";

import { ButtonComponent, MediaComponent, RepeaterComponent, SoundComponent } from "types";
import {
  reorderArray,
  isButtonComponent,
  isMediaComponent,
  isSoundComponent,
  isMediaRepeater,
  isButtonRepeater,
  isSoundRepeater,
  createUUID,
  addObject,
  mediaDuplicateID,
  buttonDuplicateID,
  soundDuplicateID,
} from "utils";
import {
  createButtonComponent,
  createMediaComponent,
  createSoundComponent,
  updateCreatedMediaComponet,
} from "template-builders";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateRepeaterComponent } from "components/content-editor/reducers";
import BlmMediaCard from "../media-card";
import BlmButtonCard from "../button-card";
import BlmSoundCard from "../sound-card";
import { ComponentTypes, MediaVariants, StyleListTypes } from "editor-constants";
import BlmRepeaterOptionsEditor from "./options";
import "./styles.scss";
import { updateCreatedButtonComponent } from "template-builders/core";
import { ContainerProps } from "./container";

export interface CompProps {
  data: RepeaterComponent;
  startIndex: number;
}

const getDraggableStyle = (draggableStyle: any) => ({
  userSelect: "none",
  ...draggableStyle,
});

const BlmRepeaterList: FunctionComponent<CompProps & ContainerProps> = (props) => {
  const { data, startIndex, duplicateImageTemplate } = props;
  const { allowComponent, value = [], minimum, maximum, options } = data;
    const {
    component: selectedComponent,
    selectComponent,
    dispatch,
    element,
  } = useContentEditorCtx();
  const [open, setOpen] = useState(false);
  const len = value.length;
  const isAddable = len < maximum;
  const isDeletable = len > minimum;
  const isMediaDuplicate = minimum === 1;
  const updateChange = (newData: RepeaterComponent) => {
    if (dispatch) {
      dispatch(updateRepeaterComponent(newData));
    }
  };

  const handleClick = (data: MediaComponent | ButtonComponent | SoundComponent) => {
    if (selectComponent) {
      selectComponent(data);
    }
  };

  const handleAddClick = (event: MouseEvent) => {
    if (!isAddable) {
      return;
    }

    const newData = { ...data };

    if (isMediaRepeater(data)) {
      const component = createMediaComponent(data);
      updateCreatedMediaComponet(data, component);
      newData.value = [...value, component] as MediaComponent[];
    } else if (isButtonRepeater(data)) {
      const component = createButtonComponent(data);
      updateCreatedButtonComponent(data, component);
      newData.value = [...value, component] as ButtonComponent[];
    } else if (isSoundRepeater(data)) {
      const component = createSoundComponent(data);

      newData.value = [...value, component] as SoundComponent[];
    }

    updateChange(newData);
  };

  const handleEditClick = () => {
    if (options) {
      setOpen(true);
    }
  };

  const handleDeleteClick = (deleted: MediaComponent | ButtonComponent | SoundComponent) => {
    const newData = { ...data };

    newData.value = value.filter((component) => component.id !== deleted.id);

    updateChange(newData);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const newData = {
      ...data,
      value: reorderArray(value, result.source.index, result.destination.index),
    };

    updateChange(newData);
  };

  const handleEditorSave = (newData: RepeaterComponent) => {
    updateChange(newData);
  };

  const handleEditorClose = () => {
    setOpen(false);
  };

  const DuplicateNewId = async (val: any, index: number) => {
    if (element && (index || index === 0) && val) {
      let value;
      var result;
      if (val.type === "media") {
        result = mediaDuplicateID(val, element);
      } else if (val.type === "button") {
        result = buttonDuplicateID(val, element);
      } else if (val.type === "audio") {
        result = soundDuplicateID(val, element);
      }
      await duplicateImageTemplate(result).then((res) => {
        value = { ...res.payload?.media };
      });
      return value;
    }
  };

  const DuplicateMedia = async (val: any, index: number) => {
    let newData = { ...data };
    if (newData.value) {
      if (val && val.variant === MediaVariants.Button) {
          let res: any = await DuplicateNewId(val, index);
          let values = {
            ...res,
          };
          return { ...newData?.value[index]?.value, ...values };
      } else if (val && val.variant === MediaVariants.Image) {
          let res: any = await DuplicateNewId(val, index);
          let values = {
            ...newData.value[index].value,
            media: res[0],
          };
          return { ...values };
      } else if (val && val.variant === MediaVariants.FlipCard) {
          let res: any = await DuplicateNewId(val, index);
          let New: any = newData?.value[index]?.value;
          let recto = { ...New?.recto, ...res?.recto, icon: res?.recto_icon };
          let verso = { ...New?.verso, ...res?.verso, icon: res?.verso_icon };
          let clickAction = {
            action: res?.clickAction?.action,
            value: { ...New?.clickAction?.value, ...res?.clickAction?.value },
          };
          let overAction = {
            action: res?.overAction?.action,
            value: { ...New?.overAction?.value, ...res?.overAction?.value },
          };

          return {
            ...newData?.value[index]?.value,
            overAction: overAction,
            clickAction: clickAction,
            recto: recto,
            verso: verso,
          };
      }
    }
  };

  const DuplicateButton = async (index: number) => {
    let newData = { ...data };
    if (newData.value) {
      let res: any = await DuplicateNewId(newData?.value[index], index);
      let New: any = newData?.value[index]?.value;

      let clickAction = {
        action: res?.clickAction?.action,
        value: { ...New?.clickAction?.value, ...res?.clickAction?.value },
      };
      let overAction = {
        action: res?.overAction?.action,
        value: { ...New?.overAction?.value, ...res?.overAction?.value },
      };
      let inline = {
        ...New?.inline,
        ...res?.icon,
      };

      return {
        ...newData?.value[index]?.value,
        overAction: overAction,
        clickAction: clickAction,
        inline: inline,
      };
    }
  };

  const DuplicateSound = async (index: number) => {
    let newData = { ...data };

    if (newData.value) {
      let New = newData?.value[index]?.value;
      let res: any = await DuplicateNewId(newData?.value[index], index);

      return {
        ...New,
        image: res?.thumbnail,
        media: {
          ...res?.[0],
          marker: res?.marker,
          subtitle: res?.subtitle,
        },
      };
    }
  };

  const handleDuplicateClick = async (index: number) => {
    let newData = { ...data };
    if (newData.value && (index || index === 0)) {
      const item = newData?.value[index];
      const newItem = { ...item, id: createUUID(), isEdited: true };
      newData.value = addObject(newData?.value, newItem, index + 1);
      if (element && (index || index === 0) && newData.value) {
        let val: any = newData?.value[index];
        if (val.type === ComponentTypes.Media) {
          let res = await DuplicateMedia(val, index);
          newData.value[index + 1].value = res;
        } else if (
          val.type === ComponentTypes.Button &&
          (val.value?.inline?.id ||
            val.value?.clickAction?.value?.background?.id ||
            val.value?.overAction?.value?.background?.id)
        ) {
          let res = await DuplicateButton(index);
          newData.value[index + 1].value = res;
        } else if (
          val.type === ComponentTypes.Sound &&
          (val?.value?.media?.id ||
            val?.value?.image?.id ||
            val?.value?.media?.subtitle?.id ||
            val?.value?.media?.marker?.id)
        ) {
          let res = await DuplicateSound(index);
          newData.value[index + 1].value = res;
        }
      }
    }
    updateChange(newData);
  };

  const renderList = () => {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div ref={provided.innerRef} className="repeater-list" {...provided.droppableProps}>
              {value.map((component, index) => {
                if (component.id) {
                  return (
                    <Draggable key={component.id} draggableId={component.id} index={index}>
                      {(providedItem, snapshot) => {
                        const cardProps = {
                          ref: providedItem.innerRef,
                          key: component.id,
                          isSelected: selectedComponent === component,
                          isDeletable,
                          isMediaDuplicate,
                          drag: providedItem.dragHandleProps,
                          ...providedItem.draggableProps,
                          style: getDraggableStyle(providedItem.draggableProps.style),
                          className: clsx(allowComponent, {
                            dragging: snapshot.isDragging,
                          }),
                          onClick: handleClick,
                          onDelete: handleDeleteClick,
                          index: index,
                          onDuplicate: handleDuplicateClick,
                        };

                        if (isMediaComponent(component)) {
                          return (
                            <BlmMediaCard
                              data={component}
                              order={startIndex + index + 1}
                              {...cardProps}
                            />
                          );
                        } else if (isButtonComponent(component)) {
                          return (
                            <BlmButtonCard
                              data={component}
                              {...cardProps}
                              type={StyleListTypes.Button}
                            />
                          );
                        } else if (isSoundComponent(component)) {
                          return <BlmSoundCard data={component} {...cardProps} />;
                        } else {
                          return <Fragment />;
                        }
                      }}
                    </Draggable>
                  );
                } else {
                  return null;
                }
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  return (
    <div
      className={clsx("repeater-list-wrapper", allowComponent, {
        "has-children": len > 0,
        "has-options": options,
      })}
    >
            {renderList()}
      <div
        className={clsx("repeater-add-btn", { disabled: !isAddable })}
        onClick={handleAddClick}
      />
      <div className="repeater-edit-btn" onClick={handleEditClick} />
      {open && (
        <BlmRepeaterOptionsEditor
          data={data}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      )}
    </div>
  );
};

export default BlmRepeaterList;
