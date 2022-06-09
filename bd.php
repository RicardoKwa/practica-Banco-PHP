<?php

function leer_config($nombre, $esquema){
	$config = new DOMDocument();
	$config->load($nombre);
	$res = $config->schemaValidate($esquema);
	if ($res===FALSE){ 
	   throw new InvalidArgumentException("Revise fichero de configuración");
	} 		
	$datos = simplexml_load_file($nombre);	
	$ip = $datos->xpath("//ip");
	$nombre = $datos->xpath("//nombre");
	$usu = $datos->xpath("//usuario");
	$clave = $datos->xpath("//clave");	
	$resul = [];
	$resul[] = $ip[0];
	$resul[] = $usu[0];
	$resul[] = $clave[0];
	$resul[] = $nombre[0];
	return $resul;
}

function comprobar_usuario($email){
	$res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
	$mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);

	$select = $mysqli->query("SELECT * FROM cliente WHERE email = '$email'");
	$row_cnt = $select->num_rows;
	$row = $select->fetch_array(MYSQLI_ASSOC); 
    $mysqli->close();
	if ($row_cnt == 1){
		 return $row;
	}else{
		return "FALSE";
	}
}


function registro_usuario($nombre,$p_apellido,$s_apellido,$email,$clave){
	$res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
	$mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
	if ($mysqli->connect_errno) {
		printf("Falló la conexión: %s\n", $mysqli->connect_error);
		exit();
	}
	$sel = $mysqli->query("SELECT email FROM cliente WHERE email = $email");
	$row_cnt = $sel->num_rows;
	if($row_cnt == 0){
        $insert = "INSERT INTO cliente (nombre,p_apellido,s_apellido,email,clave) VALUES ('$nombre','$p_apellido','$s_apellido','$email','$clave')";
		$mysqli->query($insert);
		$mysqli->close();
		return TRUE;
	}else{
		$mysqli->close();
		return FALSE;
	}
}


function cargar_cuentas($email){
    $res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
    $mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
  
    if ($resultado = $mysqli->query("SELECT num_cuenta,compartida FROM compartidas WHERE email_c = '$email'")) {
        /* obtener el array de objetos */
        $array =[];
        while ($obj = $resultado->fetch_object()) {
        array_push($array,$obj);
        }
        /* liberar el conjunto de resultados */
        $resultado->close();
        if (sizeof($array)>0){
            return $array;
        }else{
            return FALSE;
        }
    }
}


function insertar_movimiento($tipoMov,$importe,$numeroCuenta){
	$res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
	
	$mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
	if ($mysqli->connect_errno) {
		printf("Falló la conexión: %s\n", $mysqli->connect_error);
		exit();
	}

	$select2 = $mysqli->query("SELECT saldo FROM cuentabancaria WHERE numero_cuenta = '$numeroCuenta'");
	$row2 = $select2->fetch_array(MYSQLI_NUM); // saldo de la cuenta para actualizarlo
	$old_saldo = $row2[0];

	if($tipoMov === 'Ingreso'){
	$new_saldo = floatval($old_saldo) + floatval($importe);
	}else{
	$new_saldo = floatval($old_saldo) - floatval($importe);
	}
    
	if (sizeof($row2) == 1 && $new_saldo >= 0){
		$mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
		$insert = "INSERT INTO movimientos(tipo_mov, monto, numero_cuenta) VALUES ('$tipoMov',$importe,$numeroCuenta)";
		$update = "UPDATE cuentabancaria SET saldo =$new_saldo WHERE numero_cuenta = $numeroCuenta";
	    if ($mysqli->query($insert) && $mysqli->query($update)) {
				$mysqli->commit();
        		$mysqli->close();
				return TRUE;
		}else{
			$mysqli->rollback();
			$mysqli->close();
			return FALSE;
		}
	}else{
	  $mysqli->close();
	  return FALSE;
	}
}

function balance($email){
    $res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
    $mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
    if ($mysqli->connect_errno) {
        printf("Falló la conexión: %s\n", $mysqli->connect_error); 
        exit();
    }
    $select = $mysqli->query("SELECT SUM(saldo) as saldoTotal FROM cuentabancaria WHERE numero_cuenta IN (SELECT num_cuenta FROM compartidas WHERE email_c = '$email')");
    $row = $select->fetch_array(MYSQLI_ASSOC); 
    $row_cnt = $select->num_rows;
    if($row_cnt == 1){
        $suma = $row['saldoTotal'];
        $mysqli->close();
        return $suma;
    }else{
        $mysqli->close();
        return FALSE;
    }
}


