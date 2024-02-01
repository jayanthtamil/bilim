import { connect, ConnectedProps } from "react-redux";

import { ColorListTypes, FontListTypes } from "editor-constants";
import { RootState } from "redux/types";
import BlmTextToolbox from "./BlmTextToolbox";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    fonts: style?.fonts[FontListTypes.Text],
    colors: style?.colors[ColorListTypes.Text],
    bgColors: style?.colors[ColorListTypes.TextBackground],
  };
};

const connector = connect(mapStateToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmTextToolbox);
