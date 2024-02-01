import { makeStyles, createStyles } from "@material-ui/core/styles";

export const usePartPageContainerStyle = makeStyles(
  () =>
    createStyles({
      root: {
        width: "100%",
        position: "relative",
        "&$showControls, &:hover": {
          "& $controls": {
            visibility: "visible",
          },
          "& $addBtn": {
            visibility: "visible",
          },
        },
      },
      showControls: {},
      controls: {
        pointerEvents: "none",
        visibility: "hidden",
        position: "absolute",
        zIndex: 100,
        width: "100%",
        height: "100%",
      },
      addBtn: {
        visibility: "hidden",
      },
    }),
  { name: "PartPageContainer" }
);
