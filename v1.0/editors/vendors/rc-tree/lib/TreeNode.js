"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.InternalTreeNode = void 0;

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _CSSMotion = _interopRequireDefault(require("rc-animate/lib/CSSMotion"));

var _toArray = _interopRequireDefault(require("rc-util/lib/Children/toArray"));

var _reactLifecyclesCompat = require("react-lifecycles-compat");

var _contextTypes = require("./contextTypes");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var ICON_OPEN = "open";
var ICON_CLOSE = "close";
var defaultTitle = "---";

var TreeNode = /*#__PURE__*/function (_React$Component) {
  _inherits(TreeNode, _React$Component);

  var _super = _createSuper(TreeNode);

  function TreeNode() {
    var _this;

    _classCallCheck(this, TreeNode);

    _this = _super.apply(this, arguments);
    _this.state = {
      dragNodeHighlight: false,
      dropEffect: ""
    };

    _this.onSelectorClick = function (e) {
      // Click trigger before select/check operation
      var expandOnSelectorClick = _this.props.expandOnSelectorClick;
      var _this$props$context = _this.props.context,
          onNodeClick = _this$props$context.onNodeClick,
          treeExpandOnSelectorClick = _this$props$context.expandOnSelectorClick;
      onNodeClick(e, _assertThisInitialized(_this));
      var expandOnSelector = typeof expandOnSelectorClick !== "undefined" ? expandOnSelectorClick : treeExpandOnSelectorClick;

      if (expandOnSelector) {
        _this.onExpand(e);
      }

      if (_this.isSelectable()) {
        _this.onSelect(e);
      } else {
        _this.onCheck(e);
      }
    };

    _this.onSelectorDoubleClick = function (e) {
      var onNodeDoubleClick = _this.props.context.onNodeDoubleClick;
      onNodeDoubleClick(e, _assertThisInitialized(_this));
    };

    _this.onSelect = function (e) {
      if (_this.isDisabled()) return;
      var onNodeSelect = _this.props.context.onNodeSelect;
      e.preventDefault();
      onNodeSelect(e, _assertThisInitialized(_this));
    };

    _this.onCheck = function (e) {
      if (_this.isDisabled()) return;
      var _this$props = _this.props,
          disableCheckbox = _this$props.disableCheckbox,
          checked = _this$props.checked;
      var onNodeCheck = _this.props.context.onNodeCheck;
      if (!_this.isCheckable() || disableCheckbox) return;
      e.preventDefault();
      var targetChecked = !checked;
      onNodeCheck(e, _assertThisInitialized(_this), targetChecked);
    };

    _this.onMouseEnter = function (e) {
      var onNodeMouseEnter = _this.props.context.onNodeMouseEnter;
      onNodeMouseEnter(e, _assertThisInitialized(_this));
    };

    _this.onMouseLeave = function (e) {
      var onNodeMouseLeave = _this.props.context.onNodeMouseLeave;
      onNodeMouseLeave(e, _assertThisInitialized(_this));
    };

    _this.onContextMenu = function (e) {
      var onNodeContextMenu = _this.props.context.onNodeContextMenu;
      onNodeContextMenu(e, _assertThisInitialized(_this));
    };

    _this.onDragStart = function (e) {
      var onNodeDragStart = _this.props.context.onNodeDragStart;
      e.stopPropagation();

      _this.setState({
        dragNodeHighlight: true
      });

      onNodeDragStart(e, _assertThisInitialized(_this));

      try {
        // ie throw error
        // firefox-need-it
        e.dataTransfer.setData("text/plain", "");
      } catch (error) {// empty
      }
    };

    _this.onDragEnter = function (e) {
      var onNodeDragEnter = _this.props.context.onNodeDragEnter;
      e.preventDefault();
      e.stopPropagation();
      onNodeDragEnter(e, _assertThisInitialized(_this));
    };

    _this.onDragOver = function (e) {
      var _this$props$context2 = _this.props.context,
          onNodeDragOver = _this$props$context2.onNodeDragOver,
          getNodeDropEffect = _this$props$context2.getNodeDropEffect;
      e.preventDefault();
      e.stopPropagation();

      if (getNodeDropEffect) {
        var dropEffect = getNodeDropEffect(e, _assertThisInitialized(_this));

        if (_this.state.dropEffect !== dropEffect) {
          _this.setState({
            dropEffect: dropEffect
          });
        }

        e.dataTransfer.dropEffect = dropEffect;
      }

      onNodeDragOver(e, _assertThisInitialized(_this));
    };

    _this.onDragLeave = function (e) {
      var onNodeDragLeave = _this.props.context.onNodeDragLeave;
      e.stopPropagation();
      onNodeDragLeave(e, _assertThisInitialized(_this));
    };

    _this.onDragEnd = function (e) {
      var onNodeDragEnd = _this.props.context.onNodeDragEnd;
      e.stopPropagation();

      _this.setState({
        dragNodeHighlight: false
      });

      onNodeDragEnd(e, _assertThisInitialized(_this));
    };

    _this.onDrop = function (e) {
      var onNodeDrop = _this.props.context.onNodeDrop;
      e.preventDefault();
      e.stopPropagation();

      _this.setState({
        dragNodeHighlight: false
      });

      onNodeDrop(e, _assertThisInitialized(_this));
    }; // Disabled item still can be switch


    _this.onExpand = function (e) {
      var onNodeExpand = _this.props.context.onNodeExpand;
      onNodeExpand(e, _assertThisInitialized(_this));
    };

    _this.onOptionsClick = function (e) {
      var onNodeOptionsClick = _this.props.context.onNodeOptionsClick;
      onNodeOptionsClick(e, _assertThisInitialized(_this));
    }; // Drag usage


    _this.setSelectHandle = function (node) {
      _this.selectHandle = node;
    };

    _this.getNodeChildren = function () {
      var children = _this.props.children;
      var originList = (0, _toArray.default)(children).filter(function (node) {
        return node;
      });
      var targetList = (0, _util.getNodeChildren)(originList);

      if (originList.length !== targetList.length) {
        (0, _util.warnOnlyTreeNode)();
      }

      return targetList;
    };

    _this.getNodeExpanded = function () {
      var _this$props2 = _this.props,
          expanded = _this$props2.expanded,
          alwaysExpanded = _this$props2.alwaysExpanded;
      return alwaysExpanded || expanded;
    };

    _this.getNodeState = function () {
      var expanded = _this.getNodeExpanded();

      if (_this.isLeaf()) {
        return null;
      }

      return expanded ? ICON_OPEN : ICON_CLOSE;
    };

    _this.isLeaf = function () {
      var _this$props3 = _this.props,
          isLeaf = _this$props3.isLeaf,
          loaded = _this$props3.loaded;
      var loadData = _this.props.context.loadData;
      var hasChildren = _this.getNodeChildren().length !== 0;

      if (isLeaf === false) {
        return false;
      }

      return isLeaf || !loadData && !hasChildren || loadData && loaded && !hasChildren;
    };

    _this.isDisabled = function () {
      var disabled = _this.props.disabled;
      var treeDisabled = _this.props.context.disabled; // Follow the logic of Selectable

      if (disabled === false) {
        return false;
      }

      return !!(treeDisabled || disabled);
    };

    _this.isCheckable = function () {
      var checkable = _this.props.checkable;
      var treeCheckable = _this.props.context.checkable; // Return false if tree or treeNode is not checkable

      if (!treeCheckable || checkable === false) return false;
      return treeCheckable;
    }; // Load data to avoid default expanded tree without data


    _this.syncLoadData = function (props) {
      var loading = props.loading,
          loaded = props.loaded;
      var _this$props$context3 = _this.props.context,
          loadData = _this$props$context3.loadData,
          onNodeLoad = _this$props$context3.onNodeLoad;

      var expanded = _this.getNodeExpanded();

      if (loading) return; // read from state to avoid loadData at same time

      if (loadData && expanded && !_this.isLeaf()) {
        // We needn't reload data when has children in sync logic
        // It's only needed in node expanded
        var hasChildren = _this.getNodeChildren().length !== 0;

        if (!hasChildren && !loaded) {
          onNodeLoad(_assertThisInitialized(_this));
        }
      }
    }; // Switcher


    _this.renderSwitcher = function () {
      var switcherIconFromProps = _this.props.switcherIcon;
      var _this$props$context4 = _this.props.context,
          prefixCls = _this$props$context4.prefixCls,
          switcherIconFromCtx = _this$props$context4.switcherIcon;

      var expanded = _this.getNodeExpanded();

      var switcherIcon = switcherIconFromProps || switcherIconFromCtx;

      if (_this.isLeaf()) {
        return React.createElement("span", {
          className: (0, _classnames.default)("".concat(prefixCls, "-switcher"), "".concat(prefixCls, "-switcher-noop"))
        }, typeof switcherIcon === "function" ? switcherIcon(_objectSpread({}, _this.props, {
          isLeaf: true
        })) : switcherIcon);
      }

      var switcherCls = (0, _classnames.default)("".concat(prefixCls, "-switcher"), "".concat(prefixCls, "-switcher_").concat(expanded ? ICON_OPEN : ICON_CLOSE));
      return React.createElement("span", {
        onClick: _this.onExpand,
        className: switcherCls
      }, typeof switcherIcon === "function" ? switcherIcon(_objectSpread({}, _this.props, {
        isLeaf: false
      })) : switcherIcon);
    }; // Checkbox


    _this.renderCheckbox = function () {
      var _this$props4 = _this.props,
          checked = _this$props4.checked,
          halfChecked = _this$props4.halfChecked,
          disableCheckbox = _this$props4.disableCheckbox;
      var prefixCls = _this.props.context.prefixCls;

      var disabled = _this.isDisabled();

      var checkable = _this.isCheckable();

      if (!checkable) return null; // [Legacy] Custom element should be separate with `checkable` in future

      var $custom = typeof checkable !== "boolean" ? checkable : null;
      return React.createElement("span", {
        className: (0, _classnames.default)("".concat(prefixCls, "-checkbox"), checked && "".concat(prefixCls, "-checkbox-checked"), !checked && halfChecked && "".concat(prefixCls, "-checkbox-indeterminate"), (disabled || disableCheckbox) && "".concat(prefixCls, "-checkbox-disabled")),
        onClick: _this.onCheck
      }, $custom);
    };

    _this.renderIcon = function () {
      var loading = _this.props.loading;
      var prefixCls = _this.props.context.prefixCls;
      return React.createElement("span", {
        className: (0, _classnames.default)("".concat(prefixCls, "-iconEle"), "".concat(prefixCls, "-icon__").concat(_this.getNodeState() || "docu"), loading && "".concat(prefixCls, "-icon_loading"))
      });
    }; // Icon + Title


    _this.renderSelector = function () {
      var dragNodeHighlight = _this.state.dragNodeHighlight;
      var _this$props5 = _this.props,
          title = _this$props5.title,
          selected = _this$props5.selected,
          icon = _this$props5.icon,
          loading = _this$props5.loading;
      var _this$props$context5 = _this.props.context,
          prefixCls = _this$props$context5.prefixCls,
          showIcon = _this$props$context5.showIcon,
          treeIcon = _this$props$context5.icon,
          draggable = _this$props$context5.draggable,
          loadData = _this$props$context5.loadData;

      var disabled = _this.isDisabled();

      var wrapClass = "".concat(prefixCls, "-node-content-wrapper"); // Icon - Still show loading icon when loading without showIcon

      var $icon;

      if (showIcon) {
        var currentIcon = icon || treeIcon;
        $icon = currentIcon ? React.createElement("span", {
          className: (0, _classnames.default)("".concat(prefixCls, "-iconEle"), "".concat(prefixCls, "-icon__customize"))
        }, typeof currentIcon === "function" ? currentIcon(_this.props) : currentIcon) : _this.renderIcon();
      } else if (loadData && loading) {
        $icon = _this.renderIcon();
      } // Title


      var $title = React.createElement("span", {
        className: "".concat(prefixCls, "-title")
      }, title);
      return React.createElement("span", {
        ref: _this.setSelectHandle,
        title: typeof title === "string" ? title : "",
        className: (0, _classnames.default)("".concat(wrapClass), "".concat(wrapClass, "-").concat(_this.getNodeState() || "normal"), !disabled && (selected || dragNodeHighlight) && "".concat(prefixCls, "-node-selected"), !disabled && draggable && "draggable"),
        draggable: !disabled && draggable || undefined,
        "aria-grabbed": !disabled && draggable || undefined,
        onMouseEnter: _this.onMouseEnter,
        onMouseLeave: _this.onMouseLeave,
        onContextMenu: _this.onContextMenu,
        onClick: _this.onSelectorClick,
        onDoubleClick: _this.onSelectorDoubleClick,
        onDragStart: draggable ? _this.onDragStart : undefined
      }, $icon, $title);
    }; // Children list wrapped with `Animation`


    _this.renderChildren = function () {
      var pos = _this.props.pos;
      var _this$props$context6 = _this.props.context,
          prefixCls = _this$props$context6.prefixCls,
          motion = _this$props$context6.motion,
          renderTreeNode = _this$props$context6.renderTreeNode;

      var expanded = _this.getNodeExpanded(); // Children TreeNode


      var nodeList = _this.getNodeChildren();

      if (nodeList.length === 0) {
        return null;
      }

      return React.createElement(_CSSMotion.default, Object.assign({
        visible: expanded
      }, motion), function (_ref) {
        var style = _ref.style,
            className = _ref.className;
        return React.createElement("ul", {
          className: (0, _classnames.default)(className, "".concat(prefixCls, "-child-tree"), expanded && "".concat(prefixCls, "-child-tree-open")),
          style: style,
          "data-expanded": expanded,
          role: "group"
        }, (0, _util.mapChildren)(nodeList, function (node, index) {
          return renderTreeNode(node, index, pos);
        }));
      });
    }; //Options


    _this.renderOptionsIcon = function () {
      var _this$props6 = _this.props,
          showOptionsIcon = _this$props6.showOptionsIcon,
          optionsIcon = _this$props6.optionsIcon;
      var _this$props$context7 = _this.props.context,
          prefixCls = _this$props$context7.prefixCls,
          treeShowOptionsIcon = _this$props$context7.showOptionsIcon;
      var $icon;
      var showOptions = typeof showOptionsIcon !== "undefined" ? showOptionsIcon : treeShowOptionsIcon;

      if (showOptions) {
        $icon = React.createElement("span", {
          className: (0, _classnames.default)("".concat(prefixCls, "-options")),
          onClick: _this.onOptionsClick
        }, optionsIcon);
      }

      return React.createElement(React.Fragment, null, $icon);
    };

    return _this;
  } // Isomorphic needn't load data in server side


  _createClass(TreeNode, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props7 = this.props,
          eventKey = _this$props7.eventKey,
          registerTreeNode = _this$props7.context.registerTreeNode;
      this.syncLoadData(this.props);
      registerTreeNode(eventKey, this);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.syncLoadData(this.props);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _this$props8 = this.props,
          eventKey = _this$props8.eventKey,
          registerTreeNode = _this$props8.context.registerTreeNode;
      registerTreeNode(eventKey, null);
    }
  }, {
    key: "isSelectable",
    value: function isSelectable() {
      var selectable = this.props.selectable;
      var treeSelectable = this.props.context.selectable; // Ignore when selectable is undefined or null

      if (typeof selectable === "boolean") {
        return selectable;
      }

      return treeSelectable;
    }
  }, {
    key: "render",
    value: function render() {
      var _classNames;

      var loading = this.props.loading;

      var _this$props9 = this.props,
          className = _this$props9.className,
          style = _this$props9.style,
          dragOver = _this$props9.dragOver,
          dragOverGapTop = _this$props9.dragOverGapTop,
          dragOverGapBottom = _this$props9.dragOverGapBottom,
          isLeaf = _this$props9.isLeaf,
          selected = _this$props9.selected,
          checked = _this$props9.checked,
          halfChecked = _this$props9.halfChecked,
          otherProps = _objectWithoutProperties(_this$props9, ["className", "style", "dragOver", "dragOverGapTop", "dragOverGapBottom", "isLeaf", "selected", "checked", "halfChecked"]);

      var _this$props$context8 = this.props.context,
          prefixCls = _this$props$context8.prefixCls,
          filterTreeNode = _this$props$context8.filterTreeNode,
          draggable = _this$props$context8.draggable;
      var disabled = this.isDisabled();
      var dataOrAriaAttributeProps = (0, _util.getDataAndAria)(otherProps);
      var expanded = this.getNodeExpanded();
      return React.createElement("li", Object.assign({
        className: (0, _classnames.default)(className, (_classNames = {}, _defineProperty(_classNames, "".concat(prefixCls, "-treenode-disabled"), disabled), _defineProperty(_classNames, "".concat(prefixCls, "-treenode-switcher-").concat(expanded ? "open" : "close"), !isLeaf), _defineProperty(_classNames, "".concat(prefixCls, "-treenode-checkbox-checked"), checked), _defineProperty(_classNames, "".concat(prefixCls, "-treenode-checkbox-indeterminate"), halfChecked), _defineProperty(_classNames, "".concat(prefixCls, "-treenode-selected"), selected), _defineProperty(_classNames, "".concat(prefixCls, "-treenode-loading"), loading), _defineProperty(_classNames, "drag-over", !disabled && dragOver && this.state.dropEffect !== "none"), _defineProperty(_classNames, "drag-over-gap-top", !disabled && dragOverGapTop && this.state.dropEffect !== "none"), _defineProperty(_classNames, "drag-over-gap-bottom", !disabled && dragOverGapBottom && this.state.dropEffect !== "none"), _defineProperty(_classNames, "filter-node", filterTreeNode && filterTreeNode(this)), _classNames)),
        style: style,
        role: "treeitem",
        onDragEnter: draggable ? this.onDragEnter : undefined,
        onDragOver: draggable ? this.onDragOver : undefined,
        onDragLeave: draggable ? this.onDragLeave : undefined,
        onDrop: draggable ? this.onDrop : undefined,
        onDragEnd: draggable ? this.onDragEnd : undefined
      }, dataOrAriaAttributeProps), React.createElement("div", {
        className: (0, _classnames.default)("".concat(prefixCls, "-node-row"))
      }, React.createElement("div", {
        className: (0, _classnames.default)("".concat(prefixCls, "-node-row-container"))
      }, this.renderSwitcher(), this.renderCheckbox(), this.renderSelector()), this.renderOptionsIcon()), this.renderChildren());
    }
  }]);

  return TreeNode;
}(React.Component);

