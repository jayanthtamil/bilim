import DropdownArrowIcon from "assets/images/forms/dropdown-arrow-1.png";

/** @type {{root: React.CSSProperties}} */
export const styles = {
  /* Styles applied to the select component `root` class. */
  root: {
    display: "inline-flex",
    position: "relative" as any,
    boxSizing: "border-box" as any,
    alignItems: "center",
    fontSize: "1rem",
    lineHeight: "1.1876em",
    letterSpacing: "0.00938em",
  },
  /* Styles applied to the select component `select` class. */
  select: {
    width: "100%",
    boxSizing: "content-box" as any,
    fontSize: "14px",
    fontWeight: "bold" as any,
    color: "#3a3e42",
    border: "1px solid #dadada",
    padding: "5px 0 6px 15px",
    "-moz-appearance": "none", // Reset
    "-webkit-appearance": "none", // Reset
    // When interacting quickly, the text can end up selected.
    // Native select can't be selected either.
    userSelect: "none" as any,
    borderRadius: 5, // Reset
    minWidth: 16, // So it doesn't collapse.
    cursor: "pointer",
    "&:focus": {
      // Show that it's not an text input
      backgroundColor: "none",
      borderRadius: 5, // Reset Chrome style
    },
    // Remove IE 11 arrow
    "&::-ms-expand": {
      display: "none",
    },
    "&$disabled": {
      cursor: "default",
    },
    "&&": {
      paddingRight: 24,
    },
  },
  /* Styles applied to the select component `selectMenu` class. */
  selectMenu: {
    height: "auto", // Resets for multpile select with chips
    minHeight: "1.1876em", // Required for select\text-field height consistency
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as any,
    overflow: "hidden",
  },
  /* Pseudo-class applied to the select component `disabled` class. */
  disabled: {},
  /* Styles applied to the icon component. */
  icon: {
    // We use a position absolute over a flexbox in order to forward the pointer events
    // to the input and to support wrapping tags..
    position: "absolute" as any,
    right: 0,
    top: "calc(50% - 12px)", // Center vertically
    pointerEvents: "none" as any, // Don't block pointer events on the select under the icon.
    color: "black",
    width: "1em",
    height: "1em",
    display: "inline-block",
    fontSize: "1.5rem",
    transition: "fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    flexShrink: 0,
    background: `url(${DropdownArrowIcon}) no-repeat center`,
    "-mozUserSelect": "none",
    "&$disabled": {
      color: "green", //theme.palette.action.disabled,
    },
  },
  /* Styles applied to the icon component if the popup is open. */
  iconOpen: {
    transform: "rotate(180deg)",
  },
  backdrop: {
    zIndex: 1309,
    backgroundColor: "transparent",
  },
  popper: {
    scrollbarWidth: "thin" as any,
    backgroundColor: "#fff",
    borderRadius: "4px",
    overflow: "auto",
    boxShadow:
      "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    zIndex: 1310,
    minHeight: 50,
  },
};
