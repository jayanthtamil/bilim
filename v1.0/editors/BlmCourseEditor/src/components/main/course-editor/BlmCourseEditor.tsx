import React, { useEffect, MouseEvent, useCallback } from "react";
import IdleTimer from "react-idle-timer";
import { Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import BlmStructurePanel from "components/structures/panel";
import BlmHeader from "../header";
import BlmLoaders from "../loaders";
import BlmDialogs from "../dialogs";
import BlmEditorBoard from "../editor-board";
import { ContainerProps } from "./course-editor-container";
import "./course-editor.scss";

interface CompProps extends ContainerProps {}

function BlmCourseEditor(props: CompProps) {
  const {
    isAuthorized,
    isInteractable,
    getUserAuthorization,
    initializeCourseProperties,
    openDialog,
  } = props;
  const timeout = 1000 * 60 * 30;
  const { t } = useTranslation();

  const initEditor = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let courseId = urlParams.get("courseId");

    if (courseId && courseId.length !== 0) {
      initializeCourseProperties(courseId);
    } else {
      openDialog(`${t("alert.warning")}!`, `${t("alert.course_not_found")}`);
    }
  }, [initializeCourseProperties, openDialog, t]);

  useEffect(() => {
    if (isAuthorized === undefined) {
      getUserAuthorization();
    } else if (isAuthorized) {
      initEditor();
    }
  }, [isAuthorized, getUserAuthorization, initEditor]);

  const handleIdle = (event: Event) => {
    showSessionExpiredDialog();
  };

  const showSessionExpiredDialog = () => {
    openDialog(`${t("alert.session_expired")}`, `${t("alert.session_info")}`, handleSessionExpired);
  };
  const handleSessionExpired = (event: MouseEvent) => {
    if (process.env.REACT_APP_LOGOUT_URL) {
      window.location.href = process.env.REACT_APP_LOGOUT_URL;
    } else {
      window.location.href = "";
    }
  };

  return (
    <IdleTimer onIdle={handleIdle} timeout={timeout} stopOnIdle={true}>
      <BlmLoaders />
      <section className="editor-section">
        <BlmHeader />
        <BlmEditorBoard />
        <BlmStructurePanel />
      </section>
      <BlmDialogs />
      <Backdrop open={!isInteractable} className="editor-backdrop" />
    </IdleTimer>
  );
}

export default BlmCourseEditor;
