import React, { useRef, MouseEvent, useState, Fragment, useEffect } from "react";
import clsx from "clsx";
import { Breadcrumbs } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CMSFolder } from "types";
import { BlmCoursePropertiesPanel } from "components/course-properties";
import { BlmCourseExportPanel } from "components/course-export";
import { ContainerProps } from "./header-container";
import "./header.scss";
import { textArea } from "utils";

export interface CompProps extends ContainerProps {}

interface EditorPanelState {
  open: boolean;
  type: "none" | "properties" | "export";
  anchorEle?: HTMLElement;
}

const initEditorPanel: EditorPanelState = {
  open: false,
  type: "none",
};

function flatChild(parent?: CMSFolder | null) {
  let arr: CMSFolder[] = [];

  if (parent) {
    arr.push(parent);

    if (parent.child) {
      const result = flatChild(parent.child);
      arr = arr.concat(result);
    }
  }

  return arr;
}

function BlmHeader(props: CompProps) {
  const {
    panel,
    tree,
    courseProps,
    element,
    toggleStructurePanel,
    toggleStructurePanelPin,
    setStructureAnchorEle,
    getCoursePreview,
  } = props;
  const header = tree.item ? tree.item.name : "";
  const anchorRef = useRef<HTMLDivElement>(null);
  const [editorPanel, setEditorPanel] = useState(initEditorPanel);
  const { t } = useTranslation();

  useEffect(() => {
    const element = anchorRef.current;

    if (element) {
      setStructureAnchorEle(element);
      toggleStructurePanel(true);
    }
  }, [setStructureAnchorEle, toggleStructurePanel]);

  const toggleEditorPanel = (
    open: boolean,
    type: EditorPanelState["type"] = "none",
    anchorEle?: HTMLElement
  ) => {
    setEditorPanel({ open, type, anchorEle });
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (process.env.REACT_APP_BACK_URL) {
      window.location.href = process.env.REACT_APP_BACK_URL;
    }
  };

  const handleStructuresClick = () => {
    toggleStructurePanel();
  };

  const handlePinClick = (event: MouseEvent) => {
    event.stopPropagation();

    toggleStructurePanelPin();
  };

  const renderBreadcrumbItems = () => {
    const { title } = courseProps || {};
    const items = [];
    const parents = flatChild(courseProps?.parent);

    if (parents) {
      for (let parent of parents) {
        const { id, title: folderTitle, link: folderLink } = parent;

        items.push(
          <a key={id} href={folderLink || ""} className="breadcrumb-link">
            {folderTitle}
          </a>
        );
      }
    }

    if (title) {
      items.push(
        <span key="title" className="breadcrumb-lbl">
          {title}
        </span>
      );
    }

    return items;
  };

  const handlePreviewClick = (event: MouseEvent) => {
    if (courseProps) {
      getCoursePreview(courseProps.id, element?.id, event.ctrlKey).then((result) => {
        if (!result.error) {
          const { file_uri } = result.payload;

          if (file_uri) {
            window.open(file_uri);
          }
        }
      });
    }
  };

  const handleExportClick = (event: MouseEvent<HTMLElement>) => {
    toggleEditorPanel(true, "export", event.currentTarget);
  };

  const handlePropertiesClick = (event: MouseEvent<HTMLElement>) => {
    toggleEditorPanel(true, "properties", event.currentTarget);
  };

  const handleEditorClose = () => {
    toggleEditorPanel(false);
  };

  const renderEditorPanel = () => {
    const { open, type, anchorEle } = editorPanel;

    if (open && anchorEle) {
      if (type === "export" && courseProps?.id) {
        return (
          <BlmCourseExportPanel
            open={true}
            anchorEle={anchorEle}
            courseId={courseProps.id}
            onClose={handleEditorClose}
          />
        );
      } else if (type === "properties" && courseProps) {
        let newDescription = textArea(courseProps.description, "<br>", "\n");
        courseProps.description = newDescription;
        return (
          <BlmCoursePropertiesPanel
            open={true}
            anchorEle={anchorEle}
            data={courseProps}
            onClose={handleEditorClose}
          />
        );
      }
    }
  };

  return (
    <Fragment>
      <header className="editor-header">
        <button
          title={t("tooltips.back_domain")}
          className="editor-back-btn"
          onClick={handleBackClick}
        />
        <div ref={anchorRef} className="structure-anchor" onClick={handleStructuresClick}>
          <div className="anchor-icon" />
          <span className="anchor-lbl">{header}</span>
          <div
            className={clsx("pin-icon", {
              pinned: panel.isPinned,
            })}
            onClick={handlePinClick}
          />
        </div>
        <Breadcrumbs separator=">" aria-label="breadcrumb" className="breadcrumb-ctrl">
          {renderBreadcrumbItems()}
        </Breadcrumbs>
        <div className="editor-version">{process.env.REACT_APP_VERSION}</div>
        <button
          className="preview-btn"
          onClick={handlePreviewClick}
          title="Press ctrl key to deactivate the preprequisites"
        >
          {t("buttons.preview")}
        </button>
        <button className="export-btn" onClick={handleExportClick}>
          {t("buttons.export")}
        </button>
        <div className="header-btn-separator" />
        <button className="library-btn">{t("buttons.library")}</button>
        <div className="header-btn-separator" />
        <button className="properties-btn" onClick={handlePropertiesClick}>
          {t("buttons.properties")}
        </button>
      </header>
      {renderEditorPanel()}
    </Fragment>
  );
}

export default BlmHeader;
