import React, { Fragment, ReactChild, PropsWithChildren } from "react";

interface CompProps {
  label: ReactChild;
  disabled?: boolean;
}

export type TabProps = PropsWithChildren<CompProps>;

const Tab = (props: TabProps) => {
  const { children } = props;

  return <Fragment>{children}</Fragment>;
};

export default Tab;
