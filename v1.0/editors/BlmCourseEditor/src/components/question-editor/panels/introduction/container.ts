import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmQuestionIntroduction from "./BlmQuestionIntroduction";

const mapStateToProps = ({ domain: { themes } }: RootState) => {
  return {
    themes,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmQuestionIntroduction);
