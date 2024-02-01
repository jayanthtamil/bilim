import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  BackgroundMedia,
  CourseElement,
  CourseElementTemplate,
  CustomChangeEvent,
  MediaFile,
  PropertiesEditorComponent,
  ScreenBackground,
  Tint,
} from "types";
import { differenceOfObjects } from "utils";
import { BlmTintPicker } from "shared";
import { BlmBackgroundMedia } from "components/shared";
import {
  getScreenBackgroundMedias,
  getScreenBackgroundModel,
  setScreenBackgroundHTML,
} from "template-builders";
import { ContainerProps } from "./container";
import "./screen-background.scss";

export interface CompProps extends ContainerProps {
  element: CourseElement;
}

export interface EditorState {
  data?: ScreenBackground;
  oldMedias: MediaFile[];
  isEdited: boolean;
}

const initEditor: EditorState = { oldMedias: [], isEdited: false };

const createTemplate = (template: CourseElementTemplate, background: ScreenBackground) => {
  const newTemplate: CourseElementTemplate = {
    ...template,
  };

  newTemplate.html = setScreenBackgroundHTML(newTemplate, background);

  return newTemplate;
};

const BlmScreenBackgroundProps: ForwardRefRenderFunction<PropertiesEditorComponent, CompProps> = (
  props,
  ref
) => {
  const { element, template, bgColors, removeFiles, clearFiles, previewTemplates, saveTemplates } =
    props;
  const [editor, setEditor] = useState(initEditor);
  const { data, oldMedias, isEdited } = editor;
  const { t } = useTranslation("properties");
  
  useImperativeHandle(ref, () => ({
    isEdited,
    save: saveChanges,
    revert: revertChanges,
  }));

  useEffect(() => {
    if (template) {
      const newBackground = getScreenBackgroundModel(template);

      if (newBackground) {
        const oldMedias = getScreenBackgroundMedias(newBackground);

        setEditor({ data: newBackground, oldMedias, isEdited: false });
      }
    }
  }, [template]);

  const saveChanges = () => {
    if (template && data && isEdited) {
      const newTemplate = createTemplate(template, data);
      const newMedias = getScreenBackgroundMedias(data);
      const deletedMedias = differenceOfObjects(oldMedias, newMedias, "id");

      saveTemplates(element, newTemplate);
      removeFiles(deletedMedias);
      clearFiles(template.id, true);
    }
  };

  const revertChanges = () => {
    if (template) {
      const newBackground = getScreenBackgroundModel(template);

      if (newBackground) {
        setEditor({ ...editor, data: newBackground, isEdited: false });
        updatePreivew(newBackground);
      }

      clearFiles(template.id, false);
    }
  };

  const updatePreivew = (newData: ScreenBackground) => {
    if (template) {
      const newTemplate = createTemplate(template, newData);

      previewTemplates(newTemplate);
    }
  };

  const updateChange = (newData: ScreenBackground) => {
    setEditor({ ...editor, data: newData, isEdited: true });
    updatePreivew(newData);
  };

  const handleChange = (event: CustomChangeEvent<BackgroundMedia | Tint>) => {
    if (data) {
      const { name, value } = event.target;
      const newData = { ...data };

      if (name === "media" || name === "tint") {
        newData[name] = value as any;
      }

      updateChange(newData);
    }
  };

  if (template && data) {
    return (
      <div className="screen-background-props-container">
        <div className="screen-bg-media-title">{t("page_screen_background.background_media")}</div>
        <BlmBackgroundMedia
          name="media"
          elementId={template.id}
          type="screen"
          data={data.media}
          onChange={handleChange}
        />
        <div className="screen-bg-color-title">{t("page_screen_background.background_clr")}</div>
        <BlmTintPicker
          data={data.tint}
          colors={bgColors}
          className="screen-bg-tint-picker"
          onChange={handleChange}
        />
      </div>
    );
  } else {
    return null;
  }
};

export default forwardRef(BlmScreenBackgroundProps);
