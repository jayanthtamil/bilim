jQuery(document).ready(function() {
	//Sort by Recent
	jQuery('.category-card').sort(function(a, b) {
		var A = jQuery(a).data("changed"); 
		var B = jQuery(b).data("changed"); 
		//return (A < B) ? -1 : (A > B) ? 1 : 0; 
		return A > B ? -1 : 1;
	  }).appendTo('#courseViewContainer'); 
	  
	jQuery('.course-card').sort(function(a, b) {
		var A = jQuery(a).data("changed"); 
		var B = jQuery(b).data("changed"); 
		//return (A < B) ? -1 : (A > B) ? 1 : 0; 
		return A > B ? -1 : 1;
	  }).appendTo('#courseViewContainer'); 
});

function onInfoBtnClick(event) {
  /*const btn = event.target;
  const card = btn.parentNode.parentNode;
  const modifiedNode = card.getElementsByClassName("card-modified")[0];
  const contextMenuNode = card.getElementsByClassName("card-ctx-btn")[0];

  modifiedNode.classList.toggle("show");*/
	//contextMenuNode.classList.toggle("show");

  var popupContainer = document.querySelector('.properties-container');
	popupContainer.innerHTML = '';
	var crs_id = event.target.getAttribute('data-crs-id');
	console.log('course_props',course_props);
	course_props.forEach(function(value,index){

		if(value.id == crs_id){
			var img = "<img class='course-style-img' src='"+base_url +"/modules/custom/bilimauth/images/style-temp.png'/>";
			var div = document.createElement('div');
			
			if(value.navigation == 'template'){
				var navigation = 'editor';
			}
			else{
				var navigation = value.navigation;
			}
			
			if(value.display  = 'fullresponsive'){
				var display = 'FULL RESPONSIVE';
			}
			else if(value.display == 'smartphone'){
				var display = 'ONLY MOBILE';
			}
			else if(value.display == 'desktop'){
				var display = 'ONLY COMPUTER';
			}
			var crs = '';
			if(value.courses){
				for (i in value.courses){
					crs += `<div class="stl-crs" data-crs="${i}" onclick="redirect(this);">${value.courses[i]}</div>`;
				};
			}
		
			var html = `
					<button class="popup-close-btn" onclick="onCrsPopupClose(event)"></button>
					<h2 style="font-weight: bold;font-size: 2em; padding-top: 15px; text-transform: capitalize;">${value.title}</h2>
<div style="cursor:pointer; display: flex;justify-content: space-between;align-items: center;width: 100%;margin: 30px 0;">
						<span style="border-bottom: 3px solid #ccc;display: block;width: 92%;"></span>
					</div>
					
					<div style="display: flex;flex-flow:column wrap;">
						<span class="crs-style">${value.style_name}</span>
						<img class='course-style-img' src='${base_url}/modules/custom/bilimauth/images/style-temp.png'/>
						<span class="course-style-display">
	               	<span class="${value.display}-mid-icon" data-dp="${value.display}"></span>${display}
	          </span>
<p style="margin-left:50px;color: #43b271;font-size: 13px;font-weight: bold;text-transform: uppercase;">Navigation by ${navigation}</p>
					</div>
					<div style="cursor:pointer; display: flex;justify-content: space-between;align-items: center;width: 100%;margin: 30px 0;" onclick="toggleStyleInfo(this);">
						<span style="border-bottom: 3px solid #ccc;display: block;width: 92%;"></span>
						<span class="course-style-drop-down-icon domain-arrow-icon"></span>
					</div>
					<div class="course-style-details-info style-poperties-info">
<span class="crs-lang crs-flag with-flag ${value.lang_code}">${value.language}</span>
            <div class="course-style-info-control">
              <span class="course-style-info-lbl creation">Creation :</span>
              <span class="course-style-info-txt date created-date">${value.createdDate}</span>
              <span class="course-style-info-txt time created-time">${value.createdTime}</span>
            </div>
            <div class="course-style-info-control">
              <span class="course-style-info-lbl modification">Modification :</span>
              <span class="course-style-info-txt date changed-date">${value.changedDate}</span>
              <span class="course-style-info-txt time changed-time">${value.changedTime}</span>
            </div>
            <div class="course-style-info-control">
              <span class="course-style-info-lbl created-from">Created from :</span>
              <span class="course-style-info-txt">${value.created_by}</span>
            </div>
            <div class="course-style-info-control">
              <span class="course-style-info-lbl modified">Modified :</span>
              <span class="course-style-info-txt">${value.modified_by}</span>
            </div>
          </div>`;
			div.innerHTML = html;
			document.getElementById('crs-properties-container').appendChild(div);
		}
	});
	

  
  
	popupContainer.classList.add('show');
  
}

function onStyleInfoBtnClick(event) {
  var popupContainer = document.querySelector('.properties-container');
	popupContainer.innerHTML = '';
	var stl_id = event.target.getAttribute('data-stl-id');
	console.log('style_props',style_props);
	style_props.forEach(function(value,index){
		if(value.id == stl_id){
			var img = "<img class='course-style-img' src='"+base_url +"/modules/custom/bilimauth/images/style-temp.png'/>";
			var div = document.createElement('div');
			
			if(value.navigation == 'template'){
				var navigation = 'editor';
			}
			else{
				var navigation = value.navigation;
			}
			
			if(value.display  = 'fullresponsive'){
				var display = 'FULL RESPONSIVE';
			}
			else if(value.display == 'smartphone'){
				var display = 'ONLY MOBILE';
			}
			else if(value.display == 'desktop'){
				var display = 'ONLY COMPUTER';
			}
			var crs = '';
			if(value.courses){
				for (i in value.courses){
					crs += `<div class="stl-crs" data-crs="${i}" onclick="redirect(this);">${value.courses[i]}</div>`;
				};
			}
		
			var html = `
					<button class="popup-close-btn" onclick="onStylePopupClose(event)"></button>
					<h2 style="font-weight: bold;font-size: 2em; padding-top: 15px; text-transform: capitalize;">${value.title}</h2>
					<p style="color: #43b271;font-size: 13px;font-weight: bold;text-transform: uppercase;">Navigation by ${navigation}</p>
					<div style="display: flex;justify-content: space-between;">
						<img class='course-style-img' src='${base_url}/modules/custom/bilimauth/images/style-temp.png'/>
						<span class="course-style-display">
	               	${display}<span class="${value.display}-mid-icon" data-dp="${value.display}"></span>
	          </span>
					</div>
					<div style="cursor:pointer; display: flex;justify-content: space-between;align-items: center;width: 100%;margin: 30px 0;" onclick="toggleStyleInfo(this);">
						<span style="border-bottom: 3px solid #ccc;display: block;width: 92%;"></span>
						<span class="course-style-drop-down-icon domain-arrow-icon"></span>
					</div>
					<div class="course-style-details-info style-poperties-info">
            <div class="course-style-info-control">
              <span class="course-style-info-lbl creation">Creation :</span>
              <span class="course-style-info-txt date created-date">${value.createdDate}</span>
              <span class="course-style-info-txt time created-time">${value.createdTime}</span>
            </div>
            <div class="course-style-info-control">
              <span class="course-style-info-lbl modification">Modification :</span>
              <span class="course-style-info-txt date changed-date">${value.changedDate}</span>
              <span class="course-style-info-txt time changed-time">${value.changedTime}</span>
            </div>
            <div class="course-style-info-control">
              <span class="course-style-info-lbl created-from">Created from :</span>
              <span class="course-style-info-txt">${value.created_by}</span>
            </div>
            <div class="course-style-info-control">
              <span class="course-style-info-lbl modified">Modified :</span>
              <span class="course-style-info-txt">${value.modified_by}</span>
            </div>
          </div>
					<h1 style="font-size: 25px;font-weight: bold;margin: 30px 0 0;">Courses</h1>
					<div style="cursor:pointer;display: flex;justify-content: space-between;align-items: center;width: 100%;margin: 0 0 15px;" onclick="toggleCourseList(this);">
						<span style="border-bottom: 3px solid #ccc;display: block;width: 92%;"></span>
						<span class="course-style-drop-down-icon domain-arrow-icon"></span>
					</div>
					<div class="style-course-list custom-scrollbar" style="overflow: auto;max-height: calc(100vh - 63%); height: 50vh;">${crs}</div>
			`;
			div.innerHTML = html;
			document.getElementById('style-properties-container').appendChild(div);
		}
	});
	

  
  
	popupContainer.classList.add('show');
  
}

function redirect(target){
	console.log('t',target);
	var crs_id = target.getAttribute('data-crs');
	var url = base_url + '/update-course';
	var data = {
		crs_id:crs_id
	};
	var xmlhttp = new XMLHttpRequest(); 
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.responseType = 'json';
	xmlhttp.send(JSON.stringify(data));
	xmlhttp.onload = function(e) {
	  if (this.status == 200) {
	    console.log('response', this.response);
			location.href = location.origin + "/bilim/v1.0/editors/BlmCourseEditor/build/?courseId=" + crs_id;  
	  }
		
	};
}

function onClickToEditor(event){
	var crs_id = event.target.closest('.course-card').getAttribute('data-crs');
	var url = base_url + '/update-course';
	var data = {
		crs_id:crs_id
	};
	var xmlhttp = new XMLHttpRequest(); 
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.responseType = 'json';
	xmlhttp.send(JSON.stringify(data));
	xmlhttp.onload = function(e) {
	  if (this.status == 200) {
	    console.log('response', this.response);
			location.href = location.origin + "/bilim/v1.0/editors/BlmCourseEditor/build/?courseId=" + crs_id;  
	  }
		
	};
}

function toggleStyleInfo(target){
	target.lastElementChild.classList.toggle('domain-arrow-icon');
	let element = document.querySelector('.style-poperties-info');
	if(element.style.display == 'none'){
		element.style.display = 'block';
	}
	else{
		element.style.display = 'none';
	}
}

function toggleCourseList(target){
	target.lastElementChild.classList.toggle('domain-arrow-icon');
	let element = document.querySelector('.style-course-list');
	if(element.style.display == 'none'){
		element.style.display = 'block';
	}
	else{
		element.style.display = 'none';
	}
}

function onCtxBtnClick(event) {

	var crs_hide_menu = event.target.getAttribute("data-crs-dup");

	if(crs_hide_menu == 0){

var rect = event.target.getBoundingClientRect();
  var x = rect.left + 30; //x position.
  var y = rect.top - 200;  //y position.
  if(y > 140){
    y = 140;
  } 

  const ctxMenu = document.getElementsByClassName("course-context-menu")[0];
  ctxMenu.style.left = x+'px';
  ctxMenu.style.top = y+'px';  
  
  var crs_id = event.target.getAttribute("data-crs");
  document.getElementById("crs-url").setAttribute("data-crs", crs_id);
  document.getElementById("crs-preview").setAttribute("data-crs", crs_id);
  document.getElementById("crs-props").setAttribute("data-crs-id", crs_id);
  document.getElementById("crs-export").setAttribute("data-crs-id", crs_id);
  document.getElementById("crs-duplicate").setAttribute("data-crs-id", crs_id);
  document.getElementById("move-crs-popup").setAttribute("data-crs-id", crs_id); 
  document.getElementById("change-style-btn").setAttribute("data-crs-id", crs_id); 

  var crs_id_dup1 = event.target.getAttribute("data-crs-dup");
  document.getElementById("crs-del").setAttribute("data-crs-dup", crs_id_dup1);
  if(crs_id_dup1 == 1) 
  {
	//document.getElementById("crs-del").classList.remove("delete-course-popup");
  }
  var crs_id_dup = event.target.getAttribute("data-crs-dup");
  document.getElementById("crs-url").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("crs-rename").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("crs-duplicate").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("move-crs-popup").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("dup-move-crs-popup").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("crs-preview").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("click-export").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("change-style").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("crs-props").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("crs-menu").setAttribute("data-crs-dup", crs_id_dup);
  document.getElementById("crs-update-link").setAttribute("data-crs-dup", crs_id_dup);
  if(crs_id_dup == 1) 
  {
	
	// document.getElementById("crs-url").style.display = "none";
	// document.getElementById("crs-del").style.display = "none";
	// document. getElementsByClassName("card-ctx-btn").style.display = "none";
	// document.getElementById("crs-url").classList.add("not-activated");
	// document.getElementById("crs-del").classList.add("not-activated");
	// document.getElementById("crs-duplicate").classList.add("not-activated");
	// document.getElementById("move-crs-popup").classList.add("not-activated");
	// document.getElementById("dup-move-crs-popup").classList.add("not-activated");
	// document.getElementById("crs-preview").classList.add("not-activated");
	// document.getElementById("click-export").classList.add("not-activated");
	// document.getElementById("crs-rename").classList.add("not-activated");
	// document.getElementById("change-style").classList.add("not-activated");
	// document.getElementById("crs-props").classList.add("not-activated");
	
	
	// document.getElementsByClassName("edit-course-click").disabled = true;
	// document.getElementsByClassName("edit-course-click").removeEventListener("click"); 
	// document.getElementByClassName("context-menu-container").removeAttribute("onclick");
	//document.getElementById("crs_duplicate").style.display = "block";
  }
  else {
	// document.getElementById("crs-url").style.display = "block";
	// document.getElementById("crs-del").style.display = "block";
	//document. getElementsByClassName("card-ctx-btn").style.display = "block";
	//document.getElementById("crs_duplicate").style.display = "block";
	
	// document.getElementByClassName("course-rename").classList.remove("not-activated");

	// document.getElementById("crs-url").classList.add("edit-course-click");
	// document.getElementByClassName("context-menu-container").addAttribute("onclick");
  }
  

  
  var framework = event.target.getAttribute("data-framework");
	document.getElementById("change-style-btn").setAttribute("data-framework", framework);

  var display = event.target.getAttribute("data-display");
  if(display && display != 'desktop'){
    document.querySelector('.mobile-orientation').classList.add('show');
  }
  document.querySelector('#change-style').setAttribute('data-display', display);
  
  /*document.querySelector('#change-style-popup .device-mobile').click();
  document.querySelector('#change-style-popup .device-desktop').click();
  document.querySelector('#change-style-popup .device-full-responsive').click();*/
  removeDeviceFilters();
  
  var query = '#change-style-popup .course-device.' + display;
  console.log('dis',display);
  console.log('query',query);
	document.querySelector(query).click();

  var parent_id = event.target.getAttribute("data-pid");
  document.getElementById("crs-duplicate").setAttribute("data-pid", parent_id);
  document.getElementById("move-crs-popup").setAttribute("data-pid", parent_id);

  var crs_name = event.target.getAttribute("data-crs-name");
  document.getElementById("crs-url").setAttribute("data-crs-name", crs_name);

  var crs_type = event.target.getAttribute("data-type");
  document.getElementById("crs-url").setAttribute("data-type", crs_type);
  showCourseCxtMenu();
	}
	else{
		// var crs_hide_menu = event.target.getAttribute("data-crs-dup");
		var crsDup = document.getElementById('crs-dup-course-popup');
		console.log(crsDup);
	    crsDup.classList.add('show-dup-course-popup');
		document.getElementById("crs-dup-course-popup").style.display = "block";
//   popup.style.display = "block";
	}

  
};

