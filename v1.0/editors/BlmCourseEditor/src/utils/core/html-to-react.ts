//@ts-nocheck
import React from "react";
import camelCase from "lodash/camelCase";

import { SimpleObject } from "types";

export const isValidNode = () => {
  return true;
};

//https://github.com/aknuds1/html-to-react/blob/master/lib/utils.js
export function createStyleJsonFromString(styleString: string = "") {
  var styles = styleString.split(/;(?!base64)/);
  var singleStyle,
    key,
    value,
    jsonStyles: SimpleObject = {};

  for (var i = 0; i < styles.length; ++i) {
    singleStyle = styles[i].split(":");

    if (singleStyle.length > 2) {
      singleStyle[1] = singleStyle.slice(1).join(":");
    }

    key = singleStyle[0];
    value = singleStyle[1];

    if (typeof value === "string") {
      value = value.trim();
    }

    if (typeof key === "string") {
      key = key.trim();
    }

    if (key != null && value != null && key.length > 0 && value.length > 0) {
      if (key.startsWith("--")) {
        //For css variables
        jsonStyles[key] = value;
      } else {
        jsonStyles[camelCase(key)] = value;
      }
    }
  }
  return jsonStyles;
}

export function createReactAttribs(attribs?: SimpleObject) {
  if (attribs) {
    const result: SimpleObject = {};

    for (const key in attribs) {
      let prop = key;
      let value = attribs[key];

      if (key === "style") {
        value = createStyleJsonFromString(value);
      } else if (key === "class") {
        prop = "className";
      } else if (key === "for") {
        prop = "htmlFor";
      } else if (key === "autoplay") {
        prop = "autoPlay";
      }

      result[prop] = value;
    }

    return result;
  }

  return attribs;
}

// prettier-ignore
const voidElementTags = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', 'menuitem', 'textarea',
];

export function processDefaultNode(node: any, children: JSX.Element, index: any) {
  if (node.type === "text") {
    return node.data;
  } else if (node.type === "comment") {
    // FIXME: The following doesn't work as the generated HTML results in
    // "&lt;!--  This is a comment  --&gt;"
    // return '<!-- ' + node.data + ' -->';
    return false;
  }

  if (voidElementTags.indexOf(node.name) > -1) {
    return createElement(node, index);
  } else {
    return createElement(node, index, node.data, children);
  }
}

// Boolean HTML attributes, copied from https://meiert.com/en/blog/boolean-attributes-of-html/,
// on the form React expects.
// prettier-ignore
const booleanAttrs = [
  "allowFullScreen", "allowpaymentrequest", "async", "autoFocus", "autoPlay", "checked", "controls",
  "default", "disabled", "formNoValidate", "hidden", "ismap", "itemScope", "loop", "multiple", "muted",
  "nomodule", "noValidate", "open", "playsinline", "readOnly", "required", "reversed", "selected", "truespeed",
];

function createElement(node: any, index: any, data?: any, children?: JSX.Element) {
  let elementProps = {
    key: index,
  };
  if (node.attribs) {
    elementProps = Object.entries(node.attribs).reduce(
      (result: any, [key, value]: [string, any]) => {
        key = camelCaseMap[key.replace(/[-:]/, "")] || key;

        if (key === "style") {
          value = createStyleJsonFromString(value);
        } else if (key === "class") {
          key = "className";
        } else if (key === "for") {
          key = "htmlFor";
        } else if (key.startsWith("on")) {
          // eslint-disable-next-line no-new-func
          value = Function(value);
        } 

        if (booleanAttrs.includes(key) && (value || "") === "") {
          value = key;
        }

        result[key] = value;
        return result;
      },
      elementProps
    );
  }

  children = children || [];
  const allChildren = data != null ? [data].concat(children) : children;

  return React.createElement.apply(null, [node.name, elementProps].concat(allChildren));
}

// prettier-ignore
const HTML_ATTRIBUTES = ["accept", "acceptCharset", "accessKey", "action", "allowFullScreen", "allowTransparency", "alt", "async", "autoComplete", "autoFocus", "autoPlay", "capture",
 "cellPadding", "cellSpacing", "challenge", "charSet", "checked", "cite", "classID", "className", "colSpan", "cols", "content", "contentEditable", "contextMenu", "controls", "coords",
 "crossOrigin", "data", "dateTime", "default", "defer", "dir", "disabled", "download", "draggable", "encType", "form", "formAction", "formEncType", "formMethod", "formNoValidate", "formTarget",
 "frameBorder", "headers", "height", "hidden", "high", "href", "hrefLang", "htmlFor", "httpEquiv", "icon", "id", "inputMode", "integrity", "is", "keyParams", "keyType", "kind", "label", "lang", 
 "list", "loop", "low", "manifest", "marginHeight", "marginWidth", "max", "maxLength", "media", "mediaGroup", "method", "min", "minLength", "multiple", "muted", "name", "noValidate", "nonce", 
 "open", "optimum", "pattern", "placeholder", "poster", "preload", "profile", "radioGroup", "readOnly", "rel", "required", "reversed", "role", "rowSpan", "rows", "sandbox", "scope", "scoped", 
 "scrolling", "seamless",  "selected", "shape", "size", "sizes", "span", "spellCheck", "src", "srcDoc", "srcLang", "srcSet", "start", "step", "style", "summary", "tabIndex", "target", "title", 
 "type", "useMap", "value", "width", "wmode", "wrap", "onClick"
];

