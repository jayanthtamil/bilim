import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import {
  setStructureAnchorEle,
  toggleStructurePanel,
  toggleStructurePanelPin,
  getCoursePreview,
} from "redux/actions";
import BlmHeader from "./BlmHeader";

const mapStateToProps = ({
  editor: {
    core: { tree, element, structurePanel },
  },
  course: {
    properties: { properties },
  },
}: RootState) => {
  return {
    tree,
    element,
    courseProps: properties,
    panel: structurePanel,
  };
};

const mapDispatchToProps = {
  setStructureAnchorEle,
  toggleStructurePanel,
  toggleStructurePanelPin,
  getCoursePreview,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmHeader);
