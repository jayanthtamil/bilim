import { makeStyles, createStyles } from "@material-ui/core/styles";

import deleteIcon from "assets/images/buttons/delete-1.png";
import deleteOverIcon from "assets/images/buttons/delete-1-over.png";

export const useDeleteComponentStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "absolute",
        top: "-12px",
        right: "-12px",
        width: "27px",
        height: "28px",
        cursor: "pointer",
        zIndex: 2,
        background: `url(${deleteIcon}) no-repeat`,
        "&:hover": {
          background: `url(${deleteOverIcon}) no-repeat`,
        },
      },
    }),
  { name: "BlmDeleteComponent" }
);
