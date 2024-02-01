import { makeStyles, createStyles } from "@material-ui/core/styles";

export const useTextCardStyle = makeStyles(
  () =>
    createStyles({
      root: {
        paddingBottom: "12px",
        borderBottom: "1px solid #e5e8ef",
        color: "#2b2b2b",
      },
      textWrapper: {
        maxHeight: 80,
        overflow: "hidden",
      },
    }),
  { name: "BlmTextCard" }
);
