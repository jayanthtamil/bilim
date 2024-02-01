import { connect, ConnectedProps } from "react-redux";

import { ElementPropsComponent } from "types";
import { RootState } from "redux/types";
import { getElementConfig } from "redux/actions";
import BlmSummaryGeneralProps from "./BlmSummaryGeneralProps";

const mapStateToProps = (state: RootState, props: ElementPropsComponent) => {
  return {
    config: getElementConfig(state, props.data),
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmSummaryGeneralProps);
