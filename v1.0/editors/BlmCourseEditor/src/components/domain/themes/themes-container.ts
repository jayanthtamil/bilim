import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";

import BlmThemes from "./BlmThemes";

const mapStateToProps = ({ domain: { themes } }: RootState) => {
  return {
    themes,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmThemes);
