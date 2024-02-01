function openResetPopup(event) {
	var emailResetPopup = document.getElementById('email-reset-popup');
	emailResetPopup.classList.add('show-email-reset-popup');
}

function hideResetPopup(event){
	var emailResetPopup = document.getElementById('email-reset-popup');
	emailResetPopup.classList.remove('show-email-reset-popup');
}

function hidePwdResetPopup(event){
	var pwdResetPopup = document.getElementById('pwd-reset-popup');
	pwdResetPopup.classList.remove('show-pwd-reset-popup');
}

(function ($, Drupal) {
	 $(document).ready(function(){
		if(window.location.href.indexOf('?email=') > 0) {
      var pwdResetPopup = document.getElementById('pwd-reset-popup');
            $('#reset-password').val('');
            $('#reset-confirm-password').val('');
			pwdResetPopup.classList.add('show-pwd-reset-popup');
		}
  });
	$('.email-reset-btn').click(function(e){
    $('.loading-gif').show();
		var email = $('#email-reset').val();
		var url = base_url + 'email-reset';
		var data = {
			email : email
		};
		$.ajax({
      url : url,
      type: "POST",
      data : data,
  		cache: false,
   		dataType : 'json',
      success:function(response){
        $('.loading-gif').hide();
  		  if(response.result == 'ok'){
         location.reload();
  			}
				else {
                                        $('.loading-gif').hide();
					alert('Enter a valid email');
				}
			}
		});
		
	});	
	
	$('.pwd-reset-btn').click(function(e){
    $('.loading-gif').show();
		var val = window.location.href;
		var email = val.substr(val.indexOf("=") + 1);
		var pwd = $('#reset-password').val();
		var cpwd = $('#reset-confirm-password').val();
		var response = grecaptcha.getResponse();


		if(pwd == '') {
			alert('Please enter the password');
		}
		else if(cpwd == '') {
			alert('Please enter the confirm password');
		}
		else if(response.length == 0) {
			alert('please enter captcha');
		}
		else if(pwd == cpwd) {
			var url = base_url + 'pwd-reset';
			var data = {
				email : email,
				pwd: pwd,
				cpwd: cpwd
			};
			$.ajax({
	      url : url,
	      type: "POST",
	      data : data,
	  		cache: false,
	   		dataType : 'json',
	      success:function(response){
	        $('.loading-gif').hide();
	  		  if(response.result == 'ok'){
	          window.location = base_url + '/platform/login';
	  			}
					else {
						alert('Invalid user');
					}
				}
			});
		}
		else {
			alert('Please enter the same password on confirmation.');
		}
		
	});
})(jQuery, Drupal);
