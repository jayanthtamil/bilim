import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { getTemplates, getTemplateProperties } from "redux/actions";
import BlmTemplatesPanel from "./BlmTemplatesPanel";

const mapStateToProps = ({
  course: {
    properties: { properties: course },
    style: { style },
  },
  domain: { templates },
}: RootState) => {
  return {
    course,
    style,
    templates,
  };
};

const mapDispatchToProps = {
  getTemplates,
  getTemplateProperties,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmTemplatesPanel);
