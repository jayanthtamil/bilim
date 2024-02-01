import React, { PropsWithChildren, HTMLAttributes, Fragment, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import clsx from "clsx";

import { ElementType } from "editor-constants";
import { BlmRichTextEditor, TextEditorChangeEvent } from "components/component-editor";
import { BlmDeleteComponent } from "../../controls";
import { useTextStyle } from "./style";

export interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  "blm-id": string;
  "blm-deletable": string;
  template: ElementType;
  onChange: (event: TextEditorChangeEvent) => void;
  onDelete: (selector: string) => void;
}

function BlmText(props: PropsWithChildren<CompProps>) {
  const { template, className, children, onChange, onDelete, ...others } = props;
  const { "blm-id": compoenentId, "blm-deletable": deletable } = others;
  const classes = useTextStyle();
  const name = `[blm-id="${compoenentId}"]`;
  const isDeletable =
    deletable !== undefined && (!className || className.indexOf("deactivated") === -1);
  const isQuestion = template === ElementType.Question;

  const html = useMemo(() => {
    const str = renderToStaticMarkup(<Fragment>{children}</Fragment>);

    //https://github.com/sstur/draft-js-utils/issues/194
    return isQuestion ? str.replace(/\n/g, "<br/>") : str;
  }, [children, isQuestion]);

  const handleClick = () => {
    if (onDelete) {
      onDelete(name);
    }
  };

  return (
    <div className={clsx(className, classes.root)} {...others}>
      {isDeletable && <BlmDeleteComponent className={classes.deleteBtn} onClick={handleClick} />}
      <BlmRichTextEditor
        name={name}
        value={html}
        template={template}
        offset={{ x: 0, y: -5 }}
        {...(isQuestion ? { onTextChange: onChange } : { onChange })}
      />
    </div>
  );
}

export default BlmText;
