import React, { ChangeEvent, useMemo, useState } from "react";
import clsx from "clsx";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";

import {
  ComponentAction,
  ComponentStyle,
  CustomChangeEvent,
  MediaComponent,
  MediaFile,
  MediaSlideshow,
  MediaSlideshowItem,
} from "types";
import { StyleListTypes, Positions, MediaPosition } from "editor-constants";
import {
  addObject,
  createUUID,
  findObject,
  getMediaSlideshow,
  removeObject,
  updateObject,
  validateAction,
  reorderArray,
} from "utils";
import { BlmHorizontalList } from "shared";
import { BlmRichTextEditor } from "components/component-editor";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmActions from "../../actions";
import { BlmStyleList, BlmStyleTintPicker } from "../../styles";
import BlmMediaDashboard from "../dashboard";
import BlmSlideShowItem from "./item";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
}
const DEFAULT_ITEM = new MediaSlideshowItem();
const DEFAULT_ITEMS = [DEFAULT_ITEM];

DEFAULT_ITEM.id = createUUID();

function createMediaMap(items: MediaSlideshowItem[]) {
  return items.reduce((map: { [key: string]: number }, item) => {
    const { media } = item;

    if (media) {
      const { id } = media;

      map[media.id] = (map[id] || 0) + 1;
    }

    return map;
  }, {});
}

