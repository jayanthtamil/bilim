import { connect, ConnectedProps } from "react-redux";

import { CourseElement } from "types";
import { RootState } from "redux/types";
import {
  getElementProperties,
  updateElementProperties,
  clearElementProperties,
  setElementProperties,
  removeFiles,
  clearFiles,
} from "redux/actions";

const mapStateToProps = (
  {
    course: {
      element: { properties },
    },
  }: RootState,
  props: { element: CourseElement }
) => {
  const { element } = props;

  return { properties: properties[element.id] };
};

const mapDispatchToProps = {
  getElementProperties,
  updateElementProperties,
  clearElementProperties,
  removeFiles,
  clearFiles,
  setElementProperties,
};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector;
