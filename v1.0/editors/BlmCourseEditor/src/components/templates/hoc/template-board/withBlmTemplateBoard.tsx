import React, {
  useState,
  useEffect,
  FunctionComponent,
  ComponentType,
  MouseEvent,
  useCallback,
  useRef,
} from "react";
import { Diff } from "utility-types";
import { setScreenBackgroundHTML, getScreenBackgroundModel } from "template-builders";

import {
  TemplatePanelOptions,
  CourseElement,
  TemplateBase,
  CourseElementTemplate,
  AssociatedTemplate,
  ScreenBackground,
} from "types";
import {
  ElementType,
  PanelCloseReasons,
  TemplateEditorTypes,
  TemplatePanelTypes,
} from "editor-constants";
import { findIndex, getChildElement } from "utils";
import { usePrevious } from "hooks";
import { BlmTemplatesPanel } from "components/domain";
import {
  BlmBackgroundEditor,
  BlmScrollEditor,
  BlmTemplateEditor,
  BlmVariantEditor,
  BlmPropertiesEditor,
  BlmAssociatedChapterEditor,
  BlmActionEditor,
  BlmExpertEditor,
} from "components/template-editors";
import { withBlmMainFrame } from "components/frames";
import {
  changeTemplateVariant,
  createElementTemplateHTML,
  getUnusedMedias,
} from "template-builders";
import BlmTemplateBoardContext from "./BlmTemplateBoardContext";
import connector, { ContainerProps } from "./template-board-container";
import { setContentTemplateHTML, getContentTemplateModel } from "template-builders";
import "./styles.scss";

interface InjectedProps {
  templates?: CourseElementTemplate[];
}

interface CompProps {
  element: CourseElement;
}

interface TemplatesPanelState {
  open: boolean;
  options?: TemplatePanelOptions;
}

interface EditorPanelState {
  open: boolean;
  type: TemplateEditorTypes;
  template?: CourseElementTemplate;
  anchorEle?: HTMLElement;
  templateEle?: HTMLElement;
}

const initTemplatesPanel: TemplatesPanelState = {
  open: false,
  options: undefined,
};

const initEditorPanel: EditorPanelState = {
  open: false,
  type: TemplateEditorTypes.None,
};

interface DuplicateElement {
  isDuplicate: boolean;
  template: any;
  templates: any;
}

const initStateForDuplicate: DuplicateElement = {
  isDuplicate: false,
  template: undefined,
  templates: undefined,
};

const createTemplate = (template: CourseElementTemplate, background: ScreenBackground) => {
  const newTemplate: CourseElementTemplate = {
    ...template,
  };

  newTemplate.html = setScreenBackgroundHTML(newTemplate, background);

  return newTemplate;
};

