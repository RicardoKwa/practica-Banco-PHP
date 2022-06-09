<?php	
	require_once 'sesiones_json.php';
	require_once 'bd.php';

    if(comprobar_sesion()){ 

	    $cuentas = cargar_cuentas($_POST['email']);
        if($cuentas === FALSE){
            $vacio = array("");
            echo json_encode($vacio);           
        }else{
            $cuentas_json = json_encode($cuentas);			
            $_SESSION['cuentas'] = $cuentas_json;
            echo $cuentas_json;
        }
	}else{
        return;
    }
