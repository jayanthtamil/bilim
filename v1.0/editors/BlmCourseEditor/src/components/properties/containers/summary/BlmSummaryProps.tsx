import React from "react";
import { useTranslation } from "react-i18next";

import { ElementPropsContainer } from "types";
import { Tabs } from "shared/material-ui";
import { BlmSummaryGeneralProps } from "../../controls";
import { withBlmPropertiesBoard } from "../../hoc";

export interface CompProps extends ElementPropsContainer {}

function BlmSummaryProps(props: CompProps) {
  const { element, data, onChange, onSave } = props;
  const { t } = useTranslation("properties");

  if (element && data) {
    return (
      <Tabs key={data.id} className="summary-props-tabs" onTabChange={onSave}>
        {[
          <BlmSummaryGeneralProps
            key="1"
            label={t("tabs.general")}
            data={data}
            onChange={onChange}
          />,
        ]}
      </Tabs>
    );
  }

  return null;
}

export default withBlmPropertiesBoard(BlmSummaryProps);
