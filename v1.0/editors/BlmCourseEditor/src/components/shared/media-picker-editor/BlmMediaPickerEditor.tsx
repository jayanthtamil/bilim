import React, { ComponentProps, Fragment, MouseEvent, useState } from "react";

import { MediaFile } from "types";
import BlmMediaPicker from "../media-picker";
import { BlmMediaEditor } from "../media-editor";

type AllProps = ComponentProps<typeof BlmMediaPicker> &
  Omit<ComponentProps<typeof BlmMediaEditor>, "open" | "data" | "onSave" | "onClose">;

export interface MediaPickerEditorProps extends AllProps {}

function BlmMediaPickerEditor(props: MediaPickerEditorProps) {
  const { name, data, elementId, showEdit = true, onChange, ...others } = props;
  const [show, setShow] = useState(false);

  const handleEditClick = () => {
    setShow(true);
  };

  const handleEditorSave = (value: MediaFile) => {
    if (onChange) {
      onChange({ target: { name, value } });
    }

    setShow(false);
  };

  const handleEditorClose = (event: MouseEvent) => {
    setShow(false);
  };

  return (
    <Fragment>
      <BlmMediaPicker
        name={name}
        data={data}
        elementId={elementId}
        showEdit={showEdit}
        onChange={onChange}
        onEdit={handleEditClick}
        sound="sound"
        {...others}
      />
      {data && show && (
        <BlmMediaEditor
          open={show}
          elementId={elementId}
          data={data}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      )}
    </Fragment>
  );
}

export default BlmMediaPickerEditor;
