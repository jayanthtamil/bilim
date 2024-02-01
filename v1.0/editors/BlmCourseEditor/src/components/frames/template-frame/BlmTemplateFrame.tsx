import React, { Fragment, ReactNode } from "react";
import clsx from "clsx";
import Frame, { FrameContextConsumer } from "react-frame-component";
import { create } from "jss";
import { jssPreset } from "@material-ui/core/styles";
import { StylesProvider } from "@material-ui/core/styles";

import BlmTemplateStyles from "./BlmTemplateStyles";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface TemplateFrameProps {
  className?: string;
  children?: ReactNode;
}

const defaultContent = `<!DOCTYPE html>
<html>
  <head>
    <noscript id="jss-insertion-point"></noscript>
  </head>
  <body>
  </body>
</html>`;

function BlmTemplateFrame(props: TemplateFrameProps & ContainerProps) {
  const { children, style, className } = props;

  const renderHead = () => {
    const { draftJS, template } = style?.cssFiles || {};

    return (
      <Fragment>
        <link href={draftJS} rel="stylesheet" />
        {template && <link href={template} rel="stylesheet" />}
      </Fragment>
    );
  };

  if (children) {
    return (
      <Frame
        initialContent={defaultContent}
        head={renderHead()}
        mountTarget="body"
        frameBorder={0}
        scrolling="no"
        className={clsx("template-frame", className)}
      >
        <FrameContextConsumer>
          {({ document }) => {
            const jss = create({
              ...jssPreset(),
              insertionPoint: document.getElementById("jss-insertion-point"),
            });
            const sheetsManager = new Map();

            return (
              <StylesProvider jss={jss} sheetsManager={sheetsManager}>
                <BlmTemplateStyles />
                {children}
              </StylesProvider>
            );
          }}
        </FrameContextConsumer>
      </Frame>
    );
  } else {
    return null;
  }
}

export default BlmTemplateFrame;
