import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmCompletionPrerequisiteProps from "./BlmCompletionPrerequisiteProps";

const mapStateToProps = ({
  course: {
    properties: { properties },
  },
}: RootState) => {
  return {
    course: properties,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCompletionPrerequisiteProps);
