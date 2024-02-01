import { connect, ConnectedProps } from "react-redux";

import { ElementPropsComponent } from "types";
import { RootState } from "redux/types";
import { getElementConfig } from "redux/actions";
import BlmGeneralProps from "./BlmGeneralProps";

const mapStateToProps = (state: RootState, props: ElementPropsComponent) => {
  return {
    config: getElementConfig(state, props.data),
    courseProps: state.course.properties.properties,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmGeneralProps);
