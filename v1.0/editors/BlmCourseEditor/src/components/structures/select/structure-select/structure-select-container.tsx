import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmStructureSelect from "./BlmStructureSelect";

const mapStateToProps = ({
  course: {
    structure: { structure },
  },
}: RootState) => {
  return {
    structure,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmStructureSelect);
