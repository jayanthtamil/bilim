import { connect, ConnectedProps } from "react-redux";
import { openConfirmDialog } from "redux/actions";
import BlmActionEditor from "./BlmActionEditor";

const mapStateToProps = null;
const mapDispatchToProps = {
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmActionEditor);
