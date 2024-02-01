import React, { MouseEvent } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { CourseElement } from "types";
import { ElementType } from "editor-constants";
import { BlmCourseTree } from "components/shared";
import "./styles.scss";

export interface CompProps {
  data: CourseElement;
  associated?: CourseElement;
  showClose: boolean;
  onChange: (element: CourseElement) => void;
  onClose: (event: MouseEvent) => void;
}

const BlmAssociatedChapter = (props: CompProps) => {
  const { data, associated, showClose, onChange, onClose } = props;
  const { t } = useTranslation("template-editors");

  const handleItemClick = (item: CourseElement) => {
    if (onChange) {
      onChange(item);
    }
  };

  const handleClose = (event: MouseEvent) => {
    if (onClose) {
      onClose(event);
    }
  };

  return (
    <div className="associated-chapter-panel">
      <div className="associated-chapter-anchor" />
      <div className="associated-chapter-content">
        <div className="associated-chapter-title">{t("associate_chapter.select")}</div>
        <div
          className={clsx("associated-chapter-close-btn", {
            show: showClose,
          })}
          onClick={handleClose}
        />
        <BlmCourseTree
          data={data}
          treeType="associated-chapter"
          selectedItem={associated}
          allowedItems={[ElementType.Root, ElementType.Chapter]}
          className={clsx("blm-associated-course-tree", {
            "course-root": data.type === ElementType.Root,
          })}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
};

export default BlmAssociatedChapter;
