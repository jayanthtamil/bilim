import React, { useState, MouseEvent } from "react";
import { Popover, List, ListItem, ListItemIcon, Divider, Popper } from "@material-ui/core";
import { useTranslation } from "react-i18next";

import {
  CourseElement,
  ContextMenu,
  UpdateElementConnectionPost,
  CourseElementTemplate,
} from "types";
import {
  ElementType,
  ContextMenuLabels,
  ContextMenuActions,
  TreeActionTypes,
} from "editor-constants";
import { ConnectionCtxItemIcon, MoveToOpenIcon, MoveToCloseIcon } from "assets/icons";
import { hasAutoSummary, getElementType } from "utils";
import {
  getContextMenuActions,
  hasContextMenuAction,
  getElementTypeByAction,
  getConnectionTypeByAction,
  createConnection,
  validateSummary,
  validateAutoSummary,
} from "./context-menu-utils";
import {
  setContentTemplateHTML,
  getContentTemplateModel,
  setTemplateSizeHTML,
} from "template-builders";
import BlmCopyFrom from "../copy-from";
import { ContainerProps } from "./context-menu-container";
import "./context-menu-styles.scss";

export interface CompProps extends ContainerProps {
  data?: ContextMenu;
  onItemClick?: (action: ContextMenuActions, element: CourseElement) => void;
  onClose?: () => void;
}

const popperOptions = {
  eventsEnabled: true,
};

