/**
 * Webpack has bug for import loop, which is not the same behavior as ES module.
 * When util.js imports the TreeNode for tree generate will cause treeContextTypes be empty.
 */
import * as React from "react";
import createReactContext, { Context } from "@ant-design/create-react-context";
import { IconType, NodeInstance, Key } from "./interface";

type NodeMouseEventHandler = (e: React.MouseEvent, node: NodeInstance) => void;

export interface TreeContextProps {
  prefixCls: string;
  selectable: boolean;
  showIcon: boolean;
  icon: IconType;
  switcherIcon: IconType;
  draggable: boolean;
  checkable: boolean | React.ReactNode;
  checkStrictly: boolean;
  disabled: boolean;
  motion: any;
  showOptionsIcon: boolean;
  expandOnSelectorClick: boolean;

  loadData: (treeNode: NodeInstance) => Promise<void>;
  filterTreeNode: (treeNode: NodeInstance) => boolean;
  renderTreeNode: (
    child: React.ReactElement,
    index: number,
    pos: number | string
  ) => React.ReactElement;

  isKeyChecked: (key: Key) => boolean;

  onNodeClick: NodeMouseEventHandler;
  onNodeDoubleClick: NodeMouseEventHandler;
  onNodeExpand: NodeMouseEventHandler;
  onNodeSelect: NodeMouseEventHandler;
  onNodeCheck: (
    e: MouseEvent,
    treeNode: NodeInstance,
    checked: boolean
  ) => void;
  onNodeLoad: (treeNode: NodeInstance) => void;
  onNodeMouseEnter: NodeMouseEventHandler;
  onNodeMouseLeave: NodeMouseEventHandler;
  onNodeContextMenu: NodeMouseEventHandler;
  onNodeDragStart: NodeMouseEventHandler;
  onNodeDragEnter: NodeMouseEventHandler;
  onNodeDragOver: NodeMouseEventHandler;
  onNodeDragLeave: NodeMouseEventHandler;
  onNodeDragEnd: NodeMouseEventHandler;
  onNodeDrop: NodeMouseEventHandler;
  onNodeOptionsClick: NodeMouseEventHandler;

  registerTreeNode: (key: Key, node: NodeInstance) => void;

  getNodeDropEffect: (
    event: React.MouseEvent,
    treeNode: NodeInstance
  ) => string;
}

export const TreeContext: Context<TreeContextProps | null> = createReactContext(
  null
);
