function onNewUserBtnClick(event) {
  const userPopup = document.getElementById("userPopup");
  if (userPopup.classList.contains("edit-user")) {
    userPopup.classList.remove("edit-user");
  }
  if (!userPopup.classList.contains("new-user")) {
    userPopup.classList.add("new-user");
  }

	var inputs = document.querySelectorAll('.user-popup-form input');
	for(i=0; i<inputs.length; i++){
		inputs[i].value = '';
	}
	
	var selects = document.querySelectorAll('.user-popup-form select');
	for(x=0; x<selects.length; x++){
		selects[x].value = '';
	}
	document.querySelector('.activate-chk-box #title').checked = true;
  toggleUserPopup();
}

function onEditUserBtnClick(id) {
  const userPopup = document.getElementById("userPopup");
  if (userPopup.classList.contains("new-user")) {
    userPopup.classList.remove("new-user");
  }
  if (!userPopup.classList.contains("edit-user")) {
    userPopup.classList.add("edit-user");
  }
	var username = document.getElementById('username-span-'+id).innerHTML;
  document.getElementsByClassName('username-txt')[0].value = username;
	var firstname = document.getElementById('firstname-span-'+id).innerHTML;
  document.getElementsByClassName('firstname-txt')[0].value = firstname;
	var lastname = document.getElementById('lastname-span-'+id).innerHTML;
  document.getElementsByClassName('lastname-txt')[0].value = lastname;
	var email = document.getElementById('email-span-'+id).innerHTML;
  document.getElementsByClassName('email-txt')[0].value = email;
	var profile = document.getElementById('profile-span-'+id).innerHTML;
	document.getElementById('profile-select').value = profile;
	var customer = document.getElementById('customer-span-'+id).innerHTML;
	document.getElementById('customer-select').value = (customer == 'All') ? '' : customer;
	var status = document.getElementById('status-span-'+id).innerHTML;
	if(status == '1'){
		document.querySelector('.activate-chk-box #title').checked = true;
	}
	var profile_select = document.getElementById('profile-select').value;
	if(profile_select == 'supervisor'){
		document.getElementById('customer-select').disabled = true;
	}
	else{
		document.getElementById('customer-select').disabled = false;
	}

	document.getElementsByClassName('update-user-btn')[0].setAttribute('data-id',id);
  toggleUserPopup();
}

function onPopupClose(event) {
	var inputs = document.querySelectorAll('.user-popup-form input');
	for(i=0; i<inputs.length; i++){
		inputs[i].value = '';
	}
	
	var selects = document.querySelectorAll('.user-popup-form select');
	for(x=0; x<selects.length; x++){
		selects[x].value = '';
	}
	document.querySelector('#customer-select').disabled = false;
	
  toggleUserPopup();
}

function toggleUserPopup() {
  const popupContainer = document.getElementById("popupContainer");
  popupContainer.classList.toggle("show");
}

function onUserDltBtnClick(event){
	var dltUserPopup = document.getElementById('delete-user-popup');
	dltUserPopup.classList.add('show-user-popup');
	var curr_nid = event.target.getAttribute('data-uid');
	document.getElementsByClassName('hidden-user-id')[0].setAttribute('data-uid',curr_nid);
}

function onUserDltCancel(event){
	var dltUserPopup = document.getElementById('delete-user-popup');
	dltUserPopup.classList.remove('show-user-popup');
}

