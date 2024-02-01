import { makeStyles, createStyles } from "@material-ui/core/styles";

import deleteIcon from "assets/images/content-media/hotspot-delete.png";

export const useHotspotItemStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "absolute",
        cursor: "move",
        "&:hover": {
          outline: "3px solid #507de2",
          "& $deleteWrapper": {
            visibility: "visible",
          },
        },
        "&:before, &:after": {
          pointerEvents: "none",
        },
      },
      deleteWrapper: {
        width: "100%",
        height: "50%",
        visibility: "hidden",
        transition: "visibility 0.2s ease",
      },
      deleteBtn: {
        position: "absolute",
        cursor: "pointer",
        inset: "auto -28px auto auto",
        width: "28px",
        height: "23px",
        background: `url(${deleteIcon}) no-repeat center`,
      },
      selected: {
        outline: "3px solid #507de2",
      },
    }),
  { name: "BlmHotspotItem" }
);
