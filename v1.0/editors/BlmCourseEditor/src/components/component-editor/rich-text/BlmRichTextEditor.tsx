import React, { FocusEvent, useEffect, useRef, useState } from "react";
import { EditorState } from "draft-js";
import { create } from "jss";
import { jssPreset, StylesProvider } from "@material-ui/core";

import { SimpleObject, TextEditorComponent } from "types";
import { camelToKebab } from "utils";
import BlmTextToolbox from "../text-toolbox";
import BlmTextEditor from "../text";
import { TextEditorProps } from "../text/BlmTextEditor";

export interface RichTextEditorProps
  extends Pick<TextEditorProps, "name" | "value" | "onChange" | "onTextChange"> {
  placeholder?: string;
  offset?: { x?: number; y?: number };
  className?: string;
  template?: string;
}

const jss = create({
  ...jssPreset(),
});

const cssProperties = [
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "color",
  "textDecoration",
  "textTransform",
  "backgroundColor",
];

function BlmRichTextEditor(props: RichTextEditorProps) {
  const { name, value, placeholder, offset, className, onChange, onTextChange, template } = props;
  const [open, setOpen] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>();
  const [styles, setStyles] = useState<SimpleObject>();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<TextEditorComponent>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (containerRef.current) {
      const styles: SimpleObject = {};
      const obj = window.getComputedStyle(containerRef.current);

      for (const prop of cssProperties) {
        let val = obj.getPropertyValue(camelToKebab(prop));

        styles[prop] = val;
      }

      setStyles(styles);
    }
  }, []);

  useEffect(() => {
    if (open && containerRef.current) {
      const docs = [containerRef.current.ownerDocument, document];

      const handleScroll = (event: Event) => {
        const element = containerRef.current?.ownerDocument.activeElement;

        if (element && "blur" in element) {
          (element as HTMLElement).blur();
        }
      };

      docs.forEach((doc) => {
        doc?.addEventListener("scroll", handleScroll, { once: true });
        doc?.addEventListener("wheel", handleScroll, { once: true });
      });

      return () => {
        docs.forEach((doc) => {
          doc?.removeEventListener("scroll", handleScroll);
          doc?.removeEventListener("wheel", handleScroll);
        });
      };
    }
  }, [open]);

  const handleFocus = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleBlur = (event: FocusEvent) => {
    timeoutRef.current = setTimeout(() => setOpen(false));
  };

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
  };

  return (
    <div ref={containerRef} className={className} onFocus={handleFocus} onBlur={handleBlur}>
      {open && containerRef.current && template !== "question" && (
        <StylesProvider jss={jss}>
          <BlmTextToolbox
            show={true}
            offset={offset}
            anchorEle={containerRef.current}
            textEditorRef={textRef}
            editorState={editorState}
            defaultStyles={styles}
            size={containerRef.current?.clientWidth < 365 ? "small" : "normal"}
          />
        </StylesProvider>
      )}
      <BlmTextEditor
        ref={textRef}
        name={name}
        value={value}
        placeholder={placeholder}
        showSelection={open}
        onChange={onChange}
        onTextChange={onTextChange}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
}

export default BlmRichTextEditor;
