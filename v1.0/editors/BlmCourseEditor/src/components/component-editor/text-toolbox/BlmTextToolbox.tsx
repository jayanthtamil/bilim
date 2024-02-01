import React, { useMemo, MouseEvent, ChangeEvent } from "react";
import clsx from "clsx";
import { EditorState } from "draft-js";
import { ListItemIcon, MenuItem, Popper, Select } from "@material-ui/core";

import { SimpleObject, TextEditorRef } from "types";
import {
  INLINE_STYLE_SIZE_PREFIX,
  INLINE_STYLE_COLOR_PREFIX,
  INLINE_STYLE_BG_COLOR_PREFIX,
  BLOCK_STYLE_UNORDERED_LIST,
  BLOCK_STYLE_ORDERED_LIST,
  INLINE_STYLE_BOLD,
  INLINE_STYLE_ITALIC,
  INLINE_STYLE_UNDERLINE,
  INLINE_STYLE_FONT_PREFIX,
  BLOCK_STYLE_LEFT_ALIGN,
  BLOCK_STYLE_CENTER_ALIGN,
  BLOCK_STYLE_RIGHT_ALIGN,
  BLOCK_STYLE_JUSTIFY_ALIGN,
} from "editor-constants";
import { findIndex, getIFrameClientRect } from "utils";
import {
  BulletListIcon,
  CenterAlignIcon,
  DropdownImg2,
  JustifyAlignIcon,
  LeftAlignIcon,
  NumListIcon,
  RightAlignIcon,
} from "assets/icons";
import {
  BlmColorPicker,
  ColorPickerChangeEvent,
  BlmNumericSelect,
  NumericSelectChangeEvent,
} from "shared";
import { getCurrentStyle } from "./utils";
import { ContainerProps } from "./container";
import "./styles.scss";

export interface CompProps extends ContainerProps {
  show: boolean;
  anchorEle?: HTMLElement;
  offset?: { x?: number; y?: number };
  textEditorRef?: TextEditorRef;
  editorState?: EditorState;
  defaultStyles?: SimpleObject;
  size?: "normal" | "small";
}

const sizes = [
  { label: "12 px", value: 12 },
  { label: "14 px", value: 14 },
  { label: "16 px", value: 16 },
  { label: "18 px", value: 18 },
  { label: "24 px", value: 24 },
  { label: "30 px", value: 30 },
  { label: "36 px", value: 36 },
  { label: "48 px", value: 48 },
  { label: "60 px", value: 60 },
  { label: "72 px", value: 72 },
  { label: "100 px", value: 100 },
];

