import React from "react";
import { useTranslation } from "react-i18next";

import { ElementPropsContainer } from "types";
import { hasCustomEvaluation } from "utils";
import { Tabs } from "shared/material-ui";
import {
  BlmGeneralProps,
  // BlmCustomEvaluationProps,
  BlmFilesProps,
  BlmLogProps,
  BlmCompletionPrerequisiteProps,
} from "../../controls";
import { withBlmPropertiesBoard } from "../../hoc";

export interface CompProps extends ElementPropsContainer {}

function BlmCustomProps(props: CompProps) {
  const { element, data, onChange, onSave } = props;
  const { t } = useTranslation("properties");

  if (element && data && hasCustomEvaluation(data)) {
    return (
      <Tabs key={data.id} className="custom-props-tabs" onTabChange={onSave}>
        <BlmGeneralProps
          label={t("tabs.general")}
          element={element}
          data={data}
          onChange={onChange}
        />
        <BlmFilesProps label={t("tabs.files")} data={data} onChange={onChange} />
        <BlmCompletionPrerequisiteProps
          label={t("tabs.prerequisite")}
          type="prerequisite"
          element={element}
          data={data}
          onChange={onChange}
        />
        {/* <BlmCustomEvaluationProps label="Evaluation" data={data} onChange={onChange} /> */}
        <BlmLogProps label={t("tabs.log")} data={data} />
      </Tabs>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default withBlmPropertiesBoard(BlmCustomProps);
