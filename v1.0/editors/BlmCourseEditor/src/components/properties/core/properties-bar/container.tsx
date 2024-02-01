import { connect, ConnectedProps } from "react-redux";

import { openConfirmDialog } from "redux/actions";
import BlmPropertiesBar from "./BlmPropertiesBar";

const mapStateToProps = undefined;
const mapDispatchToProps = {
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmPropertiesBar);
