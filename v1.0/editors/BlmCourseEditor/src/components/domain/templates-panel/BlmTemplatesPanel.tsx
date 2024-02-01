import React, { MouseEvent, useCallback, useMemo, useEffect, useState } from "react";
import { Drawer } from "@material-ui/core";

import {
  CourseElement,
  TemplateFilter,
  TemplatePanelOptions,
  TemplateBase,
  TemplateScopeFilter,
} from "types";
import { TemplateContext, ElementType, TemplatePanelTypes, StructureTypes } from "editor-constants";
import { getTemplateAndVariant, isVariant } from "utils";
import { createCategories, getFirstCategory } from "./utils";
import BlmCategoryList from "./category-list";
import TemplatesPanelContext from "./TemplatesPanelContext";
import { AddTemplateHandler } from "./types";
import { ContainerProps } from "./templates-panel-container";
import "./templates-panel.scss";

export interface CompProps extends ContainerProps {
  open: boolean;
  element: CourseElement;
  options: TemplatePanelOptions;
  onAddTemplateClick?: (
    template: TemplateBase,
    options: TemplatePanelOptions,
    isDarkSelected: boolean
  ) => void;
  onClose: (event: MouseEvent) => void;
}

interface PanelState {
  template: TemplateBase;
  isDarkSelected: boolean;
}

function BlmTemplatesPanel(props: CompProps) {
  const {
    open,
    element,
    options,
    course,
    style,
    templates,
    getTemplates,
    getTemplateProperties,
    onAddTemplateClick,
    onClose,
  } = props;
  const [state, setState] = useState<PanelState>();

  const filter = useMemo(() => {
    if (templates && element) {
      const { parent } = element;
      const { type, templateType, isSummary } = options;
      const scope = new TemplateScopeFilter();
      let context;
      let virtualCategory;

      scope.included = [templateType];

      if (
        templateType !== ElementType.Question &&
        (element.type === ElementType.Page || element.type === ElementType.SimplePage)
      ) {
        scope.excluded = [ElementType.Question];
      }

      if (isSummary) {
        context = TemplateContext.Summary;
      } else if (parent?.type === ElementType.Feedback) {
        context = TemplateContext.Feedback;
      } else if (parent?.type === ElementType.AssociateContent) {
        context = TemplateContext.AssociateContent;
      } else if (templates && parent?.template?.interaction) {
        context = TemplateContext.Interaction;
        virtualCategory = getTemplateAndVariant(templates, parent.template.id)?.template.parent;
      }

      const filter: TemplateFilter = {
        showAllCategory: !(isSummary || Boolean(virtualCategory)),
        framework: style?.config?.framework,
        display: course?.display,
        structureContext: element.root?.type as StructureTypes,
        theme: parent?.theme?.toLowerCase(),
        scope,
        context,
        switchable: type === TemplatePanelTypes.Switchable,
        virtualCategory,
      };

      return filter;
    }
  }, [templates, element, options, course, style]);

  const categories = useMemo(() => {
    if (templates && filter) {
      return createCategories(templates, filter);
    }
  }, [templates, filter]);

  const selectedCategory = useMemo(() => {
    if (categories && options.isSummary) {
      return getFirstCategory(categories);
    }
  }, [categories, options]);

  const addTemplate: AddTemplateHandler = useCallback(
    (template, isDarkSelected) => {
      if (element && template.html && onAddTemplateClick) {
        onAddTemplateClick(template, options, isDarkSelected);
      }
    },
    [element, options, onAddTemplateClick]
  );

  useEffect(() => {
    if (!templates && course) {
      getTemplates(course);
    }
  }, [templates, course, getTemplates]);

  useEffect(() => {
    if (templates && state) {
      const { template, isDarkSelected } = state;
      const result = getTemplateAndVariant(templates, template.id);
      const newTemplate = result?.variant || result?.template;

      if (newTemplate?.html) {
        addTemplate(newTemplate, isDarkSelected);
        setState(undefined);
      }
    }
  }, [templates, state, addTemplate]);

  const handleAddTemplateClick: AddTemplateHandler = (template, isDarkSelected) => {
    if (!template.html) {
      const reqTemplate = isVariant(template) ? template.parent : template;

      if (reqTemplate) {
        setState({ template, isDarkSelected });
        getTemplateProperties(reqTemplate);
      }
    } else {
      addTemplate(template, isDarkSelected);
    }
  };

  const onCloseDrawer = (event: any) => {
    if (onClose) {
      onClose(event);
    }
  };

  return (
    <Drawer open={open} className="templates-panel-drawer" onClose={onCloseDrawer}>
      {element && categories && (
        <div className="templates-panel custom-scrollbar">
          <TemplatesPanelContext.Provider
            value={{
              type: options.type,
              onAddTemplateClick: handleAddTemplateClick,
            }}
          >
            <BlmCategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              isDark={options.template?.isDarkTemplate}
              onClose={onClose}
            />
          </TemplatesPanelContext.Provider>
        </div>
      )}
    </Drawer>
  );
}

export default BlmTemplatesPanel;
