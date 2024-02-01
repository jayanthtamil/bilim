import * as React from "react";
import { TreeNodeProps, InternalTreeNodeProps } from "./TreeNode";

export interface DataNode {
  key: string;
  title: string;
  disabled?: boolean;
  selectable?: boolean;
  children?: DataNode[];
}

export type IconType =
  | React.ReactNode
  | ((props: TreeNodeProps) => React.ReactNode);

export type Key = string | number;

export type NodeElement<D = any> = React.ReactElement<TreeNodeProps<D>> & {
  selectHandle: HTMLSpanElement;
  type: {
    isTreeNode: boolean;
  };
};

export type NodeInstance<D = any> = React.Component<
  InternalTreeNodeProps<D>
> & {
  selectHandle?: HTMLSpanElement;
};

export interface Entity<N = NodeElement> {
  node: N;
  index: number;
  key: Key;
  pos: string | number;
  parent?: Entity<N>;
  children?: Entity<N>[];
}

export { TreeNodeProps, InternalTreeNodeProps };
