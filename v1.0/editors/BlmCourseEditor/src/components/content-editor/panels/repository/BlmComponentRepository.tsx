import React, { MouseEvent } from "react";
import { AccordionProps } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { ContentTemplate } from "types";
import { ComponentTypes } from "editor-constants";
import {
  BlmComponentAccordion,
  BlmComponentList,
  BlmRepeaterList,
} from "components/content-editor/components";
import { useContentEditorCtx } from "components/content-editor/core";
import "./styles.scss";

export interface CompProps {
  data: ContentTemplate;
}

function BlmComponentRepository(props: CompProps) {
  const { data } = props;
  const { texts, medias, buttons, sounds, repeater } = data;
  const { component, selectComponent } = useContentEditorCtx();
  const { t } = useTranslation("content-editor");

  const handleAccordionChange: AccordionProps["onChange"] = (event, expanded) => {
    if (expanded && selectComponent) {
      selectComponent();
    }
  };

  const handleTextListClick = (event: MouseEvent) => {
    if (selectComponent) {
      selectComponent();
    }
  };

  return (
    <div className="component-repository-wrapper custom-scrollbar">
      {texts.length > 0 && (
        <BlmComponentAccordion
          label={t("label.text")}
          className={clsx("text-accordion", {
            selected: component === undefined,
          })}
          onChange={handleAccordionChange}
        >
          <BlmComponentList type={ComponentTypes.Text} data={texts} onClick={handleTextListClick} />
        </BlmComponentAccordion>
      )}
      {(medias.length || repeater.medias?.length) && (
        <BlmComponentAccordion label={t("label.media")} className="media-accordion">
          {medias.length > 0 && <BlmComponentList type={ComponentTypes.Media} data={medias} />}
          {repeater.medias?.map((item, ind) => (
            <BlmRepeaterList
              key={item.id}
              data={item}
              startIndex={ind === 0 ? medias.length : repeater.medias![ind - 1].value?.length || 0}
            />
          ))}
        </BlmComponentAccordion>
      )}
      {(buttons.length || repeater.buttons?.length) && (
        <BlmComponentAccordion label={t("label.button")} className="button-accordion">
          {buttons.length > 0 && <BlmComponentList type={ComponentTypes.Button} data={buttons} />}
          {repeater.buttons?.map((item) => (
            <BlmRepeaterList key={item.id} data={item} startIndex={0} />
          ))}
        </BlmComponentAccordion>
      )}
      {(sounds.length || repeater.sounds?.length) && (
        <BlmComponentAccordion label={t("label.sound")} className="sound-accordion">
          {sounds.length > 0 && <BlmComponentList type={ComponentTypes.Sound} data={sounds} />}
          {repeater.sounds?.map((item) => (
            <BlmRepeaterList key={item.id} data={item} startIndex={0} />
          ))}
        </BlmComponentAccordion>
      )}
    </div>
  );
}

export default BlmComponentRepository;
