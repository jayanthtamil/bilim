import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmMediaCard from "./BlmMediaCard";

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

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmMediaCard);
