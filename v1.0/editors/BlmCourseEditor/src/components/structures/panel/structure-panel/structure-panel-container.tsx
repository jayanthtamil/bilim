import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmStructurePanel from "./BlmStructurePanel";

const mapStateToProps = ({
  course: {
    structure: { structure },
  },
  editor: {
    core: { structurePanel },
  },
}: RootState) => {
  return {
    structure: structure,
    panel: structurePanel,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmStructurePanel);
