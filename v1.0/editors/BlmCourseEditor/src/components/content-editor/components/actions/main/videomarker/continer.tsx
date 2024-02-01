import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { getFile } from "redux/actions";
import BlmVideoMarkerAction, { CompProps } from "./BlmVideoMarkerAction";

const mapStateToProps = (
  {
    course: {
      file: {
        files: { loaded },
      },
    },
  }: RootState,
  props: CompProps
) => {
  return {
    markerFiles: loaded,
  };
};

const mapDispatchToProps = {
  getFile,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmVideoMarkerAction);
