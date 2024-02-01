import React, { ChangeEvent } from "react";
import { FormControlLabel, Switch } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CustomChangeEvent,
  MediaComponent,
  ComponentAction,
  MediaFlipCard,
  FlipCardSide,
  ContentTemplateAction,
} from "types";
import { getMediaFlipCard } from "utils";
import { useContentEditorCtx } from "components/content-editor/core";
import { updateMediaComponent } from "components/content-editor/reducers";
import BlmActions, { BlmSwitchActions } from "../../actions";
import { BlmStyleApplyButton } from "../../styles";
import BlmMediaDashboard from "../dashboard";
import BlmFlipCardSide from "./side";
import "./styles.scss";

export interface CompProps {
  label: string;
  data: MediaComponent;
  temp?: ContentTemplateAction | undefined;
}

function BlmMediaFlipCard(props: CompProps) {
  const { t } = useTranslation("content-editor");
  const { data, temp } = props;
  const state = getMediaFlipCard(data);
  const { dispatch } = useContentEditorCtx();
  const { value: flipcard } = state;
  const { recto, verso, flipAction, clickAction, overAction } = flipcard;

  const updateChange = (newFlipcard: MediaFlipCard) => {
    const newData = {
      ...state,
      value: newFlipcard,
    };

    if (dispatch) {
      dispatch(updateMediaComponent(newData));
    }
  };

  const handleChange = (
    event: ChangeEvent<any> | CustomChangeEvent<FlipCardSide | ComponentAction>
  ) => {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const newFlipcard = { ...flipcard };

    if (
      name === "recto" ||
      name === "verso" ||
      name === "flipAction" ||
      name === "clickAction" ||
      name === "overAction"
    ) {
      newFlipcard[name] = value;
    }

    if (newFlipcard.recto.media === undefined) {
      newFlipcard.recto.style.bgTint = undefined;
      newFlipcard.recto.style.tint = undefined;
    }
    if (newFlipcard.verso.media === undefined) {
      newFlipcard.verso.style.bgTint = undefined;
      newFlipcard.verso.style.tint = undefined;
    }

    updateChange(newFlipcard);
  };

  const handleSwitchClick = () => {
    const newFlipcard = { ...flipcard };

    newFlipcard.clickAction = flipcard.overAction;
    newFlipcard.overAction = flipcard.clickAction;

    updateChange(newFlipcard);
  };

  return (
    <BlmMediaDashboard data={state}>
      <div className="content-media-flipcard-wrapper">
        <div className="flipcard-params-wrapper">
          <div className="flipcard-params-title">{t("title.parameters")}</div>
          <BlmFlipCardSide name="recto" data={recto} onChange={handleChange} />
          <BlmFlipCardSide name="verso" type="verso" data={verso} onChange={handleChange} />
          <BlmStyleApplyButton label={t("flipkart.apply_flipkart")} />
        </div>
        <div className="flipcard-actions-wrapper">
          <div className="flipcard-actions-title">{t("label.action")}</div>
          <div className="flipcard-actions-flip-lbl">
            {t("flipkart.return_card")}:{" "}
            <span className="flipcard-actions-bold-lbl">{t("flipkart.on_click")}</span>
            <FormControlLabel
              name="flipAction"
              label={t("flipkart.on_roll_over")}
              checked={flipAction}
              control={<Switch className="switch-2" />}
              className="flipcard-actions-flip-switch-ctrl"
              onChange={handleChange}
            />
          </div>
          <div className="flipcard-actions-lbl">
            {t("label.on")} <span className="flipcard-actions-bold-lbl">{t("label.click")}</span>
          </div>
          <div className="flipcard-actions-lbl">
            {t("label.on")}{" "}
            <span className="flipcard-actions-bold-lbl">{t("label.roll_over")}</span>
          </div>
          <BlmActions name="clickAction" data={clickAction} temp={temp} onChange={handleChange} />
          <BlmSwitchActions
            left={clickAction}
            right={overAction}
            rightType="over"
            onClick={handleSwitchClick}
          />
          <BlmActions name="overAction" data={overAction} type="over" onChange={handleChange} />
        </div>
      </div>
    </BlmMediaDashboard>
  );
}

export default BlmMediaFlipCard;
