import { connect, ConnectedProps } from "react-redux";

import { getCourseExport } from "redux/actions";
import BlmCourseExportPanel from "./BlmCourseExportPanel";

const mapStateToProps = null;
const mapDispatchToProps = {
  getCourseExport,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCourseExportPanel);
