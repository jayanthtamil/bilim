import React from "react";

import { SoundComponent } from "types";
import { BlmSound } from "components/content-editor/components";
import "./styles.scss";

interface CompProps {
  data: SoundComponent;
}

function BlmContentSound(props: CompProps) {
  const { data } = props;

  return <BlmSound data={data} />;
}

export default BlmContentSound;
