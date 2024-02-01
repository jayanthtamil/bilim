import React, { PropsWithChildren } from "react";
import clsx from "clsx";
import { FormControlLabel, FormControlLabelProps, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import "./styles.scss";

export interface CompProps {
  type?: "standard" | "controlled";
  label: string;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: FormControlLabelProps["onChange"];
}

function BlmActionDashboard(props: PropsWithChildren<CompProps>) {
  const { type, label, name, checked, disabled, children, className, onChange } = props;
  const { t } = useTranslation("template-editors");

  return (
    <div className={clsx("action-dashboard-wrapper", className, { disabled })}>
      <div className="action-dashboard-title-wrapper">
        <span className="action-dashboard-title">{label}</span>
        {type === "controlled" && (
          <FormControlLabel
            name={name}
            label={
              checked ? `${t("action_dashboard.always")}` : `${t("action_dashboard.uncomplete")}`
            }
            control={<Switch className="switch-1" />}
            checked={checked}
            labelPlacement="top"
            className="action-dashboard-switch-frm-ctrl"
            onChange={onChange}
          />
        )}
      </div>
      <div className="action-dashboard-content-wrapper">{children}</div>
    </div>
  );
}

export default BlmActionDashboard;
