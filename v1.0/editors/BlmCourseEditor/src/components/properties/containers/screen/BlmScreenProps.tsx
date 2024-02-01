import React, { MouseEvent, Ref } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { ElementPropsContainer, PropertiesEditorComponent } from "types";
import { ElementType } from "editor-constants";
import { Tabs } from "shared/material-ui";
import {
  BlmGeneralProps,
  BlmScreenBackgroundProps,
  BlmLogProps,
  BlmPropsBarDashboard,
  BlmCompletionPrerequisiteProps,
} from "../../controls";
import { withBlmPropertiesBoard } from "../../hoc";

export interface CompProps extends ElementPropsContainer {
  bgRef: Ref<PropertiesEditorComponent>;
  tabIndex: false | number;
  onTabChange: (value: number) => void;
  onClose: (event: MouseEvent) => void;
}

function BlmScreenProps(props: CompProps) {
  const { element, data, bgRef, tabIndex, onChange, onTabChange, onClose } = props;
  const isStructure = element.root?.type === ElementType.Structure;
  const isScreen = element.type === ElementType.Screen;
  const { t } = useTranslation("properties");

  if (element && data) {
    return (
      <Tabs
        key={data.id}
        selectedIndex={tabIndex}
        closableTab={true}
        className={clsx("element-properties-tabs", data.type, { structures: isStructure })}
        onTabChange={onTabChange}
      >
        <BlmPropsBarDashboard label={t("tabs.general")} className="general-props" onClose={onClose}>
          <BlmGeneralProps element={element} data={data} onChange={onChange} />
        </BlmPropsBarDashboard>
        {isStructure && isScreen && (
          <BlmPropsBarDashboard
            label={t("tabs.completion")}
            className="completion-prerequisite-props"
            onClose={onClose}
          >
            <BlmCompletionPrerequisiteProps element={element} data={data} onChange={onChange} />
          </BlmPropsBarDashboard>
        )}
        <BlmPropsBarDashboard
          label={t("tabs.background")}
          className="background-props"
          onClose={onClose}
        >
          <BlmScreenBackgroundProps ref={bgRef} element={element} />
        </BlmPropsBarDashboard>
        <BlmPropsBarDashboard label={t("tabs.log")} className="log-props" onClose={onClose}>
          <BlmLogProps data={data} />
        </BlmPropsBarDashboard>
      </Tabs>
    );
  } else {
    return null;
  }
}

export default withBlmPropertiesBoard(BlmScreenProps);
