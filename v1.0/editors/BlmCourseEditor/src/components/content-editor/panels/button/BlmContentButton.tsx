import React from "react";

import { ButtonComponent, ContentTemplateAction } from "types";
import { BlmButton } from "components/content-editor/components";
import "./styles.scss";

interface CompProps {
  data: ButtonComponent;
  temp: ContentTemplateAction | undefined;
}

function BlmContentButton(props: CompProps) {
  const { data, temp } = props;

  return <BlmButton data={data} temp={temp} />;
}

export default BlmContentButton;
