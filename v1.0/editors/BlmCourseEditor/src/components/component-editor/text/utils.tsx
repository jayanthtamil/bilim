import { CharacterMetadata, ContentState, EditorState, Modifier, SelectionState } from "draft-js";
import { stateFromHTML } from "draft-js-import-html";
import { stateToHTML } from "draft-js-export-html";
import { Map, OrderedSet } from "immutable";

import { decorator, stateConfig, htmlConfig } from "./config";
import {
  INLINE_STYLE_BG_COLOR_PREFIX,
  INLINE_STYLE_BOLD,
  INLINE_STYLE_COLOR_PREFIX,
  INLINE_STYLE_FONT_PREFIX,
  INLINE_STYLE_SIZE_PREFIX,
  INLINE_STYLE_HIGHLIGHT,
  INLINE_STYLE_ITALIC,
  INLINE_STYLE_UNDERLINE,
} from "editor-constants";

type DraftInlineStyle = Immutable.OrderedSet<string>;
type DraftInlineMap = Map<string, DraftInlineStyle>;

export const createEditorState = (html: string) => {
  const content = stateFromHTML(html, stateConfig as any);
  const newContent = serializeContent(content);

  return EditorState.createWithContent(newContent, decorator);
};

export const createEditorHTML = (state: EditorState) => {
  const newState = removeInlineStyle(state, INLINE_STYLE_HIGHLIGHT);
  const content = newState.getCurrentContent();
  const html = content.hasText() ? stateToHTML(content, htmlConfig) : "";

  return decodeHTML(html);
};

const decodeHTML = (str: string) => {
  return str.replace(/&nbsp;/g, "\xA0");
};

//https://github.com/sstur/draft-js-utils/pull/155/checks
//This function serialize multiple nested inline array into single inline style array
//After above PR is approved and include in release we can remove this function.
//This function avoid that we need to check inline style are single or nested array in other utill functions
const serializeContent = (contentState: ContentState) => {
  const blockMap = contentState.getBlockMap();

  const newBlockMap = blockMap.map((block) => {
    let list = block!.getCharacterList();

    list = list.map((char) => {
      return serializeStyle(char as any);
    }) as any;

    return block!.set("characterList", list);
  });

  return contentState.merge({
    blockMap: blockMap.merge(newBlockMap as any),
  }) as ContentState;
};

const serializeStyle = (char: DraftInlineMap) => {
  const charStyles = char.get("style");
  const initStyles = OrderedSet<string>();
  const styleReducer = (style = initStyles, value?: string) => {
    if (Array.isArray(value)) {
      for (const str of value) {
        style = styleReducer(style, str);
      }
    } else if (value) {
      style = style.add(value);
    }
    return style;
  };
  const reducedStyles = charStyles.reduce(styleReducer, initStyles);

  return char.set("style", reducedStyles);
};

// This functionality has been taken from draft-js and modified for re-usability purposes.
// Maps over the selected characters, and applies a function to each character.
// Characters are of type CharacterMetadata.
const mapSelectedCharacters =
  (callback: (arg: DraftInlineMap) => DraftInlineMap) =>
  (contentState: ContentState, selectionState: SelectionState) => {
    const blockMap = contentState.getBlockMap();
    const startKey = selectionState.getStartKey();
    const startOffset = selectionState.getStartOffset();
    const endKey = selectionState.getEndKey();
    const endOffset = selectionState.getEndOffset();

    const newBlocks = blockMap
      .skipUntil((_, k) => {
        return k === startKey;
      })
      .takeUntil((_, k) => {
        return k === endKey;
      })
      .concat(Map([[endKey, blockMap.get(endKey)]]))
      .map((block, blockKey) => {
        let sliceStart;
        let sliceEnd;
        // sliceStart -> where the selection starts
        // endSlice -> Where the selection ends

        // Only 1 block selected
        if (startKey === endKey) {
          sliceStart = startOffset;
          sliceEnd = endOffset;
          // Gets the selected characters of the block when multiple blocks are selected.
        } else {
          sliceStart = blockKey === startKey ? startOffset : 0;
          sliceEnd = blockKey === endKey ? endOffset : block!.getLength();
        }

        // Get the characters of the current block
        let chars = block!.getCharacterList();
        let current: CharacterMetadata;

        while (sliceStart < sliceEnd) {
          current = chars.get(sliceStart);
          const newChar = callback(current as any);
          chars = chars.set(sliceStart, newChar as any);
          sliceStart++;
        }

        return block!.set("characterList", chars);
      });

    return contentState.merge({
      blockMap: blockMap.merge(newBlocks as any),
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    }) as ContentState;
  };

