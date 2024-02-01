import React, { ComponentType } from "react";

import { TemplateFrameProps } from "./BlmTemplateFrame";
import BlmTemplateFrame from "./container";

const withBlmTemplateFrame = <P extends object>(WrappedComponent: ComponentType<P>) => {
  function WithBlmTemplateFrame(props: P & TemplateFrameProps) {
    const { className, ...others } = props;

    return (
      <BlmTemplateFrame className={className}>
        <WrappedComponent {...(others as P)} />
      </BlmTemplateFrame>
    );
  }

  return WithBlmTemplateFrame;
};

export default withBlmTemplateFrame;
