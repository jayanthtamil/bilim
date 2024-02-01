import React, { ChangeEvent, Fragment } from "react";
import { Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElement, CourseElementProps, ElementPropsComponent } from "types";
import { AcceptedFileTypes, ElementType } from "editor-constants";
import { hasAutoSummary, textArea } from "utils";
import { BlmMediaPicker, MediaPickerChangeEvent } from "components/shared";
import { changeKeyMap } from "./utils";
import { ContainerProps } from "./general-container";
import "./general.scss";

interface CompProps extends ElementPropsComponent, ContainerProps {
  element: CourseElement;
}

function BlmGeneralProps(props: CompProps) {
  const { element, data, config, courseProps, onChange } = props;
  const { properties, metadatas } = config || {};
  const { navigation } = courseProps || {};
  const {
    name: title,
    subTitle,
    duration,
    mediaJSON,
    navigationJSON,
    metadatasJSON,
  } = data;
  const { t } = useTranslation("properties");

  const updateChange = (newData: CourseElementProps) => {
    if (onChange) {
      onChange(newData);
    }
  };

  const handleChange = (event: ChangeEvent<any> | MediaPickerChangeEvent) => {
    const { target } = event;
    const value =
      "type" in target && target.type === "checkbox" && "checked" in target
        ? target.checked
        : target.value;
    const name = target.name;
    let newData;

    if (changeKeyMap.hasOwnProperty(name)) {
      const map = changeKeyMap[name];
      const { obj, key } = map;

      newData = {
        ...data,
        [obj]: {
          ...data[obj],
          [key]: value,
        },
      };
    } else {
      newData = { ...data, [name]: value };
    }

    updateChange(newData);
  };

  const handleMiscChange = (event: MediaPickerChangeEvent) => {
    const { name, value } = event.target;
    const newData: CourseElementProps = {
      ...data,
      navigationJSON: { ...data.navigationJSON },
    };

    if (newData.navigationJSON) {
      newData.navigationJSON[name] = value || null;
    }

    updateChange(newData);
  };

  const handleMetadataChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const value =
      "type" in target && target.type === "checkbox" && "checked" in target
        ? target.checked
        : target.value;
    const name = target.name;
    const newData: CourseElementProps = {
      ...data,
      metadatasJSON: { ...data.metadatasJSON },
    };

    if (newData.metadatasJSON) {
      newData.metadatasJSON[name] = value;
    }

    updateChange(newData);
  };

  const renderMedias = () => {
    const medias = properties?.medias;
    const { default: defaultVal, over, sound } = medias || {};

    if (medias && (defaultVal || over || sound)) {
      return (
        <Fragment>
          <div className="general-media-lbl">{t("label.media")}</div>
          <div className="general-media-container">
            {defaultVal && (
              <Fragment>
                <span className="general-default-media-lbl">{t("general.default")}</span>
                <BlmMediaPicker
                  name="default"
                  elementId={data.id}
                  acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
                  data={mediaJSON?.default}
                  className="general-default-media-picker"
                  onChange={handleChange}
                />
              </Fragment>
            )}
            {defaultVal && (over || sound) && <div className="general-media-separator" />}
            <Fragment>
              {(over || sound) && (
                <span className="general-over-media-lbl">{t("general.over")}</span>
              )}
              {over && (
                <BlmMediaPicker
                  name="over"
                  elementId={data.id}
                  acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
                  data={mediaJSON?.over}
                  className="general-over-media-picker"
                  onChange={handleChange}
                />
              )}
              {sound && (
                <BlmMediaPicker
                  name="overSound"
                  elementId={data.id}
                  acceptedFiles={[AcceptedFileTypes.Audio]}
                  data={mediaJSON?.overSound}
                  className="general-over-sound-picker"
                  onChange={handleChange}
                />
              )}
            </Fragment>
          </div>
        </Fragment>
      );
    }
  };

  const renderMisc = () => {
    const misc = properties?.misc;

    if (misc) {
      const items = [];

      for (let name in misc) {
        const value = misc[name];

        if (value) {
          const media = navigationJSON?.[name];

          items.push(
            <div key={name} className="general-misc-media-item">
              <div className="general-misc-media-lbl">{name}</div>
              <BlmMediaPicker
                name={name}
                elementId={data.id}
                acceptedFiles={[AcceptedFileTypes.Image, AcceptedFileTypes.Video]}
                data={media}
                className="general-misc-media-picker"
                onChange={handleMiscChange}
              />
            </div>
          );
        }
      }

      if (items.length > 0) {
        return (
          <div className="general-misc-media-container">
            <div className="general-misc-media-title">{t("general.misc")}</div>
            {items}
          </div>
        );
      }
    }
  };

  const renderMetadata = (key: string, label: string, value: string | string[]) => {
    if (Array.isArray(value)) {
      return (
        <Fragment key={key}>
          <span className="general-options-lbl">{label} :</span>
          <select
            name={label}
            value={(metadatasJSON?.[label] as string) || undefined}
            className="general-options-ctrl general-options-select"
            onChange={handleMetadataChange}
          >
            {value.map((str, ind) => (
              <option key={ind} value={str}>
                {str}
              </option>
            ))}
          </select>
        </Fragment>
      );
    } else if (value === "number") {
      return (
        <Fragment key={key}>
          <span className="general-options-lbl">{label} :</span>
          <input
            name={label}
            type="number"
            min="0"
            value={(metadatasJSON?.[label] as number) || undefined}
            className="general-options-ctrl general-options-txt"
            onChange={handleMetadataChange}
          />
        </Fragment>
      );
    } else if (value === "boolean") {
      return (
        <Fragment key={key}>
          <span className="general-options-lbl">{label} :</span>
          <Checkbox
            name={label}
            checked={(metadatasJSON?.[label] as boolean) || undefined}
            className="general-options-chk"
            onChange={handleMetadataChange}
          />
        </Fragment>
      );
    } else {
      return (
        <Fragment key={key}>
          <span className="general-options-lbl">{label} :</span>
          <input
            name={label}
            type="text"
            value={(metadatasJSON?.[label] as string) || undefined}
            className="general-options-ctrl general-options-txt"
            onChange={handleMetadataChange}
          />
        </Fragment>
      );
    }
  };

  const renderMetadatas = () => {
    if (metadatas) {
      const items = [];

      for (const key in metadatas) {
        const item = renderMetadata(key, key, metadatas[key]);
        items.push(item);
      }

      return items;
    }
  };

  if (data) {
    if (data?.description) {
      let newDescription = textArea(data.description, "<br>", "\n");
      data.description = newDescription;
    }
    return (
      <div className="general-props-container">
        <span className="general-title-lbl">{t("label.title")}</span>
        <input
          name="name"
          type="text"
          maxLength={70}
          value={title}
          className="general-title-txt"
          onChange={handleChange}
        />
        <span className="general-duration-lbl">{t("label.duration")}</span>
        <input
          name="duration"
          type="number"
          min="0"
          value={duration || ""}
          className="general-duration-txt"
          onChange={handleChange}
        />
        {element?.root?.type === ElementType.Structure &&
          element.parent &&
          hasAutoSummary(element.parent, navigation?.navigationlevel) && (
            <Fragment>
              <div className="general-auto-summary-wrapper">
                <span className="general-auto-summary-title">{t("general.auto_summary")}</span>
                <span className="general-auto-summary-lbl">{t("general.define_here")}</span>
              </div>
              {properties?.title2 && (
                <Fragment>
                  <span className="general-sub-title-lbl">{t("general.title2")}</span>
                  <input
                    name="subTitle"
                    type="text"
                    maxLength={70}
                    value={subTitle || ""}
                    className="general-sub-title-txt"
                    onChange={handleChange}
                  />
                </Fragment>
              )}
              {properties?.description && (
                <Fragment>
                  <span className="general-description-lbl">{t("label.description")}</span>
                  <textarea
                    name="description"
                    maxLength={1000}
                    value={data.description || ""}
                    className="general-description-txt"
                    onChange={handleChange}
                  />
                </Fragment>
              )}
              {renderMedias()}
              {renderMisc()}
              <Fragment>
                <div className="general-options-title">{t("general.options")}</div>
                <div className="general-options-container">{renderMetadatas()}</div>
              </Fragment>
            </Fragment>
          )}
      </div>
    );
  } else {
    return null;
  }
}

export default BlmGeneralProps;