exports.InternalTreeNode = TreeNode;
TreeNode.propTypes = {
  eventKey: _propTypes.default.string,
  prefixCls: _propTypes.default.string,
  className: _propTypes.default.string,
  style: _propTypes.default.object,
  onSelect: _propTypes.default.func,
  // By parent
  expanded: _propTypes.default.bool,
  selected: _propTypes.default.bool,
  checked: _propTypes.default.bool,
  loaded: _propTypes.default.bool,
  loading: _propTypes.default.bool,
  halfChecked: _propTypes.default.bool,
  children: _propTypes.default.node,
  title: _propTypes.default.node,
  pos: _propTypes.default.string,
  dragOver: _propTypes.default.bool,
  dragOverGapTop: _propTypes.default.bool,
  dragOverGapBottom: _propTypes.default.bool,
  // By user
  isLeaf: _propTypes.default.bool,
  checkable: _propTypes.default.bool,
  selectable: _propTypes.default.bool,
  disabled: _propTypes.default.bool,
  disableCheckbox: _propTypes.default.bool,
  icon: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),
  switcherIcon: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),
  showOptionsIcon: _propTypes.default.bool,
  optionsIcon: _propTypes.default.node,
  alwaysExpanded: _propTypes.default.bool,
  expandOnSelectorClick: _propTypes.default.bool
};
(0, _reactLifecyclesCompat.polyfill)(TreeNode);

var ContextTreeNode = function ContextTreeNode(props) {
  return React.createElement(_contextTypes.TreeContext.Consumer, null, function (context) {
    return React.createElement(TreeNode, Object.assign({}, props, {
      context: context
    }));
  });
};

ContextTreeNode.defaultProps = {
  title: defaultTitle
};
ContextTreeNode.isTreeNode = 1;
var _default = ContextTreeNode;
exports.default = _default;