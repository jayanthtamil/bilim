import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { getCopyFromStructureList } from "redux/actions";
import BlmCopyFromStructure from "./BlmCopyFromStructure";

const mapStateToProps = ({
  course: {
    element: { structures },
  },
}: RootState) => {
  return {
    structures,
  };
};

const mapDispatchToProps = {
  getCopyFromStructureList,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCopyFromStructure);
