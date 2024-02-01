import React, { forwardRef } from "react";
import clsx from "clsx";

import BlmTemplate, { TemplateCompProps } from "../template";
import { useScreenTemplateStyle } from "./styles";

interface CompProps extends TemplateCompProps {}

const BlmScreenTemplate = forwardRef<HTMLDivElement, CompProps>((props, ref) => {
  const { className, ...others } = props;
  const classes = useScreenTemplateStyle();

  return <BlmTemplate ref={ref} className={clsx(classes.root, className)} {...others} />;
});

export default BlmScreenTemplate;
