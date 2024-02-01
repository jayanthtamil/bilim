import { makeStyles, createStyles } from "@material-ui/core/styles";

export const useScreenContainerStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "relative",
      },
      controls: {
        position: "absolute",
        zIndex: 100,
      },
    }),
  { name: "ScreenContainer" }
);
