const styles = [{
    title: "ITEM 1",
    children: [{
        title: "Style projet Nissan cache cache",
        children: [],
      },
      {
        title: "Sales skills for Cartier",
        children: [],
      },
      {
        title: "Style projet 3",
        children: [],
      },
      {
        title: "Style projet 4",
        children: [],
      },
    ],
  },
  {
    title: "ITEM 2",
    children: [{
        title: "Style projet Nissan cache cache",
        children: [],
      },
      {
        title: "Sales skills for Cartier",
        children: [],
      },
      {
        title: "Style projet 3",
        children: [],
      },
      {
        title: "Style projet 4",
        children: [],
      },
    ],
  },
  {
    title: "ITEM 3",
    children: [{
        title: "Style projet Nissan cache cache",
        children: [],
      },
      {
        title: "Sales skills for Cartier",
        children: [],
      },
      {
        title: "Style projet 3",
        children: [],
      },
      {
        title: "Style projet 4",
        children: [],
      },
    ],
  },
];

function onInfoBtnClick(event) {
  const btn = event.target;
  const card = btn.parentNode.parentNode;
  const modifiedNode = card.getElementsByClassName("card-modified")[0];
  const contextMenuNode = card.getElementsByClassName("card-ctx-btn")[0];

  modifiedNode.classList.toggle("show");
  //contextMenuNode.classList.toggle("show");
  
}

function onCtxBtnClick(event) {
  var rect = event.target.getBoundingClientRect();
  var x = rect.left + 30; //x position.
  var y = rect.top - 200;  //y position.
  if(y > 140){
    y = 140;
  } 

  const ctxMenu = document.getElementsByClassName("course-context-menu")[0];
  ctxMenu.style.left = x+'px';
  ctxMenu.style.top = y+'px';

  showCourseCxtMenu();
}

function onCtxMenuClick(event) {
  hideCtxMenus();
}

function showCourseCxtMenu() {
  const ctxContainer = document.getElementsByClassName(
    "context-menu-container"
  )[0];

  ctxContainer.classList.add("course-context-menu-container");
}

function showTreeCtxMenu() {
  const ctxContainer = document.getElementsByClassName(
    "context-menu-container"
  )[0];

  ctxContainer.classList.add("tree-context-menu-container");
}

function hideCtxMenus() {
  const ctxContainer = document.getElementsByClassName(
    "context-menu-container"
  )[0];

  if (ctxContainer.classList.contains("course-context-menu-container"))
    ctxContainer.classList.remove("course-context-menu-container");
  if (ctxContainer.classList.contains("tree-context-menu-container"))
    ctxContainer.classList.remove("tree-context-menu-container");
}

function createDomainTree() {
  const domainsTreeContainer = document.getElementById(
    "domainsTreeContainer"
  );
  const tree = createTree(domains, "domains-tree");

  domainsTreeContainer.appendChild(tree);
}

function craeteStylesTree() {
  const stylesTreeContainer = document.getElementById(
    "stylesTreeContainer"
  );
  const tree = createTree(styles, "styles-tree");

  stylesTreeContainer.appendChild(tree);
}

function createTree(arr, treeClass) {
  const ul = document.createElement("ul");

  if(treeClass) {
    ul.classList.add("tree");
    ul.classList.add(treeClass);
  } else {
    ul.classList.add("child-tree");
  }

  for(var i = 0; i < arr.length; i++) {
    const item = arr[i];
    ul.appendChild(createTreeNode(item));
  }

  return ul;
}

function createTreeNode(item) {
  const id = item.id;
  const title = item.title;
  const uri = item.link;
  const children = item.children;
  const status = item.status;
  const curnode = item.curnode;
  const li = document.createElement("li");
  const hasChildren = children && children.length > 0;

  if(status){
    li.classList.add("tree-node-open");
  } else {
    li.classList.add("tree-node-close");
  }

  if (hasChildren) {
    li.classList.add("tree-node-with-children");
  } else {
    li.classList.add("tree-node-with-no-children");
  }

  if(curnode) {
    li.classList.add("tree-node-selected");
  }

  li.innerHTML = `
      <div class="tree-node-row">
        <div class="tree-node-row-container">
          <span class="tree-node-switcher" onclick="onTreeSwitchClick(event)"></span>
          <span class="tree-node-content-wrapper">
            <span class="tree-node-icon"></span>
            <span class="tree-node-title" onclick="onTreeNodeClick(event,'${uri}')">
              <span>${title}</span>
            </span>
          </span>
        </div>
        <span class="tree-node-ctx" onclick="onTreeCtxMenuClick(event)"></span>
      </div>
    `;

  if (hasChildren) {
    li.appendChild(createTree(children));
  }

  return li;
}

