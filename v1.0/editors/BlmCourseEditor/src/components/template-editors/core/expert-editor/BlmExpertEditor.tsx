import React, { Fragment, MouseEvent, useRef } from "react";
import { Popper, Backdrop } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ContainerProps } from "./expert-editor-container";
import "./styles.scss";
import { CourseElementTemplate, TemplateEditorComponent, CourseElement, TemplatePanelOptions } from "types";
import { createModifiersForIFrame } from "components/template-editors/utils";
import { BlmTemplateExpert } from "components/template-editors/containers";
import { PanelCloseReasons } from "editor-constants";

export interface CompProps extends ContainerProps {
    open: boolean;
    anchorEle: HTMLElement;
    element: CourseElement;
    template: CourseElementTemplate;
    onSave: (template: CourseElementTemplate) => void;
    onClose: (event: MouseEvent, reason: PanelCloseReasons) => void;
    templateEle: any;
    onPreview: (template: CourseElementTemplate) => void;
    onMore: (options: TemplatePanelOptions) => void;
}

const modifiers = createModifiersForIFrame(-18, 1);

const popperOptions = {
    eventsEnabled: true,
};

function BlmExpertEditor(props: CompProps) {
    const { open, anchorEle, template, element, onSave, onClose, templateEle, onPreview, onMore, openConfirmDialog, } = props;

    const editorRef = useRef<TemplateEditorComponent | null>(null);
    const { t } = useTranslation();

    const handleSave = (event: MouseEvent) => {
        const editor = editorRef.current;

        if (editor) {
            editor.saveOnClose(event);
        }
    };

    const handleCancel = (event: MouseEvent) => {
        const editor = editorRef.current;

        if (editor) {
            editor.revert();
        }

        handleClose(event, PanelCloseReasons.Cancel);
    };

    const openSaveConfirmDialog = () => {
        const options = {
            className: "template-editor-warning-dialog",
            okLabel: `${t("button.save")}`,
            cancelLabel: `${t("button.cancel")}`,
        };

        openConfirmDialog(
            `${t("alert.cancel_confirm")}`,
            `${t("alert.save_changes")}`,
            handleSave,
            handleCancel,
            options
        );
    };

    const handleBackdropClick = (event: MouseEvent) => {
        const editor = editorRef.current;

        if (editor && editor.isEdited) {
            openSaveConfirmDialog();
        } else {
            handleClose(event);
        }
    };

    const handleClose = (event: MouseEvent, reason = PanelCloseReasons.Close) => {
        if (onClose) {
            onClose(event, reason);
        }
    };

    return (
        <Fragment>
            <Popper
                id="variant-popper"
                open={open}
                anchorEl={open ? anchorEle : null}
                placement="bottom-start"
                popperOptions={popperOptions}
                modifiers={modifiers}
                className="template-expert-editor"
            >
                <BlmTemplateExpert
                    ref={editorRef}
                    element={element}
                    template={template}
                    onSave={onSave}
                    onClose={onClose}
                    templateEle={templateEle}
                    onPreview={onPreview}
                    onMore={onMore}
                />

            </Popper>
            <Backdrop
                open={open}
                className="template-action-editor-backdrop"
                onClick={handleBackdropClick}
            />
        </Fragment>
    )
}
export default BlmExpertEditor;