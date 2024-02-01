import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmButtonCard from "./BlmButtonCard";
import { StyleListTypes } from "editor-constants";

const mapStateToProps = (
  {
    course: {
      structure: { structure },
      style: { style },
    },
  }: RootState,
  props: { type: StyleListTypes.Button }
) => {
  return {
    structure,
    styleConfig: style?.styles ? style?.styles[props.type] : undefined,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmButtonCard);
