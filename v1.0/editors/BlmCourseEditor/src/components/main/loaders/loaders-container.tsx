import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import BlmLoaders from "./BlmLoaders";

const mapStateToProps = ({
  editor: {
    loader: { items },
  },
}: RootState) => {
  return {
    loaders: items,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmLoaders);
