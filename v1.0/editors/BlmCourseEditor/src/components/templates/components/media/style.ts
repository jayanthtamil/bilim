import { makeStyles, createStyles } from "@material-ui/core/styles";

import warningIcon from "assets/images/warning-1.png";

export const useMediaStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "relative",
        "&:hover": {
          "& $deleteBtn": {
            visibility: "visible",
          },
        },
        "&$hover": {
          "& $orderLbl": {
            visibility: "visible",
          },
        },
      },
      orderLbl: {
        visibility: "hidden",
        position: "absolute",
        padding: "0 5px",
        zIndex: 1,
        inset: "50% auto auto 50%",
        transform: "translate(-50%,-50%)",
        fontSize: "15px",
        lineHeight: 1,
        fontWeight: "bold",
        color: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid #000000",
        background: "#282828",
      },
      deleteBtn: {
        visibility: "hidden",
        top: "5px",
        right: "2px",
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
      hover: {},
    }),
  { name: "BlmMedia" }
);
