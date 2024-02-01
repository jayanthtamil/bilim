import React, {
  ChangeEvent,
  FocusEvent,
  Fragment,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { CourseElement, CourseElementTemplate } from "types";
import {
  ScrollTransitionTypes,
  TemplateEditorTypes,
  TemplateDisplayTypes,
  ElementType,
} from "editor-constants";
import BlmAnchorBtn from "../anchor";
import { usePartPageToolboxStyle } from "./styles";
import { ContainerProps } from "./container";

interface CompProps extends ContainerProps {
  element: CourseElement;
  data: CourseElementTemplate;
  index: number;
  total: number;
  className?: string;
  onEditClick?: (
    type: TemplateEditorTypes,
    template: CourseElementTemplate,
    anchorEle: HTMLElement
  ) => void;
  onDeleteClick?: (template: CourseElementTemplate) => void;
  onDuplicateClick?: (template: CourseElementTemplate) => void;
  onPositionChange?: (template: CourseElementTemplate, delta: number) => void;
  onNameChange?: (template: CourseElementTemplate, name: string) => void;
  onAnchorChange?: (template: CourseElementTemplate, hasAnchor: boolean) => void;
}

function BlmPartPageToolbox(props: CompProps) {
  const {
    element,
    data,
    index,
    total,
    display,
    className,
    onEditClick,
    onDeleteClick,
    onDuplicateClick,
    onPositionChange,
    onNameChange,
    onAnchorChange,
  } = props;
  const associateRef = useRef<HTMLDivElement>(null);
  const classes = usePartPageToolboxStyle();
  const initPosition = index + 1;
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(initPosition.toString());
  const { root, parent, isOutdated } = element;
  const { name, scroll, hasAnchor, isSummary, hasAction, options, associatedChapter } = data;
  const scrollType = scroll.type || ScrollTransitionTypes.Basic;
  const associatedChapterId = options?.relative_chapter;
  const isUpEnabled = index !== 0;
  const isDownEnabled = index !== total - 1;
  const isNonMobileDisplay = display !== TemplateDisplayTypes.Mobile;
  const isStructure = root?.type === ElementType.Structure;
  const isPartPage = parent?.type === ElementType.Page;
  const { t } = useTranslation("templates");

  useEffect(() => {
    setPosition(initPosition.toString());
  }, [initPosition]);

  useLayoutEffect(() => {
    const container = associateRef.current;

    if (isSummary && !associatedChapterId && container) {
      setTimeout(() => {
        container.click();
        container.scrollIntoView();
      }, 700);
    }
  }, [isSummary, associatedChapterId, associateRef]);

  const changePosition = (delta: number) => {
    if (onPositionChange) {
      onPositionChange(data, delta);
    }
  };

  const handleEditClick = (type: TemplateEditorTypes, anchorEle: HTMLElement) => {
    if (onEditClick) {
      onEditClick(type, data, anchorEle);
    }
  };

  const handleExpandClick = () => {
    setIsExpanded((value) => {
      return !value;
    });
  };

  const handleTemplateClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Template, event.currentTarget);
  };

  const handleVariantClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Variant, event.currentTarget);
  };

  const handleExpertClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Expert, event.currentTarget);
  };

  const handleBackgroundClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Background, event.currentTarget);
  };

  const handleScrollClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Scroll, event.currentTarget);
  };

  const handleActionClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.Action, event.currentTarget);
  };

  const handleGeneralClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.GeneralProps, event.currentTarget);
  };

  const handleCompletionClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.CompletionProps, event.currentTarget);
  };

  const handleLogClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.LogProps, event.currentTarget);
  };

  const handleDuplicateClick = () => {
    if (onDuplicateClick) {
      onDuplicateClick(data);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteClick) {
      onDeleteClick(data);
    }
  };

  const handleUpClick = (event: MouseEvent) => {
    changePosition(-1);
  };

  const handleDownClick = (event: MouseEvent) => {
    changePosition(1);
  };

  const validatePosition = (element: HTMLInputElement) => {
    const value = element.value;
    const pos = parseInt(value);

    if (isNaN(pos) || pos < 0 || pos > total) {
      setPosition(initPosition.toString());
    } else if (initPosition !== pos) {
      setPosition("");
      changePosition(pos - initPosition);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setPosition(value);
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    validatePosition(event.currentTarget);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      validatePosition(event.currentTarget);
      event.currentTarget.blur();
    }
  };

  const handleNameChange = (newName: string) => {
    if (onNameChange) {
      onNameChange(data, newName);
    }
  };

  const handleAnchorChange = (newAnchor: boolean) => {
    if (onAnchorChange) {
      onAnchorChange(data, newAnchor);
    }
  };

  const handleAssociatedChapterClick = (event: MouseEvent<HTMLDivElement>) => {
    handleEditClick(TemplateEditorTypes.AssociatedChapter, event.currentTarget);
  };

  return (
    <div className={clsx(classes.root, className, { [classes.outdated]: isOutdated })}>
      <div className={classes.editBtn} title={t("button.edit")} onClick={handleTemplateClick} />
      <div
        className={clsx(classes.leftBtnBar, {
          [classes.expanded]: isExpanded,
        })}
      >
        <div
          className={classes.variantsBtn}
          title={t("part_page_tool.change_template")}
          onClick={handleVariantClick}
        />
        <div
          className={classes.expertsBtn}
          title={t("part_page_tool.expert_template")}
          onClick={handleExpertClick}
        />
        <div
          className={classes.backgroundBtn}
          title={t("part_page_tool.background")}
          onClick={handleBackgroundClick}
        />
        <div
          className={clsx(classes.scrollBtn, classes[scrollType])}
          title={t("part_page_tool.transition")}
          onClick={handleScrollClick}
        />
        <div
          className={clsx(classes.actionBtn, { [classes.actionActiveBtn]: hasAction })}
          onClick={handleActionClick}
          title={t("part_page_tool.event")}
        />
        {isNonMobileDisplay && isExpanded && (
          <Fragment>
            <div
              className={clsx(classes.propertiesBtn, classes.generalBtn)}
              onClick={handleGeneralClick}
            >
              {t("tabs.general")}
            </div>
            {isStructure && isPartPage && (
              <div
                className={clsx(classes.propertiesBtn, classes.completionBtn)}
                onClick={handleCompletionClick}
              >
                {t("tabs.completions")}
              </div>
            )}
            <div className={clsx(classes.propertiesBtn, classes.logBtn)} onClick={handleLogClick}>
              {t("tabs.log")}
            </div>
          </Fragment>
        )}
        {isNonMobileDisplay && (
          <div
            className={classes.expandBtn}
            onClick={handleExpandClick}
            title={
              isExpanded
                ? `${t("part_page_tool.less_option")}`
                : `${t("part_page_tool.more_option")}`
            }
          />
        )}
      </div>
      {isSummary && (
        <div
          ref={associateRef}
          className={classes.associatedChapterBtn}
          onClick={handleAssociatedChapterClick}
        >
          {associatedChapter ? associatedChapter.name : ""}
        </div>
      )}
      <div className={classes.rightOuterWrapper}>
        <div className={classes.positionCtrlsWrapper}>
          <div
            className={clsx(classes.positionUpBtn, {
              disabled: !isUpEnabled,
            })}
            onClick={handleUpClick}
            title={t("part_page_tool.move_up")}
          />
          <span className={classes.positionDivider} />
          <input
            type="number"
            min={1}
            max={total}
            value={position}
            className={classes.positionTxt}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
          />
          <span className={classes.positionDivider} />
          <div
            className={clsx(classes.positionDownBtn, {
              disabled: !isDownEnabled,
            })}
            onClick={handleDownClick}
            title={t("part_page_tool.move_down")}
          />
          <div className={classes.positionTooltip}>
            {t("button.edit")}
            <br />
            {t("part_page_tool.position")}
          </div>
        </div>
        <div className={classes.rightBtnBar}>
          <div
            className={classes.duplicateBtn}
            onClick={handleDuplicateClick}
            title={t("part_page_tool.duplicate")}
          />
          <div
            className={classes.deleteBtn}
            onClick={handleDeleteClick}
            title={t("part_page_tool.delete")}
          />
        </div>
      </div>
      <div className={classes.anchorBtnWrapper}>
        <BlmAnchorBtn
          name={name}
          hasAnchor={hasAnchor}
          className={classes.anchorBtn}
          onNameChange={handleNameChange}
          onAnchorChange={handleAnchorChange}
        />
      </div>
    </div>
  );
}

export default BlmPartPageToolbox;
