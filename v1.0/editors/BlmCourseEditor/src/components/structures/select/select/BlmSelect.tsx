import React, { Fragment, MouseEvent, PropsWithChildren } from "react";
import clsx from "clsx";
import { Popper, Backdrop, withStyles, Portal } from "@material-ui/core";

import { styles } from "./select-styles";

export interface CompProps {
  name?: string;
  value?: string;
  placeholder?: string;
  open?: boolean;
  disabled?: boolean;
  autoWidth?: boolean;
  classes: {
    root: string;
    select: string;
    selectMenu: string;
    disabled: string;
    icon: string;
    iconOpen: string;
    backdrop: string;
    popper: string;
  };
  className?: string;
  onOpen?: (event: MouseEvent) => void;
  onClose?: (event: MouseEvent) => void;
}

const MAX_HEIGHT = 300;

const setAutoHeight = (data: any) => {
  const {
    instance: { reference },
    offsets: {
      reference: { bottom },
    },
    styles: popperStyles,
  } = data;

  const bodyHeight = reference.ownerDocument.body.offsetHeight;

  popperStyles.maxHeight = Math.max(bodyHeight - bottom, MAX_HEIGHT) - 10 + "px";

  return data;
};

const modifiers = {
  flip: {
    enabled: true,
  },
  hide: {
    enabled: false,
  },
  preventOverflow: {
    enabled: false,
  },
  autoHeight: {
    enabled: true,
    order: 849,
    fn: setAutoHeight,
  },
};

function BlmSelect(props: PropsWithChildren<CompProps>) {
  const {
    name,
    value,
    placeholder,
    open: openProp,
    disabled,
    autoWidth,
    classes,
    className,
    children,
    onOpen,
    onClose,
  } = props;
  const [displayNode, setDisplayNode] = React.useState<HTMLDivElement | null>(null);
  const { current: isOpenControlled } = React.useRef(openProp != null);
  const [menuMinWidthState, setMenuMinWidthState] = React.useState<number | null>();
  const [openState, setOpenState] = React.useState(false);
  const isOpen = displayNode !== null && (isOpenControlled ? openProp : openState);

  const update = (open: boolean, event: MouseEvent) => {
    if (open) {
      if (onOpen) {
        onOpen(event);
      }
    } else if (onClose) {
      onClose(event);
    }

    if (!isOpenControlled) {
      setMenuMinWidthState(autoWidth ? null : displayNode!.clientWidth);
      setOpenState(open);
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    // Ignore everything but left-click
    if (event.button !== 0) {
      return;
    }
    // Hijack the default focus behavior.
    event.preventDefault();

    if (displayNode) displayNode.focus();

    update(true, event);
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    update(false, event);
  };

  // Avoid performing a layout computation in the render method.
  let menuMinWidth = menuMinWidthState;

  if (!autoWidth && isOpenControlled && displayNode) {
    menuMinWidth = displayNode.clientWidth;
  }

  return (
    <Fragment>
      <div className={clsx("BlmSelect-root", classes.root, className)}>
        <div
          ref={setDisplayNode}
          className={clsx("BlmSelect-select", classes.select, classes.selectMenu, {
            [classes.disabled]: disabled,
          })}
          onMouseDown={disabled ? undefined : handleMouseDown}
        >
          <span>{value || placeholder}</span>
        </div>
        <div
          className={clsx("BlmSelect-icon", classes.icon, {
            [classes.iconOpen]: isOpen,
            [classes.disabled]: disabled,
          })}
        />
      </div>
      {isOpen && displayNode && (
        <Fragment>
          <Portal container={displayNode.ownerDocument.body}>
            <Backdrop
              open={true}
              className={clsx("BlmSelect-backdrop", classes.backdrop)}
              onClick={handleBackdropClick}
            />
          </Portal>
          <Popper
            id={`blm-${name || "select"}-popper`}
            anchorEl={displayNode}
            open={true}
            keepMounted={true}
            placement={"bottom-start"}
            modifiers={modifiers}
            style={{
              minWidth: menuMinWidth || 0,
            }}
            className={clsx("BlmSelect-popper", classes.popper)}
          >
            {children}
          </Popper>
        </Fragment>
      )}
    </Fragment>
  );
}

export default withStyles(styles, { name: "BlmSelect" })(BlmSelect);