function BlmTextToolbox(props: CompProps) {
  const {
    show,
    anchorEle,
    offset,
    textEditorRef,
    editorState,
    defaultStyles,
    size,
    fonts,
    colors,
    bgColors,
  } = props;
  const defaultFont = defaultStyles?.fontFamily;
  const currentStyle = getCurrentStyle(editorState, defaultStyles);
  const { x: offsetX = 0, y: offsetY = 0 } = offset || {};

  const hasDefaultFont = useMemo(() => {
    return fonts ? findIndex(fonts, defaultFont, "fontFamily") !== -1 : false;
  }, [fonts, defaultFont]);

  const hasFont = useMemo(() => {
    return fonts ? findIndex(fonts, currentStyle.fontFamily, "fontFamily") !== -1 : false;
  }, [fonts, currentStyle.fontFamily]);

  const modifiers = useMemo(() => {
    const pos = anchorEle ? getIFrameClientRect(anchorEle) : { x: 0, y: 0 };

    return {
      offset: {
        offset: `${pos.x + offsetX},${-(pos.y + offsetY)}`,
        enabled: true,
      },
      flip: {
        enabled: false,
      },
      preventOverflow: {
        enabled: true,
      },
      hide: {
        enabled: true,
      },
      computeStyle: {
        gpuAcceleration: false,
      },
    };
  }, [anchorEle, offsetX, offsetY]);

  const toggleInlineStyle = (inlineStyle: string) => {
    textEditorRef?.current?.toggleInlineStyle(inlineStyle);
  };

  const applyInlineStyle = (inlineStyle: string, value: string) => {
    textEditorRef?.current?.applyInlineStyle(inlineStyle, value);
  };

  const removeInlineStyle = (inlineStyle: string) => {
    textEditorRef?.current?.removeInlineStyle(inlineStyle);
  };

  const toggleAlignment = (textAlign: string) => {
    textEditorRef?.current?.toggleAlignment(textAlign);
  };

  const toggleBlockType = (blockType: string) => {
    textEditorRef?.current?.toggleBlockType(blockType);
  };

  const cleareStyles = () => {
    textEditorRef?.current?.clearStyles();
  };

  const focusTextEditor = () => {
    // Hacky: Wait to focus the editor so we don't lose selection.
    setTimeout(() => {
      textEditorRef?.current?.setFocus();
    }, 50);
  };

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault();
  };

  const handleSelectMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleSelectClose = (event: ChangeEvent<{}>) => {
    const { currentTarget } = event;
    const {
      dataset: { value },
    } = currentTarget as HTMLElement;

    if (value === "left" || value === "center" || value === "right" || value === "justify") {
      toggleAlignment(value);
    } else if (value === BLOCK_STYLE_ORDERED_LIST || value === BLOCK_STYLE_UNORDERED_LIST) {
      toggleBlockType(value as string);
    } else {
      if (value) {
        applyInlineStyle(INLINE_STYLE_FONT_PREFIX, value);
      } else if (value === "") {
        removeInlineStyle(INLINE_STYLE_FONT_PREFIX);
      }
    }

    focusTextEditor();
  };

  const handleFontSize = (event: NumericSelectChangeEvent) => {
    const { value } = event.target;

    if (value) {
      applyInlineStyle(INLINE_STYLE_SIZE_PREFIX, value + "px");
    } else {
      removeInlineStyle(INLINE_STYLE_SIZE_PREFIX);
    }

    focusTextEditor();
  };

  const handleColorMouseDown = (event: MouseEvent) => {
    if (event.target instanceof HTMLInputElement) {
      event.stopPropagation();
      event.target.focus(); // Hacky: Wait to trigger the text editor blur event first
    }
  };

  const handleColorChange = (event: ColorPickerChangeEvent) => {
    const { name, value } = event.target;
    const { color } = value;
    const prefix = name === "color" ? INLINE_STYLE_COLOR_PREFIX : INLINE_STYLE_BG_COLOR_PREFIX;

    if (color) {
      applyInlineStyle(prefix, color);
    } else {
      removeInlineStyle(prefix);
    }

    focusTextEditor();
  };

  const handleInlineMouseDown = (event: MouseEvent) => {
    const { style } = (event.currentTarget as HTMLElement).dataset;

    if (style) {
      toggleInlineStyle(style);
    }
  };

  const handleClearBtn = () => {
    cleareStyles();
  };

  return (
    <Popper
      open={show}
      anchorEl={anchorEle}
      disablePortal={false}
      placement={"top-start"}
      modifiers={modifiers}
      className="text-toolbox-popper"
    >
      <div className={clsx("text-toolbox-wrapper", size)} onMouseDown={handleMouseDown}>
        <Select
          displayEmpty={!hasDefaultFont}
          value={hasFont ? currentStyle.fontFamily : ""}
          MenuProps={{
            disableRestoreFocus: true,
            autoFocus: false,
            className: "text-font-dropdown-menu",
          }}
          className="text-font-dropdown"
          onMouseDown={handleSelectMouseDown}
          onClose={handleSelectClose}
        >
          {!hasDefaultFont && <MenuItem value="">Select</MenuItem>}
          {fonts?.map((font) => (
            <MenuItem key={font.fontFamily} value={font.fontFamily}>
              {font.name}
            </MenuItem>
          ))}
        </Select>
        <div className="text-hr" />
        <div onMouseDown={handleSelectMouseDown}>
          <BlmNumericSelect
            name="size"
            value={currentStyle.fontSize}
            label="px"
            min={8}
            max={500}
            options={sizes}
            popupIcon={<DropdownImg2 />}
            className="text-size-dropdown"
            popupClassName="text-size-dropdown-menu"
            onChange={handleFontSize}
          />
        </div>
        <div className="text-hr" />
        <div className="text-color-wrapper" onMouseDown={handleColorMouseDown}>
          <BlmColorPicker
            name="color"
            color={currentStyle.color}
            colors={colors}
            className="text-color-picker"
            onChange={handleColorChange}
          />
          <BlmColorPicker
            name="bgColor"
            color={currentStyle.bgColor}
            colors={bgColors}
            className="text-bg-color-picker"
            onChange={handleColorChange}
          />
        </div>
        <div className="text-hr" />
        <div
          data-style={INLINE_STYLE_BOLD}
          className={clsx("text-bold-btn", {
            selected: currentStyle.bold,
          })}
          onMouseDown={handleInlineMouseDown}
        />
        <div
          data-style={INLINE_STYLE_ITALIC}
          className={clsx("text-italic-btn", {
            selected: currentStyle.italic,
          })}
          onMouseDown={handleInlineMouseDown}
        />
        <div
          data-style={INLINE_STYLE_UNDERLINE}
          className={clsx("text-underline-btn", {
            selected: currentStyle.underline,
          })}
          onMouseDown={handleInlineMouseDown}
        />
        <div className="text-hr" />
        <Select
          value={currentStyle.align}
          MenuProps={{
            disableRestoreFocus: true,
            autoFocus: false,
            className: "text-align-dropdown-menu",
          }}
          className="text-align-dropdown"
          onMouseDown={handleSelectMouseDown}
          onClose={handleSelectClose}
        >
          <MenuItem value={BLOCK_STYLE_LEFT_ALIGN}>
            <ListItemIcon>
              <LeftAlignIcon />
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={BLOCK_STYLE_CENTER_ALIGN}>
            <ListItemIcon>
              <CenterAlignIcon />
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={BLOCK_STYLE_RIGHT_ALIGN}>
            <ListItemIcon>
              <RightAlignIcon />
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={BLOCK_STYLE_JUSTIFY_ALIGN}>
            <ListItemIcon>
              <JustifyAlignIcon />
            </ListItemIcon>
          </MenuItem>
        </Select>
        <Select
          value={currentStyle.list}
          MenuProps={{
            disableRestoreFocus: true,
            autoFocus: false,
            className: "text-list-dropdown-menu",
          }}
          className="text-list-dropdown"
          onMouseDown={handleSelectMouseDown}
          onClose={handleSelectClose}
        >
          <MenuItem value={BLOCK_STYLE_ORDERED_LIST}>
            <ListItemIcon>
              <NumListIcon />
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={BLOCK_STYLE_UNORDERED_LIST}>
            <ListItemIcon>
              <BulletListIcon />
            </ListItemIcon>
          </MenuItem>
        </Select>
        <div className="text-hr" />
        <div className="text-link-btn" />
        <div className="text-erase-btn" onClick={handleClearBtn} />
      </div>
    </Popper>
  );
}

export default BlmTextToolbox;
