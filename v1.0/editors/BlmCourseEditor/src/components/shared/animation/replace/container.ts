import { connect, ConnectedProps } from "react-redux";

import { replaceAnimationAttachment, openDialog } from "redux/actions";
import BlmReplaceAttachment from "./BlmReplaceAttachment";

const mapStateToProps = null;
const mapDispatchToProps = {
  replaceAnimationAttachment,
  openDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmReplaceAttachment);
