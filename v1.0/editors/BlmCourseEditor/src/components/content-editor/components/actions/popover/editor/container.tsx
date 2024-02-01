import { connect, ConnectedProps } from "react-redux";

import { StyleListTypes } from "editor-constants";
import { RootState } from "redux/types";
import { openConfirmDialog, openDialog } from "redux/actions";
import BlmPopoverAction from "./BlmPopoverActionEditor";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    stylePopoverConfig: style?.styles
      ? style?.styles[StyleListTypes.MediaHotspotPopover]
      : undefined,
  };
};

const mapDispatchToProps = {
  openConfirmDialog,
  openDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmPopoverAction);
