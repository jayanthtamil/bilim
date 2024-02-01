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
function openPopup() {
	var popup = document.getElementById("popup");
	popup.style.display = "block";
  }
  
  function closePopup() {
	var popup = document.getElementById("popup");
	popup.style.display = "none";
  }
function onCtxBtnClick(event) {
	var crs_hide_menu = event.target.getAttribute("data-crs-dup");
	// alert(crs_hide_menu);
	if(crs_hide_menu == 0){
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

    var crs_id = event.target.getAttribute("data-crs");
    document.getElementById("crs-url").setAttribute("data-crs", crs_id);
    document.getElementById("crs-preview").setAttribute("data-crs", crs_id);
    document.getElementById("crs-export").setAttribute("data-crs", crs_id);
    document.getElementById("crs-props").setAttribute("data-crs-id", crs_id);

    var display = event.target.getAttribute("data-display");
    if(display && display != 'desktop'){
      document.querySelector('.mobile-orientation').classList.add('show');
    }
  
    var dview_url = event.target.getAttribute("data-url");
    document.getElementById("crs-url").setAttribute("data-url", dview_url);
  
    showCourseCxtMenu();
	}else{
		// var crs_hide_menu = event.target.getAttribute("data-crs-dup");
		var crsDup = document.getElementById('popup');
		console.log(crsDup);
	    crsDup.classList.add('popup');
		document.getElementById("popup").style.display = "block";
	}
    
}

function onCtxMenuClick(event) {
	if(event.target.className.indexOf('not-activated') == -1){
		hideCtxMenus();
	}
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

function onCrsPopupClose(event) {
  const popupContainer = document.getElementById("crs-properties-container");
  popupContainer.classList.toggle("show");
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

function onExportCrsPopupClose(event,success) {
  document.querySelector('.export-web').click();
  const popupContainer = event.target.closest(".export-crs-container");
  popupContainer.classList.toggle("show");
  document.querySelector('.mobile-orientation').classList.remove('show');
  document.querySelector('.export-web').click();
  if(success){
    location.reload();
  }
}

// click on browser back button to refresh the page.
window.addEventListener( "pageshow", function ( event ) {
  var historyTraversal = event.persisted || 
                         ( typeof window.performance != "undefined" && 
                              window.performance.navigation.type === 2 );
  if ( historyTraversal ) {
    // Handle page restore.
    window.location.reload();
  }
});

(function ($, Drupal) {
	$('.edit-course-click').on('click',function(e){
		e.preventDefault();
		var crs_id = document.getElementById('crs-url').getAttribute('data-crs');
		var url = base_url + '/update-course';
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
	
        $('#click-export').on('click',function(e){
	  e.preventDefault();
	  $('#export-crs-popup').addClass('show');
        });
	
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
				  console.log('success');
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
				cache: false,
				contentType: "application/json",
				dataType : "json",
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

        //see course in domain
	$('#course-domain').on('click',function(e){
	  var dview_url = $('#crs-url').data('url');
	  var url = base_url + '/platform/domainview/' + dview_url;
	  location.href = url;
	});

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
		

})(jQuery, Drupal);
