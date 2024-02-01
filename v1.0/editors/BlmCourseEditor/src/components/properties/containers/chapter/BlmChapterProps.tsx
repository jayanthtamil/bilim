import React from "react";
import { useTranslation } from "react-i18next";

import { ElementPropsContainer } from "types";
import { hasChapterEvaluation } from "utils";
import { Tabs } from "shared/material-ui";
import {
  BlmGeneralProps,
  BlmChapterEvaluationProps,
  BlmLogProps,
  BlmCompletionPrerequisiteProps,
} from "../../controls";
import { withBlmPropertiesBoard } from "../../hoc";
import { ContainerProps } from "./chapter-container";

export interface CompProps extends ContainerProps, ElementPropsContainer {}

function BlmChapterProps(props: CompProps) {
  const { element, data, tabIndex, onChange, onSave } = props;
  const { t } = useTranslation();

  if (element && data && hasChapterEvaluation(data)) {
    return (
      <Tabs
        key={data.id}
        selectedIndex={element.isEvaluation ? 2 : tabIndex !== -1 ? tabIndex : 0}
        className="chapter-props-tabs"
        onTabChange={onSave}
      >
        <BlmGeneralProps
          label={t("tabs.general")}
          element={element}
          data={data}
          onChange={onChange}
        />
        <BlmCompletionPrerequisiteProps
          label={t("tabs.completion")}
          element={element}
          data={data}
          onChange={onChange}
        />
        <BlmChapterEvaluationProps
          label={t("tabs.evaluation")}
          element={element}
          data={data}
          onChange={onChange}
        />
        <BlmLogProps label={t("tabs.log")} data={data} />
      </Tabs>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default withBlmPropertiesBoard(BlmChapterProps);
