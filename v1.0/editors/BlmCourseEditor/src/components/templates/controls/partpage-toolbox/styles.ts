import { makeStyles, createStyles } from "@material-ui/core/styles";

import edit from "assets/images/template/edit-btn.png";
import editOver from "assets/images/template/edit-btn-over.png";
import variant from "assets/images/template/variant-btn.png";
import variantOver from "assets/images/template/variant-btn-over.png";
import variantWarning from "assets/images/template/variant-warning-btn.png";
import background from "assets/images/template/bg-btn.png";
import backgroundOver from "assets/images/template/bg-btn-over.png";
import basic from "assets/images/template/scroll-basic-btn.png";
import basicOver from "assets/images/template/scroll-basic-btn-over.png";
import fixed from "assets/images/template/scroll-fixed-btn.png";
import fixedOver from "assets/images/template/scroll-fixed-btn-over.png";
import parallax from "assets/images/template/scroll-parallax-btn.png";
import parallaxOver from "assets/images/template/scroll-parallax-btn-over.png";
import zoom from "assets/images/template/scroll-zoom-btn.png";
import zoomOver from "assets/images/template/scroll-zoom-btn-over.png";
import action from "assets/images/template/action-btn.png";
import actionOver from "assets/images/template/action-btn-over.png";
import actionActive from "assets/images/template/action-btn-active.png";
import expand from "assets/images/expand-2-close.png";
import expandOver from "assets/images/expand-2-close-over.png";
import assocaited from "assets/images/expand-7-open.png";
import deleteNormal from "assets/images/template/delete-btn.png";
import deleteOver from "assets/images/template/delete-btn-over.png";
import duplicate from "assets/images/template/duplicate-btn.png";
import duplicateOver from "assets/images/template/duplicate-btn-over.png";
import moveUp from "assets/images/template/move-up-btn.png";
import moveUpOver from "assets/images/template/move-up-btn-over.png";
import moveDown from "assets/images/template/move-down-btn.png";
import moveDownOver from "assets/images/template/move-down-btn-over.png";
import expert from "assets/images/template/expert-btn.png";
import expertOver from "assets/images/template/expert-btn-over.png";

