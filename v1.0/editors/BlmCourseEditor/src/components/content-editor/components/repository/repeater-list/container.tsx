
import { connect, ConnectedProps } from "react-redux";

import { duplicateImageTemplate, getElementTemplates,  } from "redux/actions";
import BlmRepeaterList from "./BlmRepeaterList";

const mapDispatchToProps = {
    duplicateImageTemplate, getElementTemplates
};

const connector = connect(null , mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmRepeaterList);

