import React, {
  useEffect,
  ComponentType,
  useCallback,
  forwardRef,
  useImperativeHandle,
  RefAttributes,
  ForwardRefExoticComponent,
} from "react";
import { Diff } from "utility-types";
import useStateRef from "react-usestateref";

import {
  CourseElement,
  CourseElementProps,
  ElementPropsChangeHandler,
  ElementPropsContainer,
  MediaFile,
  PropertiesEditorComponent,
} from "types";
import { ElementType } from "editor-constants";
import { differenceOfObjects, textArea } from "utils";
import { usePrevious } from "hooks";
import { getPropertiesMedias } from "template-builders";
import connector, { ContainerProps } from "./properties-board-container";

interface InjectedProps extends ElementPropsContainer {}

interface CompProps {
  element: CourseElement;
  autoSave?: boolean;
  autoClear?: boolean;
  onChange?: ElementPropsChangeHandler;
}

interface EditorState {
  data?: CourseElementProps;
  oldMedias: MediaFile[];
  isEdited: boolean;
}

const initEditor: EditorState = {
  data: undefined,
  oldMedias: [],
  isEdited: false,
};

const withBlmPropertiesBoard = <P extends InjectedProps>(WrappedComponent: ComponentType<P>) => {
  const WithBlmPropertiesBoard = forwardRef<
    PropertiesEditorComponent,
    CompProps & ContainerProps & P
  >((props, ref) => {
    const {
      element,
      properties,
      autoSave = true,
      autoClear = true,
      getElementProperties,
      updateElementProperties,
      clearElementProperties,
      removeFiles,
      clearFiles,
      setElementProperties,
      onChange,
      ...wrappedProps
    } = props;
    const [editor, setEditor, editorRef] = useStateRef(initEditor);
    const { data, isEdited } = editor;
    const prevData = usePrevious(data);

    useImperativeHandle(ref, () => ({
      isEdited,
      save: saveChanges,
      revert: revertChanges,
    }));

    if (data?.description) {
      let newDescription = textArea(data.description, "<br>", "\n");
      data.description = newDescription;
    }

    const updateTree = useCallback(
      (newData?: CourseElementProps) => {
        if (editorRef.current) {
          const { data } = editorRef.current;

          if (
            data &&
            (data.type === ElementType.Chapter ||
              data.type === ElementType.Page ||
              data.type === ElementType.Custom) &&
            (!newData ||
              data.isEvaluation !== newData.isEvaluation ||
              data.hasFeedback !== newData.hasFeedback ||
              data.hasAssociateContent !== newData.hasAssociateContent)
          ) {
            setElementProperties(newData);
          }
        }
      },
      [editorRef, setElementProperties]
    );

    const saveChanges = useCallback(() => {
      if (editorRef.current) {
        const { data, oldMedias, isEdited } = editorRef.current;

        if (data?.description) {
          let newDescription = textArea(data.description, "\n", "<br>");
          data.description = newDescription;
        }

        if (data && isEdited) {
          const newMedias = getPropertiesMedias(data);
          const deletedMedias = differenceOfObjects(oldMedias, newMedias, "id");

          updateTree(data);
          updateElementProperties(data);
          removeFiles(deletedMedias);
          clearFiles(data.id, true);
          setEditor({ data, oldMedias: newMedias, isEdited: false });
        }
      }
    }, [editorRef, updateTree, updateElementProperties, removeFiles, clearFiles, setEditor]);

    const revertChanges = () => {
      updateTree(properties);
      setEditor({ ...editor, data: properties, isEdited: false });
      clearFiles(properties.id, false);
    };

    useEffect(() => {
      if (element && !properties) {
        getElementProperties(element);
      }
    }, [element, properties, getElementProperties]);

    useEffect(() => {
      if (autoSave && element.id) {
        return () => {
          saveChanges();
        };
      }
    }, [element.id, autoSave, saveChanges]);

    useEffect(() => {
      if (autoClear && element.id) {
        return () => {
          const id =
            element.type !== ElementType.Page && element.type !== ElementType.SimplePage
              ? element.id
              : undefined;
          clearElementProperties(id);
        };
      }
    }, [element.id, element.type, autoClear, clearElementProperties]);

    useEffect(() => {
      if (properties) {
        setEditor({
          data: properties,
          oldMedias: getPropertiesMedias(properties),
          isEdited: false,
        });
      }
    }, [properties, setEditor]);

    useEffect(() => {
      if (data && data !== prevData && onChange) {
        onChange(data);
      }
    }, [data, prevData, onChange]);

    const handleChange: ElementPropsChangeHandler = (newData, forceSave) => {
      updateTree(newData);
      setEditor({ ...editor, data: newData, isEdited: true });

      if (forceSave) {
        saveChanges();
      }
    };

    const handleSave = () => {
      saveChanges();
    };

    return (
      <WrappedComponent
        {...(wrappedProps as P)}
        element={element}
        data={data}
        onChange={handleChange}
        onSave={handleSave}
      />
    );
  });

  //https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
  return connector(WithBlmPropertiesBoard as any) as ForwardRefExoticComponent<
    CompProps & Diff<P, InjectedProps> & RefAttributes<PropertiesEditorComponent>
  >;
};

export default withBlmPropertiesBoard;
