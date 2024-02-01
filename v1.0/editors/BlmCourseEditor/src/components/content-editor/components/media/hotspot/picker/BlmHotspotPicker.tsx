import React, { useState } from "react";
import { Drawer } from "@material-ui/core";

import {
  MediaHotspotItem,
  MediaHotspot,
  CustomChangeEvent,
  MediaFile,
  MediaConfigOptions,
} from "types";
import { AcceptedFileTypes } from "editor-constants";
import { BlmMediaPicker } from "components/shared";
import BlmClassicPreview, { HotspotChangeEvent } from "./classic";
import Blm360Preview from "./360";
import "./styles.scss";

export interface CompProps {
  type?: "standard" | "panorama";
  elementId: string;
  data: MediaHotspot;
  isLinked?: boolean;
  selectedItem?: MediaHotspotItem;
  onChange?: (data: MediaHotspot) => void;
  onItemChange?: (event: HotspotChangeEvent) => void;
  options2?: MediaConfigOptions;
}

const deleteAlert = {
  title: "Warning",
  message: `Do you want to delete the main media?
    All hotspots will be deleted.
    This operation cannot be reverted.`,
  options: { className: "hotspot-delete-warning" },
};

function BlmHotspotPicker(props: CompProps) {
  const { type, elementId, data, isLinked, selectedItem, onChange, onItemChange, options2 } = props;
  const { media, items } = data;
  const [fullScreen, setFullScreen] = useState(false);

  const updateChange = (newData: MediaHotspot) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: CustomChangeEvent<MediaFile | undefined>) => {
    const target = event.target;
    const { name, value } = target;
    let newHotspot: MediaHotspot | undefined;

    if (name === "media") {
      newHotspot = { ...data, media: value, items: value ? items : [] };
    }

    if (newHotspot) {
      updateChange(newHotspot);
    }
  };

  const handleFullscreen = () => {
    setFullScreen(!fullScreen);
  };

  const renderChildren = () => {
    return (
      <div className="hotspot-picker-wrapper">
        <BlmMediaPicker
          name="media"
          elementId={elementId}
          data={media}
          isLinked={isLinked}
          acceptedFiles={[AcceptedFileTypes.Image360MainMedia]}
          previewZone="none"
          placeholder="Select media"
          deleteAlert={deleteAlert}
          className="media-picker-3"
          onChange={handleChange}
          hotspot={'hotspot'}
        >
          {type === "panorama" ? (
            <Blm360Preview
              data={data}
              selectedItem={selectedItem}
              onChange={onItemChange}
              options2={options2}
            />
          ) : (
            <BlmClassicPreview data={data} selectedItem={selectedItem} onChange={onItemChange} />
          )}
          <div className="hotspots-fullscreen-btn" onClick={handleFullscreen} />
        </BlmMediaPicker>
      </div>
    );
  };

  if (fullScreen) {
    return (
      <Drawer className="hotspot-picker-drawer" open={true}>
        {renderChildren()}
      </Drawer>
    );
  } else {
    return renderChildren();
  }
}

export default BlmHotspotPicker;
