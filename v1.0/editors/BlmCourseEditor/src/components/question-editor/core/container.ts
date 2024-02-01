import { connect, ConnectedProps } from "react-redux";

import { removeFiles, clearFiles } from "redux/actions";
import BlmQuestionEditor from "./BlmQuestionEditor";

const mapStateToProps = null;
const mapDispatchToProps = {
  removeFiles,
  clearFiles,
};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmQuestionEditor);
