import React, { MouseEvent } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { ElementPropsContainer } from "types";
import { ElementType } from "editor-constants";
import { hasPageEvaluation } from "utils";
import { Tabs } from "shared/material-ui";
import {
  BlmGeneralProps,
  BlmPageBackgroundProps,
  BlmPageEvaluationProps,
  BlmLogProps,
  BlmPropsBarDashboard,
  BlmCompletionPrerequisiteProps,
} from "../../controls";
import { withBlmPropertiesBoard } from "../../hoc";

export interface CompProps extends ElementPropsContainer {
  tabIndex: false | number;
  onTabChange: (value: number) => void;
  onClose: (event: MouseEvent) => void;
}

function BlmPageProps(props: CompProps) {
  const { element, data, tabIndex, onChange, onTabChange, onClose } = props;
  const isStructure = element.root?.type === ElementType.Structure;
  const isPage = element.type === ElementType.Page;
  const { t } = useTranslation("properties");

  if (element && data && hasPageEvaluation(data)) {
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
        {isStructure && isPage && (
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
          <BlmPageBackgroundProps data={data} onChange={onChange} />
        </BlmPropsBarDashboard>
        {isPage && (
          <BlmPropsBarDashboard
            label={t("tabs.evaluation")}
            className="evaluation-props"
            onClose={onClose}
          >
            <BlmPageEvaluationProps element={element} data={data} onChange={onChange} />
          </BlmPropsBarDashboard>
        )}
        <BlmPropsBarDashboard label={t("tabs.log")} className="log-props" onClose={onClose}>
          <BlmLogProps data={data} />
        </BlmPropsBarDashboard>
      </Tabs>
    );
  } else {
    return null;
  }
}

export default withBlmPropertiesBoard(BlmPageProps);