// prettier-ignore
const NON_STANDARD_ATTRIBUTES = [ "autoCapitalize", "autoCorrect", "color", "itemProp", "itemScope", "itemType", "itemRef", "itemID", "security", "unselectable", "results", "autoSave"];

// prettier-ignore
const SVG_ATTRIBUTES = [ "accentHeight", "accumulate", "additive", "alignmentBaseline", "allowReorder", "alphabetic", "amplitude", "arabicForm", "ascent", "attributeName", "attributeType",
 "autoReverse", "azimuth", "baseFrequency", "baseProfile", "baselineShift", "bbox", "begin", "bias", "by", "calcMode", "capHeight", "clip", "clipPath", "clipPathUnits", "clipRule", "colorInterpolation",
 "colorInterpolationFilters", "colorProfile", "colorRendering", "contentScriptType", "contentStyleType", "cursor", "cx", "cy", "d", "decelerate", "descent", "diffuseConstant", "direction", 
 "display", "divisor", "dominantBaseline", "dur", "dx", "dy", "edgeMode", "elevation", "enableBackground", "end", "exponent", "externalResourcesRequired", "fill", "fillOpacity", "fillRule", 
 "filter", "filterRes", "filterUnits", "floodColor", "floodOpacity", "focusable", "fontFamily", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontWeight", "format", 
 "from", "fx", "fy", "g1", "g2", "glyphName", "glyphOrientationHorizontal", "glyphOrientationVertical", "glyphRef", "gradientTransform", "gradientUnits", "hanging", "horizAdvX", "horizOriginX", 
 "ideographic", "imageRendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kernelMatrix", "kernelUnitLength", "kerning", "keyPoints", "keySplines", "keyTimes", "lengthAdjust", 
 "letterSpacing", "lightingColor", "limitingConeAngle", "local", "markerEnd", "markerHeight", "markerMid", "markerStart", "markerUnits", "markerWidth", "mask", "maskContentUnits", "maskUnits", 
 "mathematical", "mode", "numOctaves", "offset", "opacity", "operator", "order", "orient", "orientation", "origin", "overflow", "overlinePosition", "overlineThickness", "paintOrder", "panose1", 
 "pathLength", "patternContentUnits", "patternTransform", "patternUnits", "pointerEvents", "points", "pointsAtX", "pointsAtY", "pointsAtZ", "preserveAlpha", "preserveAspectRatio", "primitiveUnits", 
 "r", "radius", "refX", "refY", "renderingIntent", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "result", "rotate", "rx", "ry", "scale", "seed", "shapeRendering", 
 "slope", "spacing", "specularConstant", "specularExponent", "speed", "spreadMethod", "startOffset", "stdDeviation", "stemh", "stemv", "stitchTiles", "stopColor", "stopOpacity", "strikethroughPosition", 
 "strikethroughThickness", "string", "stroke", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit", "strokeOpacity", "strokeWidth", "surfaceScale", "systemLanguage", 
 "tableValues", "targetX", "targetY", "textAnchor", "textDecoration", "textLength", "textRendering", "to", "transform", "u1", "u2", "underlinePosition", "underlineThickness", "unicode", "unicodeBidi", 
 "unicodeRange", "unitsPerEm", "vAlphabetic", "vHanging", "vIdeographic", "vMathematical", "values", "vectorEffect", "version", "vertAdvY", "vertOriginX", "vertOriginY", "viewBox", "viewTarget", 
 "visibility", "widths", "wordSpacing", "writingMode", "x", "x1", "x2", "xChannelSelector", "xHeight", "xlinkActuate", "xlinkArcrole", "xlinkHref", "xlinkRole", "xlinkShow", "xlinkTitle", "xlinkType", 
 "xmlns", "xmlnsXlink", "xmlBase", "xmlLang", "xmlSpace", "y", "y1", "y2", "yChannelSelector", "z", "zoomAndPan" ];

const camelCaseMap = HTML_ATTRIBUTES.concat(NON_STANDARD_ATTRIBUTES)
  .concat(SVG_ATTRIBUTES)
  .reduce(function (soFar: any, attr: string) {
    const lower = attr.toLowerCase();

    if (lower !== attr) {
      soFar[lower] = attr;
    }

    return soFar;
  }, {});
