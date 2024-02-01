import { connect, ConnectedProps } from "react-redux";

import { StyleListTypes } from "editor-constants";
import { RootState } from "redux/types";
import BlmStylePicker from "./BlmStylePicker";

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
  };
};

const connector = connect(mapStateToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmStylePicker);
