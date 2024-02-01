import React, { TextareaHTMLAttributes, useLayoutEffect, useRef } from "react";

export interface CompProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

function BlmAutoTextArea(props: CompProps) {
  const { value, ...others } = props;
  const txtRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const txt = txtRef.current;

    if (txt) {
      txt.style.height = "0px";
      txt.style.height = txt.scrollHeight + 2 + "px";
    }
  }, [value]);

  return <textarea ref={txtRef} value={value} {...others} />;
}

export default BlmAutoTextArea;
