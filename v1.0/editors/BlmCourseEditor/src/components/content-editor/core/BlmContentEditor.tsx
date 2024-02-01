import React, {
  forwardRef,
  useMemo,
  MouseEvent,
  useEffect,
  useImperativeHandle,
  useReducer,
  useState,
} from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import {
  ContentTemplate,
  CourseElementTemplate,
  TemplateEditorComponent,
  CourseElement,
  MediaComponent,
  ButtonComponent,
  SoundComponent,
  ContentTemplateAction,
} from "types";
import {
  compareComponent,
  differenceOfObjects,
  isButtonComponent,
  isMediaComponent,
  validateContent,
  isSoundComponent,
} from "utils";
import {
  setComputedStyles,
  setContentTemplateHTML,
  getContentTemplateModel,
  getContentMedias,
  getContentHTMLJSON,
  GlTemplateBuilderStore,
  getTemplateActionModel,
} from "template-builders";
import {
  BlmComponentRepository,
  BlmContentText,
  BlmContentMedia,
  BlmContentButton,
  BlmContentSound,
} from "components/content-editor/panels";
import {
  ContentEditorState,
  contentReducer,
  initContentEditor,
  setComponent,
} from "components/content-editor/reducers";
import ContentEditorContext from "./ContentEditorContext";
import { ContainerProps } from "./container";
import "./content-editor.scss";
import { createTemplateView } from "components/template-editors/containers/template-action/utils";

interface CompProps extends ContainerProps {
  frameEle: HTMLElement;
  element: CourseElement;
  template: CourseElementTemplate;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent) => void;
}

const initState: ContentEditorState = {
  template: null,
  data: null,
  oldMedias: [],
  isEdited: false,
};

const createTemplate = (template: CourseElementTemplate, content: ContentTemplate) => {
  const newTemplate: CourseElementTemplate = {
    ...template,
  };

  newTemplate.html = setContentTemplateHTML(newTemplate, content);
  newTemplate.htmlJSON = getContentHTMLJSON(newTemplate, content);

  return newTemplate;
};

const BlmContentEditor = forwardRef<TemplateEditorComponent, CompProps>((props, ref) => {
  const {
    frameEle,
    element,
    template,
    isFileUploading,
    onSave,
    onClose,
    openDialog,
    removeFiles,
    clearFiles,
    clearAnimations,
    clearMediaProperties,
    openConfirmDialog,
  } = props;
  const [state, dispatch] = useReducer(contentReducer, initState);
  const { data, oldMedias, component, isEdited } = state;
  const [tempVal, setTempVal] = useState<ContentTemplateAction | undefined>(undefined);
  const { isDarkTemplate } = template;
  const { t } = useTranslation();

  useImperativeHandle(ref, () => ({
    isEdited,
    saveOnClose: handleSaveOnClose,
    revert: revertChanges,
  }));

  const view = useMemo(() => createTemplateView(element), [element]);

  useEffect(() => {
    if (template) {
      const data = getTemplateActionModel(template, view);

      setTempVal(data);
      const editor = getContentTemplateModel(template);
      editor.texts.sort(compareComponent);
      editor.medias.sort(compareComponent);
      editor.buttons.sort(compareComponent);

      setComputedStyles(frameEle, editor.texts);
      GlTemplateBuilderStore.updateStyles(frameEle, "templates.css");

      dispatch(initContentEditor(template, editor));
    }
  }, [template, frameEle, view, dispatch]);

  const validateData = (callback: Function) => {
    if (data && isEdited) {
      try {
        validateContent(data);
      } catch (error) {
        openDialog(`${t("alert.warning")}`, (error as Error).message);
        return;
      }
    }

    callback();
  };

  const saveChanges = () => {
    if (data && isEdited) {
      const newTemplate = createTemplate(template, data);
      const newMedias = getContentMedias(data);
      const deletedMedias = differenceOfObjects(oldMedias, newMedias, "id");

      if (onSave && newTemplate) {
        onSave(newTemplate);
      }

      removeFiles(deletedMedias);
    }
  };

  const revertChanges = () => {
    clearFiles(element.id, false);
  };

  const selectComponent = (newComponent?: MediaComponent | ButtonComponent | SoundComponent) => {
    if (!isFileUploading && dispatch) {
      validateData(() => {
        dispatch(setComponent(newComponent));
      });
    }
  };

  const handleSaveOnClose = (event: MouseEvent) => {
    let medias: MediaComponent | undefined | any = null;
    state.data?.medias.map((x, i: Number) => {
      if (x.config?.variant) {
        x.config?.variant.map((y, idx) => {
          if (y === "target") {
            medias = x;
          }
        });
      }
    });
    const options = {
      okLabel: `${t("button.save")}`,
      cancelLabel: `${t("button.cancel")}`,
    };

    if (
      medias &&
      (medias?.value?.template === undefined || "") &&
      medias.value?.name !== undefined &&
      medias.variant !== "hotspot" &&
      isEdited
    ) {
      openConfirmDialog(
        "Warning",
        `${t("alert.template_not_selected_target")}`,
        handleSave,
        handleCancel,
        options
      );
    } else {
      validateData(() => {
        saveChanges();
        clearFiles(element.id, true);
        clearAnimations();
        clearMediaProperties();

        if (onClose) {
          onClose(event);
        }
      });
    }
  };

  function handleSave(event: MouseEvent) {
    validateData(() => {
      saveChanges();
      clearFiles(element.id, true);
      clearAnimations();
      clearMediaProperties();

      if (onClose) {
        onClose(event);
      }
    });
  }

  function handleCancel() {}

  const renderComponentEditor = () => {
    if (!component && data!.texts.length > 0) {
      return <BlmContentText texts={data!.texts} isDark={isDarkTemplate} />;
    } else if (component && isMediaComponent(component)) {
      return component && <BlmContentMedia key={component.id} data={component} temp={tempVal} />;
    } else if (component && isButtonComponent(component)) {
      return component && <BlmContentButton key={component.id} data={component} temp={tempVal} />;
    } else if (component && isSoundComponent(component)) {
      return component && <BlmContentSound key={component.id} data={component} />;
    } else {
      return null;
    }
  };

  if (data) {
    return (
      <ContentEditorContext.Provider
        value={{
          element,
          template: data,
          component,
          selectComponent,
          openDialog,
          dispatch,
        }}
      >
        <div className="content-editor-wrapper">
          <div className="template-thumbnail-box">
            {template.thumbnail && <img src={template.thumbnail} alt="" />}
          </div>
          <BlmComponentRepository data={data} />
          <div className="component-editor-wrapper custom-scrollbar">{renderComponentEditor()}</div>
          <div className="content-editor-close-btn" onClick={handleSaveOnClose} />
          <div
            className={clsx("content-editor-overlay", {
              show: isFileUploading,
            })}
          />
        </div>
      </ContentEditorContext.Provider>
    );
  } else {
    return null;
  }
});

export default BlmContentEditor;
