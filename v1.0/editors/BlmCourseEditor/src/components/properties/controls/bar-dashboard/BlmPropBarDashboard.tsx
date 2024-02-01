import React, { MouseEvent, PropsWithChildren } from "react";
import clsx from "clsx";

import "./styles.scss";

export interface CompProps {
  label: string;
  className: string;
  onClose?: (event: MouseEvent) => void;
}

function BlmPropsBarDashboard(props: PropsWithChildren<CompProps>) {
  const { children, className, onClose } = props;

  return (
    <div className={clsx("prop-bar-dashboard-wrapper", className)}>
      <div className="prop-bar-dashboard-close-btn" onClick={onClose} />
      {children}
    </div>
  );
}

export default BlmPropsBarDashboard;
