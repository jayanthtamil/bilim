import OriginTree from "./Tree";
import TreeNode from "./TreeNode";
var Tree = OriginTree;
Tree.TreeNode = TreeNode;
export { TreeNode };
export * from "./util";
export default Tree;