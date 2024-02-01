import React, {
  ChangeEvent,
  forwardRef,
  MouseEvent,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import clsx from "clsx";
import { Checkbox, FormControlLabel, MenuItem, MenuList } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { CourseElementTemplate, TemplateEditorComponent, TemplateScroll } from "types";
import { ScrollTransitionTypes } from "editor-constants";
import { filterFalsy, toggleAttributeInString, toJSONString } from "utils";
import "./styles.scss";

export interface CompProps {
  template: CourseElementTemplate;
  onSave?: (template: CourseElementTemplate) => void;
  onClose?: (event: MouseEvent) => void;
}

export interface EditorState {
  data?: TemplateScroll;
  isEdited: boolean;
}

const initEditor: EditorState = { isEdited: false };

const createTemplate = (template: CourseElementTemplate, scroll: TemplateScroll) => {
  const newTemplate = { ...template };
  const { type = ScrollTransitionTypes.Basic, effect, parallaxe } = scroll;
  const options = {
    parallaxecomponents: type !== ScrollTransitionTypes.Zoom ? parallaxe : undefined,
    fixedtransitioneffects: type === ScrollTransitionTypes.Fixed ? effect : undefined,
  };
  const attrs = {
    "blm-scroll-transition": type,
    "blm-scroll-option": filterFalsy(Object.values(options)).length
      ? toJSONString(options)
      : undefined,
  };

  newTemplate.scroll = scroll;
  newTemplate.html = toggleAttributeInString(newTemplate.html, attrs, ".outercontainer");

  return newTemplate;
};

const BlmTemplateScroll = forwardRef<TemplateEditorComponent, CompProps>((props, ref) => {
  const { template, onSave, onClose } = props;
  const [editor, setEditor] = useState(initEditor);
  const { data, isEdited } = editor;
  const { t } = useTranslation("template-editors");

  useEffect(() => {
    if (template) {
      const newData = {
        ...template.scroll,
        type: template.scroll.type || ScrollTransitionTypes.Basic,
      };

      setEditor({ data: newData, isEdited: !template.scroll.type });
    }
  }, [template]);

  useImperativeHandle(ref, () => ({
    isEdited,
    saveOnClose: handleSaveOnClose,
    revert: () => {},
  }));

  const saveChanges = () => {
    if (isEdited && data) {
      const newTemplate = createTemplate(template, data);

      if (onSave) {
        onSave(newTemplate);
      }
    }
  };

  const updateChange = (newData: TemplateScroll) => {
    setEditor({ data: newData, isEdited: true });
  };

  const handleItemClick = (event: MouseEvent<HTMLElement>) => {
    const {
      dataset: { value },
    } = event.currentTarget;

    if (data && value) {
      updateChange({ ...data, type: value as ScrollTransitionTypes });
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;

    if (data && (name === "effect" || "parallax")) {
      updateChange({ ...data, [name]: value });
    }
  };

  const handleSaveOnClose = (event: MouseEvent) => {
    saveChanges();

    if (onClose) {
      onClose(event);
    }
  };

  return (
    <div className="template-scroll-panel">
      <div className="template-scroll-anchor" />
      <div className="template-scroll-content">
        <div className="template-scroll-close-btn" onClick={handleSaveOnClose} />
        <MenuList className="template-scroll-list">
          <MenuItem
            data-value={ScrollTransitionTypes.Basic}
            selected={data?.type === ScrollTransitionTypes.Basic}
            className="basic"
            onClick={handleItemClick}
          >
            {t("transition.basic")}
          </MenuItem>
          <MenuItem
            data-value={ScrollTransitionTypes.Fixed}
            selected={data?.type === ScrollTransitionTypes.Fixed}
            className="fixed"
            onClick={handleItemClick}
          >
            {t("transition.fixed")}
          </MenuItem>
          <MenuItem
            data-value={ScrollTransitionTypes.Parallax}
            selected={data?.type === ScrollTransitionTypes.Parallax}
            className="parallax"
            onClick={handleItemClick}
          >
            {t("transition.parallax")}
          </MenuItem>
          <MenuItem
            data-value={ScrollTransitionTypes.Zoom}
            selected={data?.type === ScrollTransitionTypes.Zoom}
            className="zoom"
            onClick={handleItemClick}
          >
            {t("transition.zoom")}
          </MenuItem>
        </MenuList>
        <div className={clsx("template-scroll-ctrls", data?.type)}>
          <div className="template-scroll-preview" />
          {data?.type === ScrollTransitionTypes.Fixed && (
            <FormControlLabel
              name="effect"
              label={t("transition.label.shadow")}
              control={<Checkbox />}
              checked={data?.effect ?? false}
              className="template-scroll-effect-frm-ctrl"
              onChange={handleChange}
            />
          )}
          {data?.type !== ScrollTransitionTypes.Zoom && (
            <FormControlLabel
              name="parallaxe"
              label={t("transition.label.comp_parallaxe")}
              control={<Checkbox />}
              checked={data?.parallaxe ?? false}
              className="template-scroll-parallaxe-frm-ctrl"
              onChange={handleChange}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default BlmTemplateScroll;
