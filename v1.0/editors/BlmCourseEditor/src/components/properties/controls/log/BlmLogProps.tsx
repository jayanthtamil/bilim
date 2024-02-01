import React from "react";
import { useTranslation } from "react-i18next";

import { ElementPropsComponent } from "types";
import { formatDate } from "utils";
import "./log.scss";

interface CompProps extends Omit<ElementPropsComponent, "onChange"> {}

function BlmLogProps(props: CompProps) {
  const { data } = props;
  const { created, modified } = data;
  const { t } = useTranslation();

  if (data) {
    return (
      <div className="log-props-container">
        <div className="log-props-lbl">{t("log.created_on")} :</div>
        <div className="log-props-name">{formatDate(created.date)}</div>
        <div className="log-props-lbl">{t("log.modified_on")} :</div>
        <div className="log-props-name">{formatDate(modified.date)}</div>
        <div className="log-props-hr" />
        <div className="log-props-lbl">{t("log.created_by")} :</div>
        <div className="log-props-name">{created.user}</div>
        <div className="log-props-lbl">{t("log.modified_by")} :</div>
        <div className="log-props-name">{modified.user}</div>
      </div>
    );
  } else {
    return null;
  }
}

export default BlmLogProps;
