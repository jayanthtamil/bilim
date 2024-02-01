import React, { ChangeEvent } from "react";

import { CustomChangeEvent, LinkAction } from "types";
import "./styles.scss";

export interface CompProps {
  data?: LinkAction;
  onChange?: (event: CustomChangeEvent<LinkAction>) => void;
}

function BlmLinkAction(props: CompProps) {
  const { data, onChange } = props;
  const { url = "" } = data || {};

  const updateChange = (newData: LinkAction) => {
    if (onChange) {
      onChange({ target: { name: "link", value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newData = { url: value };

    updateChange(newData);
  };

  return (
    <div className="link-action-wrapper">
      <input type="text" value={url} className="link-action-txt" onChange={handleChange} />
    </div>
  );
}

export default BlmLinkAction;
