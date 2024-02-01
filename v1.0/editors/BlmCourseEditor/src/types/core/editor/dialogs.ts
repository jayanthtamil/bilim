import { MouseEvent } from "react";

import { DialogType } from "editor-constants";

export interface DialogOptions {
  className?: string;
  okLabel?: string;
  cancelLabel?: string;
}

export class Dialog {
  id: string;
  type: DialogType;
  title?: string;
  message?: string;
  options?: DialogOptions;
  onOk?: DialogHandler;
  onCancel?: DialogHandler;

  constructor(
    id: string,
    type: DialogType,
    title = "",
    message = "",
    onOk?: DialogHandler,
    onCancel?: DialogHandler
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.message = message;
    this.onOk = onOk;
    this.onCancel = onCancel;
  }
}

export type DialogHandler = (e: MouseEvent) => void;
