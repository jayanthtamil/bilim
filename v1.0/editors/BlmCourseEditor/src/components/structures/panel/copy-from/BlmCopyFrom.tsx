import React, { ChangeEvent } from "react";
import { Popover, Select, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ContainerProps } from "./copy-from-container";
import { TreeView, TreeItem } from "@material-ui/lab";
import BlmCopyFromStructure from "../copy-from-structure";
import { ExpandOpen, ExpandClose } from "assets/icons";
import { CourseElement } from "types";
import "./copy-from-styles.scss";

export interface CompProps extends ContainerProps {
  element?: CourseElement;
  anchor?: HTMLElement | null;
  open: boolean;
  onClose?: () => void;
}

function BlmCopyFrom(props: CompProps) {
  const {
    open,
    anchor,
    element,
    onClose,
    getCopyFromDomainList,
    getCopyFromDomainCategory,
    getCopyFromSubFolderList,
    selectTreeItem,
  } = props;
  const [value, setValue] = React.useState(undefined);
  const [domainList, setdomainList] = React.useState<any>();
  const [displayCategor, setDisplayCategory] = React.useState(false);
  const [Category, setCategory] = React.useState<any | undefined>(undefined);
  const [courseId, setcourseId] = React.useState<any | undefined>(undefined);
  const [expanded, setexpanded] = React.useState<any>([]);
  const { t } = useTranslation("structures");

  React.useEffect(() => {
    if (!domainList) {
      getCopyFromDomainList().then((res) => {
        setdomainList(res.payload.domain);
      });
    }
  }, [domainList, getCopyFromDomainList]);

  const handleChange = (event: ChangeEvent<any>) => {
    const { value } = event.target;
    setValue(value);
    setDisplayCategory(true);

    getCopyFromDomainCategory(value).then((res) => {
      setDisplayCategory(true);
      setCategory(res.payload.domain);
      setexpanded([]);
    });
  };

  const renderItems = () => {
    if (domainList) {
      return domainList?.map((item: any) => {
        if (typeof item === "object") {
          const { id, name } = item;
          return (
            <MenuItem key={id} value={id}>
              <ListItemIcon className={name} />
              <ListItemText>{name}</ListItemText>
            </MenuItem>
          );
        }
      });
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      selectTreeItem();
    }
  };

  const setExpandVal = (node: string) => {
    setexpanded((prevExpandedState: string[]) => {
      var arr = [...prevExpandedState];
      if (!arr.includes(node)) {
        arr.push(node);
      } else {
        arr.splice(arr.indexOf(node), 1);
      }
      return arr;
    });
  };

  const handleSubChildren = (course_id: string, res: object, node: string) => {
    var newCategory = Category;
    var renderTreeChildren = (Category: any) => {
      Category.map((treeItemData: any) => {
        if (treeItemData.children && treeItemData.children.length > 0) {
          renderTreeChildren(treeItemData.children);
        }

        if (treeItemData.id === course_id) {
          treeItemData.children = res;
          setExpandVal(node);
        }
        return Category;
      });
    };
    renderTreeChildren(newCategory);
    renderTree(newCategory);
  };

  const handleNodeSelect = (event: ChangeEvent<{}>, node: string) => {
    var course_id = node.split("-")[0];
    var CategoryType = node.split("-")[1];
    if (CategoryType === "course") {
      setcourseId(course_id);
    }
  };

  const handleTreeItemClick = (child: object, node: string) => {
    var course_id = node.split("-")[0];
    var type = node.split("-")[1];
    var link = node.split("-")[2];
    var params = link.split("/domainview/");

    if (child === undefined) {
      if (type === "content_folder") {
        getCopyFromSubFolderList(
          params[1].split("/")[0],
          params[1].split("/")[1],
          params[1].split("/")[2]
        ).then((res) => {
          handleSubChildren(course_id, res.payload.categories, node);
        });
      }
    } else {
      setExpandVal(node);
    }
  };

  const renderTree = (treeItems: any) => {
    return treeItems.map((treeItemData: any) => {
      let children = undefined;
      if (treeItemData.children && treeItemData.children.length > 0) {
        children = renderTree(treeItemData.children);
      }
      return (
        <TreeItem
          key={treeItemData.id}
          onIconClick={() =>
            handleTreeItemClick(
              treeItemData.children,
              treeItemData.id + "-" + treeItemData.type + "-" + treeItemData.link
            )
          }
          onLabelClick={() =>
            handleTreeItemClick(
              treeItemData.children,
              treeItemData.id + "-" + treeItemData.type + "-" + treeItemData.link
            )
          }
          nodeId={treeItemData.id + "-" + treeItemData.type + "-" + treeItemData.link}
          label={
            <>
              {treeItemData.type === "course" && (
                <img
                  className={
                    treeItemData.flag_url.substring(treeItemData.flag_url.lastIndexOf("/") + 1) ===
                    "global.png"
                      ? "globe-flag-icon"
                      : ""
                  }
                  src={treeItemData.flag_url}
                  alt=""
                />
              )}
              {treeItemData.type === "content_folder" && treeItemData.children === undefined ? (
                <span className="no-children" />
              ) : treeItemData.type === "content_folder" &&
                treeItemData.children &&
                treeItemData.children.length === 0 ? (
                <span className="empty-children" />
              ) : (
                ""
              )}
              <ListItemText>{treeItemData.title}</ListItemText>
            </>
          }
          children={children}
        />
      );
    });
  };

  const renderCategoryList = () => {
    if (displayCategor && Category !== undefined) {
      return (
        <div className="catory-list-container">
          <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandOpen />}
            defaultExpandIcon={<ExpandClose />}
            onNodeSelect={handleNodeSelect}
            expanded={expanded}
          >
            {renderTree(Category)}
          </TreeView>
        </div>
      );
    }
  };

  const renderPlaceholder = () => {
    return <div>-- Select a domain --</div>;
  };

  return (
    <div className="copy-from">
      <Popover
        id="structure-ctx"
        open={open}
        anchorEl={anchor}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: 3,
          horizontal: -7,
        }}
        disableBackdropClick={true}
        PaperProps={{ square: true }}
        transitionDuration={0}
        className="copy-from-panel"
        onClose={handleClose}
      >
        <div className="copy-from-props-container">
          <div className="copy-from-left-container">
            <div className="copy-from-panel-close-btn" onClick={handleClose} />
            <div className="domain-lists">
              <div className="page-bg-props-bg-media-title">{t("copy_from.title")}</div>
              <Select
                name="action"
                value={value || ""}
                displayEmpty={true}
                renderValue={value ? undefined : renderPlaceholder}
                MenuProps={{
                  className: "copt-from-domain-popover",
                }}
                className="copt-from-domain-dropdown"
                onChange={handleChange}
              >
                {renderItems()}
              </Select>
              {renderCategoryList()}
            </div>
          </div>
          {courseId && (
            <div className="copy-from-struture-container">
              <div className="copy-from-header">{t("copy_from.structure_header")}</div>
              <div className="copy-from-struture-title">{t("accordion.structure")}</div>
              <BlmCopyFromStructure courseId={courseId} element={element} />
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
}
export default BlmCopyFrom;