function BlmMediaSlideshow(props: CompProps) {
  const { data } = props;
  const state = useMemo(() => getMediaSlideshow(data), [data]);
  const { template, openDialog, dispatch } = useContentEditorCtx();
  const { value: slideshow, hasApplyStyle } = state;
  const { items: slides, style, slideStyle } = slideshow;
  const items = slides && slides.length ? slides : DEFAULT_ITEMS;
  const [selectedId, setSelectedId] = useState(items[0].id);
  const selectedItem = useMemo(
    () => (selectedId && findObject(items, selectedId, "id")) || items[0],
    [items, selectedId]
  );
  const { title, description, caption, clickAction } = selectedItem;
  const mediaMap = useMemo(() => createMediaMap(items), [items]);
  const { t } = useTranslation("content-editor");

  if (slides && slideshow) {
    let item;
    slideshow.items.map((x, i) => {
    if (x.media !== undefined) {
    item = x.media;
    }
    return true;
    });
    if (item === undefined) {
    slideshow.slideStyle.bgTint = undefined;
    slideshow.slideStyle.tint = undefined;
    }
    
    }

  const updateChange = (newSlideshow: MediaSlideshow) => {
    const newData = { ...state, value: newSlideshow };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const updateItems = (newItems: MediaSlideshowItem[]) => {
    const newSlideshow = { ...slideshow, items: newItems };

    updateChange(newSlideshow);
  };

  const validateItem = (item: MediaSlideshowItem, callback: Function) => {
    try {
      validateAction(item.clickAction, template!);
    } catch (error) {
      if (openDialog) {
        openDialog(`${t("alert.warning")}`, (error as Error).message);
      }
      return;
    }

    callback();
  };

  const updateSelectedId = (index: number) => {
    const item = items[index];

    if (item?.id) {
      setSelectedId(item.id);
    }
  };

  const handleChange = (
    event:
      | ChangeEvent<any>
      | CustomChangeEvent<
          | MediaFile
          | ComponentAction
          | MediaPosition
          | Positions
          | ComponentStyle
          | string
          | undefined
        >
  ) => {
    const {
      name,
      value,
    }: {
      name: string;
      value: any;
    } = event.target;
    let newItems: MediaSlideshowItem[] | undefined;
    let newSlideshow: MediaSlideshow | undefined;

    if (
      name === "media" ||
      name === "title" ||
      name === "description" ||
      name === "caption" ||
      name === "clickAction" ||
      name === "option"
    ) {
      newItems = updateObject(items, "id", selectedItem.id, { [name]: value });
    } else if (name === "style" || name === "slideStyle") {
      newSlideshow = { ...slideshow, [name]: value };
    } else if (name === "position") {
      newItems = updateObject(items, "id", selectedItem.id, { [name]: value });
    }

    if (newItems) {
      updateItems(newItems);
    } else if (newSlideshow) {
      updateChange(newSlideshow);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const newData = {
      ...slideshow,
      items: reorderArray(items, result.source.index, result.destination.index),
    };

    updateChange(newData);
  };

  const handleItemAdd = (index: number) => {
    validateItem(selectedItem, () => {
      const newItem = new MediaSlideshowItem();
      const newItems = addObject(items, newItem, index);

      newItem.id = createUUID();

      setSelectedId(newItem.id);
      updateItems(newItems);
    });
  };

  const handleItemDuplicate = (index: number) => {
    const item = items[index];

    validateItem(item, () => {
      const newItem = { ...item, id: createUUID() };
      const newItems = addObject(items, newItem, index + 1);

      updateItems(newItems);
    });
  };

  const handleItemDelete = (index: number) => {
    const item = items[index];
    const newItems = removeObject(items, item);
    const newLen = newItems.length;

    if (item.id === selectedId) {
      updateSelectedId(index < newLen ? index : newLen - 1);
    }

    updateItems(newItems);
  };

  const handleItemClick = (index: number) => {
    validateItem(selectedItem, () => {
      updateSelectedId(index);
    });
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-media-slideshow-wrapper">
        <div className="slideshow-params-wrapper">
          <div className="slideshow-params-title">{t("title.parameters")}</div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable2" direction="horizontal">
              {(provided) => (
                <BlmHorizontalList
                  ref={provided.innerRef}
                  className="slidshow-horizontal-list"
                  {...provided.droppableProps}
                >
                  {items.map((item, ind) => {
                    const { id, media, option, position } = item;
                    const count = media ? mediaMap[media.id] : 0;
                    const isLinked = count > 1;

                    return (
                      <Draggable key={id} draggableId={id} index={ind}>
                        {(providedItem, snapshot) => (
                          <BlmSlideShowItem
                            ref={providedItem.innerRef}
                            key={id}
                            index={ind}
                            data={media}
                            option={option}
                            position={position}
                            isLinked={isLinked}
                            selected={item === selectedItem}
                            drag={providedItem.dragHandleProps}
                            className={clsx({
                              dragging: snapshot.isDragging,
                            })}
                            onChange={handleChange}
                            onAdd={handleItemAdd}
                            onDuplicate={handleItemDuplicate}
                            onDelete={handleItemDelete}
                            onClick={handleItemClick}
                            {...providedItem.draggableProps}
                          />
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </BlmHorizontalList>
              )}
            </Droppable>
          </DragDropContext>
          <div className="slideshow-params-txt-wrapper">
            <input
              type="text"
              name="title"
              placeholder={t("label.title")}
              value={title}
              className="slideshow-params-title-txt"
              onChange={handleChange}
            />
            <BlmRichTextEditor
              key={selectedId}
              name="description"
              placeholder={t("label.description")}
              value={description}
              className="slideshow-params-desc-txt"
              onChange={handleChange}
            />
            <textarea
              name="caption"
              placeholder={t("label.caption")}
              value={caption}
              className="slideshow-params-caption-txt"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="slideshow-actions-wrapper">
          <div className="slideshow-actions-title">{t("label.action")}</div>
          <div className="slideshow-actions-lbl">
            {t("label.on")} <span className="slideshow-actions-bold-lbl">{t("label.click")}</span>
          </div>
          <BlmActions
            name="clickAction"
            type="slideshow"
            data={clickAction}
            onChange={handleChange}
          />
        </div>
        <div className="slideshow-styles-wrapper">
          <div className="slideshow-styles-title">{t("title.style")}</div>
          <div className="slideshow-styles-sub-title">{t("slideshow.slideshow_style")}</div>
          <BlmStyleList
            type={StyleListTypes.MediaSlideshow}
            name="style"
            data={style}
            onChange={handleChange}
          />
          <div className="slideshow-styles-sub-title">{t("slideshow.slide_style")}</div>
          <BlmStyleTintPicker
            type={StyleListTypes.MediaSlideshowItem}
            name="slideStyle"
            data={slideStyle}
            showBgTint={true}
            label={t("slideshow.apply_all_slideshow")}
            showApplyStyle={hasApplyStyle}
            onChange={handleChange}
          />
        </div>
      </div>
    </BlmMediaDashboard>
  );
}

export default BlmMediaSlideshow;
