<?php
require_once 'bd.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {  
	$json = file_get_contents('php://input');
    $data = json_decode($json,true);
    
	 if(!($data['importe'] > 0)){
		echo "Negativo";
		return ;
	}

    $resul = insertar_movimiento($data['tipoMov'],$data['importe'],$data['cuenta']);
	if($resul === FALSE){
		echo "FALSE";
	}elseif($resul === TRUE){		
		echo "TRUE";	
	}	

}

