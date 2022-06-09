<?php
require_once 'bd.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {  
    $json = file_get_contents('php://input');
    $data = json_decode($json,true);
	
	$password = $data['clave'];
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

	$new_usu = registro_usuario($data['nombre'],$data['papellido'],$data['sapellido'],$data['email'], $password_hash);
	if(!$new_usu){
		echo "FALSE";
	}else{
		if(!empty($data['cuenta'])){
			crear_cuentaReg($data['cuenta'],$data['email']);
		}
		session_start();
        $cliente = array(
            "nombre" => $data['nombre'],
            "p_apellido" => $data['papellido'],
            "s_apellido" => $data['sapellido'],
            "email" => $data['email'],
            "clave" => $data['clave']
        );
		$_SESSION['cliente'] = $cliente;
		$_SESSION['cuentas'] = [];
		echo "TRUE";
	}	

}