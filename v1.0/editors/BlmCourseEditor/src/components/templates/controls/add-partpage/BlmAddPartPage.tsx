import React, { MouseEvent } from "react";
import clsx from "clsx";

import { useAddPartPageStyle } from "./styles";

interface CompProps {
  value: number;
  className?: string;
  onClick: (event: MouseEvent<HTMLElement>, value: number) => void;
}

function BlmAddPartPage(props: CompProps) {
  const { value, className, onClick } = props;
  const classes = useAddPartPageStyle();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(event, value);
    }
  };

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.addBtn} onClick={handleClick} />
    </div>
  );
}

export default BlmAddPartPage;
