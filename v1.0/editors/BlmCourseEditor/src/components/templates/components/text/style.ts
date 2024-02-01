import { makeStyles, createStyles } from "@material-ui/core/styles";

export const useTextStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "relative",
        "&:hover": {
          outline: "1px solid #d2d2d2",
          "& $deleteBtn": {
            visibility: "visible",
          },
        },
      },
      deleteBtn: {
        visibility: "hidden",
      },
    }),
  { name: "BlmText" }
);
