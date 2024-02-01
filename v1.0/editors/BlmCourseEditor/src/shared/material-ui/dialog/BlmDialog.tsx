import React from "react";
import clsx from "clsx";
import { Dialog } from "@material-ui/core";

import { Dialog as AppDialog } from "types";
import "./dialog.scss";

interface CompProps extends Omit<AppDialog, "id" | "type" | "onCancel"> {
  open: boolean;
}

export default function BlmDialog(props: CompProps) {
  const { open, title, message, options, onOk } = props;
  const { className, okLabel = "Ok" } = options || {};

  if (message) {
    return (
      <Dialog open={open} onClose={onOk} className={clsx("dialog", className)}>
        <div className="dialog-content">
          <div className="dialog-title">{title}</div>
          <div className="dialog-message">{message}</div>
          <div className="dialog-button dialog-ok-btn" onClick={onOk}>
            {okLabel}
          </div>
        </div>
      </Dialog>
    );
  } else {
    return null;
  }
}
