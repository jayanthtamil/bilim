import { connect, ConnectedProps } from "react-redux";

import { ColorListTypes } from "editor-constants";
import { RootState } from "redux/types";
import { removeFiles, clearFiles } from "redux/actions";
import BlmTemplateBackground from "./BlmTemplateBackground";

const mapStateToProps = ({
  course: {
    style: { style },
  },
}: RootState) => {
  return {
    bgColors: style?.colors[ColorListTypes.Background],
  };
};

const mapDispatchToProps = {
  removeFiles,
  clearFiles,
};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmTemplateBackground);
