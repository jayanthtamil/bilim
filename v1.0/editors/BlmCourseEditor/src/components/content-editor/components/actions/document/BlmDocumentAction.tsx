import React from "react";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, DocumentAction } from "types";
import { AcceptedFileTypes } from "editor-constants";
import { BlmMediaPicker, MediaPickerChangeEvent } from "components/shared";
import { useContentEditorCtx } from "components/content-editor/core";
import "./styles.scss";

export interface CompProps {
  data?: DocumentAction;
  onChange?: (event: CustomChangeEvent<DocumentAction>) => void;
}

function BlmDocumentAction(props: CompProps) {
  const { data, onChange } = props;
  const { element } = useContentEditorCtx();
  const { document } = data || {};
  const { t } = useTranslation("content-editor");

  const updateChange = (newData: DocumentAction) => {
    if (onChange) {
      onChange({ target: { name: "document", value: newData } });
    }
  };

  const handleChange = (event: MediaPickerChangeEvent) => {
    const { value } = event.target;
    const newData = { document: value };

    updateChange(newData);
  };

  return (
    <div className="document-action-wrapper">
      <BlmMediaPicker
        name="document"
        elementId={element!.id}
        acceptedFiles={[
          AcceptedFileTypes.Doc,
          AcceptedFileTypes.Zip,
          AcceptedFileTypes.Image,
          AcceptedFileTypes.Video,
          AcceptedFileTypes.Audio,
        ]}
        data={document}
        placeholder={t("document.browse")}
        replaceZone="none"
        className="document-action-picker"
        onChange={handleChange}
      />
    </div>
  );
}

export default BlmDocumentAction;
