<?php
require_once 'sesiones_json.php';
require_once 'bd.php';

function exec_crear_cuenta($email,$numero){ //Funcion 'ejecutora' , manda el email si se ha creado una nueva cuenta, ese email lo utilizamos como param en el js
	$resul = crear_cuenta($email,$numero);
	if(!$resul){	
		echo "FALSE";
	}else{		
		echo $email;	
	}		
}
	
if(comprobar_sesion()){
	$cuentas = cargar_cuentas($_SESSION['cliente']['email']);
	//Cantidad de cuentas: Maximo 5 cuentas
	if($cuentas != FALSE){
		if(sizeof($cuentas)<5){
				exec_crear_cuenta($_SESSION['cliente']['email'],$_POST['numero_cuenta']);
		}else{
			echo "MAX";
		}
	}else{
		exec_crear_cuenta($_SESSION['cliente']['email'],$_POST['numero_cuenta'],TRUE);
	}
}



















