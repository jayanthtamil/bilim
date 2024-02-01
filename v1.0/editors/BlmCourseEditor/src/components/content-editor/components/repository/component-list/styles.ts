import { makeStyles, createStyles } from "@material-ui/core/styles";

export const useComponentListStyle = makeStyles(
  () =>
    createStyles({
      root: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: "100%",
        "&.text": {
          paddingRight: 43,
          gap: "11px",
          cursor: "pointer",
        },
        "&.media": {},
        "&.button": {},
        "&.sound": {},
      },
    }),
  { name: "BlmComponentList" }
);
