import React, { forwardRef } from "react";
import clsx from "clsx";

import BlmTemplate, { TemplateCompProps } from "../template";
import { usePartPageTemplateStyle } from "./styles";

interface CompProps extends TemplateCompProps {}

const BlmPartPageTemplate = forwardRef<HTMLDivElement, CompProps>((props, ref) => {
  const { className, ...others } = props;
  const classes = usePartPageTemplateStyle();

  return <BlmTemplate ref={ref} className={clsx(classes.root, className)} {...others} />;
});

export default BlmPartPageTemplate;
