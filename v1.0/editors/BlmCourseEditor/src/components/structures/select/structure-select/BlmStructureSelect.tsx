import React, { useState, MouseEvent, useEffect, useMemo } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { CourseElement, CustomChangeEvent } from "types";
import { ElementType } from "editor-constants";
import { getElement } from "utils";
import { BlmCourseTree, CourseTreeProps } from "components/shared";
import BlmSelect from "../select";
import BlmAccordion from "../accordion";
import { ContainerProps } from "./structure-select-container";
import "./structure-select.scss";

export type StructureSelectChangeEvent = CustomChangeEvent<string>;

export interface CompProps extends ContainerProps {
  name: string;
  value?: string;
  placeholder?: string;
  element?: CourseElement | string;
  structures?: {
    show?: boolean;
    allowedItems?: CourseTreeProps["allowedItems"];
  };
  local?: {
    show?: boolean;
    allowedItems?: CourseTreeProps["allowedItems"];
  };
  annexes?: {
    show?: boolean;
    allowedItems?: CourseTreeProps["allowedItems"];
  };
  template?: {
    allowedItems?: CourseTreeProps["allowedItems"];
  };
  selectables?: ElementType[];
  className?: string;
  onChange?: (event: StructureSelectChangeEvent) => void;
}

const DEFAULT_ITEMS = [
  ElementType.Chapter,
  ElementType.AnnexesFolder,
  ElementType.Screen,
  ElementType.Page,
  ElementType.Custom,
];
const DEFAULT_TEMPLATE_ITMES = [ElementType.SimplePage, ElementType.SimpleContent];

function BlmStructureSelect(props: CompProps) {
  const { t } = useTranslation("structures");
  const {
    name,
    value,
    structure,
    element,
    placeholder = t("label.select_1"),
    structures,
    annexes,
    template,
    selectables,
    className,
    onChange,
    local,
  } = props;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CourseElement>();

  const localElement = useMemo(() => {
    if (typeof element === "string") {
      return structure ? getElement(structure, element) : undefined;
    }

    return element;
  }, [element, structure]);

  useEffect(() => {
    let item;

    if (value && value !== "") {
      item = structure ? getElement(structure, value) : undefined;
    }

    setSelectedItem(item);
  }, [value, structure, setSelectedItem]);

  const updateChange = (item: CourseElement) => {
    if (onChange) {
      onChange({ target: { name, value: item.id } });
    }
  };

  const handleSelectOpen = (event: MouseEvent) => {
    setOpen(true);
  };

  const handleSelectClose = (event: MouseEvent) => {
    setOpen(false);
  };

  const handleTreeItemClick = (item: CourseElement) => {
    if (!selectables || selectables.includes(item.type)) {
      setSelectedItem(item);
      setOpen(false);

      updateChange(item);
    }
  };

  return (
    <BlmSelect
      name={name}
      open={open}
      value={selectedItem?.name}
      placeholder={placeholder}
      onOpen={handleSelectOpen}
      onClose={handleSelectClose}
      className={clsx("structure-select", selectedItem?.type, className)}
    >
      {(!structures || structures.show) && (
        <BlmAccordion title={t("accordion.structure")}>
          {structure?.structure && (
            <BlmCourseTree
              data={structure.structure}
              treeType={ElementType.Structure}
              allowedItems={structures?.allowedItems || DEFAULT_ITEMS}
              selectedItem={selectedItem}
              onItemClick={handleTreeItemClick}
            />
          )}
        </BlmAccordion>
      )}
      {localElement && (local === undefined || local.show === true) && (
        <BlmAccordion title={t("accordion.local")}>
          <BlmCourseTree
            data={localElement}
            treeType="template"
            selectedItem={selectedItem}
            allowedItems={template?.allowedItems || DEFAULT_TEMPLATE_ITMES}
            onItemClick={handleTreeItemClick}
          />
        </BlmAccordion>
      )}
      {annexes?.show && (
        <BlmAccordion title={t("accordion.annexes")}>
          {structure?.annexes && (
            <BlmCourseTree
              data={structure.annexes}
              treeType={ElementType.Annexes}
              allowedItems={annexes?.allowedItems || DEFAULT_ITEMS}
              selectedItem={selectedItem}
              onItemClick={handleTreeItemClick}
            />
          )}
        </BlmAccordion>
      )}
    </BlmSelect>
  );
}

export default BlmStructureSelect;
