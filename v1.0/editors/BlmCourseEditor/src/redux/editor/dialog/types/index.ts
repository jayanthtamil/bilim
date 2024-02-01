import { Dialog as AppDialog } from "types";

export const OPEN_DIALOG = "OPEN_DIALOG";
export const OPEN_CONFIRM_DIALOG = "OPEN_CONFIRMATION_DIALOG";
export const CLOSE_DIALOG = "CLOSE_DIALOG";

export interface DialogsState {
  items: AppDialog[];
}

interface Dialog extends AppDialog {}

export interface OpenDialogAction {
  type: typeof OPEN_DIALOG;
  payload: { dialog: Dialog };
}

export interface OpenConfirmDialogAction {
  type: typeof OPEN_CONFIRM_DIALOG;
  payload: { dialog: Dialog };
}

export interface CloseDialogAction {
  type: typeof CLOSE_DIALOG;
  payload: { id: string };
}

export type DialogActions = OpenDialogAction | OpenConfirmDialogAction | CloseDialogAction;
