import React, { ComponentProps, ForwardRefRenderFunction, forwardRef } from "react";
import clsx from "clsx";
import { MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { MediaTrackCue } from "types";
import { MediaCueActions, MediaPlayerTypes } from "editor-constants";
import { formatShortTime } from "utils";
import { useMediaEditorContext } from "../../context";
import "./styles.scss";

export interface CompProps extends ComponentProps<typeof MenuItem> {
  data: MediaTrackCue;
  "data-value"?: MediaCueActions;
}

const BlmSynchroActionItem: ForwardRefRenderFunction<HTMLLIElement, CompProps> = (props, ref) => {
  const { data, "data-value": val, value, className, ...others } = props;
  const { startTime, endTime } = data;
  const { playerType } = useMediaEditorContext();
  const duration = isNaN(endTime) ? 2 : endTime - startTime;
  const curValue = val ?? value;
  const { t } = useTranslation("shared");

  const renderContentLbl = () => {
    if (curValue !== MediaCueActions.ScrollVPauseC) {
      return undefined;
    }

    if (playerType === MediaPlayerTypes.Lottie) {
      return duration.toFixed(3);
    } else {
      return formatShortTime(duration);
    }
  };

  return (
    <MenuItem
      ref={ref}
      className={clsx("synchro-action-item-wrapper", className, val, value)}
      {...others}
    >
      <div className="action-item-content">
        <div className="action-item-video-lbl">{t("synchro_action_item.video")}</div>
        <div className="action-item-video-icon" />
        <div className="action-item-divider" />
        <div className="action-item-content-lbl">
          <span>{t("synchro_action_item.content")}</span>
          {renderContentLbl()}
        </div>
        <div className="action-item-content-icon" />
      </div>
    </MenuItem>
  );
};

export default forwardRef(BlmSynchroActionItem);
