import React, { useRef, useEffect, ReactNode, CSSProperties, Fragment } from "react";
import clsx from "clsx";
import Frame, { FrameContextConsumer } from "react-frame-component";
import { create } from "jss";
import { jssPreset, StylesProvider } from "@material-ui/core/styles";

import { CourseDisplay, TemplateDisplayTypes, TemplateOrientationTypes } from "editor-constants";
import BlmLoaders from "components/main/loaders";
import BlmMainStyles from "./BlmMainStyles";
import { ContainerProps } from "./container";
import "./styles.scss";

//https://github.com/DefinitelyTyped/DefinitelyTyped/issues/42537
export interface MainFrameProps {
  styles?: CSSProperties;
  children?: ReactNode;
}

type FrameType = InstanceType<typeof Frame> & { node: HTMLFrameElement };

const defaultContent = `<!DOCTYPE html>
<html>
  <head>
    <noscript id="jss-insertion-point"></noscript>
  </head>
  <body>
  </body>
</html>`;

function BlmMainFrame(props: MainFrameProps & ContainerProps) {
  const { children, style, properties, display, orientation, styles, setTemplateView } = props;
  const frameRef = useRef<FrameType | null>(null);

  useEffect(() => {
    if (frameRef.current && frameRef.current.node) {
      const frame = frameRef.current.node;
      if (display === TemplateDisplayTypes.Desktop) {
        frame.style.width = "100%";
        frame.style.height = "100%";
      } else {
        if (orientation === TemplateOrientationTypes.Portrait) {
          frame.style.width = "375px";
          frame.style.height = "700px";
        } else {
          frame.style.width = "700px";
          frame.style.height = "375px";
        }
      }
    }
  }, [display, orientation]);

  const renderHead = () => {
    const { customBootstrap, draftJS, template, bootstrap } = style?.cssFiles || {};

    return (
      <Fragment>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Bilim Editor</title>
        <link href={customBootstrap} rel="stylesheet" />
        <link href={draftJS} rel="stylesheet" />
        {bootstrap && <link href={bootstrap} rel="stylesheet" />}
        {template && <link href={template} rel="stylesheet" />}
      </Fragment>
    );
  };

  const handleDesktopBtnClick = () => {
    setTemplateView(TemplateDisplayTypes.Desktop);
  };

  const handleMobileBtnClick = () => {
    setTemplateView(TemplateDisplayTypes.Mobile, TemplateOrientationTypes.Portrait);
  };

  const handleOrientationClick = () => {
    if (orientation === TemplateOrientationTypes.Portrait) {
      setTemplateView(display, TemplateOrientationTypes.Landscape);
    } else {
      setTemplateView(display, TemplateOrientationTypes.Portrait);
    }
  };

  if (children) {
    return (
      <div className={clsx("main-frame-wrapper", display)}>
        <div className="display-wrapper">
          <div className="desktop-display" onClick={handleDesktopBtnClick} />
          {properties?.display !== CourseDisplay.Desktop && (
            <div className="mobile-display" onClick={handleMobileBtnClick} />
          )}
        </div>
        {display === TemplateDisplayTypes.Mobile && (
          <div className={clsx("orientation-wrapper", orientation)}>
            <div className="orientation" onClick={handleOrientationClick} />
            <span className="orientation-size">
              {orientation === TemplateOrientationTypes.Portrait ? "375 x 700" : "700 x 375"}
            </span>
          </div>
        )}
        <Frame
          id="templateFrame"
          ref={frameRef}
          initialContent={defaultContent}
          head={renderHead()}
          mountTarget="body"
          frameBorder={0}
          scrolling="auto"
          className="main-frame"
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
                  <BlmMainStyles body={styles} />
                  <BlmLoaders />
                  <div className="container-fluid swimlane_main_container">
                    <div className="container-xl swimlane">
                      <div className="row">
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                        <div className="col-1" />
                        <div className="col-1 swimlanecell" />
                      </div>
                    </div>
                  </div>
                  {children}
                </StylesProvider>
              );
            }}
          </FrameContextConsumer>
        </Frame>
      </div>
    );
  } else {
    return null;
  }
}

export default BlmMainFrame;
