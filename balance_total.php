<?php
require_once 'sesiones_json.php';
require_once 'bd.php';
    
	if(comprobar_sesion()){	
        $resul = balance($_SESSION['cliente']['email']);
        if($resul == FALSE){
            echo "FALSE";
        }else{
            echo $resul;
        }
    }
