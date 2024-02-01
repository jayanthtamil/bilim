import { connect, ConnectedProps } from "react-redux";

import { openConfirmDialog, openDialog } from "redux/actions";
import BlmHotspotGroupsEditor from "./BlmHotspotGroupsEditor";

const mapStateToProps = null;
const mapDispatchToProps = {
  openDialog,
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmHotspotGroupsEditor);
