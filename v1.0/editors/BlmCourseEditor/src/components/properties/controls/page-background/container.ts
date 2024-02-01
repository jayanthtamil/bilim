import { connect, ConnectedProps } from "react-redux";

import { ColorListTypes } from "editor-constants";
import { RootState } from "redux/types";
import BlmPageBackgroundProps from "./BlmPageBackgroundProps";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    bgColors: style?.colors[ColorListTypes.Background],
  };
};

const connector = connect(mapStateToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmPageBackgroundProps);
