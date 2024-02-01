import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";

import BlmChapterProps from "./BlmChapterProps";

const mapStateToProps = ({
  editor: {
    core: {
      propertiesPanel: { tabIndex },
    },
  },
}: RootState) => {
  return {
    tabIndex,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmChapterProps);
