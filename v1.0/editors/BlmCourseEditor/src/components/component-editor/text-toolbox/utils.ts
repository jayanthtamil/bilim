import { EditorState } from "draft-js";

import { SimpleObject } from "types";
import {
  INLINE_STYLE_SIZE_PREFIX,
  INLINE_STYLE_COLOR_PREFIX,
  INLINE_STYLE_BG_COLOR_PREFIX,
  INLINE_STYLE_BOLD,
  INLINE_STYLE_ITALIC,
  INLINE_STYLE_UNDERLINE,
  BLOCK_STYLE_UNORDERED_LIST,
  BLOCK_STYLE_ORDERED_LIST,
  INLINE_STYLE_FONT_PREFIX,
} from "editor-constants";
import { toNumber } from "utils";

export const getCurrentStyle = (editorState?: EditorState, defaultStyles?: SimpleObject) => {
  const style = {
    bold: false,
    italic: false,
    underline: false,
    fontFamily: defaultStyles?.fontFamily,
    fontSize: toNumber(defaultStyles?.fontSize) || 12,
    list: BLOCK_STYLE_ORDERED_LIST,
    align: "left",
    color: defaultStyles?.color,
    bgColor: defaultStyles?.backgroudColor,
  };

  if (editorState) {
    const currentBlock = getCurrentBlock(editorState);
    const inlineStyle = editorState.getCurrentInlineStyle();
    const blockAlign = currentBlock.getData().get("textAlign");
    const blockType = currentBlock.getType();

    inlineStyle.forEach((styleName) => {
      if (styleName) {
        if (styleName === INLINE_STYLE_BOLD) {
          style.bold = true;
        } else if (styleName === INLINE_STYLE_ITALIC) {
          style.italic = true;
        } else if (styleName === INLINE_STYLE_UNDERLINE) {
          style.underline = true;
        } else if (styleName.startsWith(INLINE_STYLE_FONT_PREFIX)) {
          style.fontFamily = styleName.replace(INLINE_STYLE_FONT_PREFIX, "");
        } else if (styleName.startsWith(INLINE_STYLE_SIZE_PREFIX)) {
          style.fontSize = toNumber(styleName.replace(INLINE_STYLE_SIZE_PREFIX, ""));
        } else if (styleName.startsWith(INLINE_STYLE_COLOR_PREFIX)) {
          style.color = styleName.replace(INLINE_STYLE_COLOR_PREFIX, "");
        } else if (styleName.startsWith(INLINE_STYLE_BG_COLOR_PREFIX)) {
          style.bgColor = styleName.replace(INLINE_STYLE_BG_COLOR_PREFIX, "");
        }
      }
    });

    if (blockAlign) {
      style.align = blockAlign;
    }

    if (blockType === BLOCK_STYLE_ORDERED_LIST || blockType === BLOCK_STYLE_UNORDERED_LIST) {
      style.list = blockType;
    }
  }

  return style;
};

const getCurrentBlock = (editorState: EditorState) => {
  const selection = editorState.getSelection();
  const blockKey = selection.getStartKey();

  return editorState.getCurrentContent().getBlockForKey(blockKey);
};
