import { connect, ConnectedProps } from "react-redux";

import { ColorListTypes, StyleListTypes } from "editor-constants";
import { RootState } from "redux/types";
import BlmStyleTintPicker from "./BlmStyleTintPicker";

const mapStateToProps = (
  {
    course: {
      style: { style },
    },
  }: RootState,
  props: { type: StyleListTypes }
) => {
  return {
    styleConfig: style?.styles ? style?.styles[props.type] : undefined,
    tintColors: style?.colors[ColorListTypes.MediaTint],
    bgTintColors: style?.colors[ColorListTypes.MediaTintBackground],
    buttonTintOut: style?.colors[ColorListTypes.ButtonTintOut],
    buttonTintOver: style?.colors[ColorListTypes.ButtonTintOver],
  };
};

const connector = connect(mapStateToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmStyleTintPicker);
