import { createStyles, makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(
  (theme) =>
    createStyles({
      root: {
        "& .MuiBlmAutocomplete-inputRoot": {
          padding: "2px 4px",
          height: 29,
          "& .MuiBlmAutocomplete-input": {
            marginRight: 1,
            padding: 0,
          },
          "& .MuiBlmAutocomplete-popupIndicator": {
            marginLeft: 5,
            padding: 0,
            width: 24,
            height: "100%",
            borderRadius: 0,
            borderLeft: "1px solid #e5e5e5",
            backgroundColor: "transparent",
            "&.MuiBlmAutocomplete-popupIndicatorOpen": {
              marginTop: -2,
              borderLeft: "none",
              borderRight: "1px solid #e5e5e5",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#dadada",
            borderRadius: 5,
          },
        },
      },
      "@global": {
        ".MuiBlmAutocomplete-popper": {
          "& .MuiBlmAutocomplete-listbox": {
            scrollbarWidth: "thin",
            "& .MuiBlmAutocomplete-option": {
              padding: "2px 10px",
            },
          },
        },
      },
    }),
  { name: "BlmNumericInput" }
);
