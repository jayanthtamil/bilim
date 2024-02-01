import { CSSProperties, PropsWithChildren } from "react";

import { useMainStyles } from "./styles";

export interface CompProps {
  body?: CSSProperties;
}

const BlmMainStyles = (props: PropsWithChildren<CompProps>) => {
  const { body } = props;

  useMainStyles({ body });

  return null;
};

export default BlmMainStyles;
