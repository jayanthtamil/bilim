import { RootState } from "redux/types";
import { UserState } from "redux/user/types";
import { DomainState } from "redux/domain/types";
import { CourseState } from "redux/course";
import { EditorState } from "redux/editor";
import { OthersState } from "redux/others/types";
import { initState as initUser } from "redux/user/reducers";
import { initState as initDomain } from "redux/domain/reducers";
import { initState as initCourseProperties } from "redux/course/properties/reducers";
import { initState as initCourseStructure } from "redux/course/structure/reducers";
import { initState as initCourseStyle } from "redux/course/style/reducers";
import { initState as initCourseElement } from "redux/course/element/reducers";
import { initState as initCourseFile } from "redux/course/file/reducers";
import { initState as initEditorCore } from "redux/editor/core/reducers";
import { initState as initEditorDialog } from "redux/editor/dialog/reducers";
import { initState as initEditorLoader } from "redux/editor/loader/reducers";
import { initState as initOthers } from "redux/others/reducers";

export const userState: UserState = {
  ...initUser,
};

export const domainState: DomainState = {
  ...initDomain,
};

export const courseState: CourseState = {
  properties: { ...initCourseProperties },
  structure: { ...initCourseStructure },
  style: { ...initCourseStyle },
  element: { ...initCourseElement },
  file: { ...initCourseFile },
};

export const editorState: EditorState = {
  core: { ...initEditorCore },
  dialog: { ...initEditorDialog },
  loader: { ...initEditorLoader },
};

export const othersState: OthersState = {
  ...initOthers,
};

export const rootState: RootState = {
  user: userState,
  domain: domainState,
  course: courseState,
  editor: editorState,
  others: othersState,
};
