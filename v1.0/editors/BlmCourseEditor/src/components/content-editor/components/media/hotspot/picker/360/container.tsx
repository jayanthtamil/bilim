import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import Blm360Preview from "./Blm360Preview";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    styleConfig: style?.styles ? style?.styles : undefined,
  };
};

const connector = connect(mapStateToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(Blm360Preview);
