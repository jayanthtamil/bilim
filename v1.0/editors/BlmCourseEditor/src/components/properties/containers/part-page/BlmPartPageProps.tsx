import React, { MouseEvent } from "react";
import clsx from "clsx";

import { ElementPropsContainer } from "types";
import { TemplateEditorTypes } from "editor-constants";
import { BlmGeneralProps, BlmCompletionPrerequisiteProps, BlmLogProps } from "../../controls";
import { withBlmPropertiesBoard } from "../../hoc";
import "./styles.scss";

export interface CompProps extends ElementPropsContainer {
  type: TemplateEditorTypes;
  onClose: (event: MouseEvent) => void;
}

function BlmPartPageProps(props: CompProps) {
  const { element, data, type, onChange, onSave, onClose } = props;

  const saveChanges = () => {
    if (onSave) {
      onSave();
    }
  };

  const handleClose = (event: MouseEvent) => {
    saveChanges();

    if (onClose) {
      onClose(event);
    }
  };

  const renderChildren = () => {
    if (element && data) {
      if (type === TemplateEditorTypes.GeneralProps) {
        return <BlmGeneralProps element={element} data={data} onChange={onChange} />;
      } else if (type === TemplateEditorTypes.CompletionProps) {
        return <BlmCompletionPrerequisiteProps element={element} data={data} onChange={onChange} />;
      } else if (type === TemplateEditorTypes.LogProps) {
        return <BlmLogProps data={data} />;
      }
    }
  };

  if (data) {
    return (
      <div className={clsx("partpage-properties-panel", type)}>
        <div className="partpage-props-anchor" />
        <div className="partpage-props-content">
          <div className="partpage-props-close-btn" onClick={handleClose} />
          {renderChildren()}
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default withBlmPropertiesBoard(BlmPartPageProps);
