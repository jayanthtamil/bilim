import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import { getVimeoVideo } from "redux/actions";
import BlmExternalVideo from "./BlmExternalVideo";

const mapStateToProps = ({ others: { vimeo } }: RootState) => {
  return { videos: vimeo };
};

const mapDispatchToProps = { getVimeoVideo };

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmExternalVideo);
