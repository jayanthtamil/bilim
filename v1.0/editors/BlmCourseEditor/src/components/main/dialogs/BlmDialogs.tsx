import React, { Fragment, MouseEvent } from "react";

import { Dialog, DialogHandler } from "types";
import { DialogType } from "editor-constants";
import { BlmDialog, BlmConfirmDialog } from "shared/material-ui";
import { ContainerProps } from "./dialogs-container";

interface CompProps extends ContainerProps {}

function BlmDialogs(props: CompProps) {
  const { dialogs, closeDialog } = props;

  const hanldeClick = (id: string, event: MouseEvent, callback?: DialogHandler) => {
    if (closeDialog) {
      closeDialog(id);
    }
    if (callback) {
      callback(event);
    }
  };

  const renderDialog = (dialog: Dialog) => {
    const { id, title, message, onOk, onCancel, options } = dialog;

    if (dialog.type === DialogType.Dialog) {
      return (
        <BlmDialog
          key={id}
          open={true}
          title={title}
          message={message}
          options={options}
          onOk={(event: MouseEvent) => hanldeClick(id, event, onOk)}
        />
      );
    } else if (dialog.type === DialogType.ConfirmDialog) {
      return (
        <BlmConfirmDialog
          key={id}
          open={true}
          title={title}
          message={message}
          options={options}
          onOk={(event: MouseEvent) => hanldeClick(id, event, onOk)}
          onCancel={(event: MouseEvent) => hanldeClick(id, event, onCancel)}
        />
      );
    } else {
      return null;
    }
  };

  if (dialogs) {
    return <Fragment>{dialogs.map((dialog) => renderDialog(dialog))}</Fragment>;
  } else {
    return null;
  }
}

export default BlmDialogs;
