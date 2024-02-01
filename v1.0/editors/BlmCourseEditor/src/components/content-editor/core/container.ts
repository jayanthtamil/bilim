import { connect, ConnectedProps } from "react-redux";

import {
  openDialog,
  removeFiles,
  clearFiles,
  clearAnimations,
  clearMediaProperties,
  makeGetIsLoading,
} from "redux/actions";
import { openConfirmDialog } from "redux/actions";
import { UPLOAD_FILE_STARTED } from "redux/course/file/types";
import { RootState } from "redux/types";
import BlmContentEditor from "./BlmContentEditor";

const getFileUploading = makeGetIsLoading(UPLOAD_FILE_STARTED);

const mapStateToProps = (state: RootState) => ({
  isFileUploading: getFileUploading(state),
});

const mapDispatchToProps = {
  openDialog,
  removeFiles,
  clearFiles,
  clearAnimations,
  clearMediaProperties,
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmContentEditor);
