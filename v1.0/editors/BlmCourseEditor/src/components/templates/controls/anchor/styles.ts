import { makeStyles, createStyles } from "@material-ui/core/styles";

import anchor from "assets/images/template/anchor-btn.png";
import anchorOver from "assets/images/template/anchor-btn-over.png";
import anchorSelected from "assets/images/template/anchor-btn-selected.png";

export const useAnchorButtonStyle = makeStyles(() =>
  createStyles({
    root: {
      position: "relative",
      pointerEvents: "none",
    },
    anchorTxt: {
      pointerEvents: "all",
      position: "absolute",
      padding: " 0 38px 0 10px",
      right: "6px",
      width: "216px",
      height: "35px",
      boxSizing: "border-box",
      fontWeight: "bold",
      fontSize: "14px",
      color: "#2b2b2b",
      textAlign: "center",
      border: "1px solid #dae0e8",
      borderRadius: "25px",
      boxShadow: "0px 0px 7px 0px #b8b8b8",
      zIndex: -1,
    },
    anchorBtn: {
      pointerEvents: "all",
      cursor: "pointer",
      width: "41px",
      padding: "9px",
      marginTop: "-8px",
      height: "41px",
      background: `url(${anchor}) no-repeat transparent`,
      "&:hover": {
        background: `url(${anchorOver}) no-repeat transparent`,
      },
    },
    hasAnchor: {
      "& $anchorTxt": {
        display: "none",
      },
      "& $anchorBtn": {
        background: `url(${anchorSelected}) no-repeat transparent`,
      },
      "&:hover": {
        "& $anchorTxt": {
          display: "initial",
        },
      },
    },
  })
);
