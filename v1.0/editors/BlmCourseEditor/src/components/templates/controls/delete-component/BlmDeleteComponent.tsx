import React, { MouseEvent } from "react";
import clsx from "clsx";

import { useDeleteComponentStyle } from "./styles";

export interface CompProps {
  className: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
}

function BlmDeleteComponent(props: CompProps) {
  const { className, onClick } = props;
  const classes = useDeleteComponentStyle();

  return <div className={clsx(classes.root, className)} onClick={onClick} />;
}

export default BlmDeleteComponent;
