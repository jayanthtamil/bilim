import React, { ChangeEvent, Fragment, useMemo, useState, MouseEvent } from "react";
import { Tabs, Tab } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  ComponentAction,
  CustomChangeEvent,
  MediaComponent,
  MediaConfigOptions,
  MediaHotspot,
  MediaHotspot360,
  MediaHotspotItem,
} from "types";
import {
  createShortUUID,
  findObject,
  isGoto360Action,
  updateObject,
  validateHotspot,
  validateHotspotItem,
} from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMedia360Option, updateMediaComponent } from "components/content-editor/reducers";
import BlmHotspotHeader from "../header";
import BlmHotspotPicker from "../picker";
import BlmHotspotItemProps from "../properties";
import { BlmHotspot360Provider } from "./context";
import { ContainerProps } from "./container";
import "./styles.scss";
import BlmHotspot360Options from "./BlmHotspot360Options";

export interface HotspotClassicProps extends ContainerProps {
  data: MediaComponent & { value: MediaHotspot360 };
  openModal: boolean;
  onSave: () => void;
  onClose: () => void;
}

function BlmHotspot360(props: HotspotClassicProps) {
  const { data, openDialog, openConfirmDialog, openModal, onClose, onSave } = props;
  const [hotspotId, setHotspotId] = useState<string>();
  const [itemId, setItemdId] = useState<string>();
  const [name, setName] = useState<string>();
  const { element, template, dispatch } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");
  const { value } = data;
  const { items } = value;

  const selectedHotspot = useMemo(
    () => (hotspotId && items && findObject(items, hotspotId, "id")) || items?.[0],
    [items, hotspotId]
  );

  const selectedIndex = useMemo(
    () => (items && selectedHotspot && items.indexOf(selectedHotspot)) ?? 0,
    [items, selectedHotspot]
  );

  const selectedItem = useMemo(() => {
    if (selectedHotspot) {
      const { items } = selectedHotspot;

      return (itemId && items && findObject(items, itemId, "id")) || items?.[0];
    }
  }, [selectedHotspot, itemId]);

  const isLinkedMedia = useMemo(() => {
    if (selectedHotspot.media) {
      return (
        items.findIndex(
          (item) => item.id !== selectedHotspot.id && item.media?.id === selectedHotspot.media?.id
        ) !== -1
      );
    }

    return false;
  }, [items, selectedHotspot]);

  const isLinkedItem = useMemo(() => {
    if (selectedItem && selectedItem.media) {
      return (
        items.findIndex((item) => {
          return (
            item.items.findIndex(
              (item2) => item2.id !== selectedItem.id && item2.media?.id === selectedItem.media?.id
            ) !== -1
          );
        }) !== -1
      );
    }

    return false;
  }, [items, selectedItem]);

  const updateChange = (newValue: MediaHotspot360) => {
    const newData = {
      ...data,
      value: newValue,
    };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const update360Options = (newValue: MediaConfigOptions) => {
    const newData = {
      ...data,
      options2: newValue,
    };

    if (dispatch) {
      dispatch(updateMedia360Option(newData));
    }
  };

  const updateHotspot = (newHotspot: MediaHotspot) => {
    const newValue = {
      ...data.value,
      items: updateObject(items, "id", selectedHotspot.id, newHotspot),
    };

    updateChange(newValue);
  };

  const duplicateHotspot = (hotspot: MediaHotspot) => {
    const newInd = items.indexOf(hotspot);
    const newItems = [...items];
    const newHotspot = { ...hotspot };
    const cloneAction = (action: ComponentAction) => {
      return (
        action && {
          ...action,
          value: action.value && { ...action.value },
        }
      );
    };

    newHotspot.id = createShortUUID();
    newHotspot.name = newHotspot.name + "-copy";

    newHotspot.groups = {
      ...newHotspot.groups,
      items: newHotspot.groups.items.map((group) => {
        return { ...group };
      }),
    };

    newHotspot.items = newHotspot.items.map((item) => {
      const { clickAction, overAction } = item;

      return {
        ...item,
        id: createShortUUID(),
        clickAction: cloneAction(clickAction),
        overAction: cloneAction(overAction),
      };
    });

    newItems.splice(newInd + 1, 0, newHotspot);

    updateChange({ ...value, items: newItems });
  };

  const deleteHotspot = (hotspot: MediaHotspot) => {
    const newItemes = items.filter((item) => item.id !== hotspot.id);
    const updateAction = (action: ComponentAction) => {
      if (action && isGoto360Action(action) && action.value?.gotoId === hotspot.id) {
        action.value.gotoId = undefined;
      }
    };

    newItemes.forEach((item) => {
      item.items.forEach((item2) => {
        updateAction(item2.clickAction);
        updateAction(item2.overAction);
      });
    });

    updateChange({ ...value, items: newItemes });
  };

  const validateHotspot360 = (hotspot: MediaHotspot, callback: Function) => {
    if (hotspot) {
      try {
        if (template) {
          validateHotspot(hotspot, template);
          callback();
        }
      } catch (error) {
        if (openDialog) {
          openDialog(t("alert.warning"), (error as Error).message);
        }
      }
    }
  };

  const validateItem = (item: MediaHotspotItem | undefined, callback: Function) => {
    if (item && selectedHotspot) {
      try {
        template && validateHotspotItem(item, selectedHotspot, template);
      } catch (error) {
        openDialog && openDialog(t("alert.warning"), (error as Error).message);
        return;
      }
    }

    callback();
  };

  const handleTabsChange = (event: ChangeEvent<{}>, newValue: number) => {
    if (newValue >= 0 && newValue < items.length) {
      validateHotspot360(selectedHotspot, () => {
        setHotspotId(items[newValue].id);
      });
    }
  };

  const handleChange = (newHotspot: MediaHotspot) => {
    updateHotspot(newHotspot);
  };

  const handleItemChange = (event: CustomChangeEvent<MediaHotspotItem>) => {
    if (!selectedHotspot) {
      return;
    }

    const { name, value } = event.target;
    const { items } = selectedHotspot;
    const item = value.id !== selectedItem?.id ? selectedItem : undefined;

    validateItem(item, () => {
      const newHotspot = { ...selectedHotspot };

      if (name === "add") {
        newHotspot.items = [...items, value];
      } else if (name === "delete") {
        newHotspot.items = items.filter((item) => item.id !== value.id);
      } else if (name === "move") {
        newHotspot.items = items.map((item) => (item.id === value.id ? value : item));
      }

      if (name !== "delete") {
        setItemdId(value.id);
      } else if (itemId === value.id) {
        setItemdId(items[0]?.id);
      }

      updateHotspot(newHotspot);
    });
  };

  const handleAddClick = () => {
    const newHotspot = new MediaHotspot();
    newHotspot.id = createShortUUID();
    newHotspot.name = "360-" + String.fromCharCode(((items.length + 1) % 26) + 64).toLowerCase();

    updateChange({ ...value, items: [...items, newHotspot] });
  };

  const handleDuplicateClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (selectedHotspot) {
      validateHotspot360(selectedHotspot, () => {
        duplicateHotspot(selectedHotspot);
      });
    }
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (items.length > 1) {
      openConfirmDialog(
        t("alert.warning"),
        t("hotspot360.delete_confirm", { name: selectedHotspot.name }),
        () => {
          if (selectedHotspot) {
            deleteHotspot(selectedHotspot);
          }
        }
      );
    } else {
      openDialog(t("alert.warning"), t("hotspot360.delete_error", { name: selectedHotspot.name }));
    }
  };

  const handleLblDoubleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setName(selectedHotspot.name);
  };

  const handleTxtChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setName(value);
  };

  const handleTxtBlur = () => {
    if (name && name.trim() !== "") {
      const newHotspot = { ...selectedHotspot, name };

      updateHotspot(newHotspot);
    }
    setName(undefined);
  };

  return (
    <Fragment>
      <Tabs
        variant="scrollable"
        value={selectedIndex}
        className="hotspot-360-tabs"
        onChange={handleTabsChange}
      >
        {items.map((item, ind) => (
          <Tab
            key={item.id}
            label={
              name !== undefined && ind === selectedIndex ? (
                <input
                  type="text"
                  value={name}
                  className="hotspot-360-tab-txt"
                  onChange={handleTxtChange}
                  onBlur={handleTxtBlur}
                />
              ) : (
                <span className="hotspot-360-tab-lbl" onDoubleClick={handleLblDoubleClick}>
                  {item.name}
                </span>
              )
            }
            icon={
              <div className="hotspot-360-tab-btns-wrapper">
                <div className="hotspot-360-tab-duplicate-btn" onClick={handleDuplicateClick} />
                <div className="hotspot-360-tab-divider" />
                <div className="hotspot-360-tab-delete-btn" onClick={handleDeleteClick} />
              </div>
            }
            disableRipple={true}
          />
        ))}
        <Tab label="+" disableRipple={true} onClick={handleAddClick} />
      </Tabs>
      {selectedHotspot && (
        <BlmHotspot360Provider selectedId={selectedHotspot.id}>
          <BlmHotspotHeader type="panorama" data={selectedHotspot} onChange={handleChange} />
          <BlmHotspotPicker
            type="panorama"
            elementId={element!.id}
            data={selectedHotspot}
            isLinked={isLinkedMedia}
            selectedItem={selectedItem}
            onChange={handleChange}
            onItemChange={handleItemChange}
            options2={data.options2}
          />
          {selectedItem && (
            <BlmHotspotItemProps
              type="panorama"
              data={selectedHotspot}
              item={selectedItem}
              isLinked={isLinkedItem}
              onChange={handleChange}
            />
          )}
        </BlmHotspot360Provider>
      )}
      <BlmHotspot360Options
        open={openModal}
        onSave={onSave}
        onClose={onClose}
        data={data}
        onChange={update360Options}
      />
    </Fragment>
  );
}

export default BlmHotspot360;
