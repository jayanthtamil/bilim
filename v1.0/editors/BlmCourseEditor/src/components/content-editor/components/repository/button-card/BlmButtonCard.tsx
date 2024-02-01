import React, {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLAttributes,
  MouseEvent,
  useMemo,
} from "react";
import clsx from "clsx";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateButtonComponent } from "components/content-editor/reducers";
import { ButtonComponent, ButtonValue } from "types";
import { getActionDetails } from "utils";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick">, ContainerProps {
  data: ButtonComponent;
  isSelected?: boolean;
  drag?: DraggableProvidedDragHandleProps;
  isDeletable?: boolean;
  onClick?: (data: ButtonComponent) => void;
  onDelete?: (data: ButtonComponent) => void;
  onDuplicate?: (index: number) => void;
  index?: number;
}

const BlmButtonCard: ForwardRefRenderFunction<HTMLDivElement, CompProps> = (props, ref) => {
  const {
    index,
    data,
    isSelected,
    isDeletable,
    styleConfig,
    drag,
    className,
    structure,
    onClick,
    onDelete,
    onDuplicate,
    ...other
  } = props;
  const { value: button } = data;
  const { style } = button;
  const { dispatch } = useContentEditorCtx();
  const { classNames } = styleConfig || {};
  const currentStyle = classNames && classNames[0];

  const {
    value: { title, clickAction },
  } = data;
  const [action, params] = useMemo(
    () => getActionDetails(clickAction, structure),
    [clickAction, structure]
  );

  React.useEffect(() => {
    if (style?.style === undefined) {
      const newButton = { ...button };
      newButton["style"].style = currentStyle;
      updateChange(newButton);
    }
  });

  const updateChange = (newButton: ButtonValue) => {
    const newData = { ...data, value: newButton };

    if (dispatch) {
      dispatch(updateButtonComponent(newData));
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (onClick) {
      onClick(data);
    }
  };

  const handleDeleteClick = (event: MouseEvent) => {
    if (isDeletable && onDelete) {
      onDelete(data);
    }
  };

  const handleDuplicateClick = () => {
    if (onDuplicate && (index || index === 0)) {
      onDuplicate(index);
    }
  };

  return (
    <div
      ref={ref}
      className={clsx("button-card-wrapper", className, {
        selected: isSelected,
        deletable: isDeletable,
      })}
      {...other}
    >
      <div className="button-card-box" onClick={handleClick}>
        <div className="button-card-lbl">
          <span>{title}</span>
        </div>
        <div className="button-card-action">
          <span>{action}</span>
        </div>
        <div
          className={clsx("button-card-parameters", {
            "show-icon": action && !params,
          })}
        >
          <span>{params}</span>
        </div>
        {drag && <div className="button-card-drag-btn" {...drag} />}
      </div>
      <div>
        <div className="button-card-delete-btn" onClick={handleDeleteClick} />
        <div className="button-card-duplicate-btn" onClick={handleDuplicateClick} />
      </div>
    </div>
  );
};

export default forwardRef(BlmButtonCard);
