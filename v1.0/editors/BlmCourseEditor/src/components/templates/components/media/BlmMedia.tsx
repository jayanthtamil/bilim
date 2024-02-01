import React, { PropsWithChildren, HTMLAttributes } from "react";
import clsx from "clsx";

import { MediaVariants } from "editor-constants";
import { BlmDeleteComponent } from "../../controls";
import { useMediaStyle } from "./style";

export interface CompProps extends HTMLAttributes<HTMLDivElement> {
  "blm-id": string;
  "blm-deletable": string;
  "blm-media"?: MediaVariants;
  "blm-action"?: string;
  order: number;
  allowDelete: boolean;
  hover: boolean;
  onDelete: (selector: string) => void;
}

function BlmMedia(props: PropsWithChildren<CompProps>) {
  const { className, children, allowDelete, order, hover, onDelete, ...others } = props;
  const {
    "blm-id": compoenentId,
    "blm-deletable": deletable,
    "blm-media": variant,
    "blm-action": action,
  } = others;
  const isDeletable =
    deletable !== undefined && (!className || className.indexOf("deactivated") === -1);
  const classes = useMediaStyle();
  const selector = `[blm-id="${compoenentId}"]`;
  const hasAction =
    variant !== MediaVariants.Button || Boolean(action && /onClick|onRollOver/.test(action));

  const handleClick = () => {
    if (onDelete) {
      onDelete(selector);
    }
  };

  return (
    <div className={clsx(className, classes.root, { [classes.hover]: hover })} {...others}>
      {allowDelete && isDeletable && (
        <BlmDeleteComponent className={classes.deleteBtn} onClick={handleClick} />
      )}
      {!hasAction && <div className={classes.warningIcon} />}
      {<div className={classes.orderLbl}>{order}</div>}
      {children}
    </div>
  );
}
export default BlmMedia;