const getContentStateWithoutStyle = (
  prefix: string,
  contentState: ContentState,
  selectionState: SelectionState
) => {
  return mapSelectedCharacters(filterDynamicStyle(prefix))(contentState, selectionState);
};

const filterDynamicStyle = (prefix: string) => (char: DraftInlineMap) => {
  const charStyles = char.get("style");
  const filteredStyles = charStyles.filter((style) => !style!.startsWith(prefix));

  return char.set("style", filteredStyles as DraftInlineStyle);
};

export const applyInlineStyle = (editorState: EditorState, inline: string, value: string) => {
  const newState = removeInlineStyle(editorState, inline);
  const contentState = newState.getCurrentContent();
  const selectionState = newState.getSelection();

  return EditorState.push(
    editorState,
    Modifier.applyInlineStyle(contentState, selectionState, inline + value),
    "change-inline-style"
  );
};

export const removeInlineStyle = (editorState: EditorState, inline: string) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  return EditorState.push(
    editorState,
    getContentStateWithoutStyle(inline, contentState, selectionState),
    "change-inline-style"
  );
};

//If user move text editor lost the focus, user not able to see the selected text.
//So we added highlight layer for the selector temporarily.
export const toggleHighlight = (editorState: EditorState, showSelection = false) => {
  const selection = editorState.getSelection();
  const hasFocus = selection.getHasFocus();
  const hasHightLight = editorState.getCurrentInlineStyle().has(INLINE_STYLE_HIGHLIGHT);

  if (showSelection && !hasFocus && !hasHightLight) {
    return applyInlineStyle(editorState, INLINE_STYLE_HIGHLIGHT, "");
  } else if (hasHightLight && (hasFocus || !showSelection)) {
    return removeInlineStyle(editorState, INLINE_STYLE_HIGHLIGHT);
  }

  return editorState;
};

export const toggleAlignment = (editorState: EditorState, align: string) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const isAligned = getSelectedBlocksMap(editorState).every(
    (block) => block?.getData().get("textAlign") === align
  );
  const blockData = Map().set("textAlign", isAligned ? undefined : align);
  const newState = Modifier.mergeBlockData(contentState, selectionState, blockData);

  return EditorState.push(editorState, newState, "change-block-data");
};

const inlineStyles = [INLINE_STYLE_BOLD, INLINE_STYLE_ITALIC, INLINE_STYLE_UNDERLINE];
const inlineStyles2 = [
  INLINE_STYLE_FONT_PREFIX,
  INLINE_STYLE_SIZE_PREFIX,
  INLINE_STYLE_COLOR_PREFIX,
  INLINE_STYLE_BG_COLOR_PREFIX,
];

const removeInlineStyles = (editorState: EditorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const newContentState = inlineStyles.reduce(
    (newState, style) => Modifier.removeInlineStyle(newState, selectionState, style),
    contentState
  );
  const newContentState2 = inlineStyles2.reduce(
    (newState, style) => getContentStateWithoutStyle(style, newState, selectionState),
    newContentState
  );

  return EditorState.push(editorState, newContentState2, "change-inline-style");
};

const removeEntities = (editorState: EditorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const newContentState = Modifier.applyEntity(contentState, selectionState, null);

  return EditorState.push(editorState, newContentState, "apply-entity");
};

const getSelectedBlocksMap = (editorState: EditorState) => {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();

  return blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]]);
};

const removeBlockTypes = (editorState: EditorState) => {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const blockData = Map();
  let newState = contentState;

  newState = Modifier.setBlockType(newState, selectionState, "unstyled");
  newState = Modifier.setBlockData(newState, selectionState, blockData);

  return EditorState.push(editorState, newState, "change-block-type");
};

export const cleareStyles = (editorState: EditorState) => {
  return removeBlockTypes(removeEntities(removeInlineStyles(editorState)));
};
