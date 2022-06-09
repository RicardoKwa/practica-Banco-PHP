<?php
require_once 'sesiones_json.php';
require_once 'bd.php';
    
	if(comprobar_sesion()){	
        $resul = saldo($_POST['numero_cuenta']);
        if($resul == FALSE){
             echo "FALSE";
        }else{
          echo $resul;
        }
    }
