import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { getAnimation, updateAnimation } from "redux/actions";
import BlmAnimation from "./BlmAnimation";

const mapStateToProps = ({
  course: {
    file: { animations },
  },
}: RootState) => {
  return { animations };
};

const mapDispatchToProps = { getAnimation, updateAnimation };

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmAnimation);
