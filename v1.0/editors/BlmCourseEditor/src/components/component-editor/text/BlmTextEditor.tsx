import React, {
  ComponentProps,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { DraftHandleValue, Editor, EditorState, Modifier, RichUtils } from "draft-js";

import { CustomChangeEvent, TextEditorComponent } from "types";
import { decorator, blockStyleFn, customStyleFn } from "./config";
import {
  createEditorState,
  createEditorHTML,
  removeInlineStyle,
  toggleAlignment,
  cleareStyles,
  applyInlineStyle,
  toggleHighlight,
} from "./utils";

export type TextEditorChangeEvent = CustomChangeEvent<string>;

export interface TextEditorProps
  extends Partial<Omit<ComponentProps<typeof Editor>, "editorState" | "onChange">> {
  name: string;
  value?: string;
  showSelection?: boolean;
  onChange?: (event: TextEditorChangeEvent) => void;
  onTextChange?: (event: TextEditorChangeEvent) => void;
  onEditorChange?: (state: EditorState) => void;
}

const initEditorState = () => EditorState.createEmpty(decorator);

const BlmTextEditor: ForwardRefRenderFunction<TextEditorComponent, TextEditorProps> = (
  props,
  ref
) => {
  const { name, value, showSelection, onChange, onTextChange, onEditorChange, ...others } = props;
  const [editorState, setEditorState] = useState(initEditorState);
  const editorRef = useRef<Editor>(null);
  const htmlRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    setFocus: () => editorRef.current?.focus(),
    toggleInlineStyle: (inlineStyle) => {
      handleChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
    },
    applyInlineStyle: (inlieStyle, value) => {
      handleChange(applyInlineStyle(editorState, inlieStyle, value));
    },
    removeInlineStyle: (inlineStyle) => {
      handleChange(removeInlineStyle(editorState, inlineStyle));
    },
    toggleAlignment: (textAlign) => {
      handleChange(toggleAlignment(editorState, textAlign));
    },
    toggleBlockType: (blockType) => {
      handleChange(RichUtils.toggleBlockType(editorState, blockType));
    },
    clearStyles: () => {
      handleChange(cleareStyles(editorState));
    },
  }));

  useEffect(() => {
    if (value !== undefined && value !== null && value !== htmlRef.current) {
      const state = createEditorState(value);
      const html = createEditorHTML(state);

      htmlRef.current = html;

      setEditorState(state);
    }
  }, [value]);

  useEffect(() => {
    setEditorState((state) => toggleHighlight(state, showSelection));
  }, [showSelection]);

  const updateChange = (state: EditorState) => {
    const oldHtml = htmlRef.current;
    const html = createEditorHTML(state);

    if (html !== oldHtml) {
      htmlRef.current = html;

      if (onChange) {
        onChange({ target: { name, value: html } });
      }

      if (onTextChange) {
        onTextChange({ target: { name, value: state.getCurrentContent().getPlainText() } });
      }
    }

    if (onEditorChange) {
      onEditorChange(state);
    }
  };

  const handleChange = (state: EditorState) => {
    const newState = toggleHighlight(state, showSelection);

    setEditorState(newState);

    updateChange(newState);
  };

  const handlePastedText = (text: string, html: string | undefined, state: EditorState) => {
    const newContent = Modifier.replaceText(state.getCurrentContent(), state.getSelection(), text);
    const newState = EditorState.push(state, newContent, "insert-fragment");

    handleChange(newState);

    return true as unknown as DraftHandleValue;
  };

  return (
    <Editor
      ref={editorRef}
      editorState={editorState}
      tabIndex={1}
      blockStyleFn={blockStyleFn}
      customStyleFn={customStyleFn}
      onChange={handleChange}
      handlePastedText={handlePastedText}
      {...others}
    />
  );
};

export default forwardRef(BlmTextEditor);
