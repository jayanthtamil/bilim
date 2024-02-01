import React, { ReactNode, MouseEvent } from "react";
import clsx from "clsx";
import { withStyles, WithStyles } from "@material-ui/core";
import MuiAccordionSummary, { AccordionSummaryProps } from "@material-ui/core/AccordionSummary";
import IconButton, { IconButtonProps as IconBtnProps } from "@material-ui/core/IconButton";

import { styles } from "./styles";

type StyleProps = WithStyles<typeof styles>;

interface CustomProps extends AccordionSummaryProps {
  expanded: boolean;
  showOptionsIcon?: boolean;
  optionsIcon?: ReactNode;
  onOptionsClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

type CompProps = CustomProps & StyleProps;

const BlmAccordionSummary = React.forwardRef<HTMLDivElement, CompProps>(
  function BlmAccordionSummary(props, ref) {
    const {
      children,
      classes,
      expandIcon,
      expanded,
      IconButtonProps,
      optionsIcon,
      showOptionsIcon = false,
      onOptionsClick,
      ...other
    } = props;
    const { blmContent, optionsIcon: optionsIconCls, ...otherClasses } = classes;
    const [focusedState, setFocusedState] = React.useState(false);

    const handleOptionsClick = (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (onOptionsClick) {
        onOptionsClick(event);
      }
    };

    const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
      setFocusedState(true);
    };

    const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
      setFocusedState(false);
    };

    return (
      <MuiAccordionSummary
        classes={otherClasses}
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...other}
      >
        {expandIcon && (
          <IconButton
            className={clsx(classes.expandIcon, {
              [`${classes.expanded}`]: expanded,
            })}
            edge="end"
            component="div"
            tabIndex={-1}
            aria-hidden
            disableRipple
            {...(IconButtonProps as IconBtnProps<"div">)}
          >
            {expandIcon}
          </IconButton>
        )}
        <div className={blmContent}>{children}</div>
        {optionsIcon && (
          <IconButton
            className={clsx(optionsIconCls, {
              [`${classes.focused}`]: focusedState || showOptionsIcon,
            })}
            component="div"
            tabIndex={-1}
            aria-hidden
            disableRipple
            {...(IconButtonProps as IconBtnProps<"div">)}
            onClick={handleOptionsClick}
          >
            {optionsIcon}
          </IconButton>
        )}
      </MuiAccordionSummary>
    );
  }
);

export default withStyles(styles)(BlmAccordionSummary);
