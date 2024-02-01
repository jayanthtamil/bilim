import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { CustomChangeEvent, MailAction } from "types";
import "./styles.scss";

export interface CompProps {
  data?: MailAction;
  onChange?: (event: CustomChangeEvent<MailAction>) => void;
}

function BlmMailAction(props: CompProps) {
  const { data, onChange } = props;
  const { email = "" } = data || {};
  const { t } = useTranslation("content-editor");

  const updateChange = (newData: MailAction) => {
    if (onChange) {
      onChange({ target: { name: "mail", value: newData } });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newData = { email: value };

    updateChange(newData);
  };

  return (
    <div className="mail-action-wrapper">
      <div className="mail-action-txt-wrapper">
        <span>{t("mail_to.mailto")}:</span>
        <input type="text" value={email} className="mail-action-txt" onChange={handleChange} />
      </div>
    </div>
  );
}

export default BlmMailAction;
