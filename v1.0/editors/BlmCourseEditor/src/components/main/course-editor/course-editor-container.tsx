import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { getUserAuthorization, initializeCourseProperties, openDialog } from "redux/actions";
import BlmCourseEditor from "./BlmCourseEditor";

const mapStateToProps = ({
  user: { isAuthorized },
  editor: {
    core: { isInteractable },
  },
}: RootState) => {
  return {
    isAuthorized,
    isInteractable,
  };
};

const mapDispatchToProps = {
  getUserAuthorization,
  initializeCourseProperties,
  openDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCourseEditor);
