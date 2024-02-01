import { connect, ConnectedProps } from "react-redux";

import { openDialog, openConfirmDialog } from "redux/actions";
import BlmBaseMediaEditor from "./BlmBaseMediaEditor";

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  openDialog,
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmBaseMediaEditor);
