import React, { useState, Fragment, useEffect, MouseEvent, useContext, useMemo } from "react";
import clsx from "clsx";
import { Popover } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { Template, TemplateCategory } from "types";
import { hasTabCategory, hasGroupCategory } from "utils";
import { Tabs, Tab } from "shared/material-ui";
import TemplatesPanelContext from "../TemplatesPanelContext";
import BlmVariantList from "../variant-list";
import BlmTemplateListItem from "./template-list-item";
import TemplateListContext from "./TemplateListContext";
import "./template-list.scss";

interface CompProps {
  data: TemplateCategory;
  show: boolean;
  isDark?: boolean;
  onCloseClick: (event: MouseEvent) => void;
}

interface TooltipState {
  show: boolean;
  anchorEle?: HTMLElement;
  text: string;
}

interface GroupCompProps {
  data: TemplateCategory;
}

const initTooltip: TooltipState = {
  show: false,
  anchorEle: undefined,
  text: "",
};

function createTabs(categories: TemplateCategory[]) {
  if (categories) {
    const tabs = categories.map((category, index) => {
      const { name, children, description } = category;
      let tabChild;

      if (hasGroupCategory(category)) {
        tabChild = createGroups(children as TemplateCategory[]);
      } else {
        tabChild = createTemplates(children as Template[]);
      }
      return (
        <Tab key={index} label={description ? description : name}>
          {tabChild}
        </Tab>
      );
    });

    return <Tabs className="template-tabs-wrapper">{tabs}</Tabs>;
  }
}

function createGroups(categories: TemplateCategory[]) {
  if (categories) {
    const groups = categories.map((category, index) => {
      return <BlmTemplageGroup key={index} data={category} />;
    });

    return groups;
  }
  return <Fragment />;
}

function createTemplates(templates: Template[]) {
  const list = templates.map((template, index) => {
    return <BlmTemplateListItem key={index} data={template} />;
  });

  return <div className="template-list-wrapper">{list}</div>;
}

function BlmTemplageGroup(props: GroupCompProps) {
  const { data } = props;
  const { name, children, description } = data;
  const [open, setOpen] = useState(true);

  const handleCloseClick = (event: MouseEvent) => {
    setOpen(!open);
  };

  return (
    <div
      className={clsx("template-group-wrapper", {
        collapse: !open,
      })}
    >
      <div className="template-group-header">
        <span className="template-group-title">{description ? description : name}</span>
        <span className="template-group-expand-btn" onClick={handleCloseClick} />
      </div>
      {createTemplates(children as Template[])}
    </div>
  );
}

function BlmTemplateList(props: CompProps) {
  const { data, show, isDark, onCloseClick } = props;
  const { /* name, */ info, children, /* description */ } = data;
  const { onAddTemplateClick } = useContext(TemplatesPanelContext);
  const [tooltip, setTooltip] = useState(initTooltip);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>();
  const [showVariants, setShowVariants] = useState(false);
  const showWarning = !hasTabCategory(data);
  const { t } = useTranslation("domain");

  const varaints = useMemo(() => {
    if (selectedTemplate) {
      return [selectedTemplate, ...selectedTemplate.variants];
    }
  }, [selectedTemplate]);

  useEffect(() => {
    setSelectedTemplate(undefined);
    setShowVariants(false);
  }, [data]);

  const showTooltip = (anchorEle: HTMLElement, text: string) => {
    setTooltip({
      show: true,
      anchorEle: anchorEle,
      text: text,
    });
  };

  const handleCategoryInfoClick = (event: MouseEvent<HTMLElement>) => {
    if (info) {
      showTooltip(event.currentTarget, info);
    }
  };

  const handlePopoverClose = (event: MouseEvent) => {
    setTooltip({
      show: false,
      anchorEle: undefined,
      text: "",
    });
  };

  const handleAddClick = (template: Template) => {
    setSelectedTemplate(template);

    if (onAddTemplateClick) {
      onAddTemplateClick(template, isDark ? isDark : false);
    }
  };

  const handleVaraintsClick = (template: Template) => {
    setSelectedTemplate(template);
    setShowVariants(true);
  };

  const handleVariantCloseClick = (event: MouseEvent) => {
    setShowVariants(false);
  };

  const handleCloseClick = (event: MouseEvent) => {
    if (onCloseClick) {
      onCloseClick(event);
    }
  };

  const createChildren = () => {
    if (children && children.length > 0) {
      if (hasTabCategory(data)) {
        return createTabs(children as TemplateCategory[]);
      } else if (hasGroupCategory(data)) {
        return createGroups(children as TemplateCategory[]);
      } else {
        return createTemplates(children as Template[]);
      }
    }
  };

  return (
    <Fragment>
      <div
        className={clsx("template-list-panel", {
          show: show,
        })}
      >
        <div className="template-list-header">
          {/* <div className="template-list-title">
            <span>{description ? description : name}</span>
          </div> */}
          {info && <div className="template-list-info" onClick={handleCategoryInfoClick} />}
          {showWarning && <div className="template-list-warning">{t("template_list.warning")}</div>}
        </div>
        <div className="template-list-close-btn" onClick={handleCloseClick} />
        <div className="template-list-scroller custom-scrollbar">
          <TemplateListContext.Provider
            value={{
              selectedTemplate: selectedTemplate,
              onInfoClick: showTooltip,
              onAddClick: handleAddClick,
              onVariantsClick: handleVaraintsClick,
            }}
          >
            {createChildren()}
          </TemplateListContext.Provider>
        </div>
      </div>
      {selectedTemplate && varaints && (
        <BlmVariantList
          title={selectedTemplate.name}
          data={varaints}
          isBgChecked={isDark}
          show={show && showVariants}
          onCloseClick={handleVariantCloseClick}
        />
      )}
      <Popover
        open={tooltip.show}
        anchorEl={tooltip.anchorEle}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: 3,
          horizontal: -7,
        }}
        className="tempalte-list-popover"
        onClose={handlePopoverClose}
      >
        <div className="tempalte-list-tooltip">{tooltip.text}</div>
      </Popover>
    </Fragment>
  );
}

export default BlmTemplateList;
