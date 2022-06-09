<?php
require_once 'sesiones_json.php';

	if(comprobar_sesion()){
    echo $_SESSION['cuentas'];
    }
