import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmEditorBoard from "./BlmEditorBoard";

const mapStateToProps = ({
  editor: {
    core: {
      element,
      templatesPanel: { child },
    },
  },
}: RootState) => {
  return {
    element,
    child,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmEditorBoard);
