import React, { forwardRef, MouseEvent, useEffect, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  BackgroundMedia,
  CourseElementTemplate,
  CustomChangeEvent,
  MediaFile,
  PartPageBackground,
  TemplateEditorComponent,
  Tint,
} from "types";
import { BackgroundSizeTypes } from "editor-constants";
import { differenceOfObjects } from "utils";
import { BlmTintPicker } from "shared";
import { BlmBackgroundMedia, BlmBackgroundSize } from "components/shared";
import {
  getPartPageBackgroundMedias,
  getPartPageBackgroundModel,
  setPartPageBackgroundHTML,
} from "template-builders";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  template: CourseElementTemplate;
  onPreview: (template: CourseElementTemplate) => void;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent) => void;
}

export interface EditorState {
  data?: PartPageBackground;
  oldMedias: MediaFile[];
  isEdited: boolean;
}

const initEditor: EditorState = { oldMedias: [], isEdited: false };

const createTemplate = (template: CourseElementTemplate, background: PartPageBackground) => {
  const newTemplate: CourseElementTemplate = {
    ...template,
  };

  newTemplate.html = setPartPageBackgroundHTML(newTemplate, background);

  return newTemplate;
};

const BlmTemplateBackground = forwardRef<TemplateEditorComponent, CompProps>((props, ref) => {
  const { template, bgColors, onPreview, onSave, onClose, removeFiles, clearFiles } = props;
  const [editor, setEditor] = useState(initEditor);
  const { data, oldMedias, isEdited } = editor;
  const { t } = useTranslation("template-editors");

  useEffect(() => {
    if (template) {
      const newBackground = getPartPageBackgroundModel(template);

      if (newBackground) {
        const oldMedias = getPartPageBackgroundMedias(newBackground);

        setEditor({ data: newBackground, oldMedias, isEdited: false });
      }
    }
  }, [template]);

  useImperativeHandle(ref, () => ({
    isEdited,
    saveOnClose: handleSaveOnClose,
    revert: revertChanges,
  }));

  const saveChanges = () => {
    if (isEdited && data) {
      const newTemplate = createTemplate(template, data);
      const newMedias = getPartPageBackgroundMedias(data);
      const deletedMedias = differenceOfObjects(oldMedias, newMedias, "id");

      removeFiles(deletedMedias);

      if (onSave) {
        onSave(newTemplate);
      }
    }
  };

  const revertChanges = () => {
    clearFiles(template.id, false);
  };

  const updatePreivew = (newData: PartPageBackground) => {
    const newTemplate = createTemplate(template, newData);

    if (onPreview) {
      onPreview(newTemplate);
    }
  };

  const updateChange = (newData: PartPageBackground) => {
    setEditor({ ...editor, data: newData, isEdited: true });
    updatePreivew(newData);
  };

  const handleChange = (event: CustomChangeEvent<BackgroundMedia | BackgroundSizeTypes | Tint>) => {
    if (data) {
      const { name, value } = event.target;
      const newData = { ...data };

      if (name === "media" || name === "tint" || name === "mediaSize" || name === "colorSize") {
        newData[name] = value as any;
      }

      updateChange(newData);
    }
  };

  const handleSaveOnClose = (event: MouseEvent) => {
    saveChanges();
    clearFiles(template.id, true);

    if (onClose) {
      onClose(event);
    }
  };

  if (data) {
    return (
      <div className="template-background-panel">
        <div className="template-bg-anchor" />
        <div className="template-bg-content">
          <div className="template-bg-close-btn" onClick={handleSaveOnClose} />
          <div className="template-bg-media-box">
            <span className="template-bg-media-title">{t("background.background")}</span>
            <BlmBackgroundMedia
              name="media"
              elementId={template.id}
              type="partpage"
              data={data.media}
              onChange={handleChange}
            />
          </div>
          <BlmBackgroundSize
            title={t("background.title.size")}
            name="mediaSize"
            size={data.mediaSize}
            disabled={!Boolean(data.media.main)}
            className="template-bg-media-size-box"
            onChange={handleChange}
          />
          <div className="template-bg-color-box">
            <span className="template-bg-color-title">{t("background.background")}</span>
            <BlmTintPicker
              title={t("background.title.color")}
              data={data.tint}
              colors={bgColors}
              onChange={handleChange}
            />
            <span className="template-bg-color-info">{t("background.info")}</span>
          </div>
          <BlmBackgroundSize
            name="colorSize"
            size={data.colorSize}
            disabled={!Boolean(data.tint.color)}
            className="template-bg-color-size-box"
            onChange={handleChange}
          />
        </div>
      </div>
    );
  } else {
    return null;
  }
});

export default BlmTemplateBackground;
