import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmCourseEvaluationProps from "./BlmCourseEvaluationProps";

const mapStateToProps = ({
  course: {
    structure: { structure },
  },
}: RootState) => {
  return {
    structure: structure?.structure,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCourseEvaluationProps);
