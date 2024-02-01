import { createStyles, makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(
  (theme) =>
    createStyles({
      /* Styles applied to the root element. */
      root: {
        "&$focused $clearIndicatorDirty": {
          visibility: "visible",
        },
        /* Avoid double tap issue on iOS */
        "@media (pointer: fine)": {
          "&:hover $clearIndicatorDirty": {
            visibility: "visible",
          },
        },
      },
      /* Styles applied to the root element if `fullWidth={true}`. */
      fullWidth: {
        width: "100%",
      },
      /* Pseudo-class applied to the root element if focused. */
      focused: {},
      /* Styles applied to the tag elements, e.g. the chips. */
      tag: {
        margin: 3,
        maxWidth: "calc(100% - 6px)",
      },
      /* Styles applied to the tag elements, e.g. the chips if `size="small"`. */
      tagSizeSmall: {
        margin: 2,
        maxWidth: "calc(100% - 4px)",
      },
      /* Styles applied when the popup icon is rendered. */
      hasPopupIcon: {},
      /* Styles applied when the clear icon is rendered. */
      hasClearIcon: {},
      /* Styles applied to the Input element. */
      inputRoot: {
        flexWrap: "wrap",
        "$hasPopupIcon &, $hasClearIcon &": {
          paddingRight: 26 + 4,
        },
        "$hasPopupIcon$hasClearIcon &": {
          paddingRight: 52 + 4,
        },
        "& $input": {
          width: 0,
          minWidth: 30,
        },
        '&[class*="MuiInput-root"]': {
          paddingBottom: 1,
          "& $input": {
            padding: 4,
          },
          "& $input:first-child": {
            padding: "6px 0",
          },
        },
        '&[class*="MuiInput-root"][class*="MuiInput-marginDense"]': {
          "& $input": {
            padding: "4px 4px 5px",
          },
          "& $input:first-child": {
            padding: "3px 0 6px",
          },
        },
        '&[class*="MuiOutlinedInput-root"]': {
          padding: 9,
          "$hasPopupIcon &, $hasClearIcon &": {
            // paddingRight: 26 + 4 + 9,
          },
          "$hasPopupIcon$hasClearIcon &": {
            paddingRight: 52 + 4 + 9,
          },
          "& $input": {
            padding: "9.5px 4px",
          },
          "& $input:first-child": {
            paddingLeft: 6,
          },
          "& $endAdornment": {
            right: 9,
          },
        },
        '&[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]': {
          padding: 6,
          "& $input": {
            padding: "4.5px 4px",
          },
        },
        '&[class*="MuiFilledInput-root"]': {
          paddingTop: 19,
          paddingLeft: 8,
          "$hasPopupIcon &, $hasClearIcon &": {
            paddingRight: 26 + 4 + 9,
          },
          "$hasPopupIcon$hasClearIcon &": {
            paddingRight: 52 + 4 + 9,
          },
          "& $input": {
            padding: "9px 4px",
          },
          "& $endAdornment": {
            right: 9,
          },
        },
        '&[class*="MuiFilledInput-root"][class*="MuiFilledInput-marginDense"]': {
          paddingBottom: 1,
          "& $input": {
            padding: "4.5px 4px",
          },
        },
      },
      /* Styles applied to the input element. */
      input: {
        flexGrow: 1,
        textOverflow: "ellipsis",
        textAlign: "right",
        opacity: 0,
      },
      /* Styles applied to the input element if tag focused. */
      inputFocused: {
        opacity: 1,
      },
      /* Styles applied to the endAdornment element. */
      endAdornment: {
        // We use a position absolute to support wrapping tags.
        position: "absolute",
        right: 0,
        top: "calc(50% - 14px)", // Center vertically
      },
      /* Styles applied to the clear indicator. */
      clearIndicator: {
        marginRight: -2,
        padding: 4,
        visibility: "hidden",
      },
      /* Styles applied to the clear indicator if the input is dirty. */
      clearIndicatorDirty: {},
      /* Styles applied to the popup indicator. */
      popupIndicator: {
        padding: 2,
        marginRight: -2,
      },
      /* Styles applied to the popup indicator if the popup is open. */
      popupIndicatorOpen: {
        transform: "rotate(180deg)",
      },
      /* Styles applied to the popper element. */
      popper: {
        zIndex: theme.zIndex.modal,
      },
      /* Styles applied to the popper element if `disablePortal={true}`. */
      popperDisablePortal: {
        position: "absolute",
      },
      /* Styles applied to the `Paper` component. */
      paper: {
        ...theme.typography.body1,
        overflow: "hidden",
        margin: "4px 0",
      },
      /* Styles applied to the `listbox` component. */
      listbox: {
        listStyle: "none",
        margin: 0,
        padding: "8px 0",
        maxHeight: "40vh",
        overflow: "auto",
      },
      /* Styles applied to the loading wrapper. */
      loading: {
        color: theme.palette.text.secondary,
        padding: "14px 16px",
      },
      /* Styles applied to the no option wrapper. */
      noOptions: {
        color: theme.palette.text.secondary,
        padding: "14px 16px",
      },
      /* Styles applied to the option elements. */
      option: {
        minHeight: 48,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        cursor: "pointer",
        paddingTop: 6,
        boxSizing: "border-box",
        outline: "0",
        WebkitTapHighlightColor: "transparent",
        paddingBottom: 6,
        paddingLeft: 16,
        paddingRight: 16,
        [theme.breakpoints.up("sm")]: {
          minHeight: "auto",
        },
        '&[aria-selected="true"]': {
          backgroundColor: theme.palette.action.selected,
        },
        '&[data-focus="true"]': {
          backgroundColor: theme.palette.action.hover,
        },
        "&:active": {
          backgroundColor: theme.palette.action.selected,
        },
        '&[aria-disabled="true"]': {
          opacity: theme.palette.action.disabledOpacity,
          pointerEvents: "none",
        },
      },
      /* Styles applied to the group's label elements. */
      groupLabel: {
        backgroundColor: theme.palette.background.paper,
        top: -8,
      },
      /* Styles applied to the group's ul elements. */
      groupUl: {
        padding: 0,
        "& $option": {
          paddingLeft: 24,
        },
      },
    }),
  {
    name: "MuiBlmAutocomplete",
  }
);
