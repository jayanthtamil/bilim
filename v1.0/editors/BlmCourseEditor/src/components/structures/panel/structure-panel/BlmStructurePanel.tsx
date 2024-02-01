import React from "react";
import clsx from "clsx";
import { Popper } from "@material-ui/core";

import BlmRepositoryPanel from "../repository-panel";
import { ContainerProps } from "./structure-panel-container";
import "./structure-panel.scss";

export interface CompProps extends ContainerProps {}

const setAutoHeight = (data: any) => {
  const {
    instance: { reference },
    offsets: {
      reference: { bottom },
    },
    styles: popperStyles,
  } = data;

  const bodyHeight = reference.ownerDocument.body.offsetHeight;

  popperStyles.maxHeight = Math.max(bodyHeight - bottom, 50) - 3 + "px";

  return data;
};

const modifiers = {
  flip: {
    enabled: false,
  },
  hide: {
    enabled: false,
  },
  preventOverflow: {
    enabled: false,
  },
  autoHeight: {
    enabled: true,
    order: 849,
    fn: setAutoHeight,
  },
};

function BlmStructurePanel(props: CompProps) {
  const { panel, structure } = props;
  const { open, anchorEle } = panel;

  if (structure) {
    return (
      <Popper
        open={open}
        anchorEl={anchorEle}
        placement={"bottom-start"}
        modifiers={modifiers}
        transition
        keepMounted
        className={clsx("structure-popper", { close: !open })}
      >
        <div className="structure-popper-collapse custom-scrollbar">
          <BlmRepositoryPanel />
        </div>
      </Popper>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default BlmStructurePanel;
