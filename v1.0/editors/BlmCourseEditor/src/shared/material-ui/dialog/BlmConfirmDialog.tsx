import React from "react";
import clsx from "clsx";
import { Dialog } from "@material-ui/core";

import { Dialog as AppDialog } from "types";
import "./dialog.scss";

interface CompProps extends Omit<AppDialog, "id" | "type"> {
  open: boolean;
}

export default function BlmConfirmDialog(props: CompProps) {
  const { open, title, message, options, onOk, onCancel } = props;
  const { className, okLabel = "Yes", cancelLabel = "Cancel" } = options || {};

  if (message) {
    return (
      <Dialog open={open}  className={clsx("confirm-dialog", className)}>
        <div className="dialog-content">
          <div className="dialog-title">{title}</div>
          <div className="dialog-message">{message}</div>
          <div className="dialog-button dialog-cancel-btn" onClick={onCancel}>
            {cancelLabel}
          </div>
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