function onStyleCtxBtnClick(event){
	var tipX = event.clientX;     
	var tipY = event.clientY - 100; 
	
	var tooltip = document.getElementsByClassName("course-context-menu")[0];

  // Get calculated tooltip coordinates and size
  var tooltip_rect = tooltip.getBoundingClientRect();
  // Corrections if out of window
  if ((tipX + tooltip_rect.width) > window.innerWidth){
    tipX = tipX - tooltip_rect.width; 
	} 
  if ((tipY + tooltip_rect.height) > window.innerHeight){       
    tipY = tipY - 200; 
	}   
  // Apply corrected position
  tooltip.style.top = tipY + 'px';
  tooltip.style.left = tipX + 'px';

  var crs_id = event.target.getAttribute("data-crs");
  document.getElementById("crs-url").setAttribute("data-crs", crs_id);
  var crs_name = event.target.getAttribute("data-crs-name");
  document.getElementById("crs-url").setAttribute("data-crs-name", crs_name);
	var crs_type = event.target.getAttribute("data-type");
  document.getElementById("crs-url").setAttribute("data-type", crs_type);
  showCourseCxtMenu();
}

function onFolderCtxBtnClick(event) {
	event.stopPropagation();
	var tipX = event.clientX;     
	var tipY = event.clientY - 100; 
	
	var tooltip = document.getElementsByClassName("folder-context-menu")[0];

  // Get calculated tooltip coordinates and size
  var tooltip_rect = tooltip.getBoundingClientRect();
  // Corrections if out of window
  if ((tipX + tooltip_rect.width) > window.innerWidth){
    tipX = tipX - tooltip_rect.width; 
	} 
  if ((tipY + tooltip_rect.height) > window.innerHeight){       
    tipY = tipY - 50; 
	}   
  // Apply corrected position
  tooltip.style.top = tipY + 'px';
  tooltip.style.left = tipX + 'px';
 
  var crs_id = event.target.getAttribute("data-crs");
  document.getElementById("crs-url").setAttribute("data-crs", crs_id);
  var crs_name = event.target.getAttribute("data-crs-name");
  document.getElementById("crs-url").setAttribute("data-crs-name", crs_name);
  var crs_type = event.target.getAttribute("data-type");
  document.getElementById("crs-url").setAttribute("data-type", crs_type);
  showFolderCxtMenu();
}


function onDltBtnClick(event){
	var dltCrsPopup = document.getElementById('delete-course-popup');
	dltCrsPopup.classList.add('show-course-popup');
}

function onDeleteCategory(event){
  var dltFolderPopup = document.getElementById('delete-folder-popup');
  dltFolderPopup.classList.add('show-folder-popup'); 	
}

function onDeleteStyleFolder(event){
  var dltFolderPopup = document.getElementById('delete-style-folder-popup');
  dltFolderPopup.classList.add('show-folder-popup'); 	
}
function demo(event){
	//alert('hi');
	//event.preventDefault();
	document.getElementById("crs-dup-course-popup").style.display = "none";
}
function demo1(event){
	//alert('hi');
	//event.preventDefault();
	document.getElementById("crs-dup-course-popup1").style.display = "none";
}
function onStyleDltBtnClick(event){
	var dltStlPopup = document.getElementById('delete-style-popup');
	dltStlPopup.classList.add('show-style-popup');
}

function onDltCancel(event){
	var dltCrsPopup = document.getElementById('delete-course-popup');
	dltCrsPopup.classList.remove('show-course-popup');
}

function onDltFolderCancel(event){
	var dltFolderPopup = document.getElementById('delete-folder-popup');
	dltFolderPopup.classList.remove('show-folder-popup');
}

function onDltStyleFolderCancel(event){
	var dltFolderPopup = document.getElementById('delete-style-folder-popup');
	dltFolderPopup.classList.remove('show-folder-popup');
}

function onStyleDltCancel(event){
	var dltStlPopup = document.getElementById('delete-style-popup');
	dltStlPopup.classList.remove('show-style-popup');
}

function onDomainDltCancel(event){
	var dltDomainPopup = document.getElementById('delete-domain-cnf-popup');
	dltDomainPopup.classList.remove('show-domain-popup');
}

function onDomainNoDltCancel(event){
	var dltNoDomainPopup = document.getElementById('not-delete-domain-popup');
	dltNoDomainPopup.classList.remove('show-domain-popup');
}

function onCtxMenuClick(event) {
	if(event.target.className.indexOf('not-activated') == -1){
		hideCtxMenus();
		//removeDeviceFilters();
	}
}

function showCourseCxtMenu() {  
  const ctxContainer = document.getElementsByClassName(
    "context-menu-container"
  )[0];

  ctxContainer.classList.add("course-context-menu-container");
  

}

function showFolderCxtMenu() {  
  const ctxContainer = document.getElementsByClassName(
    "context-menu-container"
  )[0];

  ctxContainer.classList.add("folder-context-menu-container");
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
	if (ctxContainer.classList.contains("folder-context-menu-container"))
    ctxContainer.classList.remove("folder-context-menu-container");
}

function createDomainTree() {
  const domainsTreeContainer = document.getElementById(
    "domainsTreeContainer"
  );
  const domain_folders = domains[0].children;
console.log('df',domains);
  const tree = createTree(domain_folders, "domains-tree");
console.log('tree',tree);
  domainsTreeContainer.appendChild(tree);
}

function createStylesTree() {
  const stylesTreeContainer = document.getElementById(
    "stylesTreeContainer"
  );
	const domain_folders = domains[0].children;
	console.log('sytles',domains);
  const tree = createTree(domains, "styles-tree");

  stylesTreeContainer.appendChild(tree);
}

