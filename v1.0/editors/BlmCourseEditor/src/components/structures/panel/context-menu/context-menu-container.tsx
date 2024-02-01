import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import {
  createElement,
  deleteElement,
  duplicateElement,
  updateElementConnection,
  updateAutoSummary,
  updateElementSummary,
  resetElementTemplate,
  openDialog,
  openConfirmDialog,
  selectTreeItem,
  setTreeAction,
  saveTemplates,
  getElementTemplates,
  getElementTemplateVal,
  subMenuPositionElement,
  updateElementTemplates,
} from "redux/actions";
import BlmContextMenu from "./BlmContextMenu";

const mapStateToProps = ({
  course: {
    properties: { properties: courseProps },
    element: { templates },
    structure: { structure },
  },
}: RootState) => {
  return {
    courseProps,
    templates,
    tree: structure,
  };
};

const mapDispatchToProps = {
  selectTreeItem,
  setTreeAction,
  createElement,
  duplicateElement,
  deleteElement,
  updateElementConnection,
  updateAutoSummary,
  updateElementSummary,
  resetElementTemplate,
  openDialog,
  openConfirmDialog,
  saveTemplates,
  getElementTemplates,
  getElementTemplateVal,
  subMenuPositionElement,
  updateElementTemplates,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmContextMenu);
