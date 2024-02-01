import React, { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaComponent, MediaHotspot, MediaHotspotItem } from "types";
import { findObject, validateHotspotItem } from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmHotspotHeader from "../header";
import BlmHotspotPicker from "../picker";
import BlmHotspotItemProps from "../properties";

export interface HotspotClassicProps {
  data: MediaComponent & { value: MediaHotspot };
}

function BlmHotspotClassic(props: HotspotClassicProps) {
  const { data } = props;
  const [selectedId, setSelectedId] = useState<string>();
  const { element, template, openDialog, dispatch } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");
  const { value: hotspot } = data;
  const { items } = hotspot;

  const selectedItem = useMemo(
    () => (selectedId && items && findObject(items, selectedId, "id")) || items?.[0],
    [items, selectedId]
  );

  const updateChange = (newHotspot: MediaHotspot) => {
    const newData = { ...data, value: newHotspot };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleChange = (newHotspot: MediaHotspot) => {
    updateChange(newHotspot);
  };

  const handleItemChange = (event: CustomChangeEvent<MediaHotspotItem>) => {
    const { name, value } = event.target;
    const item = value.id !== selectedItem?.id ? selectedItem : undefined;

    validateItem(item, () => {
      const newHotspot = { ...hotspot };

      if (name === "add") {
        newHotspot.items = [...items, value];
      } else if (name === "delete") {
        newHotspot.items = items.filter((item) => item.id !== value.id);
      } else if (name === "move") {
        newHotspot.items = items.map((item) => (item.id === value.id ? value : item));
      }

      if (name !== "delete") {
        setSelectedId(value.id);
      } else if (selectedId === value.id) {
        setSelectedId(items[0]?.id);
      }

      updateChange(newHotspot);
    });
  };

  const validateItem = (item: MediaHotspotItem | undefined, callback: Function) => {
    if (item) {
      try {
        template && validateHotspotItem(item, hotspot, template);
      } catch (error) {
        openDialog && openDialog(`${t("alert.warning")}`, (error as Error).message);
        return;
      }
    }

    callback();
  };

  return (
    <Fragment>
      <BlmHotspotHeader data={hotspot} onChange={handleChange} />
      <BlmHotspotPicker
        elementId={element!.id}
        data={hotspot}
        selectedItem={selectedItem}
        onChange={handleChange}
        onItemChange={handleItemChange}
      />
      {selectedItem && (
        <BlmHotspotItemProps data={hotspot} item={selectedItem} onChange={handleChange} />
      )}
    </Fragment>
  );
}

export default BlmHotspotClassic;
