import { createStyles } from "@material-ui/core";

export const styles = createStyles({
  root: {
    minHeight: 39,
    fontWeight: 300,
    fontSize: 20,
    color: "#507de2",
    backgroundColor: "#f1f5fe",
    paddingLeft: 12,
    paddingRight: 12,
    "&$expanded": {
      minHeight: 39,
    },
  },
  content: {
    margin: 0,
    alignItems: "center",
    "&$expanded": {
      margin: 0,
    },
  },
  blmContent: {
    flexGrow: 1,
    paddingLeft: 5,
  },
  expanded: {},
  focused: {},
  expandIcon: {
    padding: 0,
    marginTop: 3,
    marginRight: 5,
    "&$expanded": {
      transform: "rotate(90deg)",
    },
  },
  optionsIcon: {
    alignSelf: "stretch",
    padding: "15px 5px",
    borderRadius: 0,
    visibility: "hidden",
    "&:hover": {
      backgroundColor: "#edf1fa",
    },
    "&$focused": {
      visibility: "visible",
    },
  },
});
