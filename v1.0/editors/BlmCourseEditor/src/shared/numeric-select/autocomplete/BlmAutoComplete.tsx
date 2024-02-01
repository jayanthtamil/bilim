import React, { Fragment } from "react";
import clsx from "clsx";
import { IconButton, Paper, Popper, Typography } from "@material-ui/core";
import { AutocompleteProps, useAutocomplete } from "@material-ui/lab";

import { useStyles } from "./styles";

export interface CompProps<T>
  extends AutocompleteProps<T, boolean | undefined, boolean | undefined, boolean | undefined> {
  suffix?: string;
  popupClassName?: string;
}

function BlmAutoComplete<T>(props: CompProps<T>) {
  const {
    freeSolo,
    suffix,
    disabled = false,
    size = "medium",
    openText = "Open",
    closeText = "Close",
    popupIcon,
    forcePopupIcon,
    fullWidth = false,
    disablePortal = false,
    className,
    popupClassName,
    renderInput,
    renderOption: renderOptionProp,
    getOptionLabel = (x) => x,
  } = props;
  const {
    id,
    focused,
    popupOpen,
    anchorEl,
    groupedOptions,
    focusedTag,
    inputValue,
    setAnchorEl,
    getRootProps,
    getInputProps,
    getInputLabelProps,
    getListboxProps,
    getOptionProps,
    getPopupIndicatorProps,
  } = useAutocomplete({ ...props, componentName: "Autocomplete" });
  const classes = useStyles();
  const renderOption = renderOptionProp || getOptionLabel;
  const hasPopupIcon = (!freeSolo || forcePopupIcon === true) && forcePopupIcon !== false;

  return (
    <div
      className={clsx(
        classes.root,
        {
          [classes.focused]: focused,
          [classes.fullWidth]: fullWidth,
          [classes.hasPopupIcon]: hasPopupIcon,
        },
        className
      )}
      {...getRootProps()}
    >
      {renderInput({
        id,
        disabled,
        fullWidth: true,
        size: size === "small" ? "small" : undefined,
        InputLabelProps: getInputLabelProps(),
        InputProps: {
          ref: setAnchorEl,
          className: classes.inputRoot,
          startAdornment: undefined,
          endAdornment: (
            <Fragment>
              {suffix ? <Typography>{suffix}</Typography> : null}
              {hasPopupIcon ? (
                <IconButton
                  disableRipple={true}
                  disabled={disabled}
                  aria-label={popupOpen ? closeText : openText}
                  title={popupOpen ? closeText : openText}
                  className={clsx(classes.popupIndicator, {
                    [classes.popupIndicatorOpen]: popupOpen,
                  })}
                  {...getPopupIndicatorProps()}
                >
                  {popupIcon}
                </IconButton>
              ) : null}
            </Fragment>
          ),
        },
        inputProps: {
          className: clsx(classes.input, {
            [classes.inputFocused]: focusedTag === -1,
          }),
          disabled,
          ...getInputProps(),
        },
      })}
      {popupOpen && anchorEl && (
        <Popper
          role="presentation"
          open={true}
          anchorEl={anchorEl}
          style={{
            width: anchorEl.clientWidth + "px",
          }}
          className={clsx(classes.popper, popupClassName, {
            [classes.popperDisablePortal]: disablePortal,
          })}
        >
          <Paper className={classes.paper}>
            {groupedOptions.length > 0 && (
              <ul className={classes.listbox} {...getListboxProps()}>
                {groupedOptions.map((option, index) => {
                  const optionProps = getOptionProps({ option, index }) as any;

                  return (
                    <li {...optionProps} className={classes.option}>
                      {renderOption(option, {
                        selected: optionProps["aria-selected"],
                        inputValue,
                      })}
                    </li>
                  );
                })}
              </ul>
            )}
          </Paper>
        </Popper>
      )}
    </div>
  );
}

export default BlmAutoComplete;
