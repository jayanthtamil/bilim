import React, { ChangeEvent, useMemo, useCallback } from "react";
import { Select, MenuItem, Divider, ListItemText, ListItemIcon } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  ContentTemplateAction,
  CustomChangeEvent,
  MediaTrackCue,
  SoundComponent,
  SoundMarkerAction,
} from "types";
import "./styles.scss";
import { useContentEditorCtx } from "components/content-editor/core";
import { createMediaCues, isSoundComponent } from "utils";
import { ContainerProps } from "./continer";

export interface CompProps {
  data?: SoundMarkerAction;
  showNavigation?: boolean;
  showPage?: boolean;
  onChange?: (event: CustomChangeEvent<SoundMarkerAction>) => void;
  action?: string;
  name?: string;
  temp?: ContentTemplateAction | undefined;
}

function BlmAudioMarkerAction(props: CompProps & ContainerProps) {
  const { data, onChange, getFile, markerFiles, action, name, temp } = props;
  const { sound, marker } = data || {};
  const { t } = useTranslation("content-editor");
  const { template } = useContentEditorCtx();
  const [selectedComponentId, setSelectedComponentId] = React.useState<string | undefined>(sound);
  const [selectedAudioMarkers, setSelectedAudioMarkers] = React.useState<MediaTrackCue[]>([]);
  const [selectedmarkerId, setSelectedMarkerId] = React.useState<string | undefined>(marker);

  const items = useMemo(() => {
    const components = template?.sounds;
    let result: any[] = [];
    if (components && components.some((component: SoundComponent) => component.value.media)) {
      components?.forEach((component: SoundComponent, index: number) => {
        result.push({
          label: `${t("sound_marker.Sound_label")}${index + 1}`,
          type: `${index + 1}`,
        });
      });
    } else {
      if (template?.repeater?.sounds) {
        template?.repeater?.sounds[0].value?.forEach((component: SoundComponent, index: number) => {
          result.push({
            label: `${t("sound_marker.Sound_label")}${index + 1}`,
            type: `${index + 1}`,
          });
        });
      }
    }

    if (temp) {
      result.push({
        label: "Background sound",
        type: `${100 + 1}`,
      });
    }

    return result;
  }, [template, t, temp]);

  const updateChange = useCallback(
    (newData: SoundMarkerAction) => {
      if (onChange) {
        onChange({
          target: { name: action ? action : "audiomarker", value: newData },
        });
      }
    },
    [onChange, action]
  );

  var getFirstAudio = useCallback(
    (val: any) => {
      if (val) {
        const component = template?.sounds.find(
          (media: SoundComponent, ind: number) => ind + 1 === parseInt(val)
        );

        if (
          component &&
          isSoundComponent(component) &&
          component?.value &&
          component?.value.media
        ) {
          const markerId = component.value?.media?.marker?.id || 0;
          return markerId;
        }
      }
    },
    [template]
  );

  React.useEffect(() => {
    if (selectedComponentId === undefined && items.length === 1) {
      let newData = { sound, marker } as SoundMarkerAction;
      newData.sound = items[0].type;

      var firstVidoe = getFirstAudio(items[0].type);
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
  }, [items, marker, sound, selectedComponentId, updateChange, getFirstAudio]);

  React.useEffect(() => {
    if (
      temp?.load?.sound?.sound?.marker?.id &&
      !markerFiles[temp?.load?.sound?.sound?.marker?.id]
    ) {
      getFile(temp?.load?.sound?.sound?.marker?.id, temp?.load?.sound?.sound?.marker?.url);
    }
    if (selectedComponentId) {
      const component = template?.sounds.find(
        (sound: SoundComponent) => sound.id === selectedComponentId
      );
      if (component && isSoundComponent(component)) {
        const marker = component?.value?.media?.marker;
        if (marker && !markerFiles[marker.id]) {
          getFile(marker.id, marker.url);
        }
      } else {
        if (template?.repeater?.sounds) {
          var test = template?.repeater?.sounds[0].value?.find(
            (media: SoundComponent, ind: number) => ind + 1 === parseInt(selectedComponentId)
          );

          const marker = test?.value?.media?.marker;
          if (marker && !markerFiles[marker.id]) {
            getFile(marker.id, marker.url);
          }
        }
      }
    }
  }, [template, selectedComponentId, getFile, markerFiles, temp]);

  const renderPlaceholder = () => {
    return <div>Select audio</div>;
  };

  const renderMarkerPlaceholder = () => {
    return (
      <>
        <span className={"markerIcon"} />
        <div>Select marker</div>
      </>
    );
  };

  const renderNoAudioFound = () => {
    return <div>No audio</div>;
  };
  const renderNoMarkerFound = () => {
    return <div>No marker</div>;
  };

  const renderSelectedAudioItem = () => {
    const selectedItem = items.find((item: any) => item.type === selectedComponentId)!;
    return (
      <div className="selectedItem">
        <ListItemIcon className={"audioIcon"} />
        <ListItemText>{selectedItem.label}</ListItemText>
      </div>
    );
  };

  const renderSelectedMarkerItem = () => {
    if (selectedAudioMarkers.length > 0) {
      const selectedItem = selectedAudioMarkers.find(
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
    let newData = { sound, marker } as SoundMarkerAction;

    if (name === "audio") {
      var firstAudio = getFirstAudio(value);
      newData.sound = value;

      if (firstAudio === 0) {
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
    var component;
    if (template?.sounds && template?.sounds.length > 0) {
      component = template?.sounds.find(
        (media: SoundComponent) => media.id === selectedComponentId
      );
    } else {
      if (template?.repeater?.sounds) {
        template?.repeater?.sounds[0].value?.forEach((media: SoundComponent, index: number) => {
          if ((index + 1).toString() === selectedComponentId) {
            component = media;
          }
        });
      }
    }

    if (
      (component && isSoundComponent(component) && component.value && component.value.media) ||
      temp
    ) {
      var markerId;
      if (component) {
        markerId = component.value?.media?.marker?.id || 0;
      } else {
        markerId = temp?.load.sound.sound?.marker?.id || 0;
      }
      const markerFile = markerFiles[markerId];
      if (typeof markerFile === "string") {
        const markers: MediaTrackCue[] = createMediaCues(markerFile).map((cue) => ({
          ...cue,
          endTime: NaN,
        }));

        if (selectedmarkerId === "none" && markers.length > 0) {
          let newData = { sound, marker } as SoundMarkerAction;
          newData.marker = "";
          setSelectedMarkerId("");
          updateChange(newData);
        }

        if (markerFile === "WEBVTT" && markers.length === 0 && marker !== "none") {
          let newData = { sound, marker } as SoundMarkerAction;
          newData.marker = "none";
          updateChange(newData);
        }

        const selectedItem = markers.find(
          (item: MediaTrackCue, index: number) => (index + 1).toString() === marker?.toString()
        );
        if (marker && selectedItem === undefined && markers.length < parseInt(marker)) {
          let newData = { sound, marker } as SoundMarkerAction;
          newData.marker = "";
          updateChange(newData);
        }

        setSelectedAudioMarkers(markers);
      } else {
        setSelectedAudioMarkers([]);
      }
    }
  }, [
    markerFiles,
    selectedComponentId,
    template,
    sound,
    marker,
    selectedmarkerId,
    temp,
    updateChange,
  ]);

  const renderItems = () => {
    if (items) {
      return items.map((item, ind) => {
        if (typeof item === "object") {
          const { type, label } = item;
          return (
            <MenuItem key={type} value={type}>
              {/* <ListItemIcon className={type} /> */}
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
          <ListItemText>{"No audio"}</ListItemText>
        </MenuItem>
      );
    }
  };

  const renderMarkerItems = () => {
    if (selectedAudioMarkers.length > 0) {
      return selectedAudioMarkers.map((item: MediaTrackCue, index: number) => {
        if (typeof item === "object") {
          const { text } = item;
          return (
            <MenuItem key={index} value={index + 1}>
              <p className="selectedMarkerIndex">{index + 1 < 10 ? `0${index + 1}` : index + 1}</p>
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
          {/* <ListItemIcon className={type} /> */}
          <ListItemText>{"No marker"}</ListItemText>
        </MenuItem>
      );
    }
  };

  return (
    <div className="audiomaker-action-wrapper">
      <Select
        name={name ? name : "audio"}
        value={selectedComponentId || ""}
        displayEmpty={true}
        MenuProps={{
          className: "audioomaker-actions-dropdown-popover",
        }}
        className="audiomaker-actions-dropdown"
        renderValue={
          selectedComponentId
            ? renderSelectedAudioItem
            : items.length > 0
            ? renderPlaceholder
            : renderNoAudioFound
        }
        onChange={handleChange}
      >
        {renderItems()}
      </Select>
      {selectedComponentId && (
        <>
          <Select
            name="marker"
            value={marker || ""}
            MenuProps={{
              className: "audiomaker-actions-dropdown-popover",
            }}
            className="audiomaker-actions-dropdown"
            renderValue={
              marker !== undefined && marker !== "none"
                ? renderSelectedMarkerItem
                : selectedAudioMarkers.length > 0
                ? renderMarkerPlaceholder
                : renderNoMarkerFound
            }
            displayEmpty={true}
            onChange={handleChange}
          >
            {renderMarkerItems()}
          </Select>
          {selectedAudioMarkers.length === 0 && (
            <div className="audiomarker-warning-lbl">
              <span>THERE IS NO MARKERS IN THIS AUDIO.</span>
              <span>PLEASE DEFINE MARKERS IN THIS AUDIO</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlmAudioMarkerAction;
