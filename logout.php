<?php	
require_once 'sesiones_json.php';
if(comprobar_sesion()){	
    unset($_SESSION['cliente']);
    unset($_SESSION['cuentas']);
    session_destroy();
    setcookie(session_name(), 123, time() - 1000);
}
	
