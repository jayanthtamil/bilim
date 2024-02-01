import { INode } from "html-to-react";

import { RepeaterConfigJSON } from "types";
import { toJSONObject } from "utils";

export function validateAllowDelete(repeater: INode) {
  const options = repeater.attribs["blm-options"];

  if (options && repeater.children) {
    const opts = toJSONObject<RepeaterConfigJSON>(options);
    const minimum = opts?.min_items ?? 0;
    const len = repeater.children?.filter(
      (node) => node.attribs && node.attribs["blm-component"]
    ).length;

    return minimum < len;
  }

  return false;
}
