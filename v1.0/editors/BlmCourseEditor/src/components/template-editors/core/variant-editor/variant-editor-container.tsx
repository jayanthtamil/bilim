import { connect, ConnectedProps } from "react-redux";

import { openConfirmDialog } from "redux/actions";
import BlmVariantEditor from "./BlmVariantEditor";

const mapStateToProps = null;
const mapDispatchToProps = {
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmVariantEditor);
