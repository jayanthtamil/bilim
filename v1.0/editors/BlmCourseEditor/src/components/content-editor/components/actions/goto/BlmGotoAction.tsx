import React, { ChangeEvent, useMemo } from "react";
import { Select, MenuItem, Divider, ListItemIcon, ListItemText } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { GotoAction, CustomChangeEvent, CourseElement } from "types";
import { ElementType, GotoActionTypes } from "editor-constants";
import BlmStructureSelect from "components/structures/select";
import "./styles.scss";

export interface CompProps {
  data?: GotoAction;
  showNavigation?: boolean;
  showPage?: boolean;
  onChange?: (event: CustomChangeEvent<GotoAction>) => void;
}

const STRUCTURE_ITEMS: ElementType[] = [
  ElementType.Chapter,
  ElementType.Page,
  ElementType.Screen,
  ElementType.Question,
  ElementType.Custom,
];

function BlmGotoAction(props: CompProps) {
  const { data, showNavigation = true, showPage = true, onChange } = props;
  const { action, gotoId } = data || {};
  const { t } = useTranslation("content-editor");

  const items = useMemo(() => {
    const result = [
      "MOVE IN STRUCTURE",
      { label: t("go_to_opt.eval_chap_page_scr"), type: GotoActionTypes.PageScreen },
    ];

    if (showNavigation) {
      result.push(
        "divider",
        "NAVIGATION",
        { label: t("go_to_opt.previous"), type: GotoActionTypes.Previous },
        { label: t("go_to_opt.next"), type: GotoActionTypes.Next },
        { label: t("go_to_opt.home"), type: GotoActionTypes.Home }
      );
    }

    if (showPage) {
      result.push(
        "divider",
        "IN PAGE",
        { label: t("go_to_opt.previous_partpage"), type: GotoActionTypes.PreviousPartPage },
        { label: t("go_to_opt.next_partpage"), type: GotoActionTypes.NextPartPage },
        { label: t("go_to_opt.previous_anchor"), type: GotoActionTypes.PreviousAnchor },
        { label: t("go_to_opt.next_anchor"), type: GotoActionTypes.NextAnchor }
      );
    }

    return result;
  }, [showNavigation, showPage, t]);

  const updateChange = (newData: GotoAction) => {
    if (onChange) {
      onChange({ target: { name: "goto", value: newData } });
    }
  };

  const renderPlaceholder = () => {
    return <div>Select Action</div>;
  };

  const isAllowedItem = (item: CourseElement) => {
    return item.parent?.isEvaluation ? false : STRUCTURE_ITEMS.includes(item.type);
  };

  const handleChange = (event: ChangeEvent<any> | CustomChangeEvent<string>) => {
    const { name, value } = event.target;
    const newData = { action, gotoId };

    if (name === "action") {
      newData.action = value;
    } else if (name === "courseElement") {
      newData.gotoId = value;
    }

    updateChange(newData);
  };

  const renderItems = () => {
    if (items) {
      return items.map((item, ind) => {
        if (typeof item === "object") {
          const { type, label } = item;
          return (
            <MenuItem key={type} value={type}>
              <ListItemIcon className={type} />
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          );
        } else if (item === "divider") {
          return <Divider key={item + ind} />;
        } else {
          return (
            <div key={item} className="goto-dropdown-menu-title">
              {item}
            </div>
          );
        }
      });
    }
  };

  return (
    <div className="goto-action-wrapper">
      <Select
        name="action"
        value={action || ""}
        displayEmpty={true}
        MenuProps={{
          className: "goto-actions-dropdown-popover",
        }}
        className="goto-actions-dropdown"
        renderValue={action ? undefined : renderPlaceholder}
        onChange={handleChange}
      >
        {renderItems()}
      </Select>
      {action === GotoActionTypes.PageScreen && (
        <BlmStructureSelect
          name="courseElement"
          value={gotoId}
          placeholder={t("go_to_opt.select_structure")}
          structures={{ show: true, allowedItems: isAllowedItem }}
          selectables={STRUCTURE_ITEMS}
          className="structure-select-with-icons"
          onChange={handleChange}
        />
      )}
    </div>
  );
}

export default BlmGotoAction;
