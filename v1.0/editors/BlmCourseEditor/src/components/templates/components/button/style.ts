import { makeStyles, createStyles } from "@material-ui/core/styles";

import warningIcon from "assets/images/warning-1.png";

export const useButtonStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "relative",
      },
      warningIcon: {
        position: "absolute",
        right: "5px",
        bottom: "5px",
        width: "19px",
        height: "19px",
        zIndex: 3,
        background: `url(${warningIcon}) no-repeat`,
      },
    }),
  { name: "BlmButton" }
);