function BlmContextMenu(props: CompProps) {
  const {
    data,
    courseProps,
    templates,
    tree,
    onItemClick,
    onClose,
    selectTreeItem,
    setTreeAction,
    createElement,
    deleteElement,
    duplicateElement,
    updateElementConnection,
    updateAutoSummary,
    updateElementSummary,
    resetElementTemplate,
    openDialog,
    openConfirmDialog,
    getElementTemplateVal,
    getElementTemplates,
    saveTemplates,
    subMenuPositionElement,
    updateElementTemplates,
  } = props;
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const { anchor, treeType } = data || {};
  const open = data ? true : false;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [anchorEle, setAnchorEle] = React.useState<HTMLElement | null>(null);
  const [actionVal, setActionVal] = React.useState<any>(undefined);
  const [copyFromOpen, setCopyFromOpen] = React.useState<any>(false);
  const [selectedElement, setSelectedElement] = React.useState<any>(undefined);

  const { t } = useTranslation("structures");

  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [data]);

  React.useEffect(() => {
    async function apiCall() {
      var element = data?.item;
      if (element) {
        var value: any = { id: await data?.item?.parent?.id };
        if (value.id && element.type === "partpage") {
          await getElementTemplates(value);
        }
      }
    }
    apiCall();
  }, [data, getElementTemplates]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleListItemClick = (
    event: MouseEvent<HTMLDivElement>,
    index: number,
    action: ContextMenuActions,
    element: CourseElement
  ) => {
    switch (action) {
      case ContextMenuActions.AddChapter:
      case ContextMenuActions.AddEvaluation:
      case ContextMenuActions.AddPage:
      case ContextMenuActions.AddScreen:
      case ContextMenuActions.AddQuestion:
      case ContextMenuActions.AddCustom:
      case ContextMenuActions.AddSimpleContent:
      case ContextMenuActions.AddSimplePage:
      case ContextMenuActions.AddAnnexesFolder:
        doAdd(action, element);
        break;
      case ContextMenuActions.EditPage:
      case ContextMenuActions.EditScreen:
      case ContextMenuActions.EditQuestion:
      case ContextMenuActions.EditSimpleContent:
      case ContextMenuActions.EditSimplePage:
      case ContextMenuActions.EditPartPage:
        doEdit(element);
        break;
      case ContextMenuActions.Rename:
        doRename(element);
        break;
      case ContextMenuActions.Properties:
        let htmlNode = data?.anchor.parentNode as HTMLElement;
        if (element && htmlNode) {
          selectTreeItem(element, htmlNode);
        }
        break;
      case ContextMenuActions.ResetTemplate:
        doResetTemplate(element);
        break;
      case ContextMenuActions.ResetMargin:
        doReset(element);
        break;
      case ContextMenuActions.Duplicate:
        doDuplicate(element);
        break;
      case ContextMenuActions.Delete:
        doDelete(element);
        break;
      case ContextMenuActions.ActivateSummary:
        doAutoSummary(element, true);
        break;
      case ContextMenuActions.DeactivateSummary:
        element.parent && doAutoSummary(element.parent, false);
        break;
      case ContextMenuActions.DefineSummary:
      case ContextMenuActions.DeleteSummary:
        doSummary(element);
        break;
      case ContextMenuActions.SwitchSummaryScreen:
        doSwitchSummary(element, ElementType.Screen);
        break;
      case ContextMenuActions.SwitchSummaryPage:
        doSwitchSummary(element, ElementType.Page);
        break;
      case ContextMenuActions.DefineFirstConnection:
      case ContextMenuActions.DefineSecondConnection:
      case ContextMenuActions.DefineRepeatConnection:
        doConnection(action, element);
        break;
    }

    if (
      action !== ContextMenuActions.EditPage &&
      action !== ContextMenuActions.EditScreen &&
      action !== ContextMenuActions.EditQuestion &&
      action !== ContextMenuActions.EditSimpleContent &&
      action !== ContextMenuActions.EditSimplePage &&
      action !== ContextMenuActions.EditPartPage &&
      action !== ContextMenuActions.Properties
    ) {
      selectTreeItem();
    }

    setSelectedIndex(index);
    handleClose();

    if (action === "MoveTo") {
      setAnchorEl(null);
    }

    if (action === "CopyFrom") {
      setAnchorEle(event.currentTarget);
      setActionVal("CopyFrom");
      setCopyFromOpen(true);
      setSelectedElement(element);
      let htmlNode = data?.anchor.parentNode as HTMLElement;
      if (element && htmlNode) {
        selectTreeItem(element, htmlNode);
        setTreeAction({ type: TreeActionTypes.CopyFrom, element });
      }
    }

    if (onItemClick) {
      onItemClick && onItemClick(action, element);
    }
  };

  const doReset = async (element: CourseElement) => {
    if (templates) {
      var app: any;
      await templates?.templates?.map((x: any) => {
        if (element.id === x.id) {
          app = {
            ...x,
          };
        }
        return app;
      });

      let sizeMode: any = {
        width: {
          type: "full",
          width: {
            value: "50",
            isSelected: false,
          },
        },
        margin: {
          top: {
            value: "0",
            isSelected: false,
          },
          left: {
            value: "0",
            isSelected: false,
          },
          right: {
            value: "0",
            isSelected: false,
          },
          bottom: {
            value: "50",
            isSelected: false,
          },
        },
        padding: {
          top: {
            value: "50",
            isSelected: false,
          },
          bottom: {
            value: "50",
            isSelected: false,
          },
        },
        isFullscreen: false,
        hasInnerContainer: true,
      };

      if (element.parent && app) {
        let newTemplate = setTemplateSizeHTML(app, sizeMode);
        app.html = newTemplate;
        saveTemplates(element?.parent, app);
      }
    }
  };

  const doAdd = (action: ContextMenuActions, element: CourseElement) => {
    const elementType = getElementTypeByAction(action);

    if (elementType) {
      setTreeAction({ type: TreeActionTypes.AddItem, element, elementType });
    }
  };

  const doEdit = (element: CourseElement) => {
    const htmlNode = data?.anchor?.parentElement as HTMLElement;

    selectTreeItem(element, htmlNode);
  };

  const doRename = (element: CourseElement) => {
    setTreeAction({ type: TreeActionTypes.RenameItem, element });
  };

  const doResetTemplate = (element: CourseElement) => {
    const title = t("alert.reset_confirm");
    const message = t("alert.reset_msg");
    const onOk = () => resetElementTemplate(element);

    openConfirmDialog(title, message, onOk);
  };

  const doDuplicate = (element: CourseElement) => {
    if (!element.isSummary) {
      duplicateElement(element).then((res) => {
        getElementTemplateVal(res.payload.node_duplicated.nid).then((res1) => {
          if (res1.payload.templates) {
            var newTemp = res1.payload.templates;
            if (newTemp.length) {
              var templates: CourseElementTemplate[] = [...newTemp];
              newTemp.map((temp: CourseElementTemplate, ind: number) => {
                const newContent = getContentTemplateModel(temp);
                templates[ind].html = setContentTemplateHTML(temp, newContent, "duplicate");
                return templates;
              });
              updateElementTemplates(res.payload.node_duplicated.nid, templates, "duplicate");
            } else if (newTemp.html !== "") {
              var template: CourseElementTemplate = newTemp;
              const newContent = getContentTemplateModel(newTemp);
              template.html = setContentTemplateHTML(newTemp, newContent, "duplicate");
              updateElementTemplates(res.payload.node_duplicated.nid, template, "duplicate");
            }
          }
        });
      });
    }
  };

  const doDelete = (element: CourseElement) => {
    const title = t("alert.delete_confirm");
    const message = `${t("alert.delete_msg_1")} ${element.type} ${t("alert.delete_msg_2")}`;
    const onOk = () => deleteElement(element);

    openConfirmDialog(title, message, onOk);
  };

  const doAutoSummary = (element: CourseElement, status: boolean) => {
    try {
      if (status) {
        validateAutoSummary(element);
      }
      updateAutoSummary(element, status);
    } catch (error) {
      openDialog(`${t("alert.warning")}`, (error as Error).message);
    }
  };

  const doSummary = (element: CourseElement) => {
    if (treeType) {
      try {
        validateSummary(element, courseProps);

        if (!element.isSummary && element.parent && hasAutoSummary(element.parent, Infinity)) {
          updateAutoSummary(element.parent, false);
        }

        updateElementSummary(element, !element.isSummary);
      } catch (error) {
        openDialog(`${t("alert.warning")}`, (error as Error).message, undefined, {
          className: "summary-warning",
        });
      }
    }
  };

  const doSwitchSummary = (element: CourseElement, type: ElementType) => {
    if (element.parent) {
      const newElement = new CourseElement("", t("title.new") + t(`${getElementType(type)}`), type);
      newElement.isSummary = true;

      createElement(element.parent, newElement, 1);
      updateAutoSummary(element.parent, false);
    }
  };

  const doConnection = (action: ContextMenuActions, element: CourseElement) => {
    const connectionType = getConnectionTypeByAction(action);
    const elements = element.type === ElementType.Page ? [element, ...element.children] : [element];

    if (connectionType) {
      const posts = elements.reduce((arr, item) => {
        const result = createConnection(item, connectionType);

        if (result) {
          arr.push(result);
        }

        return arr;
      }, [] as UpdateElementConnectionPost[]);

      if (posts.length > 0) {
        updateElementConnection(element, posts);
      }
    }
  };

  const isItemDisabled = (element: CourseElement, action: ContextMenuActions) => {
    const { templateType, isSummary, isLinked, theme, isEvaluation } = element;

    if (action === ContextMenuActions.Duplicate && isSummary) {
      return true;
    } else if (action === ContextMenuActions.ResetTemplate && !templateType) {
      return true;
    } else if (action === ContextMenuActions.Delete && isLinked) {
      return true;
    }

    if (theme !== "None" && action === ContextMenuActions.CopyFrom && isEvaluation) {
      return true;
    }

    return false;
  };

  const renderIcon = (
    element: CourseElement,
    action: ContextMenuActions,
    open: boolean,
    type?: string
  ) => {
    if (hasContextMenuAction(element, action)) {
      return (
        <ListItemIcon className="connexion-menue-icon">
          <ConnectionCtxItemIcon />
        </ListItemIcon>
      );
    }
    if (action === "MoveTo" && type) {
      return (
        <ListItemIcon className="test-icon">
          {open ? <MoveToOpenIcon /> : <MoveToCloseIcon />}
        </ListItemIcon>
      );
    }
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>, action: ContextMenuActions) => {
    if (action === "MoveTo") {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMouseLeave = (action: ContextMenuActions) => {
    if (action === "MoveTo") {
      setAnchorEl(null);
    }
  };

  const handleSubMenuClick = (element: CourseElement, type: ElementType, move: ElementType) => {
    if (type === ElementType.Starting && move === ElementType.Annexes) {
      subMenuPositionElement(element?.id, element?.parent?.id, tree?.annexes?.id, 0);
    } else if (type === ElementType.Starting && move === ElementType.Structure) {
      subMenuPositionElement(element?.id, element?.parent?.id, tree?.structure?.id, 0);
    } else if (type === ElementType.Structure && move === ElementType.Annexes) {
      subMenuPositionElement(element?.id, element?.parent?.id, tree?.annexes?.id, 0);
    } else if (type === ElementType.Structure && move === ElementType.Starting) {
      subMenuPositionElement(element?.id, element?.parent?.id, tree?.starting?.id, 0);
    } else if (type === ElementType.Annexes && move === ElementType.Structure) {
      subMenuPositionElement(element?.id, element?.parent?.id, tree?.structure?.id, 0);
    } else if (type === ElementType.Annexes && move === ElementType.Starting) {
      subMenuPositionElement(element?.id, element?.parent?.id, tree?.starting?.id, 0);
    }
  };

  const renderSubMenuVal = (element: CourseElement) => {
    var dataArray: Array<any> = [];
    const type = element?.root?.type;
    if (element.children.length !== 0) {
      element.children.map((value: CourseElement) => {
        if (value?.template?.course_context) {
          var menu = value?.template?.course_context.split(/[ ,]+/);
          menu.forEach((val: string) => {
            if (dataArray.indexOf(val) === -1 && val !== "null") {
              dataArray.push(val);
            }
          });
        }
        return dataArray;
      });
    } else {
      if (element?.template?.course_context) {
        var menu = element?.template?.course_context.split(/[ ,]+/);
        menu.forEach((val: string) => {
          if (dataArray.indexOf(val) === -1 && val !== "null") {
            dataArray.push(val);
          }
        });
      }
    }

    switch (type) {
      case ElementType.Starting:
        return (
          <>
            <ListItem
              disabled={
                dataArray.indexOf(ElementType.Structure) === -1 &&
                dataArray.length > 0 &&
                dataArray !== null
              }
              onClick={(event) => handleSubMenuClick(element, type, ElementType.Structure)}
            >
              {ElementType.Structure}
            </ListItem>
            <ListItem
              disabled={
                dataArray.indexOf(ElementType.Annexes) === -1 &&
                dataArray.length > 0 &&
                dataArray !== null
              }
              onClick={(event) => handleSubMenuClick(element, type, ElementType.Annexes)}
            >
              {ElementType.Annexes}
            </ListItem>
          </>
        );
      case ElementType.Structure:
        return (
          <>
            <ListItem
              disabled={dataArray.indexOf(ElementType.Starting) === -1 && dataArray.length > 0}
              onClick={(event) => handleSubMenuClick(element, type, ElementType.Starting)}
            >
              {ElementType.Starting}
            </ListItem>
            <ListItem
              disabled={dataArray.indexOf(ElementType.Annexes) === -1 && dataArray.length > 0}
              onClick={(event) => handleSubMenuClick(element, type, ElementType.Annexes)}
            >
              {ElementType.Annexes}
            </ListItem>
          </>
        );
      case ElementType.Annexes:
        return (
          <>
            <ListItem
              disabled={dataArray.indexOf(ElementType.Starting) === -1 && dataArray.length > 0}
              onClick={(event) => handleSubMenuClick(element, type, ElementType.Starting)}
            >
              {ElementType.Starting}
            </ListItem>
            <ListItem
              disabled={dataArray.indexOf(ElementType.Structure) === -1 && dataArray.length > 0}
              onClick={(event) => handleSubMenuClick(element, type, ElementType.Structure)}
            >
              {ElementType.Structure}
            </ListItem>
          </>
        );
    }
  };

  const onPanelCLose = () => {
    setCopyFromOpen(false);
  };

  const renderList = (element: CourseElement) => {
    const open = Boolean(anchorEl);
    if (treeType) {
      const actions = getContextMenuActions(element, treeType, courseProps);
      const items = actions.map((action, ind) => {
        if (action === "divider") {
          return <Divider key={ind} />;
        } else {
          return (
            <ListItem
              button
              key={ind}
              selected={selectedIndex === ind || (action === "MoveTo" && open)}
              disabled={isItemDisabled(element, action)}
              onClick={(event) => handleListItemClick(event, ind, action, element)}
              onMouseEnter={(event) => handleMouseEnter(event, action)}
              onMouseLeave={(event) => handleMouseLeave(action)}
            >
              {renderIcon(element, action, open, element.parent?.type)}
              {t(ContextMenuLabels[action])}
              {action === "MoveTo" && open && (
                <Popper
                  open={open}
                  anchorEl={anchorEl}
                  container={anchorEl?.ownerDocument.body}
                  placement="bottom-start"
                  popperOptions={popperOptions}
                  className="sub-context-menu"
                  modifiers={{
                    flip: {
                      enabled: false,
                    },
                    offset: {
                      enabled: true,
                      offset: "300,-28, 20",
                    },
                  }}
                >
                  <List>{renderSubMenuVal(element)}</List>
                </Popper>
              )}
            </ListItem>
          );
        }
      });

      return items;
    }
  };

  if (data) {
    return (
      <Popover
        id="structure-ctx"
        open={open}
        anchorEl={anchor}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{ square: true }}
        transitionDuration={0}
        className="structrues-context-menu"
        onClose={handleClose}
      >
        {open && <List>{renderList(data.item)}</List>}
      </Popover>
    );
  } else {
    return (
      <>
        {actionVal === "CopyFrom" && copyFromOpen && (
          <BlmCopyFrom
            anchor={anchorEle}
            onClose={onPanelCLose}
            open={copyFromOpen}
            element={selectedElement}
          />
        )}
      </>
    );
  }
}

export default BlmContextMenu;
