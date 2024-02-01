import { createContext, useContext } from "react";

import {
  ButtonComponent,
  ContentTemplate,
  CourseElement,
  MediaComponent,
  SoundComponent,
} from "types";
import { openDialog } from "redux/actions";
import { ContentEditorDispatch } from "../reducers";

export interface Context {
  element?: CourseElement;
  template?: ContentTemplate;
  component?: MediaComponent | ButtonComponent | SoundComponent;
  selectComponent?: (component?: MediaComponent | ButtonComponent | SoundComponent) => void;
  openDialog?: typeof openDialog;
  dispatch?: ContentEditorDispatch;
}

const ContentEditorContext = createContext<Context>({});
export const useContentEditorCtx = () => useContext(ContentEditorContext);

export default ContentEditorContext;
