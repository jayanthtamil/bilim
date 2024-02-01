import { connect, ConnectedProps } from "react-redux";

import { openConfirmDialog } from "redux/actions";
import BlmHotspotsEditor from "./BlmHotspotsEditor";

const mapStateToProps = null;
const mapDispatchToProps = {
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmHotspotsEditor);
