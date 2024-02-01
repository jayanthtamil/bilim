import { connect, ConnectedProps } from "react-redux";

import { ColorListTypes } from "editor-constants";
import { RootState } from "redux/types";
import { removeFiles, clearFiles, saveTemplates, previewTemplates } from "redux/actions";
import BlmScreenBackgroundProps from "./BlmScreenBackgroundProps";

const mapStateToProps = ({
  course: {
    element: { templates },
    style: { style },
  },
}: RootState) => {
  const arr = templates?.templates;

  return {
    template: arr && arr.length > 0 ? arr[0] : undefined,
    bgColors: style?.colors[ColorListTypes.Background],
  };
};

const mapDispatchToProps = {
  removeFiles,
  clearFiles,
  saveTemplates,
  previewTemplates,
};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmScreenBackgroundProps);
