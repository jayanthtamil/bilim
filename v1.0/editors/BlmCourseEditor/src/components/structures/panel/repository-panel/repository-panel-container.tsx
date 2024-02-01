import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmRepositoryPanel from "./BlmRepositoryPanel";

const mapStateToProps = ({
  course: {
    structure: { structure },
  },
}: RootState) => {
  return {
    data: structure,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmRepositoryPanel);
