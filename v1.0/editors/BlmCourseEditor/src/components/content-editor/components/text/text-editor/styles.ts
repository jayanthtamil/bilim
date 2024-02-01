import { makeStyles, createStyles } from "@material-ui/core/styles";

import activateIcon from "assets/images/content-editor/activate-btn-1.png";
import deleteIcon from "assets/images/buttons/delete-1.png";
import deleteOverIcon from "assets/images/buttons/delete-1-over.png";

export const useTextComponentEditorStyle = makeStyles(
  () =>
    createStyles({
      root: {
        position: "relative",
        backgroundColor: "#ffffff",
      },
      dark: {
        backgroundColor: "#3a4259",
      },
      deactivated: {
        backgroundColor: "#ffffff7F",
        "&$dark": {
          backgroundColor: "#3a42597F",
        },
        "& $editorWrapper": {
          pointerEvents: "none",
          opacity: 0.5,
        },
      },
      editorWrapper: {
        padding: "10px 17px 11px 17px",
      },
      activateBtn: {
        position: "absolute",
        cursor: "pointer",
        width: 20,
        height: "100%",
        top: 0,
        right: 10,
        background: `url(${activateIcon}) no-repeat center`,
      },
      deactivateBtn: {
        position: "absolute",
        cursor: "pointer",
        width: 20,
        height: "100%",
        top: 0,
        right: -28,
        background: `url(${deleteIcon}) no-repeat center`,
        "&:hover": {
          background: `url(${deleteOverIcon}) no-repeat center`,
         },
      },
    }),
  { name: "BlmTextComponentEditor" }
);
