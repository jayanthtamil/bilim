import React, { ChangeEvent, useMemo, useCallback } from "react";
import { Select, MenuItem, Divider, ListItemText, ListItemIcon } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MediaComponent, MediaTrackCue, VideoMarkerAction } from "types";
import { MediaVariants } from "editor-constants";
import "./styles.scss";
import { useContentEditorCtx } from "components/content-editor/core";
import { createMediaCues, isVideoMediaComponent } from "utils";
import { ContainerProps } from "./continer";

export interface CompProps {
  data?: VideoMarkerAction;
  showNavigation?: boolean;
  showPage?: boolean;
  onChange?: (event: CustomChangeEvent<VideoMarkerAction>) => void;
  action?: string;
  name?: string;
}

function BlmVideoMarkerAction(props: CompProps & ContainerProps) {
  const { data, onChange, getFile, markerFiles, action, name } = props;
  const { video, marker } = data || {};
  const { t } = useTranslation("content-editor");
  const { template } = useContentEditorCtx();
  const [selectedComponentId, setSelectedComponentId] = React.useState<string | undefined>(video);
  const [selectedVideoMarkers, setSelectedVideoMarkers] = React.useState<MediaTrackCue[]>([]);
  const [selectedmarkerId, setSelectedMarkerId] = React.useState<string | undefined>(marker);

  const filterTemplate = (template: any) => {
    return template?.medias.filter(
      (media: MediaComponent) => media.variant === MediaVariants.VideoStandard
    );
  };

  const items = useMemo(() => {
    const components = filterTemplate(template);
    let result: any[] = [];
    if (components) {
      components?.forEach((component: MediaComponent, index: number) => {
        result.push({
          label: `${t("video_marker.video_label")}${index + 1}`,
          type: `${index + 1}`,
        });
      });
    }

    return result;
  }, [template, t]);

  const updateChange = useCallback(
    (newData: VideoMarkerAction) => {
      if (onChange) {
        onChange({
          target: { name: action ? action : "videomarker", value: newData },
        });
      }
    },
    [onChange, action]
  );

  var getFirstVideo = useCallback(
    (val: any) => {
      if (val) {
        const components = filterTemplate(template);
        const component = components?.find(
          (media: MediaComponent, ind: number) => ind + 1 === parseInt(val)
        );

        if (
          component &&
          isVideoMediaComponent(component) &&
          component?.value &&
          component?.value.main
        ) {
          const markerId = component.value?.main?.marker?.id || 0;
          return markerId;
        }
      }
    },
    [template]
  );

  React.useEffect(() => {
    if (selectedComponentId === undefined && items.length === 1) {
      let newData = { video, marker } as VideoMarkerAction;
      newData.video = items[0].type;

      var firstVidoe = getFirstVideo(items[0].type);
      if (firstVidoe === 0) {
        newData.marker = "none";
        setSelectedMarkerId("none");
      } else {
        newData.marker = "";
        setSelectedMarkerId("");
      }

      updateChange(newData);
      setSelectedComponentId(items[0].type);
    }
  }, [items, marker, video, selectedComponentId, updateChange, getFirstVideo]);

  React.useEffect(() => {
    if (selectedComponentId) {
      const components = filterTemplate(template);
      const component = components?.find(
        (media: MediaComponent, ind: number) => ind + 1 === parseInt(selectedComponentId)
      );
      if (component && isVideoMediaComponent(component)) {
        const marker = component?.value?.main?.marker;
        if (marker && !markerFiles[marker.id]) {
          getFile(marker.id, marker.url);
        }
      }
    }
  }, [template, selectedComponentId, getFile, markerFiles]);

  const renderPlaceholder = () => {
    return <div>Select video</div>;
  };

  const renderMarkerPlaceholder = () => {
    return (
      <>
        <span className={"markerIcon"} />
        <div>Select marker</div>
      </>
    );
  };

  const renderNoVideoFound = () => {
    return <div>No video</div>;
  };

  const renderNoMarkerFound = () => {
    return <div>No marker</div>;
  };

  const renderSelectedVideoItem = () => {
    const selectedItem = items.find((item: any) => item.type === selectedComponentId)!;
    return (
      <div className="selectedItem">
        <ListItemIcon className={"videoIcon"} />
        <ListItemText>{selectedItem.label}</ListItemText>
      </div>
    );
  };

  const renderSelectedMarkerItem = () => {
    if (selectedVideoMarkers.length > 0) {
      const selectedItem = selectedVideoMarkers.find(
        (item: MediaTrackCue, index: number) => (index + 1).toString() === marker?.toString()
      )!;
      if (selectedItem) {
        return (
          <div className="selectedItem">
            <ListItemIcon className={"markerIcon"} />
            <p className="selectedMarkerIndex">
              {marker && parseInt(marker) < 10 ? `0${marker}` : marker}
            </p>
            <ListItemText>{selectedItem.text}</ListItemText>
          </div>
        );
      } else {
        return (
          <>
            <span className={"markerIcon"} />
            <div>Select marker</div>
          </>
        );
      }
    }
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<string>) => {
    const { name, value } = event.target;
    let newData = { video, marker } as VideoMarkerAction;

    if (name === "video") {
      var firstVidoe = getFirstVideo(value);
      newData.video = value;

      if (firstVidoe === 0) {
        newData.marker = "none";
        setSelectedMarkerId("none");
      } else {
        newData.marker = "";
        setSelectedMarkerId("");
      }

      setSelectedComponentId(value);
    } else if (name === "marker") {
      newData.marker = value;
    }
    updateChange(newData);
  };

  React.useEffect(() => {
    if (selectedComponentId) {
      const components = filterTemplate(template);
      const component = components?.find(
        (media: MediaComponent, ind: number) => ind + 1 === parseInt(selectedComponentId)
      );

      if (
        component &&
        isVideoMediaComponent(component) &&
        component?.value &&
        component?.value.main
      ) {
        const markerId = component.value?.main?.marker?.id || 0;
        const markerFile = markerFiles[markerId];
        if (typeof markerFile === "string") {
          const markers: MediaTrackCue[] = createMediaCues(markerFile).map((cue) => ({
            ...cue,
            endTime: NaN,
          }));
          if (selectedmarkerId === "none" && markers.length > 0) {
            let newData = { video, marker } as VideoMarkerAction;
            newData.marker = "";
            setSelectedMarkerId("");

            updateChange(newData);
          }

          if (markerFile === "WEBVTT" && markers.length === 0 && marker !== "none") {
            let newData = { video, marker } as VideoMarkerAction;
            newData.marker = "none";
            updateChange(newData);
          }

          const selectedItem = markers.find(
            (item: MediaTrackCue, index: number) => (index + 1).toString() === marker?.toString()
          );
          if (marker && selectedItem === undefined && markers.length < parseInt(marker)) {
            let newData = { video, marker } as VideoMarkerAction;
            newData.marker = "";
            updateChange(newData);
          }

          setSelectedVideoMarkers(markers);
        } else {
          setSelectedVideoMarkers([]);
        }
      }
    }
  }, [markerFiles, selectedComponentId, marker, selectedmarkerId, video, template, updateChange]);

  const renderItems = () => {
    if (items) {
      return items.map((item, ind) => {
        if (typeof item === "object") {
          const { type, label } = item;
          return (
            <MenuItem key={type} value={type}>
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          );
        } else if (item === "divider") {
          return <Divider key={item + ind} />;
        } else {
          return (
            <div key={item} className="goto-dropdown-menu-title">
              {item}
            </div>
          );
        }
      });
    } else {
      return (
        <MenuItem key={"none"} value={"none"}>
          <ListItemText>{"No Video"}</ListItemText>
        </MenuItem>
      );
    }
  };

  const renderMarkerItems = () => {
    if (selectedVideoMarkers.length > 0) {
      return selectedVideoMarkers.map((item: MediaTrackCue, index: number) => {
        if (typeof item === "object") {
          const { text } = item;
          return (
            <MenuItem key={index} value={index + 1}>
              <p className="selectedMarkerIndex">{index + 1 > 10 ? index + 1 : `0${index + 1}`}</p>
              <ListItemText>{text}</ListItemText>
            </MenuItem>
          );
        } else if (item === "divider") {
          return <Divider key={item + (index + 1)} />;
        } else {
          return (
            <div key={item} className="goto-dropdown-menu-title">
              {item}
            </div>
          );
        }
      });
    } else {
      return (
        <MenuItem key={"none"} value={"none"}>
          <ListItemText>{"No Marker"}</ListItemText>
        </MenuItem>
      );
    }
  };

  return (
    <div className="videomaker-action-wrapper">
      <Select
        name={name ? name : "video"}
        value={selectedComponentId || ""}
        displayEmpty={true}
        MenuProps={{
          className: "videomaker-actions-dropdown-popover",
        }}
        className="videomaker-actions-dropdown"
        renderValue={
          selectedComponentId
            ? renderSelectedVideoItem
            : items.length > 0
            ? renderPlaceholder
            : renderNoVideoFound
        }
        onChange={handleChange}
      >
        {renderItems()}
      </Select>
      {items.length === 0 && (
        <div className="videomarker-warning-lbl">
          <span>THERE IS NO VIDEO IN THIS TEMPLATE.</span>
        </div>
      )}
      {selectedComponentId && (
        <>
          <Select
            name="marker"
            value={marker || ""}
            MenuProps={{
              className: "videomaker-actions-dropdown-popover",
            }}
            className="videomaker-actions-dropdown"
            displayEmpty={true}
            renderValue={
              marker !== undefined && marker !== "none"
                ? renderSelectedMarkerItem
                : selectedVideoMarkers.length > 0
                ? renderMarkerPlaceholder
                : renderNoMarkerFound
            }
            onChange={handleChange}
          >
            {renderMarkerItems()}
          </Select>
          {selectedVideoMarkers.length === 0 && (
            <div className="videomarker-warning-lbl">
              <span>THERE IS NO MARKERS IN THIS VIDEO.</span>
              <span>PLEASE DEFINE MARKERS IN THIS VIDEO</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default BlmVideoMarkerAction;
