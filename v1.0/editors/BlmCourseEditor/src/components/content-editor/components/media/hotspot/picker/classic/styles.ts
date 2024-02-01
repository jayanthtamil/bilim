import { makeStyles, createStyles } from "@material-ui/core/styles";

export const useClassicPreviewStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      },
      container: {
        overflow: "hidden",
        zIndex: 1,
        cursor: "crosshair",
        backgroundColor: "rgba(255, 0, 0, 0)",
      },
      img: {},
    }),
  { name: "BlmClassicPreview" }
);
