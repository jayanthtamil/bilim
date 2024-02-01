import React, { useReducer, ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { ContextMenu, CourseElement, OptionsClickHandler } from "types";
import { ContextMenuActions, ElementType } from "editor-constants";
import BlmAccordion from "../accordion";
import BlmContextMenu from "../context-menu";
import {
  RepositoryProps,
  RepositoryState,
  RepositoryActions,
  RepositoryActionTypes,
  showContextMenu,
  hideContextMenu,
} from "./types";
import "./repository-panel.scss";

const addActions = [
  ContextMenuActions.AddChapter,
  ContextMenuActions.AddEvaluation,
  ContextMenuActions.AddPage,
  ContextMenuActions.AddScreen,
  ContextMenuActions.AddQuestion,
  ContextMenuActions.AddCustom,
  ContextMenuActions.AddSimpleContent,
  ContextMenuActions.AddSimplePage,
  ContextMenuActions.AddAnnexesFolder,
];

const initState: RepositoryState = {
  ctxData: undefined,
  ctxItem: undefined,
};

function reducer(prevState: RepositoryState, action: RepositoryActions) {
  let state = { ...prevState };

  if (action.type === RepositoryActionTypes.ShowContextMenu) {
    state.ctxData = action.data;
    state.ctxItem = action.data.item;
  } else if (action.type === RepositoryActionTypes.HideContextMenu) {
    state.ctxData = undefined;
    state.ctxItem = undefined;
  }

  return state;
}

function BlmRepositoryPanel(props: RepositoryProps) {
  const { data, onOptionsClick, onPanelChange } = props;
  const { starting, structure, annexes } = data || {};
  const [state, dispatch] = useReducer(reducer, initState);
  const [expanded, setExpanded] = useState<ElementType>();
  const { t } = useTranslation("structures");

  const handleOptionsClick: OptionsClickHandler = (anchorEle, element, treeType) => {
    if (onOptionsClick) {
      onOptionsClick(anchorEle, element, treeType);
    }

    toggleContextMenu(new ContextMenu(anchorEle, element, treeType));
  };

  const toggleContextMenu = (ctxData?: ContextMenu) => {
    if (ctxData) {
      setTimeout(() => {
        dispatch(showContextMenu(ctxData));
      }, 100);
    } else {
      dispatch(hideContextMenu());
    }
  };

  const handleContextItemClick = (action: ContextMenuActions, element: CourseElement) => {
    if (addActions.includes(action) && !element.root) {
      setExpanded(element.type);
    }
  };

  const handleContextClose = () => {
    toggleContextMenu();
  };

  const handlePanelChange = (event: ChangeEvent<{}>, expanded: boolean) => {
    setExpanded(undefined);

    if (onPanelChange) {
      onPanelChange(event, expanded);
    }
  };

  if (!data) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="repository-wrapper">
        <BlmAccordion
          title={t("accordion.starting")}
          treeType={ElementType.Starting}
          data={starting!}
          ctxItem={state.ctxItem}
          expanded={expanded === ElementType.Starting ? true : undefined}
          onOptionsClick={handleOptionsClick}
          onPanelChange={handlePanelChange}
        />
        <BlmAccordion
          title={t("accordion.structure")}
          treeType={ElementType.Structure}
          data={structure!}
          ctxItem={state.ctxItem}
          expanded={expanded === ElementType.Structure ? true : undefined}
          onOptionsClick={handleOptionsClick}
          onPanelChange={handlePanelChange}
        />
        <BlmAccordion
          title={t("accordion.annexes")}
          treeType={ElementType.Annexes}
          data={annexes!}
          ctxItem={state.ctxItem}
          expanded={expanded === ElementType.Annexes ? true : undefined}
          onOptionsClick={handleOptionsClick}
          onPanelChange={handlePanelChange}
        />
        <BlmContextMenu
          data={state.ctxData}
          onItemClick={handleContextItemClick}
          onClose={handleContextClose}
        />
      </div>
    );
  }
}

export default BlmRepositoryPanel;