function onTreeSwitchClick(event) {
  const switcherNode = event.target;
  const treeNode = switcherNode.parentNode.parentNode.parentNode;
  const isExpanded = treeNode.classList.contains("tree-node-open");

  if (isExpanded) {
    treeNode.classList.remove("tree-node-open");
    treeNode.classList.add("tree-node-close");
  } else {
    treeNode.classList.remove("tree-node-close");
    treeNode.classList.add("tree-node-open");
  }
}

var selectedTreeNode = null;

function onTreeNodeClick(event,uri) {
  const titleNode = event.target;
  const treeNode =
    titleNode.parentNode.parentNode.parentNode.parentNode.parentNode;

  location.href = uri;

  if (selectedTreeNode) {
    selectedTreeNode.classList.remove("tree-node-selected");
  }

  treeNode.classList.add("tree-node-selected");
  selectedTreeNode = treeNode;
}

function onTreeCtxMenuClick(event) {
  var rect = event.target.getBoundingClientRect();
  var x = rect.left + 30; //x position.
  var y = rect.top + 10;  //y position.

  if(y > 400){
    y = 400;
  }

  const ctxMenu = document.getElementsByClassName("tree-context-menu")[0];
  ctxMenu.style.left = x+'px';
  ctxMenu.style.top = y+'px';
  
  showTreeCtxMenu();
}

function onCourseStyleDropDownClick(event) {
  const stylesDropDownList = document.getElementById("styleDropDownList");

  stylesDropDownList.classList.toggle("show");
}

function onNewCourseBtnClick(event) {
  toggleNewCoursePopup();
}

function onPopupClose(event) {
  toggleNewCoursePopup();
}

function toggleNewCoursePopup() {
  const popupContainer = document.getElementById("popupContainer");
  popupContainer.classList.toggle("show");
}

function viewGroupBtnClick(event) {
  const btn = event.target;
  const view = btn.name;
  const viewContainter = document.getElementById("courseViewContainer");
  const layMain = document.getElementsByClassName("layout-main")[0];

  btn.parentNode
    .getElementsByClassName("active")[0]
    .classList.remove("active");
  btn.classList.add("active");

  if (view === "tile") {
    viewContainter.classList.remove("list-view");
    viewContainter.classList.add("tile-view");
    layMain.classList.remove("list-view-box");
    layMain.classList.add("title-view-box");
  } else {
    viewContainter.classList.remove("tile-view");
    viewContainter.classList.add("list-view");
    layMain.classList.remove("title-view-box");
    layMain.classList.add("list-view-box");
  }
}

function searchExpandBtnClick(event) {
  const btn = event.target;
  const expandBox = btn.parentNode.parentNode;

  expandBox.classList.toggle("close");
}

function searchBtnClick(event) {
  toggleSearchPanel();
}

function searchCloseBtnClick(event) {
  toggleSearchPanel();
}

function toggleSearchPanel() {
  var searchPanel = document.getElementById("searchPanel");
  searchPanel.classList.toggle("close");
}

function subfolder_view(domain,root,cf){
  location.href = '/bilim/v1.0/bilim_cms/platform/domainview/'+domain+'/'+root+'/'+cf;
}

jQuery('.sort-select').on('change', function () {
  var type = jQuery(this).val();
  if(type == 'Alphabhetical'){
    jQuery('.course-card').sort(function(a, b) {
      var A = jQuery(a).find(".card-content .desc").text().toUpperCase(); 
      var B = jQuery(b).find(".card-content .desc").text().toUpperCase(); 
      return (A < B) ? -1 : (A > B) ? 1 : 0; 
    }).appendTo('#courseViewContainer'); 
  } else {
    jQuery('.course-card').sort(function(a, b) {
      var A = jQuery(a).data("changed"); 
      var B = jQuery(b).data("changed"); 
      return (A < B) ? -1 : (A > B) ? 1 : 0; 
    }).appendTo('#courseViewContainer'); 
  }
});

createDomainTree();
craeteStylesTree();
//createCourseList();