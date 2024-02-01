import { connect, ConnectedProps } from "react-redux";

import {
  getCopyFromDomainList,
  getCopyFromDomainCategory,
  getCopyFromSubFolderList,
  selectTreeItem,
} from "redux/actions";
import BlmCopyFrom from "./BlmCopyFrom";

const mapStateToProps = null;

const mapDispatchToProps = {
  getCopyFromDomainList,
  getCopyFromDomainCategory,
  getCopyFromSubFolderList,
  selectTreeItem,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmCopyFrom);
