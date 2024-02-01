import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { selectTreeItem, setElementPropertiesTabIndex, openConfirmDialog } from "redux/actions";
import BlmPropertiesPanel from "./BlmPropertiesPanel";

const mapStateToProps = ({
  editor: {
    core: {
      structurePanel: { anchorEle },
      propertiesPanel: { open },
    },
  },
}: RootState) => {
  return {
    open,
    anchorEle,
  };
};

const mapDispatchToProps = {
  selectTreeItem,
  setElementPropertiesTabIndex,
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmPropertiesPanel);
