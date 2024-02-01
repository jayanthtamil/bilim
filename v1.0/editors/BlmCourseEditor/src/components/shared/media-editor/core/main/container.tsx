import { connect, ConnectedProps } from "react-redux";

import { RootState } from "redux/types";
import {
  getMediaProperties,
  uploadFiles,
  clearFile,
  addFiles,
  getFile,
  openDialog,
} from "redux/actions";
import BlmMediaEditor, { MediaEditorProps } from "./BlmMediaEditor";

const mapStateToProps = (
  {
    course: {
      file: {
        files: { uploaded, loaded },
        properties,
      },
    },
  }: RootState,
  props: MediaEditorProps
) => {
  const { data } = props;
  const { id, subtitle, marker } = data;

  return {
    files: uploaded,
    waveformUrl: properties[id]?.waveform,
    waveformFile: loaded[id],
    subtitleFile: subtitle?.id && loaded[subtitle.id],
    markerFile: marker?.id && loaded[marker.id],
  };
};

const mapDispatchToProps = {
  getMediaProperties,
  uploadFiles,
  clearFile,
  addFiles,
  getFile,
  openDialog,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ContainerProps = ConnectedProps<typeof connector>;
export default connector(BlmMediaEditor);
