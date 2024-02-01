import React from "react";
import clsx from "clsx";
import { Accordion, AccordionDetails, AccordionProps, AccordionSummary } from "@material-ui/core";

import { ExpandImage } from "assets/icons";
import "./styles.scss";

export interface CompProps extends AccordionProps {
  label: string;
}

function BlmComponentAccordion(props: CompProps) {
  const { label, className, children, ...others } = props;

  return (
    <Accordion
      square={true}
      defaultExpanded={true}
      className={clsx("content-accordion-wrapper", className)}
      {...others}
    >
      <AccordionSummary expandIcon={<ExpandImage />} IconButtonProps={{ disableRipple: true }}>
        {label}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

export default BlmComponentAccordion;
