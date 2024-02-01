import React, {
  ChangeEvent,
  forwardRef,
  Fragment,
  MouseEvent,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import clsx from "clsx";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CourseElement,
  CourseElementTemplate,
  CustomChangeEvent,
  ContentTemplateAction,
  TemplateEditorComponent,
  TemplateSimpleContentAction,
  MediaFile,
} from "types";
import { differenceOfObjects } from "utils";
import { getTemplateActionModel, getTemplateActionMedias } from "template-builders";
import {
  BlmActionDashboard,
  BlmBackgroundAction,
  BlmSoundAction,
  BlmSimpleContentAction,
} from "../../controls";
import { changeKeyMap, createTemplate, createTemplateView } from "./utils";
import { ContainerProps } from "./container";
import "./styles.scss";
import BlmBackgroundSoundAction from "components/template-editors/controls/actions/background-sound";

export interface CompProps extends ContainerProps {
  element: CourseElement;
  template: CourseElementTemplate;
  onSave?: (template: CourseElementTemplate) => void;
  onClose?: (event: MouseEvent) => void;
}

interface EditorState {
  data?: ContentTemplateAction;
  oldMedias: MediaFile[];
  isEdited: boolean;
}

const initState: EditorState = {
  oldMedias: [],
  isEdited: false,
};