export const usePartPageToolboxStyle = makeStyles(
  () =>
    createStyles({
      root: {
        display: "grid",
        pointerEvents: "none",
        gridTemplateColumns: "max-content 1fr repeat(2, max-content)",
        gridAutoRows: "max-content",
        justifyItems: "flex-start",
        padding: "15px 21px 0 15px",
        color: "#2b2b2b",
        transition: "visibility 0.3s ease",
      },
      outdated: {
        "& $variantsBtn": {
          backgroundImage: `url(${variantWarning})`,
        },
      },
      editBtn: {
        pointerEvents: "all",
        cursor: "pointer",
        width: "41px",
        height: "41px",
        minWidth: "41px",
        border: "none",
        margin: "0px",
        padding: "0px",
        background: `url(${edit}) no-repeat transparent`,
        "&:hover": {
          backgroundImage: `url(${editOver})`,
          cursor: "pointer",
        },
      },
      leftBtnBar: {
        pointerEvents: "all",
        display: "inline-flex",
        height: "35px",
        marginLeft: "1px",
        backgroundColor: "white",
        border: "solid #e9e9e9 1px",
        borderRadius: "20px",
        boxShadow: "2px 3px 3px 0px rgba(0, 0, 0, 0.07)",
      },
      expanded: {
        "& $expandBtn": {
          transform: "rotate(0deg)",
          backgroundPositionX: "calc(50% - 4px)",
        },
      },
      variantsBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "40px",
        borderRight: "solid #e9e9e9 1px",
        background: `url(${variant}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${variantOver})`,
        },
      },
      expertsBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "40px",
        borderRight: "solid #e9e9e9 1px",
        background: `url(${expert}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${expertOver})`,
        },
      },
      backgroundBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "40px",
        borderRight: "solid #e9e9e9 1px",
        background: `url(${background}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${backgroundOver})`,
        },
      },
      scrollBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "40px",
        borderRight: "solid #e9e9e9 1px",
      },
      basic: {
        background: `url(${basic}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${basicOver})`,
        },
      },
      fixed: {
        background: `url(${fixed}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${fixedOver})`,
        },
      },
      parallax: {
        background: `url(${parallax}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${parallaxOver})`,
        },
      },
      zoom: {
        background: `url(${zoom}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${zoomOver})`,
        },
      },
      actionBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "40px",
        borderRight: "solid #e9e9e9 1px",
        background: `url(${action}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${actionOver})`,
        },
      },
      actionActiveBtn: {
        backgroundImage: `url(${actionActive})`,
      },
      expandBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "47px",
        transform: "rotate(180deg)",
        background: `url(${expand}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${expandOver})`,
        },
      },
      propertiesBtn: {
        position: "relative",
        flex: "0 0 auto",
        cursor: "pointer",
        paddingTop: "6px",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
        textTransform: "uppercase",
        backgroundColor: "#333333",
        "&:hover": {
          paddingTop: "5px",
          borderBottom: "4px solid #eaeffb",
        },
        "&:not(:last-child)": {
          "&:after": {
            display: "block",
            position: "absolute",
            content: "''",
            top: "7px",
            right: "0px",
            width: "1px",
            height: "18px",
            backgroundColor: "#4d4d4d",
          },
        },
      },
      generalBtn: {
        width: "91px",
      },
      completionBtn: {
        width: "201px",
      },
      logBtn: {
        width: "67px",
      },
      associatedChapterBtn: {
        pointerEvents: "all",
        cursor: "pointer",
        alignSelf: "flex-start",
        margin: "-15px 0 0 0",
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
      rightOuterWrapper: {
        display: "flex",
        gridColumn: "-2/-1",
        pointerEvents: "all",
        backgroundColor: "rgba(0, 0, 0, 0)",
      },
      positionCtrlsWrapper: {
        display: "flex",
        position: "relative",
        pointerEvents: "all",
        marginRight: "8px",
        width: "110px",
        height: "33px",
        border: "solid #e9e9e9 1px",
        borderRadius: "20px",
        backgroundColor: "white",
        boxShadow: "2px 3px 3px 0px rgba(0, 0, 0, 0.07)",
      },
      positionUpBtn: {
        width: "37px",
        flex: "0 0 auto",
        cursor: "pointer",
        background: `url(${moveUp}) no-repeat center transparent`,
        "&.disabled": {
          cursor: "default",
          opacity: 0.5,
        },
        "&:not(.disabled):hover": {
          backgroundImage: `url(${moveUpOver})`,
        },
      },
      positionDownBtn: {
        width: "35px",
        flex: "0 0 auto",
        cursor: "pointer",
        background: `url(${moveDown})  no-repeat center transparent`,
        "&.disabled": {
          cursor: "default",
          opacity: 0.5,
        },
        "&:not(.disabled):hover": {
          backgroundImage: `url(${moveDownOver})`,
        },
      },
      positionTxt: {
        flex: "1 auto",
        width: "100%",
        fontWeight: 100,
        fontSize: "18px",
        textAlign: "center",
        border: "none",
        "&:hover": {
          "& ~ $positionTooltip": {
            visibility: "visible",
          },
        },
      },
      positionDivider: {
        alignSelf: "center",
        width: "2px",
        height: "15px",
        background: "#e9e9e9",
      },
      positionTooltip: {
        position: "absolute",
        left: "50%",
        bottom: "-5px",
        visibility: "hidden",
        transform: "translate(-50%,100%)",
        fontWeight: "bold",
        fontSize: "10px",
        lineHeight: "10px",
        textAlign: "center",
        textTransform: "uppercase",
      },
      rightBtnBar: {
        display: "inline-flex",
        gridColumn: "-2/-1",
        height: "35px",
        border: "solid #e9e9e9 1px",
        borderRadius: "20px",
        backgroundColor: "white",
        boxShadow: "2px 3px 3px 0px rgba(0, 0, 0, 0.07)",
      },
      duplicateBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "50px",
        borderRight: "solid #e9e9e9 1px",
        background: `url(${duplicate}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${duplicateOver})`,
        },
      },
      deleteBtn: {
        flex: "0 0 auto",
        cursor: "pointer",
        width: "48px",
        background: `url(${deleteNormal}) no-repeat center transparent`,
        "&:hover": {
          backgroundImage: `url(${deleteOver})`,
        },
      },
      anchorBtnWrapper: {
        gridColumn: "-2/-1",
        justifySelf: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0)",
      },
      anchorBtn: {
        marginTop: "8px",
        marginRight: "-6px",
      },
    }),
  { name: "BlmPartPageToolbox" }
);
