import React, { memo, ChangeEvent, MouseEvent } from "react";
import clsx from "clsx";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { FormControlLabel, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  QuestionPropositionInfo,
  QuestionProposition,
  QuestionPropositions,
  BaseComponent,
} from "types";
import { reorderArray, createUUID } from "utils";
import { BlmToggleButton, ToggleButtonChangeEvent } from "shared";
import {
  QuestionEditorDispatch,
  updateQuestionPropositions,
  addQuestionProposition,
} from "components/question-editor/reducers";
import BlmQuestionProposition from "../proposition";
import "./styles.scss";

export interface CompProps {
  data: QuestionPropositions;
  isEditable?: boolean;
  hasFBProbisitions?: boolean;
  dispatch: QuestionEditorDispatch;
}

function BlmQuestionPropositions(props: CompProps) {
  const { data, isEditable = true, hasFBProbisitions, dispatch } = props;
  const { isMCQ, restrictTypeToSingle, randomize, minimum, maximum, items } = data;
  const showFeedback = !isMCQ && hasFBProbisitions;
  const isAddable = items.length < maximum;
  const isDeletable = items.length > minimum;
  const { t } = useTranslation("question-editor");

  const updateChange = (newData: QuestionPropositions) => {
    if (dispatch) {
      dispatch(updateQuestionPropositions(newData));
    }
  };

  const handleChange = (event: ChangeEvent<any> | ToggleButtonChangeEvent) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newData = { ...data };

    if (name === "mcq") {
      newData.isMCQ = value;
    } else if (name === "randomize") {
      newData.randomize = value;
    }

    updateChange(newData);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newData: QuestionPropositions = {
      ...data,
      items: reorderArray(items, result.source.index, result.destination.index),
    };

    updateChange(newData);
  };

  const handleAddClick = (event: MouseEvent) => {
    if (isAddable) {
      const newProposition = new QuestionProposition();
      newProposition.id = createUUID();

      newProposition.title.value = "Answer " + (items.length + 1);
      newProposition.text.value = `${t("main.text_val")}`;

      const info = new QuestionPropositionInfo();
      info.simple.title.value = `${t("main.info_title")}`;
      info.simple.text.value = `${t("main.add_info+")}`;

      newProposition.info = new BaseComponent(info);

      newProposition.feedback.title.value = `${t("main.proposition_title")}`;
      newProposition.feedback.text.value = `${t("main.text_val")}`;

      if (dispatch) {
        dispatch(addQuestionProposition(newProposition));
      }
    }
  };

  return (
    <div className="main-propositions-wrapper">
      <div className="main-propositions-header">
        <span>{t("main.propositions")}</span>
        <span
          className={clsx("main-propositions-switch-lbl", {
            disabled: !isEditable,
          })}
        >
          {t("main.scq")}
        </span>
        <FormControlLabel
          name="mcq"
          label={t("main.mcq")}
          disabled={!isEditable || restrictTypeToSingle}
          checked={isMCQ}
          control={<Switch className="switch-1" />}
          className="main-propositions-switch-ctrl"
          onChange={handleChange}
        />
        <BlmToggleButton
          name="randomize"
          selected={randomize}
          disabled={!isEditable}
          className="main-propositions-randomize-btn"
          onChange={handleChange}
        />
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="main-proposition-list-wrapper"
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                  isDragDisabled={!isEditable}
                >
                  {(providedItem, snapshot) => (
                    <BlmQuestionProposition
                      ref={providedItem.innerRef}
                      key={item.id}
                      drag={providedItem.dragHandleProps}
                      data={item}
                      isDeletable={isEditable && isDeletable}
                      showFeedback={showFeedback}
                      dispatch={dispatch}
                      {...providedItem.draggableProps}
                      style={providedItem.draggableProps.style}
                      className={clsx({
                        dragging: snapshot.isDragging,
                      })}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="main-proposition-divider">
        <div
          className={clsx("main-add-proposition-btn", {
            disabled: !isEditable || !isAddable,
          })}
          onClick={handleAddClick}
        />
      </div>
    </div>
  );
}

export default memo(BlmQuestionPropositions);
