import React, { useState, ChangeEvent, MouseEvent, useEffect } from "react";
import { Accordion, AccordionDetails, AccordionProps } from "@material-ui/core";

import { CourseElement, OptionsClickHandler, TreeOptionsClickHandler } from "types";
import { ElementType } from "editor-constants";
import { RepoExpandIcon, RepoOptionsIcon } from "assets/icons";
import { BlmAccordionSummary } from "shared/material-ui";
import BlmCourseTree from "../course-tree";

export interface CompProps {
  title: string;
  treeType: ElementType;
  data: CourseElement;
  ctxItem?: CourseElement;
  expanded?: boolean;
  onOptionsClick: OptionsClickHandler;
  onPanelChange: AccordionProps["onChange"];
}

function BlmAccordion(props: CompProps) {
  const {
    title,
    treeType,
    data,
    ctxItem,
    expanded: expandedProp,
    onOptionsClick,
    onPanelChange,
  } = props;
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (expandedProp !== undefined) {
      setExpanded(expandedProp);
    }
  }, [expandedProp]);

  const handleTreeOptionsClick: TreeOptionsClickHandler = (element, item) => {
    handleOptionsClick(element, item);
  };

  const handlePanelOptionsClick = (event: MouseEvent<HTMLElement>) => {
    handleOptionsClick(event.currentTarget, data);
  };

  const handleOptionsClick = (element: HTMLElement, item: CourseElement) => {
    if (onOptionsClick) {
      onOptionsClick(element, item, treeType);
    }
  };

  const handleOnChange = (event: ChangeEvent<{}>, isExpanded: boolean) => {
    if (onPanelChange) {
      onPanelChange(event, isExpanded);
    }

    //state.expanded exclusively used for expand icon rotation in panel summary, because we can't get this value from AccordionContext.
    setExpanded(isExpanded);
  };

  return (
    <Accordion
      square
      defaultExpanded={true}
      expanded={expanded}
      className="mui-accordion"
      onChange={handleOnChange}
    >
      <BlmAccordionSummary
        expanded={expanded}
        showOptionsIcon={ctxItem === data}
        expandIcon={<RepoExpandIcon />}
        optionsIcon={<RepoOptionsIcon />}
        onOptionsClick={handlePanelOptionsClick}
      >
        {title}
      </BlmAccordionSummary>
      <AccordionDetails className="mui-accordion-details">
        <BlmCourseTree
          treeType={treeType}
          data={data}
          ctxItem={ctxItem}
          onTreeOptionsClick={handleTreeOptionsClick}
        />
      </AccordionDetails>
    </Accordion>
  );
}

export default BlmAccordion;
