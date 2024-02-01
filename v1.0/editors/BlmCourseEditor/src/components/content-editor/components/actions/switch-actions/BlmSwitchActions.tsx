import React, { MouseEvent, useMemo } from "react";
import clsx from "clsx";

import { ComponentAction } from "types";
import { ComponentActionTypes } from "editor-constants";
import { BlmActionsProps } from "../main";
import { getActionItems } from "../utils";
import "./styles.scss";

export interface CompProps {
  left?: ComponentAction;
  right?: ComponentAction;
  leftType?: BlmActionsProps["type"];
  rightType?: BlmActionsProps["type"];
  onClick?: (event: MouseEvent) => void;
}

function getItems(type?: string) {
  return getActionItems(type)
    .map((item) => item.type)
    .filter((item) => item && ComponentActionTypes.None !== item);
}

function BlmSwitchActions(props: CompProps) {
  const { left, right, leftType, rightType, onClick } = props;

  const showBtn = useMemo(() => {
    const leftAction = left?.action !== ComponentActionTypes.None ? left?.action : undefined;
    const rightAction = right?.action !== ComponentActionTypes.None ? right?.action : undefined;
    const leftItems = getItems(leftType);
    const rightItems = getItems(rightType);

    if (
      (leftAction || rightAction) &&
      (!leftAction || rightItems.includes(leftAction)) &&
      (!rightAction || leftItems.includes(rightAction))
    )
      return true;
  }, [left, right, leftType, rightType]);

  return (
    <div
      className={clsx("component-switch-actions-btn", { show: showBtn })}
      onClick={showBtn ? onClick : undefined}
    />
  );
}

export default BlmSwitchActions;
