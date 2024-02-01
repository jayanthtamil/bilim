import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmPartPageToolbox from "./BlmPartPageToolbox";

const mapStateToProps = ({
  editor: {
    core: {
      templatesPanel: { display },
    },
  },
}: RootState) => {
  return {
    display,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmPartPageToolbox);
