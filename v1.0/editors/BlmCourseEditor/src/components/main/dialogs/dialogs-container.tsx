import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { closeDialog } from "redux/actions";
import BlmDialogs from "./BlmDialogs";

const mapStateToProps = ({
  editor: {
    dialog: { items },
  },
}: RootState) => {
  return {
    dialogs: items,
  };
};

const mapDispatchToProps = {
  closeDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmDialogs);