const BlmTemplateAction = forwardRef<TemplateEditorComponent, CompProps>((props, ref) => {
  const { element, template, onSave, onClose, removeFiles, clearFiles } = props;
  const [editor, setEditor] = useState<EditorState>(initState);
  const { data, oldMedias, isEdited } = editor;
  const { load, complete } = data || {};
  const { t } = useTranslation("template-editors");

  const view = useMemo(() => createTemplateView(element), [element]);

  useEffect(() => {
    const data = getTemplateActionModel(template, view);
    const oldMedias = getTemplateActionMedias(data);
    setEditor({ data, oldMedias, isEdited: false });
  }, [template, view]);

  useImperativeHandle(ref, () => ({
    isEdited,
    saveOnClose: handleSaveOnClose,
    revert: revertChanges,
  }));

  const saveChanges = () => {
    if (data && isEdited) {
      const newTemplate = createTemplate(template, data, view);
      const newMedias = getTemplateActionMedias(data);
      const deletedMedias = differenceOfObjects(oldMedias, newMedias, "id");

      if (onSave) {
        onSave(newTemplate);
      }

      removeFiles(deletedMedias);
    }
  };

  const revertChanges = () => {
    clearFiles(template.id, false);
  };

  const handleChange = (
    event: ChangeEvent<any> | CustomChangeEvent<TemplateSimpleContentAction>
  ) => {
    if (data) {
      const target = event.target;
      const name = target.name as string;
      const value = target.type === "checkbox" ? target.checked : target.value;
      const newData = { ...data };

      if (changeKeyMap.hasOwnProperty(name)) {
        const map = changeKeyMap[name];
        const { obj1, obj2, key } = map;
        const action = newData[obj1];

        newData[obj1] = { ...action, [obj2]: key ? { ...action[obj2], [key]: value } : value };

        setEditor({ ...editor, data: newData, isEdited: true });
      }
    }
  };

  const handleSaveOnClose = (event: MouseEvent) => {
    saveChanges();
    clearFiles(template.id, true);

    if (onClose) {
      onClose(event);
    }
  };

  if (load && complete) {
    return (
      <div className={clsx("template-action-panel", element.type, { prime: true })}>
        <div className="template-action-anchor" />
        <div className="template-action-content">
          <div className="load-action-wrapper">
            <div className="load-action-lbl">{t("template_action.on_load")}</div>
            <Fragment>
              {view.load.navigation && (
                <BlmActionDashboard
                  type={view.dashboardType}
                  label={t("template_action.label.navigation")}
                  name="loadAlways"
                  checked={load.navigation.always}
                  className="load-navigation-accordion"
                  onChange={handleChange}
                >
                  <FormControlLabel
                    name="loadNext"
                    label={t("template_action.label.hide_button_next")}
                    control={<Checkbox />}
                    checked={load.navigation.next}
                    className="load-next-frm-ctrl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="loadPrevious"
                    label={t("template_action.label.hide_button_previous")}
                    control={<Checkbox />}
                    checked={load.navigation.previous}
                    className="load-previous-frm-ctrl"
                    onChange={handleChange}
                  />
                  {view.load.navigation.home && (
                    <FormControlLabel
                      name="loadHome"
                      label={t("template_action.label.hide_button_home")}
                      control={<Checkbox />}
                      checked={load.navigation.home}
                      className="load-home-frm-ctrl"
                      onChange={handleChange}
                    />
                  )}
                </BlmActionDashboard>
              )}
              {view.load.simpleContent && (
                <BlmActionDashboard
                  type={view.dashboardType}
                  label={t("template_action.label.simple_content")}
                  name="loadSCAlways"
                  checked={load.simpleContent.always}
                  className="load-simple-content-accordion"
                  onChange={handleChange}
                >
                  <BlmSimpleContentAction
                    name="loadSC"
                    element={element}
                    data={load.simpleContent}
                    onChange={handleChange}
                  />
                </BlmActionDashboard>
              )}
              {view.load.background && (
                <BlmActionDashboard
                  type={view.dashboardType}
                  label={t("template_action.label.background")}
                  name="loadBGAlways"
                  checked={load.background.always}
                  className="load-background-accordion"
                  onChange={handleChange}
                >
                  <BlmBackgroundAction
                    name="loadBG"
                    element={element}
                    data={load.background}
                    onChange={handleChange}
                  />
                </BlmActionDashboard>
              )}
            </Fragment>
            <BlmActionDashboard
              type={view.dashboardType}
              label={
                element.root?.type !== "structure"
                  ? t("template_action.label.sound")
                  : t("template_action.label.sound") +
                    " (" +
                    t("template_action.label.voice_over") +
                    ")"
              }
              name="loadSoundAlways"
              checked={load.sound.always}
              className="load-sound-accordion"
              onChange={handleChange}
            >
              <BlmSoundAction
                name="loadSound"
                element={element}
                data={load.sound}
                onChange={handleChange}
              />
            </BlmActionDashboard>
            {view.load.backgroundSound && (
              <BlmActionDashboard
                type={view.dashboardType}
                label={
                  element.root?.type !== "structure"
                    ? t("template_action.label.sound")
                    : t("template_action.label.sound") +
                      " (" +
                      t("template_action.label.background") +
                      ")"
                }
                name="loadBackgroundSoundAlways"
                checked={load.backgroundSound.always}
                className="load-sound-accordion"
                onChange={handleChange}
              >
                <BlmBackgroundSoundAction
                  name="loadBackgroundSound"
                  element={element}
                  data={load.backgroundSound}
                  onChange={handleChange}
                />
              </BlmActionDashboard>
            )}
          </div>
          {view.complete && (
            <div className="complete-action-wrapper">
              <div className="complete-action-lbl">{t("template_action.on_completed")}</div>
              {view.complete.navigation && (
                <BlmActionDashboard
                  label={t("template_action.label.navigation")}
                  disabled={load.navigation.always}
                  className="complete-navigation-accordion"
                >
                  <FormControlLabel
                    name="completeNext"
                    label={t("template_action.label.keep_button")}
                    control={<Checkbox />}
                    checked={complete.navigation.next}
                    className="complete-next-frm-ctrl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="completePrevious"
                    label={t("template_action.label.show_button")}
                    control={<Checkbox />}
                    checked={complete.navigation.previous}
                    className="complete-previous-frm-ctrl"
                    onChange={handleChange}
                  />
                  <FormControlLabel
                    name="completeHome"
                    label={t("template_action.label.show_button_home")}
                    control={<Checkbox />}
                    checked={complete.navigation.home}
                    className="complete-home-frm-ctrl"
                    onChange={handleChange}
                  />
                </BlmActionDashboard>
              )}
              <BlmActionDashboard
                label={t("template_action.label.simple_content")}
                className="complete-simple-content-accordion"
              >
                <BlmSimpleContentAction
                  name="completeSC"
                  element={element}
                  data={complete.simpleContent}
                  onChange={handleChange}
                />
              </BlmActionDashboard>
              <BlmActionDashboard
                label={t("template_action.label.background")}
                className="complete-background-accordion"
              >
                <BlmBackgroundAction
                  name="completeBG"
                  element={element}
                  data={complete.background}
                  onChange={handleChange}
                />
              </BlmActionDashboard>
              <BlmActionDashboard
                label={t("template_action.label.sound")}
                className="complete-sound-accordion"
              >
                <BlmSoundAction
                  name="completeSound"
                  element={element}
                  data={complete.sound}
                  onChange={handleChange}
                />
              </BlmActionDashboard>
            </div>
          )}
          <div className="template-action-close-btn" onClick={handleSaveOnClose} />
        </div>
      </div>
    );
  } else {
    return null;
  }
});

export default BlmTemplateAction;