const withBlmTemplateBoard = <P extends InjectedProps>(WrappedComponent: ComponentType<P>) => {
  const FramedComponent = withBlmMainFrame(WrappedComponent);
  const WithBlmTemplateBoard: FunctionComponent<CompProps & ContainerProps & P> = (props) => {
    const {
      element,
      curElement,
      templates,
      displayTemplates,
      structurePanel,
      getCourseStructure,
      openStructurePanel,
      closeStructurePanel,
      getElementTemplates,
      saveTemplates,
      previewTemplates,
      duplicateElementTemplate,
      deleteElementTemplate,
      positionElementTemplate,
      renameElement,
      removeFiles,
      clearFiles,
      openConfirmDialog,
      toggleInteraction,
      updateElementTemplates,
      ...wrappedProps
    } = props;
    const [templatesPanel, setTemplatesPanel] = useState(initTemplatesPanel);
    const [editorPanel, setEditorPanel] = useState(initEditorPanel);
    const [forDuplicate, setForDuplicate] = useState(initStateForDuplicate);

    const prevElement = usePrevious(element);
    const switchCacheRef = useRef(new Map<string, CourseElementTemplate[]>());
    const switchCache = switchCacheRef.current;

    const toggleTemplatesPanel = useCallback(
      (open: boolean, options?: TemplatePanelOptions) => {
        setTemplatesPanel({ open, options });
      },
      [setTemplatesPanel]
    );

    const deleteSwitchCache = useCallback(
      (id: string) => {
        if (switchCache.has(id)) {
          const [oldTemplate, newTemplate] = switchCache.get(id)!;

          if (oldTemplate && newTemplate) {
            const medias = getUnusedMedias(oldTemplate, newTemplate);

            if (medias.length) {
              removeFiles(medias);
              clearFiles(oldTemplate.id, true);
            }
          }

          switchCache.delete(id);
        }
      },
      [switchCache, removeFiles, clearFiles]
    );

    useEffect(() => {
      if (element) {
        const { type, templateType } = element;

        if (
          (type === ElementType.Screen ||
            type === ElementType.Question ||
            type === ElementType.SimpleContent) &&
          !templateType
        ) {
          const options = new TemplatePanelOptions(type);
          options.isSummary = element.isSummary;

          toggleTemplatesPanel(true, options);
        }
      }
    }, [element, toggleTemplatesPanel]);

    useEffect(() => {
      if (element && element.id !== prevElement?.id) {
        getElementTemplates(element);
      }
    }, [element, prevElement, getElementTemplates]);

    useEffect(() => {
      previewTemplates(templates);
      if (forDuplicate.isDuplicate && forDuplicate.template && forDuplicate.templates) {
        var allTemplates = forDuplicate.templates.templates;
        if (allTemplates) {
          var newInd;
          allTemplates.forEach((template1: any, ind: number) => {
            if (template1.nid === forDuplicate.template.id) {
              newInd = ind + 1;
            }
          });
          var duplicateTemplates: CourseElementTemplate[] = [...allTemplates];
          if (newInd) {
            const newContent = getContentTemplateModel(allTemplates[newInd]);
            duplicateTemplates[newInd].html = setContentTemplateHTML(
              allTemplates[newInd],
              newContent,
              "duplicate"
            );
            updateElementTemplates(element.id, duplicateTemplates, "duplicate");
          }
          setForDuplicate({
            isDuplicate: false,
            template: undefined,
            templates: undefined,
          });
        }
      }
    }, [templates, forDuplicate, element, saveTemplates, previewTemplates, updateElementTemplates]);

    useEffect(() => {
      toggleInteraction(true);
    }, [displayTemplates, toggleInteraction]);

    useEffect(() => {
      return () => {
        switchCache.forEach((_, key) => {
          deleteSwitchCache(key);
        });
      };
    }, [switchCache, deleteSwitchCache]);

    const getTemplateElement = (template: CourseElementTemplate) => {
      if (
        template &&
        (curElement.type === ElementType.Page || curElement.type === ElementType.SimplePage)
      ) {
        return getChildElement(curElement, template.id);
      } else {
        return curElement;
      }
    };

    const handleTemplatesPanelClose = (event: any) => {
      const { type, templateType } = curElement;

      toggleTemplatesPanel(false);

      if (
        (type === ElementType.Screen ||
          type === ElementType.Question ||
          type === ElementType.SimpleContent) &&
        !templateType
      ) {
        openStructurePanel();
      }
    };

    const addSwitchCache = (
      oldTemplate: CourseElementTemplate,
      newTemplate: CourseElementTemplate
    ) => {
      switchCache.set(oldTemplate.id, [oldTemplate, newTemplate]);
    };

    const removeSwitchCache = (template: CourseElementTemplate) => {
      deleteSwitchCache(template.id);
    };

    const handleShowTemplates = (options: TemplatePanelOptions) => {
      toggleTemplatesPanel(true, options);
    };

    const handleMoreTemplates = (options: TemplatePanelOptions) => {
      revertPreviewTemplates();
      toggleEditorPanel(false);
      toggleTemplatesPanel(true, options);
    };

    const handleAddTemplateClick = (
      variant: TemplateBase,
      options: TemplatePanelOptions,
      isDarkSelected: boolean = false
    ) => {
      const { type, templateType, position, isSummary, template } = options;

      if (type !== TemplatePanelTypes.Switchable) {
        const { id, name, thumbnailLight, thumbnailDark } = variant;
        const elementType =
          ElementType.Page === curElement.type
            ? ElementType.PartPage
            : ElementType.SimplePage === curElement.type
            ? ElementType.SimplePartPage
            : templateType;
        const newHtml = createElementTemplateHTML(variant.html, isDarkSelected, elementType);
        const associated = new AssociatedTemplate(id, name, thumbnailLight, thumbnailDark);
        const newTemplate = new CourseElementTemplate(
          "",
          name,
          elementType,
          templateType,
          newHtml,
          associated,
          isDarkSelected
        );
        newTemplate.isSummary = isSummary;
        saveTemplates(element, newTemplate, position);

        if (
          element.type === ElementType.SimpleContent ||
          (element.parent?.type === ElementType.Annexes && element.type === ElementType.Screen)
        ) {
          const newB = getScreenBackgroundModel(newTemplate);
          if (newB) {
            newB["tint"] = { color: "#ffffff", alpha: 100 } as any;
            const newTemplates = createTemplate(newTemplate, newB);
            previewTemplates(newTemplates);
            handleTemplateEdit(newTemplates);
          }
        }
      } else if (template) {
        const cached = switchCache.get(template.id)?.[0];
        const oldTemplate = cached || template;
        const newTemplate = changeTemplateVariant(oldTemplate, variant, isDarkSelected, false);

        addSwitchCache(oldTemplate, newTemplate);
        saveTemplates(element, newTemplate);
      }

      structurePanel.isPinned ? openStructurePanel() : closeStructurePanel();
      toggleTemplatesPanel(false);
      toggleInteraction(false);
    };

    const revertPreviewTemplates = () => {
      previewTemplates(templates);
    };

    const toggleEditorPanel = (
      open: boolean,
      type: TemplateEditorTypes = TemplateEditorTypes.None,
      template?: CourseElementTemplate,
      anchorEle?: HTMLElement,
      templateEle?: HTMLElement
    ) => {
      setEditorPanel({ open, type, template, anchorEle, templateEle });
    };

    const handleTemplateEdit = (template: CourseElementTemplate) => {
      if (template) {
        removeSwitchCache(template);
        previewTemplates(template); //BILIM-153: [react] Updated text not reflected in editor mode
        saveTemplates(element, template);
      }
    };

    const handleEditClick = (
      type: TemplateEditorTypes,
      template: CourseElementTemplate,
      anchorEle: HTMLElement,
      templateEle: HTMLElement
    ) => {
      if (template) {
        toggleEditorPanel(true, type, template, anchorEle, templateEle);
      }
    };

    const handleDuplicateClick = (template: CourseElementTemplate) => {
      if (curElement && template) {
        duplicateElementTemplate(curElement, template).then(() => {
          getElementTemplates(element).then((res) => {
            setForDuplicate({
              isDuplicate: true,
              template: template,
              templates: res.payload,
            });
          });
        });
      }
    };

    const handleDeleteClick = (template: CourseElementTemplate) => {
      if (curElement && template && templates) {
        const title = "Delete confirmation";
        const message = `Do you want to delete this and all his children?`;
        const onOk = () => {
          toggleInteraction(false);
          deleteElementTemplate(curElement, template);
        };

        openConfirmDialog(title, message, onOk);
      }
    };

    const handlePositionChange = (template: CourseElementTemplate, delta: number) => {
      if (curElement && template && templates) {
        const pos = findIndex(templates, template.id, "id");
        const newPos = pos + delta;
        const len = templates.length;
        const newTemplates = [...templates];

        if (pos !== -1 && newPos >= 0 && newPos < len) {
          const arr = newTemplates.splice(pos, 1);
          newTemplates.splice(newPos, 0, arr[0]);

          positionElementTemplate(curElement, newTemplates);
        }
      }
    };

    const handleNameChange = (template: CourseElementTemplate, name: string) => {
      renameElement(template, name, { ...template, name });
    };

    const handleEditorPreview = (template: CourseElementTemplate) => {
      previewTemplates(template);
    };

    const handleEditorSave = (template: CourseElementTemplate) => {
      removeSwitchCache(template);
      saveTemplates(element, template);
    };

    const handleEditorClose = (event: MouseEvent, reason?: PanelCloseReasons) => {
      if (reason && reason === PanelCloseReasons.Cancel) {
        revertPreviewTemplates();
      }

      toggleEditorPanel(false);
    };

    const handleHotspotAdd = (elementID: string, template: CourseElementTemplate) => {
      updateElementTemplates(elementID, template);
    };

    const renderEditorPanel = () => {
      const { open, type, template, anchorEle, templateEle } = editorPanel;

      if (open && type !== TemplateEditorTypes.None && template) {
        if (type === TemplateEditorTypes.Template && templateEle) {
          return (
            <BlmTemplateEditor
              open={open}
              frameEle={templateEle}
              element={getTemplateElement(template)!}
              template={template}
              onSave={handleEditorSave}
              onClose={handleEditorClose}
            />
          );
        } else if (anchorEle) {
          if (type === TemplateEditorTypes.Variant && templateEle) {
            return (
              <BlmVariantEditor
                open={open}
                anchorEle={anchorEle}
                templateEle={templateEle}
                element={getTemplateElement(template)!}
                template={template}
                onPreview={handleEditorPreview}
                onMore={handleMoreTemplates}
                onSave={handleEditorSave}
                onClose={handleEditorClose}
              />
            );
          } else if (type === TemplateEditorTypes.Background) {
            return (
              <BlmBackgroundEditor
                open={open}
                anchorEle={anchorEle}
                template={template}
                onPreview={handleEditorPreview}
                onSave={handleEditorSave}
                onClose={handleEditorClose}
              />
            );
          } else if (type === TemplateEditorTypes.Scroll) {
            return (
              <BlmScrollEditor
                open={open}
                anchorEle={anchorEle}
                template={template}
                onSave={handleEditorSave}
                onClose={handleEditorClose}
              />
            );
          } else if (type === TemplateEditorTypes.Expert) {
            return (
              <BlmExpertEditor
                open={open}
                anchorEle={anchorEle}
                template={template}
                element={getTemplateElement(template)!}
                onSave={handleEditorSave}
                onClose={handleEditorClose}
                templateEle={templateEle}
                onPreview={handleEditorPreview}
                onMore={handleMoreTemplates}
              />
            );
          } else if (type === TemplateEditorTypes.Action) {
            return (
              <BlmActionEditor
                open={open}
                anchorEle={anchorEle}
                element={getTemplateElement(template)!}
                template={template}
                onSave={handleEditorSave}
                onClose={handleEditorClose}
              />
            );
          } else if (
            type === TemplateEditorTypes.GeneralProps ||
            type === TemplateEditorTypes.CompletionProps ||
            type === TemplateEditorTypes.LogProps
          ) {
            return (
              <BlmPropertiesEditor
                open={open}
                anchorEle={anchorEle}
                type={type}
                element={getTemplateElement(template)!}
                onClose={handleEditorClose}
              />
            );
          } else if (type === TemplateEditorTypes.AssociatedChapter) {
            return (
              <BlmAssociatedChapterEditor
                open={open}
                anchorEle={anchorEle}
                element={curElement}
                template={template}
                onSave={handleEditorSave}
                onClose={handleEditorClose}
              />
            );
          }
        }
      }
    };

    return (
      <div className="template-board-wrapper custom-scrollbar">
        <BlmTemplateBoardContext.Provider
          value={{
            editorPanel: {
              isOpen: editorPanel.open,
              type: editorPanel.type,
              template: editorPanel.template,
            },
            onShowTemplates: handleShowTemplates,
            onTemplateEdit: handleTemplateEdit,
            onEditClick: handleEditClick,
            onDuplicateClick: handleDuplicateClick,
            onDeleteClick: handleDeleteClick,
            onPositionChange: handlePositionChange,
            onNameChange: handleNameChange,
            onLoadPartPageHotspot: handleHotspotAdd,
          }}
        >
          <FramedComponent
            {...(wrappedProps as P)}
            element={curElement}
            templates={displayTemplates}
          />
        </BlmTemplateBoardContext.Provider>
        {templatesPanel.options && (
          <BlmTemplatesPanel
            open={templatesPanel.open}
            element={curElement}
            options={templatesPanel.options}
            onAddTemplateClick={handleAddTemplateClick}
            onClose={handleTemplatesPanelClose}
          />
        )}
        {renderEditorPanel()}
      </div>
    );
  };

  //https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
  return connector(WithBlmTemplateBoard as any) as ComponentType<
    CompProps & Diff<P, InjectedProps>
  >;
};

export default withBlmTemplateBoard;
