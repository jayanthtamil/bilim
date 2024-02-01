import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { getTemplates, getTemplateProperties } from "redux/actions";
import BlmTemplateExpert from "./BlmTemplateExpert";

const mapStateToProps = ({
  domain: { templates },
  course: {
    properties: { properties: course },
  },
}: RootState) => {
  return {
    course,
    templates,
  };
};

const mapDispatchToProps = {
  getTemplates,
  getTemplateProperties,
};

const connector = connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
});

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmTemplateExpert);

