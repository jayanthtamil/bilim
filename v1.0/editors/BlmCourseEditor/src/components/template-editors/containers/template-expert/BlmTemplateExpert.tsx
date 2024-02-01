import React, {
  forwardRef,
  MouseEvent,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import {
  CourseElementTemplate,
  Template,
  TemplateBase,
  TemplateSize,
  TemplateEditorComponent,
  CourseElement,
  TemplatePanelOptions,
} from "types";
import { PanelCloseReasons } from "editor-constants";
import { addClassToString, removeClassFromString, getTemplateAndVariant } from "utils";
import {
  getTemplateSizeModel,
  setTemplateSizeHTML,
  changeTemplateVariant,
} from "template-builders";
import BlmTemplateSize from "../template-size";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  element: CourseElement;
  template: CourseElementTemplate;
  templateEle: HTMLElement;
  onPreview: (template: CourseElementTemplate) => void;
  onMore: (options: TemplatePanelOptions) => void;
  onSave: (template: CourseElementTemplate) => void;
  onClose: (event: MouseEvent, reason: PanelCloseReasons) => void;
}

interface ListEditorState {
  variant?: TemplateBase;
  isDarkSelected: boolean;
  isEdited: boolean;
}

interface SizeEditorState {
  size: TemplateSize | null;
  isEdited: boolean;
}

interface ListState {
  template: Template;
  selectedTemplate: TemplateBase;
}

const initListEditor = {
  isDarkSelected: false,
  isEdited: false,
};
const initSizeEditor: SizeEditorState = { size: null, isEdited: false };

const createTemplate = (
  template: CourseElementTemplate,
  listEditor: ListEditorState,
  sizeEditor: SizeEditorState,
  isRelative = true,
  oldListEditor?: ListEditorState
) => {
  const {
    isDarkTemplate,
    template: { id: templateId },
  } = template;
  let newTemplate: CourseElementTemplate = { ...template };
  let isEdited = false;
  let isVariantChanged = false;

  if (listEditor.isEdited) {
    const { variant, isDarkSelected } = listEditor;
    const prevTemplateId = oldListEditor ? oldListEditor.variant?.id : templateId;
    const prevIsDarkTemplate = oldListEditor ? oldListEditor.isDarkSelected : isDarkTemplate;

    if (variant && variant.id !== prevTemplateId && variant.html) {
      newTemplate = changeTemplateVariant(template, variant, isDarkSelected, isRelative);

      isEdited = true;
      isVariantChanged = true;
    } else if (isDarkSelected !== prevIsDarkTemplate) {
      if (isDarkSelected) {
        newTemplate.html = addClassToString(newTemplate.html, ["dark"]);
      } else {
        newTemplate.html = removeClassFromString(newTemplate.html, ["dark"]);
      }

      newTemplate.isDarkTemplate = isDarkSelected;

      isEdited = true;
    }
  }

  if (sizeEditor.size && (sizeEditor.isEdited || isVariantChanged)) {
    newTemplate.html = setTemplateSizeHTML(newTemplate, sizeEditor.size);

    isEdited = true;
  }

  if (isEdited) {
    return newTemplate;
  }
};

const BlmTemplateExpert = forwardRef<TemplateEditorComponent, CompProps>((props, ref) => {
  const {
    element,
    template,
    templates,
    templateEle,
    course,
    onPreview,
    onSave,
    onClose,
    getTemplates,
    getTemplateProperties,
  } = props;
  const [variantList, setVariantList] = useState<ListState>();
  const [listEditor] = useState<ListEditorState>(initListEditor);
  const [sizeEditor, setSizeEditor] = useState<SizeEditorState>(initSizeEditor);
  const { size, isEdited } = sizeEditor;
  const { isOutdated, forAlertIcon } = element;

  const [idealTemplate, variants] = useMemo(() => {
    if (variantList) {
      const { template, selectedTemplate } = variantList;

      if (isOutdated && forAlertIcon) {
        return [template.substitue?.template, [selectedTemplate]];
      } else {
        return [template, [template, ...template.variants]];
      }
    }

    return [];
  }, [variantList, isOutdated, forAlertIcon]);

  useImperativeHandle(ref, () => ({
    isEdited: isEdited || listEditor.isEdited,
    saveOnClose: handleSaveOnClose,
    revert: () => {},
  }));

  useEffect(() => {
    if (!templates && course) {
      getTemplates(course);
    } else if (templates) {
      const result = getTemplateAndVariant(templates, template.template.id);

      if (result) {
        setVariantList({
          template: result.template,
          selectedTemplate: result.variant ?? result.template,
        });
      }
    }
  }, [template, course, templates, setVariantList, getTemplates]);

  useEffect(() => {
    if (idealTemplate && !idealTemplate.html) {
      getTemplateProperties(idealTemplate);
    }
  }, [idealTemplate, getTemplateProperties]);

  useEffect(() => {
    if (template) {
      let newSize = getTemplateSizeModel(template, templateEle);

      if (newSize) {
        setSizeEditor({ size: newSize, isEdited: false });
      }
    }
  }, [template, templateEle]);

  const saveChanges = () => {
    const newTemplate = createTemplate(template, listEditor, sizeEditor, !isOutdated);

    if (onSave && newTemplate) {
      onSave(newTemplate);
      return true;
    }

    return false;
  };

  const updatePreivew = (
    newListEditor: ListEditorState,
    newSizeEditor: SizeEditorState,
    oldListEditor?: ListEditorState
  ) => {
    const newTemplate = createTemplate(
      template,
      newListEditor,
      newSizeEditor,
      !isOutdated,
      oldListEditor
    );

    if (onPreview && newTemplate) {
      onPreview(newTemplate);
    }
  };

  const handleSizeChange = (newSize: TemplateSize) => {
    if (newSize) {
      const newSizeEditor = { size: newSize, isEdited: true };

      setSizeEditor(newSizeEditor);
      updatePreivew(listEditor, newSizeEditor);
    }
  };

  const handleSaveOnClose = (event: MouseEvent) => {
    const isSaved = saveChanges();

    if (onClose) {
      onClose(event, isSaved ? PanelCloseReasons.Close : PanelCloseReasons.Cancel);
    }
  };
  if (!variantList || !variants) {
    return null;
  } else {
    return (
      <div className="template-expert-panel">
        <div className="template-expert-anchor" />
        <div className="template-expert-list-wrapper" />
        {size && (
          <BlmTemplateSize
            data={size}
            onChange={handleSizeChange}
            onCloseClick={handleSaveOnClose}
          />
        )}
      </div>
    );
  }
});

export default BlmTemplateExpert;
