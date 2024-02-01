import React, { useState, ChangeEvent, PropsWithChildren } from "react";
import { Accordion, AccordionDetails } from "@material-ui/core";

import { RepoExpandIcon } from "assets/icons";
import { BlmAccordionSummary } from "shared/material-ui";

export interface CompProps {
  title: string;
}

function BlmAccordion(props: PropsWithChildren<CompProps>) {
  const { title, children } = props;

  const [expanded, setExpanded] = useState(true);

  const handleOnChange = (event: ChangeEvent<{}>, isExpanded: boolean) => {
    //state.expanded exclusively used for expand icon rotation in panel summary, because we can't get this value from AccordionContext.
    setExpanded(isExpanded);
  };

  return (
    <Accordion square defaultExpanded={true} className="mui-accordion-2" onChange={handleOnChange}>
      <BlmAccordionSummary expandIcon={<RepoExpandIcon />} expanded={expanded}>
        {title}
      </BlmAccordionSummary>
      <AccordionDetails className="mui-accordion-details">{children}</AccordionDetails>
    </Accordion>
  );
}

export default BlmAccordion;
