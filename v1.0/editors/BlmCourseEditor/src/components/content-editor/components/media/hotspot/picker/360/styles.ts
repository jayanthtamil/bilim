import { withStyles, createStyles, WithStyles } from "@material-ui/core/styles";

import deleteIcon from "assets/images/content-media/hotspot-360-delete.png";

const styles = () =>
  createStyles({
    root: {
      position: "absolute",
      cursor: "crosshair",
      width: "100%",
      height: "100%",
    },
    itemRoot: {
      position: "absolute",
      "&:hover": {
        outline: "23px solid #507de2",
        "& $deleteWrapper": {
          visibility: "visible",
        },
      },
    },
    deleteWrapper: {
      width: "115%",
      height: "50%",
      visibility: "hidden",
      transition: "visibility 0.2s ease",
    },
    deleteBtn: {
      position: "absolute",
      cursor: "pointer",
      inset: "auto -180px auto auto",
      width: "150px",
      height: "150px",
      background: `url(${deleteIcon})`,
    },
    selected: {
      outline: "23px solid #507de2",
    },
  });

export const with360PreviewStyles = withStyles(styles, { name: "Blm360Preview" });
export type H360PreviewStyleProps = WithStyles<typeof styles>;
