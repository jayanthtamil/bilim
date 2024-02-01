import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { setCourseProperties, updateCourseProperties, openConfirmDialog } from "redux/actions";
import BlmCoursePropertiesPanel from "./BlmCoursePropertiesPanel";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    config: style?.config,
  };
};

const mapDispatchToProps = {
  setCourseProperties,
  updateCourseProperties,
  openConfirmDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCoursePropertiesPanel);
