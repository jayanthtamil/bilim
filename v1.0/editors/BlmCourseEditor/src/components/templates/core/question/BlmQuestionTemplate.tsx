import React, { forwardRef } from "react";
import clsx from "clsx";

import BlmTemplate, { TemplateCompProps } from "../template";
import { useQuestionTemplateStyle } from "./styles";

interface CompProps extends TemplateCompProps {}

const BlmQuestionTemplate = forwardRef<HTMLDivElement, CompProps>((props, ref) => {
  const { className, ...others } = props;
  const classes = useQuestionTemplateStyle();

  return <BlmTemplate ref={ref} className={clsx(classes.root, className)} {...others} />;
});

export default BlmQuestionTemplate;
