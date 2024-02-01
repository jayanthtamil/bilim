import React from "react";
import { useContentEditorCtx } from "components/content-editor/core";
import clsx from "clsx";
import BlmStructureSelect, { StructureSelectChangeEvent } from "components/structures/select";
import { ElementType } from "editor-constants";
import { CustomChangeEvent, GotoAction, CourseElement } from "types";
import "./styles.scss";

export interface CompProps {
  data?: GotoAction;
  type?: "standard" | "limited";
  onChange?: (event: CustomChangeEvent<GotoAction>) => void;
}

const BlmButtonActionGoto = (props: CompProps) => {
  const { type, data, onChange } = props;
  const { element } = useContentEditorCtx();
  const { gotoId } = data || {};

  const STRUCTURE_ITEMS: ElementType[] = [
    ElementType.Chapter,
    ElementType.Page,
    ElementType.Screen,
    ElementType.Question,
    ElementType.Custom,
  ];

  const isAllowedItem = (item: CourseElement) => {
    return item.parent?.isEvaluation ? false : STRUCTURE_ITEMS.includes(item.type);
  };

  const handleChange = (element: StructureSelectChangeEvent) => {
    console.log(element);
    const { target } = element;
    const { name, value } = target;
    if (onChange) {
      onChange({ target: { name, value: { action: name, gotoId: value } } });
    }
  };

  return (
    <div className={clsx("simple-action-wrapper", type)}>
      <BlmStructureSelect
        name="goto"
        element={element}
        structures={{ show: true, allowedItems: isAllowedItem }}
        selectables={[
          ElementType.SimplePage,
          ElementType.SimpleContent,
          ElementType.Page,
          ElementType.Screen,
          ElementType.Chapter,
          ElementType.Custom,
          ElementType.Question,
        ]}
        value={gotoId}
        local={{ show: false }}
        className="structure-select-with-icons"
        onChange={handleChange}
        placeholder="Select in structure"
      />
    </div>
  );
};

export default BlmButtonActionGoto;
