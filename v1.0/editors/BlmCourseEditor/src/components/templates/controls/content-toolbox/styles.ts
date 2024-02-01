import { makeStyles, createStyles } from "@material-ui/core/styles";

import edit from "assets/images/template/edit-btn.png";
import editOver from "assets/images/template/edit-btn-over.png";
import variant from "assets/images/template/variant-btn.png";
import variantOver from "assets/images/template/variant-btn-over.png";
import variantWarning from "assets/images/template/variant-warning-btn.png";
import action from "assets/images/template/action-btn.png";
import actionOver from "assets/images/template/action-btn-over.png";
import actionActive from "assets/images/template/action-btn-active.png";
import assocaited from "assets/images/expand-7-open.png";

export const useTemplateBtnStyle = makeStyles(
  () =>
    createStyles({
      root: {
        display: "inline-flex",
        margin: "10px 0 0 20px",
      },
      outdated: {
        "& $variantsBtn": {
          backgroundImage: `url(${variantWarning})`,
        },
      },
      editBtn: {
        cursor: "pointer",
        width: "41px",
        height: "41px",
        background: `url(${edit}) no-repeat transparent`,
        "&:hover": {
          backgroundImage: `url(${editOver})`,
        },
      },
      associatedChapterBtn: {
        pointerEvents: "all",
        cursor: "pointer",
        alignSelf: "flex-start",
        margin: "-11px 0 0 641px",
        padding: "0 0 0 20px",
        width: 405,
        height: 18,
        fontSize: 12,
        fontWeight: "bold",
        color: "#ffffff",
        textTransform: "uppercase",
        background: `url(${assocaited}) no-repeat right 15px center #2b2b2b`,
        borderRadius: "0 0 15px 15px",
      },
      variantsBtn: {
        cursor: "pointer",
        marginLeft: "2px",
        width: "55px",
        height: "33px",
        border: "solid #e9e9e9 1px",
        borderRight: "none",
        borderRadius: "20px 0 0 20px",
        background: `url(${variant}) no-repeat center white`,
        boxShadow: "2px 3px 3px 0px rgba(0, 0, 0, 0.07)",
        "&:hover": {
          backgroundImage: `url(${variantOver})`,
        },
        "&:last-child": {
          borderRadius: "20px",
        },
      },
      actionBtn: {
        cursor: "pointer",
        width: "55px",
        height: "33px",
        border: "solid #e9e9e9 1px",
        borderRadius: "0 20px 20px 0",
        background: `url(${action}) no-repeat center white`,
        boxShadow: "2px 3px 3px 0px rgba(0, 0, 0, 0.07)",
        "&:hover": {
          backgroundImage: `url(${actionOver})`,
        },
      },
      actionActiveBtn: {
        backgroundImage: `url(${actionActive})`,
      },
    }),
  { name: "BlmContentToolbox" }
);
