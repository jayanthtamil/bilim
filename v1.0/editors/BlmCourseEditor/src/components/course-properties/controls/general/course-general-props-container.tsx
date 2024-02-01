import { connect, ConnectedProps } from "react-redux";
import BlmCourseGeneralProps from "./BlmCourseGeneralProps";
import { RootState } from "redux/types";

const mapStateToProps = ({ domain: { languages } }: RootState) => {
  return {
    languages,
  };
};
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCourseGeneralProps);
