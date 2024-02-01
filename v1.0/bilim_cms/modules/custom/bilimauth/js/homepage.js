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
    var y = rect.top - 160;  //y position.
    if(y > 350){
      y = 350;
    }

    const ctxMenu = document.getElementsByClassName("context-menu")[0];
    ctxMenu.style.left = x+'px';
    ctxMenu.style.top = y+'px';

    const contextMenuNode = document.getElementsByClassName("card-ctx-btn")[0];
    contextMenuNode.classList.toggle("show");

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