(function ($, Drupal) {
	$('.user-search-btn,.user-detail-select, .user-filter-input').on('click change keyup',function(e){
		var username = $('#username-value').val();
		var firstname = $('#firstname-value').val();
		var lastname = $('#lastname-value').val();
		var profile = $('#user-profile-select').val();
		var customer = $('#user-customer-select').val();
		var url = base_url + '/user-filters';
		var data = {
			username : username,
			firstname: firstname,
			lastname: lastname,
			profile: profile,
			customer: customer
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
					$('#no-user').hide();
					var userIds = $.map(response.user_ids, function(value, index){
			        return [value];
			    });
					$('#userTableBody  > tr').each(function(index, tr) {
						if (!$(this).hasClass("no-user")) {
						  var id = $(this).attr('class').match(/\d+$/)[0];
							if(jQuery.inArray(id,userIds) !== -1) {
								$(this).show();
							}
							else {
								$(this).hide();
							}
						}
					});
  			}
				else {
					$('#userTableBody  > tr').each(function(index, tr) {
						$(this).hide();
						$('#no-user').show();
					});
				}
  		}
		});
	});

	//Add User
	$('#popupContainer .user-form-btn-box .create-user-btn').click(function(e){
		console.log('clicked');
		e.preventDefault();
		var username = $('.user-popup-form .username-txt').val();
		var firstname = $('.user-popup-form .firstname-txt').val();
		var lastname = $('.user-popup-form .lastname-txt').val();
		var email = $('.user-popup-form .email-txt').val();
		var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
		var profile = $('.user-popup-form #profile-select').val();
		if(profile == 'supervisor'){
			$('#customer-select').prop("disabled", true);
		}
		var customer_access = (profile == 'supervisor') ? 'All' : $('.user-popup-form #customer-select').val();
		var isActivated = $('.user-popup-form	.activate-chk-box #title').is(':checked');
		
		var url = base_url + '/add-user';
		
		if(username && firstname && lastname && testEmail.test(email) && profile && customer_access){
			var users_arr = JSON.parse(users);
			if(users_arr.indexOf(username) > -1){
console.log('username exist');
				$('.user-popup-form .username-txt').focus();
				$('.user-popup-form .username-txt').addClass('highlight');
				$('.user-popup-form .warning').addClass('show');
			} 
			else{
			$('.loading-gif').show();
			var data = {
				username : username,
				firstname : firstname,
				lastname : lastname,
				email : email,
				profile : profile,
				customer_access : customer_access,
				isActivated : isActivated
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
					else {
						setTimeout(function(){ alert("Email id already set to another user. Please enter a unique email"); }, 500);
					}
	  		}
			});
		  }
		
		}
		else{
			if(!username){
				$('.user-popup-form .username-txt').focus();
			}
			else if(!firstname){
				$('.user-popup-form .firstname-txt').focus();
			}
			else if(!lastname){
				$('.user-popup-form .lastname-txt').focus();
			}
			else if(!testEmail.test(email)){
				$('.user-popup-form .email-txt').addClass('highlight').focus();
				$('.invalid-email-msg').show();
				setTimeout(function(e){
					$('.user-popup-form .email-txt').removeClass('highlight');
					$('.invalid-email-msg').hide();
				},1000);
			}
			else if(!profile || profile == ''){
				$('.user-popup-form .profill-select-box').addClass('highlight').focus();
				setTimeout(function(e){
					$('.user-popup-form .profill-select-box').removeClass('highlight');
				},1000);
			}
			else if(!customer_access || customer_access == ''){
				$('.user-popup-form .customer-select-box').addClass('highlight').focus();
				setTimeout(function(e){
					$('.user-popup-form .customer-select-box').removeClass('highlight');
				},1000);
			}
			else if(!isActivated){
				$('.user-popup-form .custom-checkbox').addClass('highlight').focus();
				setTimeout(function(e){
					$('.user-popup-form .custom-checkbox').removeClass('highlight');
				},1000);
			}
		}
		
	});
	
	
	//Edit User
	$('#popupContainer .user-form-btn-box .update-user-btn').click(function(e){
		console.log('clicked');
		e.preventDefault();
		var uid = $(this).data('id');
		var username = $('.user-popup-form .username-txt').val();
		var firstname = $('.user-popup-form .firstname-txt').val();
		var lastname = $('.user-popup-form .lastname-txt').val();
		var email = $('.user-popup-form .email-txt').val();
		var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
		var profile = $('.user-popup-form #profile-select').val();
		if(profile == 'supervisor'){
			$('#customer-select').prop("disabled", true);
		}
		var customer_access = (profile == 'supervisor') ? 'All' : $('.user-popup-form #customer-select').val();
		var isActivated = $('.user-popup-form	.activate-chk-box #title').is(':checked');
		var url = base_url + '/edit-user';
		console.log('user', username);
		if(username && firstname && lastname && testEmail.test(email) && profile && customer_access){
			$('.loading-gif').show();
			
			var data = {
				uid : uid,
				username : username,
				firstname : firstname,
				lastname : lastname,
				email : email,
				profile : profile,
				customer_access : customer_access,
				isActivated : isActivated
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
					else {
						setTimeout(function(){ alert("Email id already set to another user. Please enter a unique email"); }, 500);					}
	  		}
			});
		
		}
		else{
			if(!username){
				$('.user-popup-form .username-txt').focus();
			}
			else if(!firstname){
				$('.user-popup-form .firstname-txt').focus();
			}
			else if(!lastname){
				$('.user-popup-form .lastname-txt').focus();
			}
			else if(!testEmail.test(email)){
				$('.user-popup-form .email-txt').addClass('highlight').focus();
				$('.invalid-email-msg').show();
				setTimeout(function(e){
					$('.user-popup-form .email-txt').removeClass('highlight');
					$('.invalid-email-msg').hide();
				},1000);
			}
			else if(!profile || profile == ''){
				$('.user-popup-form .profill-select-box').addClass('highlight').focus();
				setTimeout(function(e){
					$('.user-popup-form .profill-select-box').removeClass('highlight');
				},1000);
			}
			else if(!customer_access || customer_access == ''){
				$('.user-popup-form .customer-select-box').addClass('highlight').focus();
				setTimeout(function(e){
					$('.user-popup-form .customer-select-box').removeClass('highlight');
				},1000);
			}
			else if(!isActivated){
				$('.user-popup-form .custom-checkbox').addClass('highlight').focus();
				setTimeout(function(e){
					$('.user-popup-form .custom-checkbox').removeClass('highlight');
				},1000);
			}
		}
		
	});
	
	$('#profile-select').on('change',function(e){
		if($(this).val() == 'supervisor'){
			$('#customer-select').val('');
			$('#customer-select').prop("disabled", true);
		}
		else{
			$('#customer-select').prop("disabled", false);
		}
	});
	
	//Delete user
	$('#delete-user-popup .dlt-user-btn').click(function(e){
		$('.loading-gif').show();
		var u_id = $('#hidden-user-id').data('uid');
		var url = base_url + '/delete-user';
		var data = {
			u_id : u_id
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

	//event listener on key press
	$(document).keypress(function(e) {
		if(e.target.classList.contains('username-txt')){
			$('.user-popup-form .warning').removeClass('show');
			$('.user-popup-form .username-txt').removeClass('highlight');
		}
	});
	
})(jQuery, Drupal);
	
