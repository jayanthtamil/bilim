import React from "react";

import { ElementType } from "editor-constants";
import { hasProperties } from "utils";
import { BlmPageElement, BlmScreenElement, BlmQuestionElement } from "components/elements";
import { BlmPropertiesPanel } from "components/properties";
import { ContainerProps } from "./editor-board-container";
import "./editor-board.scss";

export interface CompProps extends ContainerProps {}

function BlmEditorBoard(props: CompProps) {
  const { element, child } = props;

  const renderChildren = () => {
    if (!element) {
      return null;
    } else if (element.type === ElementType.Page || element.type === ElementType.SimplePage) {
      return <BlmPageElement key={element.id} element={element} child={child} />;
    } else if (element.type === ElementType.Screen || element.type === ElementType.SimpleContent) {
      return <BlmScreenElement key={element.id} element={element} />;
    } else if (element.type === ElementType.Question) {
      return <BlmQuestionElement key={element.id} element={element} />;
    } else if (hasProperties(element)) {
      return <BlmPropertiesPanel element={element} />;
    }
  };

  return <main className="editor-board-wrapper">{element && renderChildren()}</main>;
}

export default BlmEditorBoard;
