import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import {
  selectTreeItem,
  setTreeAction,
  createElement,
  renameElement,
  positionElement,
  updateAutoSummary,
  getCoursePreview,
  duplicateElement,
} from "redux/actions";
import BlmCourseTree from "./BlmCourseTree";

const mapStateToProps = ({
  course: {
    properties: { properties: courseProps2 },
  },
  editor: {
    core: {
      tree: { item: selectedItem, action },
      courseProps,
      elementProps,
    },
  },
}: RootState) => {
  return {
    selectedItem,
    action,
    courseProps: courseProps || courseProps2,
    elementProps,
  };
};

const mapDispatchToProps = {
  selectTreeItem,
  setTreeAction,
  createElement,
  renameElement,
  positionElement,
  updateAutoSummary,
  getCoursePreview,
  duplicateElement,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCourseTree);
