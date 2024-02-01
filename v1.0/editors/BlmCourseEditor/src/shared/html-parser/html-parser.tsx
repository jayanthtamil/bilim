import { Parser, TProcessingInstruction } from "html-to-react";

import { isValidNode, processDefaultNode } from "utils";

export interface CompProps {
  html: string;
  processingInstructions?: TProcessingInstruction[];
}

const parser = new Parser();

function BlmHTMLParser(props: CompProps) {
  const { html, processingInstructions = [] } = props;

  const instructrions: TProcessingInstruction[] = [
    ...processingInstructions,
    {
      // Anything else
      shouldProcessNode: function (node) {
        return true;
      },
      processNode: processDefaultNode,
    },
  ];

  return parser.parseWithInstructions(html, isValidNode, instructrions);
}

export default BlmHTMLParser;
