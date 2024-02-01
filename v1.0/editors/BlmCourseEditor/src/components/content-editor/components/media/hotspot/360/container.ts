import { connect, ConnectedProps } from "react-redux";

import { openDialog, openConfirmDialog } from "redux/actions";
import BlmHotspot360 from "./BlmHotspot360";

const mapStateToProps = null;

const mapDispatchToProps = {
  openDialog,
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmHotspot360);