function createStyleTree() {
	const stylesTreeContainer = document.getElementsByClassName(
    "styles-tree-container"
  );
	console.log('style-tree',styles);
	console.log('stylestreecontainer',stylesTreeContainer);
	const tree = createSTree(styles, "styles-tree");
	const changeStyleTree = createSTree(styles, "change-styles-tree", "change-styles-tree");
	const importCrsStyleTree = createSTree(styles, "import-crs-styles-tree", "import-crs-styles-tree");
	for (let i = 0; i < stylesTreeContainer.length; i++) {
		if(stylesTreeContainer[i].id == 'changeStyleTreeContainer'){
			stylesTreeContainer[i].appendChild(changeStyleTree);
		}
		else if(stylesTreeContainer[i].id == 'importCourseStyleTree'){
			stylesTreeContainer[i].appendChild(importCrsStyleTree);
		}
		else{
  		stylesTreeContainer[i].appendChild(tree);
  	}
  }
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
  const type = item.type;
  const uri = item.link;
  const children = item.children;
  const status = item.status;
  const curnode = item.curnode;
  const li = document.createElement("li");
  const hasChildren = children && children.length > 0;
  const parent_ids = domains['parent_ids'];
  if(status || (parent_ids && parent_ids.indexOf(id) > -1 && !curnode)){
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
	    <span class="tree-node-icon ${hasChildren}"></span>
            <span class="tree-node-title" onclick="onTreeNodeClick(event,'${uri}')">
              <span>${title}</span>
            </span>
          </span>
        </div>
        <span class="tree-node-ctx" data-nid='${id}' data-uri='${uri}' data-type='${type}' data-name='${title}' onclick="onTreeCtxMenuClick(event)"></span>
      </div>
    `;

  if (hasChildren) {
    li.appendChild(createTree(children));
  }

  return li;
}

function createSTree(arr, treeClass, parent = '') {
  const ul = document.createElement("ul");

  if(treeClass) {
    ul.classList.add("tree");
    ul.classList.add(treeClass);
  } else {
    ul.classList.add("child-tree");
    if(parent){
  		ul.classList.add(parent);
  	}
  }
  for(var i = 0; i < arr.length; i++) {
    const item = arr[i];
    ul.appendChild(createStyleTreeNode(item, treeClass, parent));
  }
  return ul;
}

function createStyleTreeNode(item, treeClass, parent) {
  const id = item.id;
  const title = item.title;
  const type = item.type;
	const changedDate = item.changedDate;
	const changedTime = item.changedTime;
	const createdDate = item.createdDate;
	const createdTime = item.createdTime;
	const navigation = item.navigation;
	const framework = item.framework;
	const display = item.display;
  const children = item.children;
  const li = document.createElement("li");
  const hasChildren = children && children.length > 0;
  li.classList.add("tree-node-close");
  if (hasChildren) {
    li.classList.add("tree-node-with-children");
  } else {
    li.classList.add("tree-node-with-no-children");
  }
	var titleClick = '';
	if(type == 'style') {
		if(parent == 'import-crs-styles-tree' || treeClass == 'import-crs-styles-tree'){
			titleClick = `onclick="onImportCrsShowStyleClick(event)"`;
		}
		else if(parent == 'change-styles-tree' || treeClass == 'change-styles-tree'){
			titleClick = `onclick="onChangeShowStyleClick(event)"`;
		}
		else{
			titleClick = `onclick="onShowStyleClick(event)"`;
		}
		
		li.classList.add('style-children');
		if(display){
			li.classList.add(display);
		}
		if(navigation){
			li.classList.add(navigation);
		}
	}
	else {
		li.classList.add('style-list');
	}
	
	if(framework){
		li.setAttribute('data-framework', framework);
	}
	
	if ((hasChildren && type == 'style_folder') || type == 'style') {
  	li.innerHTML = `
      <div class="tree-node-row">
        <div class="tree-node-row-container">
          <span class="tree-node-switcher" onclick="onTreeSwitchClick(event)"></span>
          <span class="tree-node-content-wrapper">
            <span class="${display}-icon"></span>
            <span class="tree-node-title" `+titleClick+`>
              <span data-sid="${id}" data-changed-date="${changedDate}" data-changed-time="${changedTime}"
							data-created-time="${createdTime}" data-created-date="${createdDate}" data-display="${display}"
							data-navigation="${navigation}" data-title="${title}">
							${title}</span>
            </span>
          </span>
        </div>
        <span class="tree-node-ctx" data-nid='${id}' data-type='${type}' data-name='${title}' onclick="onTreeCtxMenuClick(event)"></span>
      </div>
    `;
	}
  if (hasChildren ){
    li.appendChild(createSTree(children, '', parent));
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

function onShowStyleClick(event,uri) {
console.log('event',event);
  const titleNode = event.target;
  const treeNode =
    titleNode.parentNode.parentNode.parentNode.parentNode.parentNode;
  //location.href = uri;

  var curr_nid = event.target.getAttribute('data-sid');
	var title = event.target.getAttribute('data-title');
  var display = event.target.getAttribute('data-display');
  var changed_date = event.target.getAttribute('data-changed-date');
	var changed_time = event.target.getAttribute('data-changed-time');
	var created_date = event.target.getAttribute('data-created-date');
	var created_time = event.target.getAttribute('data-created-time');
	var navigation = event.target.getAttribute('data-navigation');
	if(navigation == 'template') {
		navigation = 'editor';
	}
	var deviceType = 'full responsive';
	if(display == 'smartphone') {
		deviceType = 'only mobile';
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/smartphone_dark.png'/>";
	}
	else if(display == 'desktop') {
		deviceType = 'only computer';
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/computer_dark.png'/>";
	}
	else{
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/phonelink_dark.png'/>";
	}
	document.getElementsByClassName('course-style-display')[0].setAttribute('data-dp',display);
  document.getElementsByClassName('course-style-name')[0].innerHTML = title;
	//document.getElementsByClassName('course-style-navigation')[0].innerHTML = 'Navigation by ' +navigation;
	document.getElementsByClassName('course-style-display')[0].innerHTML = deviceType+'<span class="'+display+'-mid-icon" data-dp="'+display+'"></span>';
	document.getElementsByClassName('created-date')[0].innerHTML = created_date;
	document.getElementsByClassName('created-time')[0].innerHTML = created_time;
	document.getElementsByClassName('changed-date')[0].innerHTML = changed_date ? 'UTA - ' + changed_date : '';
	document.getElementsByClassName('changed-time')[0].innerHTML = changed_time;
	
	document.getElementsByClassName('creation')[0].innerHTML = 'Creation :';
	document.getElementsByClassName('modification')[0].innerHTML = 'Modification :';
	document.getElementsByClassName('created-from')[0].innerHTML = 'Created from :';
	document.getElementsByClassName('modified')[0].innerHTML = 'Modified :';
	document.getElementsByClassName('create-btn-toggle')[0].style.display = 'block';
	
	var img = "<img class='course-style-img' src='"+base_url +"/modules/custom/bilimauth/images/style-temp.png'/>";
  document.getElementsByClassName("image-span")[0].innerHTML = img;
  document.getElementsByClassName("course-device-icon")[0].innerHTML = device_icon;
	

  if (selectedTreeNode) {
    selectedTreeNode.classList.remove("tree-node-selected");
  }

  treeNode.classList.add("tree-node-selected");
  selectedTreeNode = treeNode;

	document.getElementById('course-create-btn').setAttribute('data-sid', curr_nid);
}

function onTreeCtxMenuClick(event) {
  var curr_nid = event.target.getAttribute('data-nid');
  var curr_type = event.target.getAttribute('data-type');
  var curr_name = event.target.getAttribute('data-name');
  var curr_uri = event.target.getAttribute('data-uri');
  
  var importStyleData = document.getElementById('import-style-data');
  if(importStyleData){
    importStyleData.setAttribute('data-id',curr_nid);
    importStyleData.setAttribute('data-type',curr_type);
    importStyleData.setAttribute('data-uri',curr_uri);
  }
  var curInfo = document.getElementById('cur-info');
  if(curInfo){
    document.getElementById('cur-info').setAttribute('data-id',curr_nid);
    document.getElementById('cur-info').setAttribute('data-type',curr_type);
    document.getElementById('cur-info').setAttribute('data-uri',curr_uri);
    document.getElementById('cur-info').setAttribute('data-name',curr_name);
  }
  document.getElementById('crs-url').setAttribute('data-crs',curr_nid);
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
  const stylesDropDownList = document.getElementById("stylesDropDownList");

  stylesDropDownList.classList.toggle("show");
	document.getElementsByClassName("course-style-drop-down-icon")[0].classList.toggle("domain-arrow-icon");
	const Container = document.getElementsByClassName("style-list");
	for(const property in Container) {
		var children = Container[property].children;
		for(child in children) {
			if(children[child].className == 'child-tree' && children[child].innerHTML.trim() == '') {
				Container[property].style.display = 'none';
			}
		}
	}
}

function onNewCourseBtnClick(event) {

  var nid = event.target.getAttribute('data-id');
  nid = nid ? nid : event.target.parentNode.getAttribute('data-id');
  var type = event.target.getAttribute('data-type');
  type = type ? type : event.target.parentNode.getAttribute('data-type');
  var class_list = event.target.classList;  
  if(class_list.contains('add-course-btn') || event.target.parentNode.classList.contains('add-course-btn')){	
  	document.getElementById('cur-info').setAttribute('data-id', nid);
  	document.getElementById('cur-info').setAttribute('data-type', type);
}	
  toggleNewCoursePopup();	
	navigationSelection(event);
	//defaultSelectStyle();
}

function onPopupClose(event) {
  toggleNewCoursePopup();
	removeFilter('.new-course-popup');
	//deviceSelectionText();
}

function onImportCourseBtnClick(event){
	 toggleImportCoursePopup();
}

function onImportPopupClose(event) {
  toggleImportCoursePopup();
}

function onStylePopupClose(event) {
  const popupContainer = document.getElementById("style-properties-container");
  popupContainer.classList.toggle("show");
}

function onCrsPopupClose(event) {
  const popupContainer = document.getElementById("crs-properties-container");
  popupContainer.classList.toggle("show");
}

function removeFilter(parent = '') {
	var isChecked = document.getElementById("navigation-type-selection").checked;
	var navigation = 'style';
	if(isChecked) {
		navigation = 'template';
	}
	var desktop = null;
	var mobile = null;
	var fullResponsive = null;
	console.log('parent', parent);
	if(document.querySelector(parent + " .device-desktop").classList.contains('active')){
		desktop = 'active';
	}
	if(document.querySelector(parent + " .device-mobile").classList.contains('active')){
		mobile = 'active';
	}
	if(document.querySelector(parent + " .device-full-responsive").classList.contains('active')){
		fullResponsive = 'active';
	}
	
	if(desktop != 'active'){
		document.querySelector(parent + ' .device-desktop').click();
	}
	if(mobile != 'active'){
		document.querySelector(parent + ' .device-mobile').click();
	}
	if(fullResponsive != 'active'){
		document.querySelector(parent + ' .device-full-responsive').click();
	}
	/*if(navigation == 'template') {
		document.querySelector('.navigation-selection').click();
	}*/

	document.getElementsByClassName('course-name-txt')[0].value = '';
	document.getElementsByClassName('course-style-name')[0].innerHTML = '';
	//document.getElementsByClassName('course-style-navigation')[0].innerHTML = '';
	document.getElementsByClassName('course-style-display')[0].innerHTML = '';
	document.getElementsByClassName('created-date')[0].innerHTML = '';
	document.getElementsByClassName('created-time')[0].innerHTML = '';
	document.getElementsByClassName('changed-date')[0].innerHTML = '';
	document.getElementsByClassName('changed-time')[0].innerHTML = '';
	
	document.getElementsByClassName('creation')[0].innerHTML = '';
	document.getElementsByClassName('modification')[0].innerHTML = '';
	document.getElementsByClassName('created-from')[0].innerHTML = '';
	document.getElementsByClassName('modified')[0].innerHTML = '';
	document.getElementsByClassName('create-btn-toggle')[0].style.display = 'none';
	
  document.getElementsByClassName("image-span")[0].innerHTML = '';
	document.getElementsByClassName("course-device-icon")[0].innerHTML = '';
	
	const stylesDropDownList = document.getElementById("stylesDropDownList");
	if(!stylesDropDownList.classList.contains('show')) {
	  stylesDropDownList.classList.toggle("show");
		document.getElementsByClassName("course-style-drop-down-icon")[0].classList.toggle("domain-arrow-icon");
	}
	const Container = document.querySelectorAll(parent + " .style-children");
	for(const property in Container) {
		if(Container[property].classList && Container[property].classList.contains('tree-node-selected')) {
			Container[property].classList.remove('tree-node-selected');
		}
	}
	
}

function toggleNewCoursePopup() {
  const popupContainer = document.getElementById("popupContainer");
  document.querySelector('#lang-select div').classList.add('show');
  document.querySelector('#selected-lang').removeAttribute('class');
  document.querySelector('#selected-lang').classList.add('hide');
  document.querySelector('.lang-select').scrollTop = 0;
  document.querySelector('.lang-select').selectedIndex = -1;
  document.querySelector('.lang-select').style.display = 'none';
  document.querySelector('.course-lang-list').style.border = 'unset';
  popupContainer.classList.toggle("show");
}

function toggleImportCoursePopup() {
  const popupContainer = document.getElementById("importPopupContainer");
  document.querySelector('#lang-select div').classList.add('show');
  document.querySelector('#selected-lang').removeAttribute('class');
  document.querySelector('#selected-lang').classList.add('hide');
  document.querySelector('.lang-select').scrollTop = 0;
  document.querySelector('.lang-select').selectedIndex = -1;
  document.querySelector('.lang-select').style.display = 'none';
  document.querySelector('.course-lang-list').style.border = 'unset';
  popupContainer.classList.toggle("show");
}

//hide/show title of style folder on add curse 
function toggleStyleFolder() {
	const listContainer = document.getElementsByClassName("style-list");
	for(const prop in listContainer) {
		var loop = listContainer[prop].children;
		for(child in loop) {
			if(loop[child].className == 'child-tree') {
				var parents = listContainer[prop].querySelectorAll(".child-tree");
			  parents.forEach(parent => {
			    if (parent.querySelectorAll(".style-children").length == parent.querySelectorAll(".style-children[style='display: none;']").length) {
			      if(parent.previousElementSibling) {
							parent.previousElementSibling.style.display = 'none';
						}
			    } 
					else {
						if(parent.previousElementSibling) {
					     parent.previousElementSibling.style.display = 'flex';
						}
			    }
			  });
			}
		}
	}
}

function defaultSelectStyle() {
	const listContainer = document.getElementsByClassName("style-children");
	for(const prop in listContainer) {
		if(listContainer[prop].style && listContainer[prop].style.display == 'block') {
			listContainer[prop].querySelector('span.tree-node-title span').click();
			break;
		}
	}
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
  location.href = base_url+'/platform/domainview/'+domain+'/'+root+'/'+cf;
}

function sub_stylefolder_view(domain,root,sf){
  location.href = base_url+'/platform/styleview/'+domain+'/'+root+'/'+sf;
}

jQuery('.sort-select').on('change', function () {
  var type = jQuery(this).val();
  if(type == 'Alphabhetical'){
	  
	jQuery('.category-card').sort(function(a, b) {
		var A = jQuery(a).find(".card-title").text().toUpperCase(); 
		var B = jQuery(b).find(".card-title").text().toUpperCase(); 
		return (A < B) ? -1 : (A > B) ? 1 : 0; 
	  }).appendTo('#courseViewContainer'); 

    jQuery('.course-card').sort(function(a, b) {
      var A = jQuery(a).find(".card-content .desc").text().toUpperCase(); 
      var B = jQuery(b).find(".card-content .desc").text().toUpperCase(); 
      return (A < B) ? -1 : (A > B) ? 1 : 0; 
    }).appendTo('#courseViewContainer'); 
	  
  } else {
	  
	jQuery('.category-card').sort(function(a, b) {
		var A = jQuery(a).data("changed"); 
		var B = jQuery(b).data("changed"); 
		//return (A < B) ? -1 : (A > B) ? 1 : 0; 
		return A > B ? -1 : 1;
	  }).appendTo('#courseViewContainer'); 

	jQuery('.course-card').sort(function(a, b) {
		var A = jQuery(a).data("changed"); 
		var B = jQuery(b).data("changed"); 
		//return (A < B) ? -1 : (A > B) ? 1 : 0; 
		return A > B ? -1 : 1;
	  }).appendTo('#courseViewContainer'); 
	
  }
});

function onStyleImportBtnClick(event) {
  //toggleImportStylePopup();
  var nid = event.target.getAttribute('data-id');
  var type = event.target.getAttribute('data-type');
  var class_list = event.target.classList;  
  if(class_list.contains('import-style-btn')){
    document.getElementById('import-style-data').setAttribute('data-id', nid);
    document.getElementById('import-style-data').setAttribute('data-type', type);
  }
  jQuery('#style-file').click();
  
}

function onStyleUpdateBtnClick(event) {
  jQuery('#update-style-file').click();
}

function toggleImportStylePopup() {
  const popupContainer = document.getElementById("style-import-container");
  popupContainer.classList.toggle("show");
}


function onAddStyleFolder(event){
	var addSfPopup = document.getElementById('create-sf-popup');
	addSfPopup.classList.add('show-sf-create-popup');
		console.log('e',event.target);
	var nid = event.target.getAttribute('data-id');
	nid = nid ? nid : event.target.parentNode.getAttribute('data-id');
  	var type = event.target.getAttribute('data-type');
   	type = type ? type : event.target.parentNode.getAttribute('data-type');
  	var class_list = event.target.classList;
 
  if(class_list.contains('add-folder-btn') || event.target.parentNode.classList.contains('add-folder-btn')){
    document.getElementById('import-style-data').setAttribute('data-id', nid);
    document.getElementById('import-style-data').setAttribute('data-type', type);
  }
}

function deviceSelectionText() {
	var desktop = null;
	var fullResponsive = null;
	var mobile = null;
	if(document.getElementsByClassName("device-desktop")[0].classList.contains('active')){
		desktop = 'active';
	}
	if(document.getElementsByClassName("device-full-responsive")[0].classList.contains('active')){
		fullResponsive = 'active';
	}
	if(document.getElementsByClassName("device-mobile")[0].classList.contains('active')){
		mobile = 'active';
	}
	if(mobile && desktop && fullResponsive) {
		document.getElementsByClassName('device-display-disc')[0].innerHTML = 'All';
	}
	else if(mobile && desktop) {
		document.getElementsByClassName('device-display-disc')[0].innerHTML = 'Only mobile and only computer';
	}
	else if(mobile && fullResponsive) {
		document.getElementsByClassName('device-display-disc')[0].innerHTML = 'Only mobile and full responsive';
	}
	else if(desktop && fullResponsive) {
		document.getElementsByClassName('device-display-disc')[0].innerHTML = 'Only computer and full responsive';
	}
	else if(mobile) {
		document.getElementsByClassName('device-display-disc')[0].innerHTML = 'Only mobile';
	}
	else if(desktop) {
		document.getElementsByClassName('device-display-disc')[0].innerHTML = 'Only computer';
	}
	else if(fullResponsive) {
		document.getElementsByClassName('device-display-disc')[0].innerHTML = 'full Responsive';
	}
}

function mobileFilter(event, parent = '', framework = '') {
	var desktop = null;
	var fullResponsive = null;
	if(document.querySelector(parent + " .device-desktop").classList.contains('active')){
		desktop = 'active';
	}
	if(document.querySelector(parent + " .device-full-responsive").classList.contains('active')){
		fullResponsive = 'active';
	}
	var isChecked = document.querySelector(parent + " #navigation-type-selection").checked;
	var navigation = 'style';
	/*if(isChecked) {
		navigation = 'template';
	}*/
	console.log('framework',framework);
	const Container = document.querySelectorAll(parent + " .style-children");
	if(event.target.classList.contains("active")) {
		
		if(!desktop && !fullResponsive) {
			if(parent != '#change-style-popup'){
				alert('Atleast one device should be selected');
			}
		}
		else {
			event.target.classList.remove("active");
			if(event.target.firstElementChild){
				event.target.firstElementChild.classList.remove('show');
			}
			for (const property in Container) {
				if(Container[property].classList) {
			
				/*if(Container[property].classList.contains(navigation)) {
					Container[property].style.display = "block";
				}
				else {
					Container[property].style.display = "none";
				}*/
			
			
					if (Container[property].classList.contains('smartphone')) {
						Container[property].style.display = "none";
					}
					else if(Container[property].classList.contains('desktop')) {
						if(desktop == 'active'){
							Container[property].style.display = "block";
						}
						else{
							Container[property].style.display = "none";
						}
					}
					else{
						if(fullResponsive == 'active'){
							Container[property].style.display = "block";
						}
						else{
							Container[property].style.display = "none";
						}
					}
				}
			}
		}
	}
	else {
		event.target.classList.add("active");
		if(event.target.firstElementChild){
			event.target.firstElementChild.classList.add('show');
		}
		
		for (const property in Container) {
			if(Container[property].classList) {
				var framework_li = Container[property].getAttribute('data-framework');
				if (Container[property].classList.contains('smartphone')) {
					if(compareVersion(framework_li, framework) > -1) {
						Container[property].style.display = "block";
					}
					else {
						Container[property].style.display = "none";
					}
				}
				else if(Container[property].classList.contains('desktop')) {
					if(desktop == 'active' && compareVersion(framework_li, framework) > -1){
						Container[property].style.display = "block";
					}
					else{
						Container[property].style.display = "none";
					}
				}
				else{
					if(fullResponsive == 'active' && compareVersion(framework_li, framework) > -1){
						Container[property].style.display = "block";
					}
					else{
						Container[property].style.display = "none";
					}
				}
				
			}
		}
	}
	
	toggleStyleFolder();
	//deviceSelectionText();
}

function desktopFilter(event, parent = '', framework = '') {
	var mobile = null;
	var fullResponsive = null;
	if(document.querySelector(parent + " .device-mobile").classList.contains('active')){
		mobile = 'active';
	}
	if(document.querySelector(parent + " .device-full-responsive").classList.contains('active')){
		fullResponsive = 'active';
	}
	var isChecked = document.querySelector(parent + " #navigation-type-selection").checked;
	var navigation = 'style';
	/*if(isChecked) {
		navigation = 'template';
	}*/
	console.log('framework',framework);
	const Container = document.querySelectorAll(parent + " .style-children");
	if(event.target.classList.contains("active")) {
		
		if(!mobile && !fullResponsive) {
			if(parent != '#change-style-popup'){
				alert('Atleast one device should be selected');
			}
		}
		else {
			event.target.classList.remove("active");
			if(event.target.firstElementChild){
				event.target.firstElementChild.classList.remove('show');
			}			
			for (const property in Container) {
				if(Container[property].classList) {
					if (Container[property].classList.contains('desktop')) {
						Container[property].style.display = "none";
					}
					else if(Container[property].classList.contains('smartphone')) {
						if(mobile == 'active'){
							Container[property].style.display = "block";
						}
						else{
							Container[property].style.display = "none";
						}
					}
					else{
						if(fullResponsive == 'active'){
							Container[property].style.display = "block";
						}
						else{
							Container[property].style.display = "none";
						}
					}
				}
			}
		}
	}
	else {
		event.target.classList.add("active");
		if(event.target.firstElementChild){
			event.target.firstElementChild.classList.add('show');
		}
		for (const property in Container) {
			if(Container[property].classList) {
				var framework_li = Container[property].getAttribute('data-framework');
				if (Container[property].classList.contains('desktop')) {
					if(compareVersion(framework_li, framework) > -1) {
						Container[property].style.display = "block";
					}
					else {
						Container[property].style.display = "none";
					}
				}
				else if(Container[property].classList.contains('smartphone')) {
					if(mobile == 'active' && compareVersion(framework_li, framework) > -1){
						Container[property].style.display = "block";
					}
					else{
						Container[property].style.display = "none";
					}
				}
				else{
					if(fullResponsive == 'active' && compareVersion(framework_li, framework) > -1){
						Container[property].style.display = "block";
					}
					else{
						Container[property].style.display = "none";
					}
				}
			}
		}
	}
	toggleStyleFolder();	
	//deviceSelectionText();
}

function fullFilter(event, parent = '', framework = '') {
	var desktop = null;
	var mobile = null;
	if(document.querySelector(parent + " .device-desktop").classList.contains('active')){
		desktop = 'active';
	}
	if(document.querySelector(parent + " .device-mobile").classList.contains('active')){
		mobile = 'active';
	}
	
	var isChecked = document.querySelector(parent + " #navigation-type-selection").checked;
	var navigation = 'style';
	/*if(isChecked) {
		navigation = 'template';
	}*/
	console.log('framework',framework);
	const Container = document.querySelectorAll(parent + " .style-children");
console.log('container',Container);
	if(event.target.classList.contains("active")) {
		
		if(!desktop && !mobile) {
			if(parent != '#change-style-popup'){
				alert('Atleast one device should be selected');
			}
		}
		else {
			event.target.classList.remove("active");
			if(event.target.firstElementChild){
				event.target.firstElementChild.classList.remove('show');
			}
			
			for (const property in Container) {
				if(Container[property].classList) {
					if (Container[property].classList.contains('fullresponsive')) {
						Container[property].style.display = "none";
					}
					else if(Container[property].classList.contains('desktop')) {
						if(desktop == 'active'){
							Container[property].style.display = "block";
						}
						else{
							Container[property].style.display = "none";
						}
					}
					else{
						if(mobile == 'active'){
							Container[property].style.display = "block";
						}
						else{
							Container[property].style.display = "none";
						}
					}
				}
			}
		}
	}
	else {
		event.target.classList.add("active");
		if(event.target.firstElementChild){
			event.target.firstElementChild.classList.add('show');
		}
		for (const property in Container) {
			if(Container[property].classList) {
				var framework_li = Container[property].getAttribute('data-framework');
				if (Container[property].classList.contains('fullresponsive')) {
					if(compareVersion(framework_li, framework) > -1) {
						Container[property].style.display = "block";
					}
					else {
						Container[property].style.display = "none";
					}
				}
				else if(Container[property].classList.contains('desktop')) {
					if(desktop == 'active' && compareVersion(framework_li, framework) > -1){
						Container[property].style.display = "block";
					}
					else{
						Container[property].style.display = "none";
					}
				}
				else{
					if(mobile == 'active' && compareVersion(framework_li, framework) > -1){
						Container[property].style.display = "block";
					}
					else{
						Container[property].style.display = "none";
					}
				}
			}
		}
	}
	toggleStyleFolder();
	//deviceSelectionText();
}


function navigationSelection(event) {
	var isChecked = document.getElementById("navigation-type-selection").checked;
	var navigation = 'style';
	/*if(isChecked) {
		navigation = 'template';
	}*/  
	var desktop = null;
	var mobile = null;
	var fullResponsive = null;
	if(document.getElementsByClassName("device-desktop")[0].classList.contains('active')){
		desktop = 'active';
	}
	if(document.getElementsByClassName("device-mobile")[0].classList.contains('active')){
		mobile = 'active';
	}
	if(document.getElementsByClassName("device-full-responsive")[0].classList.contains('active')){
		fullResponsive = 'active';
	}
	
	const Container = document.getElementsByClassName("style-children");
	for (const property in Container) {
		if(Container[property].classList) {
			if(!mobile && !desktop && !fullResponsive) {
				//if(Container[property].classList.contains(navigation)) {
					Container[property].style.display = "block";
				/*}
				else {
					Container[property].style.display = "none";
				}*/
			}
			else {
console.log('navigation',navigation);
console.log('classList',Container[property]);
				if(Container[property].classList.contains('smartphone')) {
					if(mobile == 'active') {
						Container[property].style.display = "block";
					}
					else {
						Container[property].style.display = "none";
					}
				}
				else if(Container[property].classList.contains('desktop')) {
					if(desktop == 'active') {
						Container[property].style.display = "block";
					}
					else {
						Container[property].style.display = "none";
					}
				}
				else if(Container[property].classList.contains('fullresponsive')) {
					if(fullResponsive == 'active') {
						Container[property].style.display = "block";
					}
					else {
						Container[property].style.display = "none";
					}
				}
			}
		}	
	}
	toggleStyleFolder();	
}

function openRenamePopup(event){
	if(event.target.classList == 'course-rename') {
		var crsName = document.getElementById('crs-url').getAttribute('data-crs-name');
		var id = document.getElementById('crs-url').getAttribute('data-crs');
		var type = document.getElementById('crs-url').getAttribute('data-type');
		if(type == 'course')
		{
			document.getElementsByClassName('rename-title')[0].innerHTML = 'Rename Course';
		}
		else if(type == 'style') {
			document.getElementsByClassName('rename-title')[0].innerHTML = 'Rename Style';
		}
		else if(type == 'content_folder')  {
			document.getElementsByClassName('rename-title')[0].innerHTML = 'Rename Folder';
		}
	}
	else if(event.target.classList == 'folder-rename') {
		var crsName = document.getElementById('cur-info').getAttribute('data-name');
		var id = document.getElementById('cur-info').getAttribute('data-id');
		document.getElementsByClassName('rename-title')[0].innerHTML = 'Rename Folder';
		
	}
	document.getElementById('rename-folder-course').value = crsName;
	document.getElementById('course-rename-lbl-btn').setAttribute('data-nid',id);
	
	var renameCrsPopup = document.getElementById('rename-course-popup');
	renameCrsPopup.classList.add('show-course-rename-popup');
}

function hideRenamePopup(event){
	var renameCrsPopup = document.getElementById('rename-course-popup');
	renameCrsPopup.classList.remove('show-course-rename-popup');
}

function onAddFolderClick(event) {
	var createCrsPopup = document.getElementById('create-course-popup');
	createCrsPopup.classList.add('show-course-create-popup');

	var nid = event.target.getAttribute('data-id');
	nid = nid ? nid : event.target.parentNode.getAttribute('data-id');
  	var type = event.target.getAttribute('data-type');
   	type = type ? type : event.target.parentNode.getAttribute('data-type');
	var class_list = event.target.classList;  
        if(class_list.contains('add-folder-btn') || event.target.parentNode.classList.contains('add-folder-btn')){
	  document.getElementById('cur-info').setAttribute('data-id', nid);
	  document.getElementById('cur-info').setAttribute('data-type', type);
	}

}

function hideAddFolderPopup(event){
	var createCrsPopup = document.getElementById('create-course-popup');
	createCrsPopup.classList.remove('show-course-create-popup');
}

function hideAddStyleFolderPopup(event){
	var createCrsPopup = document.getElementById('create-sf-popup');
	createCrsPopup.classList.remove('show-sf-create-popup');
}

/* start domain list events */
/*function createDomainList() {
  const domainList = document.getElementById("domainList");

  for (var i = 0; i < domains.length; i++) {
    const domain = domains[i];
    const item = createDomainItem(domain);

    domainList.appendChild(item);
  }
}*/


function createDomainList() {
  const domainList = document.getElementById("domainList");
	var key;
	for (key in domains) {
    const domain = domains[key];
    const item = createDomainItem(domain, key);
console.log('item',item);
    if(typeof(domainList) != 'undefined' && domainList){
	  if(domain != 'Tests' && domain != 'Modeles'){
 	    domainList.appendChild(item);
	   }
    }
  }
}

function createDomainItem(domain,id) {
  const li = document.createElement("li");

  li.innerHTML = `
    <div class="domain-list-row">
      <span>${domain}</span>
      <div class="domain-btn-box">
        <button class="domain-edit-btn" data-id="${id}" onclick="onEditDomainBtnClick(event)"></button>
        <button class="domain-delete-btn" id="${id}" onclick="onCheckDomainBtnClick(event)"></button>
      </div>
    </div>`;

  return li;
}

function onCheckDomainBtnClick(event) {
	var d_id = event.target.id;
	var url = base_url + '/check-domain';
	var loader = document.getElementsByClassName('loading-gif')[0];
	loader.style.display = 'block';
	var data = {
		d_id: d_id
	};
	var xmlhttp = new XMLHttpRequest(); 
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.responseType = 'json';
	xmlhttp.send(JSON.stringify(data));
	xmlhttp.onload = function(e) {
	  if (this.status == 200) {
		 loader.style.display = 'none'; 
	    if(this.response.result == 'OK'){
			console.log('res',this.response.result);
			var domainCnfPopup = document.getElementById('delete-domain-cnf-popup');
			domainCnfPopup.classList.toggle('show-domain-popup');
            domainCnfPopup.setAttribute('data-did',d_id);	
		}
		else{
			console.log('res',this.response.result);
			var notDltDomain = document.getElementById('not-delete-domain-popup');
			notDltDomain.classList.toggle('show-domain-popup');
		}
	  }
		
	};
}


function onNewDomainBtnClick(event) {
  const domainPopup = document.getElementById("domainPopup");
  if (domainPopup.classList.contains("edit-domain")) {
    domainPopup.classList.remove("edit-domain");
  }
  if (!domainPopup.classList.contains("new-domain")) {
    domainPopup.classList.add("new-domain");
  }
	document.getElementById('domain-name-input').value = '';
  toggleDomainPopup();
}

function onEditDomainBtnClick(event) {
  const domainPopup = document.getElementById("domainPopup");
  if (domainPopup.classList.contains("new-domain")) {
    domainPopup.classList.remove("new-domain");
  }
  if (!domainPopup.classList.contains("edit-domain")) {
    domainPopup.classList.add("edit-domain");
  }

	var domain_id = event.target.getAttribute('data-id');
	document.getElementById('domainPopup').setAttribute('data-id',domain_id);
	var domain_name = event.target.parentElement.previousElementSibling.innerText;
	document.querySelector('#domainPopup .domain-name-txt').value = domain_name;
  toggleDomainPopup();
}

function onDomainPopupClose(event) {
  toggleDomainPopup();
}

function toggleDomainPopup() {
  const popupContainer = document.getElementById("popupContainer");
  popupContainer.classList.toggle("show");
}

function onClickMoveCrs(event){
  const domainsTreeContainer = document.getElementById(
    "move-crs-inner-container"
  );
  
  console.log('domain_tree',domain_tree);

  var treeElement = document.querySelector('#move-crs-inner-container ul.domains-tree');
  if(typeof(treeElement) == 'undefined' || treeElement == null){
    const domain_folders = domain_tree[0];
    const tree = createMoveCrsTree(domain_folders, "domains-tree");
    domainsTreeContainer.appendChild(tree);
  }
  const popupContainer = document.getElementById("move-crs-container");
  popupContainer.classList.toggle("show");
}

function onMoveCrsPopupClose(event,success) {
  const popupContainer = event.target.closest(".move-crs-container");
  popupContainer.classList.toggle("show");
  if(success){
    location.reload();
  }
}

function createMoveCrsTree(arr, treeClass) {
  const ul = document.createElement("ul");

  if(treeClass) {
    ul.classList.add("tree");
    ul.classList.add(treeClass);
    ul.classList.add("custom-scrollbar");
  } else {
    ul.classList.add("child-tree");
  }
  for(var i = 0; i < arr.length; i++) {
    const item = arr[i];
    ul.appendChild(createMoveCrsTreeNode(item));
  }
  return ul;
}

function createMoveCrsTreeNode(item) {
  const id = item.id;
  const domain_root = item.domain_root;
  const title = item.title;
  const type = item.type;
  const uri = item.link;
  const children = item.children;
  const status = item.status;
  const curnode = item.curnode;
  const li = document.createElement("li");
  const hasChildren = children && children.length > 0;
  const parent_ids = domain_tree['parent_ids'];
  if(status || (parent_ids && parent_ids.indexOf(id) > -1 && !curnode)){
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
	    <span class="tree-node-icon ${hasChildren}"></span>
            <span class="tree-node-title">
              <span>${title}</span>
            </span>
          </span>
        </div>
        <span id="move-crs" class="tree-node-ctx" data-nid='${id}' data-uri="${uri}" data-root='${domain_root}' data-type='${type}' data-name='${title}' onclick="onMoveCrsBtnClick(event)"></span>
      </div>
    `;

  if (hasChildren) {
    li.appendChild(createMoveCrsTree(children));
  }

  return li;
}

function onMoveCrsBtnClick(event){
  var dest_id = event.target.getAttribute('data-nid');
  var root = event.target.getAttribute('data-root');
  var type = event.target.getAttribute('data-type');
  var uri = event.target.getAttribute('data-uri');
  var crs_id = document.getElementById('move-crs-popup').getAttribute('data-crs-id');
  var pid = parent_id;
console.log('pid',pid);
  var url = base_url + '/move-course';
  var loader = document.getElementsByClassName('loading-gif')[0];
  loader.style.display = 'block';
  var data = {
	dest_id: dest_id,
        crs_id: crs_id,
        pid: pid,
        root: root,
        type: type
  };
  var xmlhttp = new XMLHttpRequest(); 
  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.responseType = 'json';
  xmlhttp.send(JSON.stringify(data));
  xmlhttp.onload = function(e) {
    if (this.status == 200) {
      loader.style.display = 'none'; 
      if(this.response.result == 'OK'){
	console.log('res',this.response.result);
	const popupContainer = document.getElementById("move-crs-container");
  	popupContainer.classList.toggle("show");
	var successPopup = document.getElementById('move-crs-success-container');
	successPopup.classList.toggle('show');
        successPopup.setAttribute('data-uri',uri);	
      }
      else{
	console.log('res',this.response.result);
	
      }
    }
	
  };
}

function onClickGoTo(event){
  var link = document.getElementById('move-crs-success-container').getAttribute('data-uri');
  location.href = link;
}

function onClickDupMoveCrs(event){
  const domainsTreeContainer = document.getElementById(
    "dup-move-crs-inner-container"
  );
  
  console.log('domain_tree',domain_tree);
 
  var treeElement = document.querySelector('#dup-move-crs-inner-container ul.domains-tree');
  if(typeof(treeElement) == 'undefined' || treeElement == null){
    const domain_folders = domain_tree[0];
    const tree = createDupMoveCrsTree(domain_folders, "domains-tree");
    domainsTreeContainer.appendChild(tree);
  }
  const popupContainer = document.getElementById("dup-move-crs-container");
  popupContainer.classList.toggle("show");
}

function onDupMoveCrsPopupClose(event,success) {
  const popupContainer = event.target.closest(".move-crs-container");
  popupContainer.classList.toggle("show");
  if(success){
    location.reload();
  }
}

function createDupMoveCrsTree(arr, treeClass) {
  const ul = document.createElement("ul");

  if(treeClass) {
    ul.classList.add("tree");
    ul.classList.add(treeClass);
    ul.classList.add("custom-scrollbar");
  } else {
    ul.classList.add("child-tree");
  }
  for(var i = 0; i < arr.length; i++) {
    const item = arr[i];
    ul.appendChild(createDupMoveCrsTreeNode(item));
  }
  return ul;
}

function createDupMoveCrsTreeNode(item) {
  const id = item.id;
  const domain_root = item.domain_root;
  const title = item.title;
  const type = item.type;
  const uri = item.link;
  const children = item.children;
  const status = item.status;
  const curnode = item.curnode;
  const li = document.createElement("li");
  const hasChildren = children && children.length > 0;
  const parent_ids = domain_tree['parent_ids'];
  if(status || (parent_ids && parent_ids.indexOf(id) > -1 && !curnode)){
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
	    <span class="tree-node-icon ${hasChildren}"></span>
            <span class="tree-node-title">
              <span>${title}</span>
            </span>
          </span>
        </div>
        <span id="move-crs" class="tree-node-ctx" data-nid='${id}' data-uri="${uri}" data-root='${domain_root}' data-type='${type}' data-name='${title}' onclick="onDupMoveCrsBtnClick(event)"></span>
      </div>
    `;

  if (hasChildren) {
    li.appendChild(createDupMoveCrsTree(children));
  }

  return li;
}

function onDupMoveCrsBtnClick(event){
  var dest_id = event.target.getAttribute('data-nid');
  var root = event.target.getAttribute('data-root');
  var type = event.target.getAttribute('data-type');
  var uri = event.target.getAttribute('data-uri');
  var crs_id = document.getElementById('move-crs-popup').getAttribute('data-crs-id');
  var pid = parent_id;
console.log('pid',pid);
  var url = base_url + '/duplicate-move-course';

  document.getElementById('progress-container').classList.toggle("hide");
  document.getElementById("dup-move-crs-container").classList.toggle("show");

  var data = {
	dest_id: dest_id,
        crs_id: crs_id,
        pid: pid,
        root: root,
        type: type
  };



  var xmlhttp = new XMLHttpRequest(); 

	xmlhttp.upload.addEventListener("progress", function (evt) {
	    if (evt.lengthComputable) {
	        var percentComplete = evt.loaded / evt.total;
	        console.log(percentComplete);
		var percentage = 0;
		var on_hold = 50;

	        var timer = setInterval(function(){
	          percentage = percentage + 10;
                  if(percentage <= on_hold){
	            progress_bar_process(percentage, timer);
		  }
	        }, 1000);
	        /*$('#progressBar .progress-bar').css({
	            width: percentComplete * 100 + '%'
	        });
		if (percentComplete === 1) {
		    
	        }*/
	    }
	}, false);
	xmlhttp.addEventListener("progress", function (evt) {
	    if (evt.lengthComputable) {
	        var percentComplete = evt.loaded / evt.total;
	        console.log(percentComplete);
		var percentage = 50;

	        var timer = setInterval(function(){
	          percentage = percentage + 10;
	          progress_bar_process(percentage, timer);
	        }, 1000);

	        /*$('#progressBar .progress-bar').css({
	            width: percentComplete * 100 + '%'
	        });
		if (percentComplete === 1) {
	            $('#progress-container').addClass('hide');
	   	    $('#progress-success-container').removeClass('hide');
		    setTimeout(function(){
		      $('#progress-success-container').addClass('hide');
		    },500);
	        }*/
	    }
	}, false);

  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.responseType = 'json';
  xmlhttp.send(JSON.stringify(data));
  xmlhttp.onload = function(e) {
    if (this.status == 200) { 
      if(this.response.result == 'OK'){
	console.log('res',this.response.result);
	document.getElementById('progress-success-container').classList.toggle("hide");
	document.getElementById('progress-container').classList.add("hide");
	setTimeout(function(){
	  document.getElementById('progress-success-container').classList.toggle("hide");
	  var successPopup = document.getElementById('move-crs-success-container');
	  successPopup.classList.toggle('show');
          successPopup.setAttribute('data-uri',uri);	
	},2000);
      }
      else{
	console.log('res',this.response.result);
	
      }
    }
	
  };
}

function onExportCrsPopupClose(event,success) {
	document.querySelector('.export-web').click();
  const popupContainer = event.target.closest(".export-crs-container");
  popupContainer.classList.toggle("show");
  document.querySelector('.mobile-orientation').classList.remove('show');
  
  if(success){
    location.reload();
  }
}

function onImportCrsPopupClose(event,success) {
  const popupContainer = event.target.closest(".import-crs-container");
  popupContainer.classList.toggle("show");
  document.querySelector('.style-option').classList.remove('show');
	document.querySelector('#crs-import').classList.add('not-activated');
	document.querySelector('.import-crs-style-popup-form').style.display = 'none';
	document.querySelector('#importCourseStyleTree').classList.remove('show');
	document.querySelector('#import-file').value = "";
	document.querySelector('#import-crs-popup .style-option').classList.remove('show');
	document.querySelector('#oldStyle').checked = true;
	
	document.querySelectorAll('li.tree-node-with-no-children.tree-node-selected').forEach(function(item, index){
		item.classList.remove('tree-node-selected');
	});
	
	document.querySelectorAll('li.tree-node-with-children.tree-node-open').forEach(function(item, index){
		item.classList.remove('tree-node-open');
		item.classList.add('tree-node-close');
	});
  
  if(success){
    location.reload();
  }
}

function progress_bar_process(percentage, timer)
{
  document.querySelector('#progressBar .progress-bar').style.width = percentage + '%';
  if(percentage > 100)
  {
    clearInterval(timer);
    
    document.querySelector('#progressBar .progress-bar').style.width = '0%';
    document.querySelector('#progress-container').classList.add('hide');	
  }
}

function onChangeStyle(event) {
	var stylePopup = document.querySelector('#change-style-popup');
	stylePopup.classList.toggle('show');
	var display = event.target.getAttribute('data-display');
	console.log('event',event.target);
	var deviceFilters = document.querySelectorAll('#change-style-popup .course-device');
	for (let x = 0; x < deviceFilters.length; x++) {
		if(deviceFilters[x].classList.contains(display)){
			deviceFilters[x].classList.add('active');
			deviceFilters[x].querySelector('span').classList.add('show');
		}
	}
}

function onChangeStylePopupClose(event) {
  const popupContainer = document.getElementById("change-style-popup");
	popupContainer.classList.toggle("show");
	var deviceFilters = document.querySelectorAll('#change-style-popup .course-device');
	var count = document.querySelectorAll('#change-style-popup .course-device.active').length;
	for (let x = 0; x < deviceFilters.length; x++) {
		if(count > 1){
			deviceFilters[x].click();
		}
		deviceFilters[x].classList.remove('active');
		deviceFilters[x].querySelector('span').classList.remove('show');
	}
	document.querySelector('#change-style-popup .change-style-popup-form').style.display = 'none';
	//removeFilter('#change-style-popup');
}

function removeDeviceFilters(){
	var deviceFilters = document.querySelectorAll('#change-style-popup .course-device');
	var count = document.querySelectorAll('#change-style-popup .course-device.active').length;
	for (let x = 0; x < deviceFilters.length; x++) {
		if(count > 1){
			deviceFilters[x].classList.remove('active');
			deviceFilters[x].querySelector('span').classList.remove('show');
		}
	}	
	document.querySelectorAll('li.tree-node-with-no-children.tree-node-selected').forEach(function(item, index){
		item.classList.remove('tree-node-selected');
	});
	
	document.querySelectorAll('li.tree-node-with-children.tree-node-open').forEach(function(item, index){
		item.classList.remove('tree-node-open');
		item.classList.add('tree-node-close');
	});
}

function onChangeShowStyleClick(event,uri) {

	document.querySelector('#change-style-popup .change-style-popup-form').style.display = 'block';
  const titleNode = event.target;
  const treeNode =
    titleNode.parentNode.parentNode.parentNode.parentNode.parentNode;
  //location.href = uri;

  var curr_nid = event.target.getAttribute('data-sid');
	var title = event.target.getAttribute('data-title');
  var display = event.target.getAttribute('data-display');
  var framework = event.target.getAttribute('data-framework');
  var changed_date = event.target.getAttribute('data-changed-date');
	var changed_time = event.target.getAttribute('data-changed-time');
	var created_date = event.target.getAttribute('data-created-date');
	var created_time = event.target.getAttribute('data-created-time');
	var navigation = event.target.getAttribute('data-navigation');
	if(navigation == 'template') {
		navigation = 'editor';
	}
	var deviceType = 'full responsive';
	if(display == 'smartphone') {
		deviceType = 'only mobile';
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/smartphone_dark.png'/>";
	}
	else if(display == 'desktop') {
		deviceType = 'only computer';
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/computer_dark.png'/>";
	}
	else{
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/phonelink_dark.png'/>";
	}
	var changeStyleElement = document.getElementById('change-style-popup');

	changeStyleElement.getElementsByClassName('course-style-display')[0].setAttribute('data-dp',display);
  changeStyleElement.getElementsByClassName('course-style-name')[0].innerHTML = title;
	//document.getElementsByClassName('course-style-navigation')[0].innerHTML = 'Navigation by ' +navigation;
	changeStyleElement.getElementsByClassName('course-style-display')[0].innerHTML = deviceType+'<span class="'+display+'-mid-icon" data-dp="'+display+'"></span>';
	changeStyleElement.getElementsByClassName('created-date')[0].innerHTML = created_date;
	changeStyleElement.getElementsByClassName('created-time')[0].innerHTML = created_time;
	changeStyleElement.getElementsByClassName('changed-date')[0].innerHTML = changed_date ? 'UTA - ' + changed_date : '';
	changeStyleElement.getElementsByClassName('changed-time')[0].innerHTML = changed_time;
	
	changeStyleElement.getElementsByClassName('creation')[0].innerHTML = 'Creation :';
	changeStyleElement.getElementsByClassName('modification')[0].innerHTML = 'Modification :';
	changeStyleElement.getElementsByClassName('created-from')[0].innerHTML = 'Created from :';
	changeStyleElement.getElementsByClassName('modified')[0].innerHTML = 'Modified :';
	changeStyleElement.getElementsByClassName('create-btn-toggle')[0].style.display = 'block';
	
	var img = "<img class='course-style-img' src='"+base_url +"/modules/custom/bilimauth/images/style-temp.png'/>";
  changeStyleElement.getElementsByClassName("image-span")[0].innerHTML = img;
  changeStyleElement.getElementsByClassName("course-device-icon")[0].innerHTML = device_icon;
	

  if (selectedTreeNode) {
    selectedTreeNode.classList.remove("tree-node-selected");
  }

  treeNode.classList.add("tree-node-selected");
  selectedTreeNode = treeNode;

	document.getElementById('change-style-btn').setAttribute('data-sid', curr_nid);
}


function compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
		v1.pop();
    v2 = v2.split('.');
		v2.pop();
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++ i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;        
    }
    return v1.length == v2.length ? 0: (v1.length < v2.length ? -1 : 1);
}

function onImportCrsShowStyleClick(event,uri) {

	document.querySelector('#import-crs-popup .import-crs-style-popup-form').style.display = 'block';
  const titleNode = event.target;
  const treeNode =
    titleNode.parentNode.parentNode.parentNode.parentNode.parentNode;
  //location.href = uri;
  var curr_nid = event.target.getAttribute('data-sid');
	var title = event.target.getAttribute('data-title');
  var display = event.target.getAttribute('data-display');
  var framework = event.target.getAttribute('data-framework');
  var changed_date = event.target.getAttribute('data-changed-date');
	var changed_time = event.target.getAttribute('data-changed-time');
	var created_date = event.target.getAttribute('data-created-date');
	var created_time = event.target.getAttribute('data-created-time');
	var navigation = event.target.getAttribute('data-navigation');
	if(navigation == 'template') {
		navigation = 'editor';
	}
	var deviceType = 'full responsive';
	if(display == 'smartphone') {
		deviceType = 'only mobile';
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/smartphone_dark.png'/>";
	}
	else if(display == 'desktop') {
		deviceType = 'only computer';
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/computer_dark.png'/>";
	}
	else{
		var device_icon = "<img class='course-style-icon' src='"+base_url +"/modules/custom/bilimauth/images/phonelink_dark.png'/>";
	}
	var importCrsStyleElement = document.getElementById('import-crs-popup');

	importCrsStyleElement.getElementsByClassName('course-style-display')[0].setAttribute('data-dp',display);
  importCrsStyleElement.getElementsByClassName('course-style-name')[0].innerHTML = title;
	//document.getElementsByClassName('course-style-navigation')[0].innerHTML = 'Navigation by ' +navigation;
	importCrsStyleElement.getElementsByClassName('course-style-display')[0].innerHTML = deviceType+'<span class="'+display+'-mid-icon" data-dp="'+display+'"></span>';
	importCrsStyleElement.getElementsByClassName('created-date')[0].innerHTML = created_date;
	importCrsStyleElement.getElementsByClassName('created-time')[0].innerHTML = created_time;
	importCrsStyleElement.getElementsByClassName('changed-date')[0].innerHTML = changed_date ? 'UTA - ' + changed_date : '';
	importCrsStyleElement.getElementsByClassName('changed-time')[0].innerHTML = changed_time;
	
	importCrsStyleElement.getElementsByClassName('creation')[0].innerHTML = 'Creation :';
	importCrsStyleElement.getElementsByClassName('modification')[0].innerHTML = 'Modification :';
	importCrsStyleElement.getElementsByClassName('created-from')[0].innerHTML = 'Created from :';
	importCrsStyleElement.getElementsByClassName('modified')[0].innerHTML = 'Modified :';
	
	var img = "<img class='course-style-img' src='"+base_url +"/modules/custom/bilimauth/images/style-temp.png'/>";
  importCrsStyleElement.getElementsByClassName("image-span")[0].innerHTML = img;
  importCrsStyleElement.getElementsByClassName("course-device-icon")[0].innerHTML = device_icon;
	

  if (selectedTreeNode) {
    selectedTreeNode.classList.remove("tree-node-selected");
  }

  treeNode.classList.add("tree-node-selected");
  selectedTreeNode = treeNode;

	document.getElementById('crs-import').setAttribute('data-sid', curr_nid);
}


if(domainlist  != '') {
	createDomainList();
	
}
/* end domain list */
if(domainlist == '') {
createDomainTree();
}

if(domainlist == '' && styles) {
	createStyleTree();
}
//createCourseList();

(function ($, Drupal) {
	$('#style-file').on('change', function(e){
    $('.loading-gif').show();
		$('#style-submit').click();
	});
	  
	$('#style-import-form').on('submit',function(e){
		e.preventDefault();
    var nid = parseInt(document.getElementById('import-style-data').getAttribute('data-id'));
    var type = document.getElementById('import-style-data').getAttribute('data-type');

		var formData = new FormData($(this)[0]);
		var url = base_url + '/import-style';

    if(type == 'style_folder'){
      formData.append('nid', nid);
      formData.append('type','style_folder');
		}
    else if(type == 'domain_styles_root'){
      formData.append('nid', nid);
      formData.append('type','domain_styles_root');
    }
    else{
      formData.append('nid', nid);
      formData.append('type','domain');
    }

		$.ajax({
      url : url,
      type: "POST",
      data : formData,
      processData: false,
      contentType: false,
  		cache: false,
   		dataType : 'json',
			error: function(xhr, status, error) {
				console.log('error',error);		
				$('.loading-gif').hide();
			  var err = xhr.responseText;
			  console.log('err',err);
			  //alert(err.error);
			},
      success:function(response){
      console.log('res',response);
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
          location.reload();
          console.log(response.final_path);
  				}
        else{
					$('#style-import-form')[0].reset();
					setTimeout(function(){
						alert(JSON.stringify(response.result));
					},100);
					
        }
  		}
		});
	});
	
	//update style
	$('#update-style-file').change(function(e){
    $('.loading-gif').show();
		$('#update-style-submit').click();
	});
	$('#style-update-form').on('submit',function(e){
		e.preventDefault();
		var sid = document.getElementById('crs-url').getAttribute('data-crs');
    
		var formData = new FormData($(this)[0]);
		var url = base_url + '/update-style';
    formData.append('sid', sid);
   
		$.ajax({
      url : url,
      type: "POST",
      data : formData,
      processData: false,
      contentType: false,
  		cache: false,
   		dataType : 'json',
			error: function(xhr, status, error) {
				$('.loading-gif').hide();
			  var err = xhr.responseText;
			  console.log('err', err);
			  //alert(err.error);
			},
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
          location.reload();
          console.log(response.final_path);
  				}
        else{
					$('#style-update-form')[0].reset();
          setTimeout(function(){
						alert(JSON.stringify(response.result));
					},100);
        }
  		}
		});
	});
	
	//Delete Course
	$('#delete-course-popup .dlt-btn').click(function(e){
		$('.loading-gif').show();
		var crs_id = $('#crs-url').data('crs');
		var url = base_url + '/delete-course';
		
		var data = {
			crs_id : crs_id
		};
		
		$.ajax({
      url : url,
      type: "POST",
      data : data,
  		cache: false,
   		dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
          location.reload();
          console.log(response);
  				}
        else{
          alert(JSON.stringify(response.result));
        }
  		}
		});
	});
	//Crs-dup course popup
	$('#crs-dup-course-popup .dup-dlt-btn').click(function(e){
		document.getElementById("dup-dlt-btn").style.display="block";
		
	});
	
	//Rename Course
	$('#rename-course-popup .course-rename-lbl-btn').click(function(e){
		$('.loading-gif').show();
		var nid = document.getElementById('course-rename-lbl-btn').getAttribute('data-nid');
		var name = $('#rename-folder-course').val();
		var url = base_url + '/rename-course';
		
		var data = {
			nid : nid,
			name: name
		};
		
		$.ajax({
      url : url,
      type: "POST",
      data : data,
  		cache: false,
   		dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
          location.reload();
  				}
        else{
          alert(JSON.stringify(response.result));
        }
  		}
		});
	});
	
	//Add Course Content Folder
	$('#create-course-popup .course-create-lbl-btn').click(function(e){
		$('.loading-gif').show();
		var curr_nid = $('#cur-info').data('id');
		var type = $('#cur-info').data('type');
		var name = $('#create-folder-course').val();
		var curr_uri = $('#cur-info').data('uri');
		var url = base_url + '/add-course-content-folder';
		var data = {
			nid : curr_nid,
			type: type,
			name: name
		};
		$.ajax({
      url : url,
      type: "POST",
      data : data,
  		cache: false,
   		dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
			if(response.new_uri){
				location.href = base_url + '/platform/domainview/' + response.new_uri;
			}
			else{
                          if(!curr_uri){
			    curr_uri = location.href;
			  }
			  /*var uri_arr = curr_uri.split('/');
			  var old_fid = uri_arr[uri_arr.length -1];
			  curr_uri = curr_uri.replace(old_fid,response.fid);*/
			  location.href = curr_uri;
			}
  		  }
		  else{
		  	alert(JSON.stringify(response.result));
		  }
  		}
		});
	});
	

	//Add Style folder
	$('#sf-create-lbl-btn').click(function(e){
		e.preventDefault();
		var curr_nid = $('#import-style-data').data('id');
		var type = $('#import-style-data').data('type');
		var curr_uri = $('#import-style-data').data('uri');
		var sf_name = $('#create-sf-input').val();
		var url = base_url + '/add-style-folder';
		
		if(sf_name != ''){
			$('.loading-gif').show();
			var data = {
				nid : curr_nid,
				type : type,
				sf_name : sf_name
			};
			
			$.ajax({
	      url : url,
	      type: "POST",
	      data : data,
	  		cache: false,
	   		dataType : 'json',
	      success:function(response){
	        $('.loading-gif').hide();
	  		  if(response.result == 'OK'){
			 	if(response.new_uri){
					location.href = base_url + '/platform/styleview/' + response.new_uri;
				}
				else{
		                  if(!curr_uri){
				    curr_uri = location.href;
				  }
				  /*var uri_arr = curr_uri.split('/');
				  var old_fid = uri_arr[uri_arr.length -1];
				  curr_uri = curr_uri.replace(old_fid,response.fid);*/
				  location.href = curr_uri;
				}
	  		  }
	        else{
	          alert(JSON.stringify(response.result));
	        }
	  		}
			});
		}
		else{
			$('#create-sf-input').focus();
		}
		
	});
	
	//Create a course
	$('#course-create-btn').click(function(e){
		var sid = $(this).data('sid');
		var cname = $('.course-name-txt').val();
		var display = $('.course-style-display').data('dp').replace(/ +/g, "");
		//var curr_nid = $('.add-folder-btn').data('id');
                var curr_nid = $('#cur-info').data('id');
		//var type = $('.add-folder-btn').data('type');
                var type = $('#cur-info').data('type');
		var lang = $('.lang-select').val();
		var url = base_url + '/create-course';
		
		if(cname != '' && lang){
			$('.loading-gif').show();
			var data = {
					sid : sid,
					cname : cname,
					display : display,
					curr_nid : curr_nid,
					type : type,
					lang : lang
				};
				
			$.ajax({
	      url : url,
	      type: "POST",
	      data : data,
	  		cache: false,
	   		dataType : 'json',
	      success:function(response){
	        $('.loading-gif').hide();
	  		  if(response.result == 'OK'){
	          location.reload();
	          console.log(response);
	  				}
	  		}
			});
		}
		else{
			if(!cname){
				//$('.course-name-txt').focus();
				$('.course-name-txt').css('border', '1px solid red');
			}
			else if(!lang){
				$('.course-lang-list').css('border', '1px solid red');
			}
		}
			
	});
	
	//Edit course
	$('.edit-course-click').on('click',function(e){
		e.preventDefault();
		var crs_id = document.getElementById('crs-url').getAttribute('data-crs');
		var url = base_url + '/update-course';
		$('.loading-gif').show();
		var data = {
			crs_id : crs_id
		};   
		$.ajax({
      url : url,
	    type: "POST",
      data : data,
  		cache: false,
	   	dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
				  var crs_url = location.origin + "/bilim/v1.0/editors/BlmCourseEditor/build/?courseId=" + crs_id;
				  location.href = crs_url;
  			}
  		}
		});
	});
	
	$(document).keypress(function(e) {
		if(e.which == 13) {
			if(e.target.id == 'create-sf-input'){
				$('#sf-create-lbl-btn').click();
			}
			else if(e.target.id == 'rename-folder-course'){
				$('#rename-course-popup .course-rename-lbl-btn').click();
			}
			else if(e.target.id == 'create-folder-course'){
				$('#create-course-popup .course-create-lbl-btn').click();
			}
			else if(e.target.id == 'domain-name-input' && $('#domainPopup').hasClass('new-domain')){
				$('#domainPopup .create-domain-btn').click();
			}
			else if(e.target.id == 'domain-name-input' && $('#domainPopup').hasClass('edit-domain')){
				$('#domainPopup .update-domain-btn').click();
			}
			$('input').blur();
	  	console.log('input-id',e.target.id);
		}
	});
	
	//Create domain
	$('#domainPopup .create-domain-btn').click(function(e){
		var d_name = $('.domain-name-txt').val();
		
		if(d_name){
			$('.loading-gif').show();
			
			var data = {
				d_name : d_name
			};
			
			var url = base_url + '/add-domain';
			
			$.ajax({
      url : url,
	    type: "POST",
      data : data,
  		cache: false,
	   	dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
				  location.reload();
  			}
  		}
		});
		}
		else{
			$('.domain-name-txt').focus();
		}
		
	});
	
	//Update domain
	$('.update-domain-btn').click(function(e){
		var d_name = $('.domain-name-txt').val();
		var did = $('#domainPopup').data('id');
		
		if(d_name){
			$('.loading-gif').show();
			
			var data = {
				d_name : d_name,
				did : did
			};
			
			var url = base_url + '/update-domain';
			
			$.ajax({
      url : url,
	    type: "POST",
      data : data,
  		cache: false,
	   	dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
				  location.reload();
  			}
  		}
		});
		}
		else{
			$('.domain-name-txt').focus();
		}
		
	});
	
	$(".domain-name-search-box input").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#domainList li").filter(function() {
      $(this).toggle($(this).find( "span" ).text().toLowerCase().indexOf(value) > -1)
    });
		if($('#domainList li:visible').length===0){
      $('.error').show();
    }else{
      $('.error').hide();
    }
  });
  
	//Delete Domain
	$('#delete-domain-cnf-popup .dlt-btn').on('click', function(e) {
		$('.loading-gif').show();
		$('#delete-domain-cnf-popup').removeClass('show-domain-popup');
		var id = $('#delete-domain-cnf-popup').data('did');
		var url = base_url + '/delete-domain';
		var data = {
			nid : id
		};
		$.ajax({
		  url : url,
		  type: "POST",
		  data : data,
		  cache: false,
   		  dataType : 'json',
		  success:function(response){
			$('.loading-gif').hide();
			if(response.result == 'OK'){
				location.reload();
  			}				
		  }
		});
	});

        $('#click-export').on('click',function(e){
			var data_crs_dup = document.getElementById('click-export').getAttribute('data-crs-dup');
		//alert(data_crs_dup);
		if(data_crs_dup == 0){
	  e.preventDefault();
          var crs_id = document.getElementById('crs-url').getAttribute('data-crs');
	  $('#export-crs-popup').addClass('show');
		}
        });
	
	//Course export
	$('#crs-export').on('click',function(e){
		e.preventDefault();
		var crs_id = document.getElementById('crs-url').getAttribute('data-crs');
		var prereq = $('#prereq-select').val();
    var orientation = $('#mob-orientation-select').val();
    var version_select = $('#version-select').val();
    var package_select = $('#package-select').val();
    var exit = $('#exit-checkbox').prop('checked');
    var ex_options = $('#crs-export .exp-submit').text();
		var url = base_url + '/export-course';

		var data = {
			crs_id : crs_id,
      prereq : prereq,
			orientation : orientation,
			version_select : version_select,
			package_select : package_select,
			exit : exit,
			ex_options : ex_options
		};   
		$('.loading-gif').show();
		$('#export-crs-popup').removeClass('show');
		$.ajax({
      url : url,
	    type: "POST",
      data : JSON.stringify(data),
		contentType: "application/json",
  		cache: false,
	   	dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
				  console.log('success',response.file_uri);
	        $('#prereq-select').val('default');
	        $('#mob-orientation-select').val('free');
	        $('#exit-checkbox').prop('checked', false);
	        $('#version-select').val('default');
	        $('#package-select').val('full-sco');
	        document.querySelector('.export-web').click();
					location.href = response.file_uri;
  			}
  		}
		});
	});
	
	function getDisplay(source) {
		return JSZip.loadAsync(source)
		  .then(zip => {
		    return Promise.all([
		      zip.file('blmconfig.json').async('string'),
		    ]).then(result => {
		      return JSON.parse(result[0]).display;
		    });
		  });
	}
	
	
	async function getZipFilesContent(data) {
		const promises = []
		const zip = (await JSZip.loadAsync(data))
		zip.forEach(async (relativePath, file) => {
			if(relativePath == 'blmconfig.json' || relativePath == 'index.html'){
				const promise = file.async('string')
				promises.push(promise)
				zipContent.push({
					isValid: true,
				  file: relativePath,
				  content: await promise,
				})
		  }
		})

		await Promise.all(promises)
		return zipContent
	}
	
	var zipContent = [];
	
	$('#import-file').on('change', function(e){
		$('.browsefile .filepath').text($(this).val());
		if(document.getElementById("import-file").files.length != 0){
			var fileInput = document.getElementById("import-file");
			var file_content = getZipFilesContent(fileInput.files[0]); 			
		}
		setTimeout(function(ev){
			if (typeof zipContent !== 'undefined' && zipContent.length > 0){
			console.log('zip', zipContent);
				if(zipContent[0].isValid){
					console.log('zipContent', zipContent[0].isValid);
					if(document.getElementById("import-file").files.length != 0){
						$('.style-option').addClass('show');
						if ($('#oldStyle:disabled').length){
							 if($('#importCourseStyleTree .tree-node-with-no-children').hasClass('tree-node-selected')){
								$('#crs-import').removeClass('not-activated');
								$('#crs-import').addClass('active');
							}
						}
						else{
							$('#crs-import').removeClass('not-activated');
							$('#crs-import').addClass('active');
						}
						
						// Parsing html contents from index.html in zip.
						var newContent = new DOMParser().parseFromString(zipContent[1].content, 'text/html');
						var script_str = newContent.getElementsByTagName('script')[0].innerText;
						var crs_def_arr = script_str.split('window.courseDefinition');
						var crs_def_str = crs_def_arr[1].replace('=', '').replace(';', '');
						var crs_def_json = JSON.parse(crs_def_str);
						
						var style_id = crs_def_json.style_id;
						var display = JSON.parse(zipContent[0].content).display;
						var framework = JSON.parse(zipContent[0].content).framework;
						$('#crs-import').attr('data-framework', framework);
						if(display == 'fullresponsive'){ 
							if(!$('#import-crs-popup .course-device.fullresponsive').hasClass('active')){
								$('#import-crs-popup .course-device.fullresponsive').click();
							}
							var arr = $('#import-crs-popup .course-device.active');
							console.log('arr',Object.values(arr));
							Object.values(arr).forEach(function(val,key){
								if(!$(val).hasClass('fullresponsive')){
									$(val).click();
								}
							});
						}
						else if(display == 'desktop'){
							if(!$('#import-crs-popup .course-device.desktop').hasClass('active')){
								$('#import-crs-popup .course-device.desktop').click();
							}

							var arr = $('#import-crs-popup .course-device.active');
							console.log('arr',Object.values(arr));
							Object.values(arr).forEach(function(val,key){
								if(!$(val).hasClass('desktop')){
									$(val).click();
								}
							});
						}
						else if(display == 'smartphone'){
							if(!$('#import-crs-popup .course-device.smartphone').hasClass('active')){
								$('#import-crs-popup .course-device.smartphone').click();
							}
							var arr = $('#import-crs-popup .course-device.active');
							console.log('arr',Object.values(arr));
							Object.values(arr).forEach(function(val,key){
								if(!$(val).hasClass('smartphone')){
									$(val).click();
								}
							});
						}
						console.log('style', style_id);
						var isStyleExist = all_styles.filter(function (style) { return style.id.trim() == style_id });
						console.log('isStyleExist', isStyleExist);
						if(isStyleExist.length){
							$('#crs-import').attr('data-sid', style_id);
							$('#oldStyle').removeAttr('disabled');
							$('label[for="oldStyle"]').removeClass('not-activated');
							$('#oldStyle').click();
						}
						else{
							$('#newStyle').removeAttr('disabled');
							$('#newStyle').click();
							$('#oldStyle').attr('disabled', 'disabled');
							$('label[for="oldStyle"]').addClass('not-activated');
						}
					}
					zipContent = [];
				}
			}
			else{
				console.log('not valid', zipContent);
				$('.style-option').removeClass('show');
				$('#crs-import').addClass('not-activated');
				alert('Invalid file');
			}
		}, 1500);
	});
	
	
	 $('#click-import').on('click',function(e){
	  e.preventDefault();
          var crs_id = document.getElementById('crs-url').getAttribute('data-crs');
	  $('#import-crs-popup').addClass('show');
   });
      


   $('input[name="style"]').on('change', function(e){
	   var styleId = $('input[name="style"]:checked')[0].id;
	   if (styleId == 'newStyle') {
	   	$('#importCourseStyleTree').addClass('show');
	   	document.querySelectorAll('li.tree-node-with-no-children.tree-node-selected').forEach(function(item, index){
		item.classList.remove('tree-node-selected');
	});
	   }
	   else{
	   	$('#importCourseStyleTree').removeClass('show');
	   	$('.import-crs-style-popup-form').hide();
	   }
   });
        
        
	
	//Delete style
	$('#delete-style-popup .dlt-btn').click(function(e){
		$('.loading-gif').show();
		var style_id = $('#crs-url').data('crs');
		var url = base_url + '/delete-style';
		
		var data = {
			style_id : style_id
		};
		
		$.ajax({
      url : url,
      type: "POST",
      data : data,
  		cache: false,
   		dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
          location.reload();
          console.log(response);
  				}
        else{
          $('#delete-style-popup').hide();
		  $('.loading-gif').hide();
		  $('#not-delete-style-popup').show();
        }
  		}
		});
	});
	
	//Hide style popup
	$('#not-delete-style-popup .ok-btn').on('click',function(e){
		$('#not-delete-style-popup').hide();
		location.reload();
	});	
	
	//Activate course preview
	/*$(document).click(function (e) {
        if(e.ctrlKey && e.target.textContent == 'Preview'){
			e.preventDefault(); 
			console.log('ctrlKey',e.ctrlKey);
			$(e.target).removeClass('not-activated');			
		}
	});*/
	
	//Course preview
	$('#crs-preview').on('click',function(e){
		e.preventDefault();
		if(!$(e.target).hasClass('not-activated')){
			var crs_id = e.target.getAttribute('data-crs');
			var url = base_url + '/preview-course';
			console.log('crs_id',crs_id);
			console.log('base_url',base_url);
			var data = {
				crs_id : crs_id
			};   
			$('.loading-gif').show();
			$.ajax({
				url : url,
				type: "POST",
				data : JSON.stringify(data),
				contentType: "application/json",
				cache: false,
				dataType : 'json',
				success:function(response){
					$('.loading-gif').hide();
					if(response.result == 'OK'){
					  console.log('success',response.file_uri);
					  window.open(response.file_uri,'_blank');
					}
				}
			});
		}
	});

	//Delete content category(folder)
	$('#delete-folder-popup .dlt-btn').click(function(e){
		$('.loading-gif').show();
		var cf_id = $('#crs-url').data('crs');
		var url = base_url + '/delete-folder';
		
		var data = {
			cf_id : cf_id
		};
		
		$.ajax({
		      url : url,
		      type: "POST",
		      data : data,
		      cache: false,
		      dataType : 'json',
		      success:function(response){
			$('.loading-gif').hide();
		  	if(response.result == 'OK'){
			  location.href = base_url+'/platform/domainview/'+response.redirect_url;
			  console.log(response);
		  	}
			else{
			  $('#delete-folder-popup').removeClass('show-folder-popup');
			  setTimeout(function(e){
				window.alert(JSON.stringify(response.result));
				location.reload();
			  },300);
			  
			}
  		      }
		});
	});


	//Delete style category(folder)
	$('#delete-style-folder-popup .dlt-btn').click(function(e){
		$('.loading-gif').show();
		var sf_id = $('#crs-url').data('crs');
		var url = base_url + '/delete-style-folder';
		
		var data = {
			sf_id : sf_id
		};
		
		$.ajax({
		      url : url,
		      type: "POST",
		      data : data,
		      cache: false,
		      dataType : 'json',
		      success:function(response){
			$('.loading-gif').hide();
		  	if(response.result == 'OK'){
			  location.href = base_url+'/platform/styleview/'+response.redirect_url;
			  console.log(response);
		  	}
			else{
			  $('#delete-style-folder-popup').removeClass('show-folder-popup');
			  setTimeout(function(e){
				window.alert(JSON.stringify(response.result));
				location.reload();
			  },300);
			  
			}
  		      }
		});
	});

	$(document).ready(function(){
		var nid = '';
		if(nid){
			var parent_elements = $("[data-nid="+nid+"]").parents('.tree-node-with-children');
			for (const ele of parent_elements){
				if($(ele).hasClass('tree-node-close')){
					$(ele).removeClass('tree-node-close').addClass('tree-node-open');
				}
			}
		}
		
	});

        $('#crs-duplicate').on('click',function(e){
	  var crs_id = $(e.target).data('crs-id');
	  var parent_id = $(e.target).data('pid');
	  console.log('crs_id',crs_id);
          
	  var url = base_url + '/duplicate-course';
	
	  var data = {
		crs_id : crs_id,
		parent_id : parent_id
	  };
	  $('#progress-container').removeClass('hide');
	 	  
     	    $.ajax({
	      xhr: function () {
		var xhr = new window.XMLHttpRequest();
		xhr.upload.addEventListener("progress", function (evt) {
		    if (evt.lengthComputable) {
		        var percentComplete = evt.loaded / evt.total;
		        console.log(percentComplete);
 			var percentage = 0;
			var on_hold = 50;

		        var timer = setInterval(function(){
		          percentage = percentage + 10;
                          if(percentage <= on_hold){
		            progress_bar_process(percentage, timer);
			  }
		        }, 1000);
		        /*$('#progressBar .progress-bar').css({
		            width: percentComplete * 100 + '%'
		        });
			if (percentComplete === 1) {
 			    
		        }*/
		    }
		}, false);
		xhr.addEventListener("progress", function (evt) {
		    if (evt.lengthComputable) {
		        var percentComplete = evt.loaded / evt.total;
		        console.log(percentComplete);
			var percentage = 50;

		        var timer = setInterval(function(){
		          percentage = percentage + 10;
		          progress_bar_process(percentage, timer);
		        }, 1000);

		        /*$('#progressBar .progress-bar').css({
		            width: percentComplete * 100 + '%'
		        });
			if (percentComplete === 1) {
		            $('#progress-container').addClass('hide');
		   	    $('#progress-success-container').removeClass('hide');
       			    setTimeout(function(){
			      $('#progress-success-container').addClass('hide');
			    },500);
		        }*/
		    }
		}, false);
		return xhr;
	      },
	      type: "POST",
	      url: url,
	      data: JSON.stringify(data),
              cache: false,
	      dataType : "json",
	      success: function (response) {
	        console.log('res',response);
	        $('#progress-success-container').removeClass('hide');
	    
	        setTimeout(function(){
	          location.reload();
	        },3000);
  	      }
	  });

        });


	function progress_bar_process(percentage, timer)
	{
	  $('#progressBar .progress-bar').css('width', percentage + '%');
	  if(percentage > 100)
	  {
	    clearInterval(timer);
	    
	    $('#progressBar .progress-bar').css('width', '0%');
	    $('#progress-container').addClass('hide');	
	  }
	}

	//Device Filter
	/*$('.course-device').on('click',function(e){

	  var isActive = false;
	  var activeCount = 0;
	  for($i=0; $i<3; $i++){
		if($('.course-device')[$i].classList.contains("active")){
		  isActive = true;
		  activeCount += 1;
		}
  	  }
	  console.log('class',isActive);
	  console.log('activeCount',activeCount);
	  if(isActive && activeCount > 1){
		console.log('e',e.target.classList);
		$(e.target).toggleClass('active');
		
		$(e.target.firstElementChild).toggleClass('show');		
	  }
	  else if(isActive && activeCount == 1){
		if(e.target.classList.contains('active')){
			alert('Atleast one device should be enabled');
		}
		else{
			$(e.target).addClass('active');
			$(e.target.firstElementChild).addClass('show');
		}
	  }
	});*/
	
	//Switch export options
	$('.export-options').on('click', function(e){
	  $('.ex-right-options .options').val('');
    if($(e.target).hasClass('export-web')){
    	$('.export-options').removeClass('active');
    	$(e.target).addClass('active');
	    $('.ex-right-options .options').removeClass('show');
	    $('.ex-right-options .prerequisite').addClass('show');
	    $('.ex-right-options .mobile-orientation').addClass('show');
	    $('#crs-export .exp-submit').text('EXPORT WEB');
    }
	  else if($(e.target).hasClass('export-lms')){
		  $('.export-options').removeClass('active');
		  $(e.target).addClass('active');
	    $('.ex-right-options .options').removeClass('show');
	    $('.ex-right-options .prerequisite').addClass('show');
	    $('.ex-right-options .mobile-orientation').addClass('show');
	    $('.ex-right-options .version').addClass('show');
	    $('.ex-right-options .package').addClass('show');
	    $('.ex-right-options .exit').addClass('show');
	    $('#crs-export .exp-submit').text('EXPORT LMS');
    }
 	  else if($(e.target).hasClass('export-trans')){
        $('.export-options').removeClass('active');
    	$(e.target).addClass('active');
		$('.ex-right-options .options').removeClass('show');
	    $('.ex-right-options .prerequisite').removeClass('show');
	    $('.ex-right-options .mobile-orientation').removeClass('show');
	    $('.ex-right-options').removeClass('show');
	    $('.export-trans-options').addClass('show');
	    $('#crs-export .exp-submit').text('EXPORT TRANSLATION');
    }
  });
  
  $('#lang-select').on('click', function(e){
  	var lang_width = $('.course-lang-list').innerWidth();
  	$('.course-lang-list').css('border','unset');
  	$('#lang-select-wrapper').innerWidth(lang_width);
  	if($('.lang-select').css('display') == 'none'){
  		$('.lang-select').show();
  	}
  	else{
  		$('.lang-select').hide();
  	}
  });
  
  $('.lang-select').on('change', function(e){
  	$('#selected-lang').removeClass().addClass('selected-lang');
  	var val = $(this).val();
  	var selection = $('option[value="'+val+'"]');
		var lang = $(selection).html();
		console.log('lang',lang);
  	$(this).hide();
  	if($(selection).hasClass('with-flag')){
  		$('#lang-select .selected-lang').addClass('with-flag ' + val);
  	}
  	$('#lang-select > div').removeClass('show');
  	$('#selected-lang').addClass('show').html(lang).append('<span class="down-arrow"></span>');
  });
  
  $('.lang-select').on('click', function(e){
  	if($(this).val() == $(e.target).val()){
  		$(this).hide();
  	}
  });
  

  $('#change-style-popup .course-device').on('click', function(e){
		if(($('#change-style-popup .course-device.active').hasClass('desktop') && !$('#change-style-popup .course-device.active').hasClass('fullresponsive'))|| ($('#change-style-popup .course-device.active').hasClass('smartphone') && !$('#change-style-popup .course-device.active').hasClass('fullresponsive')) && !$(e.target).hasClass('active')){
			e.stopPropagation();
			e.preventDefault();
		}
		else{
			var framework = $('#change-style-btn').attr('data-framework');
			if($(e.target).hasClass('fullresponsive')){
				fullFilter(e, '#change-style-popup', framework);
			}
			if($(e.target).hasClass('desktop')){
				desktopFilter(e, '#change-style-popup', framework);
			}
			if($(e.target).hasClass('smartphone')){
				mobileFilter(e, '#change-style-popup', framework);
			}
		}
	});
	
	//Apply new style to a course
	$('#change-style-btn').click(function(e){
		var sid = $(this).data('sid');
		var crs_id = $(this).data('crs-id');
		var url = base_url + '/change-style';

		$('.loading-gif').show();
		$('#change-style-popup').removeClass('show');
		var data = {
				sid : sid,
				crs_id : crs_id
			};
			
		$.ajax({
      url : url,
      type: "POST",
      data : data,
  		cache: false,
   		dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'OK'){
  		  	$('#style-applied-success-container').show();
  		  	setTimeout(function(e){
  		  		location.reload();	
  		  	},500);
          console.log(response);
  				}
  		}
		});
	});
 
 
  //Import course
	$('#crs-import').click(function(e){
		if ( $(this).hasClass('active') ) {
			var sid = $(this).data('sid');
			var pid = $(this).data('pid');
			var url = base_url + '/import-course';
			var file_data = $('#import-file').prop("files")[0];
			var nid = parseInt($(this).data('style-pid'));
			var type = $(this).data('type');

			var form_data = new FormData();                  
			form_data.append('file', file_data);
			form_data.append('sid', sid);
			form_data.append('pid', pid);
			form_data.append('nid', nid);
			form_data.append('type', type);
			
			
			$('.loading-gif').show();
			$('#import-crs-popup').removeClass('show');
						
			$.ajax({
				url : url,
				type: "POST",
				data : form_data,
				cache: false,
				processData: false,
				contentType: false,
		 		dataType : 'json',
				success:function(response){
				  $('.loading-gif').hide();
					if(response.result == 'OK'){
						setTimeout(function(e){
							location.reload();	
						},500);
				    console.log(response);
					}
				},
				error:function(xhr, status, error){
					console.log('error',error);		
					$('.loading-gif').hide();
					var err = xhr.responseText;
					console.log('err',err);
				}
			});
		}
		else {
			return false;
		}
	});
	
	 $('#import-crs-popup .course-device').on('click', function(e){
		var framework = $('#crs-import').attr('data-framework');
		if($(e.target).hasClass('fullresponsive')){
			fullFilter(e, '#import-crs-popup', framework);
		}
		if($(e.target).hasClass('desktop')){
			desktopFilter(e, '#import-crs-popup', framework);
		}
		if($(e.target).hasClass('smartphone')){
			mobileFilter(e, '#import-crs-popup', framework);
		}
	});
  

})(jQuery, Drupal);
