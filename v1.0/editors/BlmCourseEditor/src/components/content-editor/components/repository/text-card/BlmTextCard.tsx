import React, { useMemo } from "react";

import { TextComponent, SimpleObject } from "types";
import { camelToKebab, toNumber } from "utils";
import { BlmHTMLParser } from "shared";
import { useTextCardStyle } from "./styles";

const cssProperties = [
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "textDecoration",
  "textTransform",
];

export interface CompProps {
  data: TextComponent;
}

function BlmTextCard(props: CompProps) {
  const {
    data: { value, frameStyle },
  } = props;
  const classes = useTextCardStyle();

  const style = useMemo(() => {
    if (frameStyle) {
      const styles: SimpleObject = {};

      for (const prop of cssProperties) {
        let val = frameStyle.getPropertyValue(camelToKebab(prop));

        if (prop === "fontSize" && toNumber(val) > 20) {
          val = "20px";
        }

        styles[prop] = val;
      }

      return styles;
    }
  }, [frameStyle]);

  return (
    <div className={classes.root}>
      <div style={style} className={classes.textWrapper}>
        {value && <BlmHTMLParser html={value} />}
      </div>
    </div>
  );
}

export default BlmTextCard;
