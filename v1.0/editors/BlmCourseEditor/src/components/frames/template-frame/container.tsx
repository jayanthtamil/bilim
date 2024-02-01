import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmTemplateFrame from "./BlmTemplateFrame";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    style,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmTemplateFrame);
