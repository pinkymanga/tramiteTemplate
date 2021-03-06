tramite = {
    //ls: 'gobmx-tramites-v1',
    ls: 'gob_mx_session_token:atuh-manager-v1.0',
    steps: ['buscar', 'preview'],
    step: 0,
    user : '',
	folioSeguimiento: '',
    masterTimer: 3000,
    init: function () {
        var controller = this;
        console.log('session search ' + JSON.stringify(window.localStorage) );
        if( localStorage[this.ls] != null ) {
            console.log('session exists');            
            var key = JSON.parse(window.localStorage[this.ls]);
            var token = key.json.token;     
            var expires = new Date(key.json.expires);
            this.rightNow = new Date();
            if( expires.getTime() > this.rightNow.getTime() ) {
                console.log('still alive');

                if( window.location.toString().split('=')[1] == 'success') {
                    controller.step = 3;
                } else if( window.location.toString().split('=')[1] == 'excepction') {
                    controller.step = 4;
                } else {
                    this.step = 0;
                }
                console.log(' step ---> ' + this.step);
            } else {
                delete window.localStorage[this.ls]
                this.step = 0;
            }
        } else {
            console.log('what');
            this.step = 0;
        }
        this.current_step();
    },
    current_step: function () {
        var controller = this;
        var current_step = this.step;
        console.log(' current_step ---> ' + controller.steps[current_step] );
        $('section').addClass('hidden');
        $('.'+controller.steps[current_step]).removeClass('hidden');
    },
    next_step: function () {
        var controller = this;
        this.step++;
        var current_step = this.step;
        $('section').addClass('hidden');
        $('.' + controller.steps[current_step]).removeClass('hidden');
        if (controller.steps[current_step] == 'confirmation') {
            setTimeout(function () {
                $('.confirmation .loader').hide('fast', function () {
                    controller.confirmation();
                });
            }, 1000);
        }
    },
    previous_step: function () {
        $('section').addClass('hidden');
        $(this.steps[this.step - 1]).removeClass('hidden');
    },
    startTimeOut: function() {
      setTimeout(function() {
         $("#errorLog").fadeOut();
     }, 3000);
  },

  errorFlagMessage:  function (message) {
    $("#errorLog").html('<span class="alert alert-danger alert-complement"><small>' + message + '</small></span>').show();
    this.startTimeOut();
  },
  search: function () {
		var controller = this;
		var user = document.getElementById("user").value;
		var password = document.getElementById("password").value;
		if(user === '' || password === '' || user === undefined || password === undefined){
			this.errorFlagMessage("Usuario y password requeridos");
		}
		else {		
			controller.next_step();
		}
	},
    evaluateValueInRegex: function(value,regex) {
      var exp = new RegExp(/(?=^.{6,}$)((?=.*\d)|(?!=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
      return  exp.test(value);
    },
	changePassword: function(){
		var controller = this;
		var user = document.getElementById("user").value;
		var password = document.getElementById("password").value;
		var passwordToChange = document.getElementById("passwordChange").value;
		var newPassword = document.getElementById("newPassword").value;
		var confirmPassword = document.getElementById("confirmPassword").value;
		if(password !== passwordToChange){
			errorMessage("Password incorrecto");
		}
		else if (newPassword !== confirmPassword){
			errorMessage("Las nuevas contraseñas no son iguales");
		}
		else if (newPassword.length < 6 || newPassword.length > 11 ){
			errorMessage("Longitud inválida la contraseña debe tener entre 6 a 10 caracteres");
		}
		else if (!this.evaluateValueInRegex(newPassword )){
			errorMessage("Formato invalido");
		}
		else{
			var payload = {"usuario":user,"contrasenia":password,"nuevaContrasenia":newPassword,"confirmacionContrasenia": confirmPassword, "ip":"127.0.0.1"};
			  $.ajax({
					url: 'http://10.15.3.32/soa-infra/resources/default/VUNTrazabilidad!1.0/VUN/seguridad/cambiarContrasenia',
					type: 'POST',
					dataType: "json",
					contentType: 'application/json',
					data: JSON.stringify(payload),
			  })
			  .done(function(response) {
					document.getElementById("password").value = '';
					$('#myModal').modal('hide');
			  }).fail(function(response){
							console.log('fail --- ' + JSON.stringify(response));
			  });
		}

		function errorMessage(message) {
		   $("#errorModalFlashMessage").html('<span class="alert alert-danger alert-complement"><small>' + message + '</small></span>').show();
		   controller.startTimeOut();
		}
	},
sendMacrotramite:function(){
    var controller = this;
    if( $('#tab-01').hasClass('active')) {
        var folioSeguimiento = document.getElementById("folioSeguimiento").value ;
        var homoclave = document.getElementById("homoclave").value;
        var estatus = document.getElementById("estatus")  ;
        var resolucion = document.getElementById("resolucion");
        var nota = document.getElementById("nota").value ;
        var formData = [folioSeguimiento, homoclave, estatus, resolucion, nota];
        var busqueda =formData.find(findMissing );
        if(formData.find(findMissing )){
            this.errorFlagMessage("faltan campos");
        }else{
			var payload = {
				"metodo": 1,
				"folioSeguimiento": folioSeguimiento,
				"homoclave": homoclave,
				"estatus": Number(estatus.options[estatus.selectedIndex].value),
				"resolucion": Number(resolucion.options[resolucion.selectedIndex].value),
				"idOperador": controller.user,
				"ip":"127.0.0.1" ,
				"nota": nota

			};
			  $.ajax({
					url: 'http://10.15.3.32/soa-infra/resources/default/VUNTrazabilidad!1.0/VUN/IOP/notificarEstatusTramite',
					type: 'POST',
					dataType: "json",
					contentType: 'application/json',
					data: JSON.stringify(payload),
			  })
			  .done(function(response) {
					 document.getElementById("folioSeguimiento").value = '';
					 document.getElementById("homoclave").value= '';
					 document.getElementById("estatus").value  = '';
					 document.getElementById("resolucion").value= '';
					 document.getElementById("nota").value = '';
					 $("#errorLog").html('<span class="alert alert-success alert-complement"><small>' + 'Tramite Creado' + '</small></span>').show();
					 controller.startTimeOut();
			  }).fail(function(response){
							console.log('fail --- ' + JSON.stringify(response));
			  });
		 }
	 }
	 else if($('#tab-02').hasClass('active')){
		var macroTramite = document.getElementById("macrotramite") ;
		var idMacrotramite = document.getElementById("idMacrotramite").value ;
		var homoclave = document.getElementById("homoclaveMacro").value ;
		var tramiteInstitucion = document.getElementById("tramiteInstitucion").value ;
		var tipoPersona = document.getElementById("tipoPersona") ;
		var noIdentificacion = document.getElementById("noIdentificacion").value ;
		var formData = [macrotramite, idMacrotramite, homoclave, tramiteInstitucion, tipoPersona, noIdentificacion];
		var busqueda =formData.find(findMissing );
		if(formData.find(findMissing )){
			this.errorFlagMessage("faltan campos");
		}
		else{

			var payload = {
				"metodo":1,
				"idInteroperabilidad": Number(macroTramite.options[macroTramite.selectedIndex].value),
				"idMacrotramiteInstitucion": idMacrotramite,
				"homoclave": homoclave ,
				"idTramiteInstitucion": tramiteInstitucion,
				"idOperador": controller.user,
				"tipoPersona": Number(tipoPersona.options[tipoPersona.selectedIndex].value),
				"idPersona": noIdentificacion,
				"ip": "192.1.4.90"
			};

			  $.ajax({
					url: 'http://10.15.3.32/soa-infra/resources/default/VUNTrazabilidad!1.0/VUN/IOP/registrarRefMacrotramite',
					type: 'POST',
					dataType: "json",
					contentType: 'application/json',
					data: JSON.stringify(payload),
			  })
			  .done(function(response) {
                    controller.folioSeguimiento = response.folioSeguimiento;
					document.getElementById("macrotramite").value= '' ;
					document.getElementById("idMacrotramite").value= '' ;
					document.getElementById("homoclaveMacro").value= '' ;
					document.getElementById("tipoPersona").value= '' ;
					document.getElementById("tramiteInstitucion").value = '' ;
					document.getElementById("noIdentificacion").value= '' ;
					document.getElementById("folioModal").innerHTML = controller.folioSeguimiento;
					$('#myModal2').modal('show');
			  }).fail(function(response){
							console.log('fail --- ' + JSON.stringify(response));
			  });
		}

	}
	function findMissing(form) {
		return form.value === '';
	}
}

}
