import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmFontStyles from "./BlmFontStyles";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    style,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmFontStyles);
