import React, { Fragment } from "react";

import { ContainerProps } from "./container";

export interface FontStylesProps extends ContainerProps {}

function BlmFontStyles(props: FontStylesProps) {
  const { style } = props;
  const { draftJS, fonts } = style?.cssFiles ?? {};

  return (
    <Fragment>
      <link rel="stylesheet" href={draftJS} />
      <link rel="stylesheet" href={fonts} />
    </Fragment>
  );
}

export default BlmFontStyles;
