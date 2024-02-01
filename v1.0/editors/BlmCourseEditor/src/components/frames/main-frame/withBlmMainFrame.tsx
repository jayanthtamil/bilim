import React, { FunctionComponent, ComponentType } from "react";

import { MainFrameProps } from "./BlmMainFrame";
import BlmMainFrame from "./container";

const withBlmMainFrame = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const withBlmMainFrame: FunctionComponent<P & MainFrameProps> = (props) => {
    const { styles, ...wrappedProps } = props;

    return (
      <BlmMainFrame styles={styles}>
        <WrappedComponent {...(wrappedProps as P)} />
      </BlmMainFrame>
    );
  };

  return withBlmMainFrame;
};

export default withBlmMainFrame;
