import { connect, ConnectedProps } from "react-redux";

import { openConfirmDialog } from "redux/actions";

import BlmMediaPicker from "./BlmMediaPicker";

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmMediaPicker);
