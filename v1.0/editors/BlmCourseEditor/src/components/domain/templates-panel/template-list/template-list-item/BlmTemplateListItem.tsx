import React, { useContext, MouseEvent } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Template } from "types";
import { TemplatePanelTypes } from "editor-constants";
import TemplatesPanelContext from "../../TemplatesPanelContext";
import TemplateListContext from "../TemplateListContext";
import "./template-list-item.scss";

export interface CompProps {
  data: Template;
}

function BlmTemplateListItem(props: CompProps) {
  const { data } = props;
  const { name, description, thumbnailLight, info, warning } = data;
  const { type } = useContext(TemplatesPanelContext);
  const { t } = useTranslation("domain");
  const { selectedTemplate, onInfoClick, onAddClick, onVariantsClick } =
    useContext(TemplateListContext);

  const handleAddClick = (event: MouseEvent) => {
    if (onAddClick) {
      onAddClick(data);
    }
  };

  const handleVariantsClick = (event: MouseEvent) => {
    if (onVariantsClick) {
      onVariantsClick(data);
    }
  };

  const handleInfoClick = (event: MouseEvent<HTMLElement>) => {
    if (info && onInfoClick) {
      onInfoClick(event.currentTarget, info);
    }
  };

  const handleWarningClick = (event: MouseEvent<HTMLElement>) => {
    if (warning && onInfoClick) {
      onInfoClick(event.currentTarget, warning);
    }
  };

  return (
    <div
      className={clsx("template-item-wrapper", {
        selected: selectedTemplate === data,
      })}
    >
      <span className="template-item-lbl" />
      <div className="template-item-img-wrapper">
        <img src={thumbnailLight} className="template-item-img" alt={name} />
      </div>
      <span className="template-item-name">{description || name}</span>
      <div className="template-item-add-btn" onClick={handleAddClick}>
        {type === TemplatePanelTypes.Switchable
          ? `${t("template_list_item.replace")}`
          : `${t("template_list_item.add")}`}
      </div>
      <div className="template-item-divider" />
      <div className="template-item-variant-btn" onClick={handleVariantsClick}>
        {t("template_list_item.variant")}
      </div>
      {info && <div className="template-item-info-icon" onClick={handleInfoClick} />}
      {warning && <div className="template-item-warning-icon" onClick={handleWarningClick} />}
    </div>
  );
}

export default BlmTemplateListItem;