function crear_cuenta($email,$numero){
	$res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
	$mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
	if ($mysqli->connect_errno) {
		printf("Falló la conexión: %s\n", $mysqli->connect_error);
		exit();
	}
    $numero = intval($numero);
    $sel1 = $mysqli->query("SELECT numero_cuenta FROM cuentabancaria WHERE numero_cuenta = $numero");
	$sel2 = $mysqli->query("SELECT num_cuenta FROM compartidas WHERE num_cuenta = $numero AND email_c = '$email'");

    $row_cnt1 = $sel1->num_rows;
	$row_cnt2 = $sel2->num_rows;
	
	if($row_cnt1 == 1){
		if($row_cnt2 == 1){
			$mysqli->close();
			return FALSE;
		}else{
			if($insert = $mysqli->query("INSERT INTO compartidas (num_cuenta,email_c,compartida) VALUES ($numero,'$email',1)")){
				$update = $mysqli->query("UPDATE compartidas SET compartida = 1 WHERE num_cuenta = $numero");
			$mysqli->close();
        	return TRUE;
			}
		}
	}else{
	$mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
	$insert1 = $mysqli->query("INSERT INTO cuentabancaria (numero_cuenta) VALUES ($numero)");
    $insert2 = $mysqli->query("INSERT INTO compartidas (num_cuenta,email_c,compartida) VALUES ($numero,'$email',0)");
    if($insert1&&$insert2){
        $mysqli->commit();
        $mysqli->close();
        return TRUE;
    }else {
        $mysqli->rollback();
        $mysqli->close();
        return FALSE;
    }
 }
}

function crear_cuentaReg($numero,$email){
	$res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
	$mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
	if ($mysqli->connect_errno) {
		printf("Falló la conexión: %s\n", $mysqli->connect_error);
		exit();
	}
	
	$sel = $mysqli->query("SELECT numero_cuenta FROM cuentabancaria WHERE numero_cuenta = $numero");
	$row_cnt = $sel->num_rows;
	if($row_cnt == 1){
		$insert = $mysqli->query("INSERT INTO compartidas(email_c,num_cuenta,compartida) VALUES ('$email',$numero,1)");
		$update = $mysqli->query("UPDATE compartidas SET compartida = 1 WHERE num_cuenta = $numero");

	}else{
		if($mysqli->query("INSERT INTO cuentabancaria (numero_cuenta) VALUES ($numero)")){
		$insert2 = $mysqli->query("INSERT INTO compartidas (email_c,num_cuenta,compartida) VALUES ('$email',$numero,0)");  
		}
	}
	$mysqli->close();	
}


function listar_movimientos($numeroCuenta){
	$res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
	$mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
	if ($mysqli->connect_errno) {
		printf("Falló la conexión: %s\n", $mysqli->connect_error);
		exit();
	}
	if ($resultado = $mysqli->query("SELECT tipo_mov , monto, fecha FROM movimientos WHERE numero_cuenta = '$numeroCuenta'")) {
		/* obtener el array de objetos */
		$array =[];
		// $obj = $resultado->fetch_object();
		while ($obj = $resultado->fetch_object()) {
		array_push($array,$obj);
		}
		$resultado->close();
	}
	if (sizeof($array)>0){
		$mysqli->close();
				return $array;
	}else{
		$mysqli->close();
				return FALSE;
	}
}

function saldo($cuenta){
    $res = leer_config(dirname(__FILE__)."\configuracion.xml", dirname(__FILE__)."\configuracion.xsd");
    $mysqli = new mysqli($res[0], $res[1], $res[2], $res[3]);
    if ($mysqli->connect_errno) {
        printf("Falló la conexión: %s\n", $mysqli->connect_error); 
        exit();
    }
    $select = $mysqli->query("SELECT saldo FROM cuentabancaria WHERE numero_cuenta = $cuenta");
    $row = $select->fetch_array(MYSQLI_NUM); 
    $row_cnt = $select->num_rows;
    if($row_cnt == 1 && sizeof($row) == 1){
        $mysqli->close();
        return $row[0];
    }else{
        $mysqli->close();
        return FALSE;
    }
}