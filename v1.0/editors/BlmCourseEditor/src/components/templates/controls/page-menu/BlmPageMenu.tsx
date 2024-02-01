import React, { Fragment } from "react";
import { List, ListItem, Backdrop, Popper, Portal } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import { PageMenuTypes } from "editor-constants";
import { usePageMenuStyle } from "./styles";

export interface CompProps {
  anchorEl: Element | null;
  showSummary: boolean;
  onItemClick: (type: PageMenuTypes) => void;
  onClose: (event: {}) => void;
}

const popperOptions = {
  eventsEnabled: true,
};

function BlmPageMenu(props: CompProps) {
  const { anchorEl, showSummary, onItemClick, onClose } = props;
  const classes = usePageMenuStyle();
  const { t } = useTranslation("templates");

  const handleItemClick = (type: PageMenuTypes) => {
    if (onItemClick) {
      onItemClick(type);
    }
  };

  if (anchorEl) {
    return (
      <Fragment>
        <Portal container={anchorEl.ownerDocument.body}>
          <Backdrop open={true} className={classes.backdrop} onClick={onClose} />
        </Portal>
        <Popper
          id="addMenu"
          open={true}
          anchorEl={anchorEl}
          container={anchorEl.ownerDocument.body}
          placement="bottom"
          popperOptions={popperOptions}
          className={classes.pageMenu}
        >
          <List>
            <ListItem onClick={() => handleItemClick(PageMenuTypes.Content)}>
              {t("page_menu.content")}
            </ListItem>
            {showSummary ? (
              <ListItem onClick={() => handleItemClick(PageMenuTypes.Summary)}>
                {t("page_menu.summary")}
              </ListItem>
            ) : (
              <ListItem onClick={() => handleItemClick(PageMenuTypes.Question)}>
                {t("page_menu.question")}
              </ListItem>
            )}
          </List>
        </Popper>
      </Fragment>
    );
  } else {
    return null;
  }
}

export default BlmPageMenu;
