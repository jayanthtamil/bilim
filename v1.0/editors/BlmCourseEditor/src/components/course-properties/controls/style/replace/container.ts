import { connect, ConnectedProps } from "react-redux";

import { replaceCourseFile, openDialog } from "redux/actions";
import BlmReplaceFile from "./BlmReplaceFile";

const mapStateToProps = null;
const mapDispatchToProps = {
  replaceCourseFile,
  openDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmReplaceFile);
