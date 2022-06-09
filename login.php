<?php
require_once 'bd.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {  
	$json = file_get_contents('php://input');
    $data = json_decode($json,true);

	$usu = comprobar_usuario($data['email']);
	if($usu === "FALSE"){
		echo "FALSE";
		 
	}else{
		if(password_verify($data['clave'],$usu['clave'])){
            session_start();
			$_SESSION['cliente'] = $usu;
			$_SESSION['cuentas'] = [];
			echo "TRUE";	
		}else{
			echo "FALSE";
		}	
	}	
}

