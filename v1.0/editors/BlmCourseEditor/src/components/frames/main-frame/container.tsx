import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { setTemplateView } from "redux/actions";
import BlmMainFrame from "./BlmMainFrame";

const mapStateToProps = ({
  course: {
    style: { style },
    properties: { properties },
  },
  editor: {
    core: {
      templatesPanel: { display, orientation },
    },
  },
}: RootState) => {
  return {
    style,
    properties,
    display,
    orientation,
  };
};

const mapDispatchToProps = {
  setTemplateView,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmMainFrame);
