<?php
require_once 'bd.php';
	
if ($_SERVER["REQUEST_METHOD"] == "POST") { 
	$movimientos = listar_movimientos($_POST['numero_cuenta']);
	$movimientos_json = json_encode($movimientos);	
	echo $movimientos_json;
}

