import React, { PropsWithChildren, HTMLAttributes } from "react";
import clsx from "clsx";

import { useButtonStyle } from "./style";

export interface CompProps extends HTMLAttributes<HTMLDivElement> {
  "blm-action"?: string;
}

function BlmButton(props: PropsWithChildren<CompProps>) {
  const { className, children, ...others } = props;
  const { "blm-action": action } = others;
  const classes = useButtonStyle();
  const hasAction = Boolean(action && /onClick|onRollOver/.test(action));

  return (
    <div className={clsx(className, classes.root)} {...others}>
      {!hasAction && <div className={classes.warningIcon} />}
      {children}
    </div>
  );
}
export default BlmButton;
