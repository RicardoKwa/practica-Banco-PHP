<?php
function comprobar_sesion(){
	session_start();
	if(!isset($_SESSION['cliente'])){	
		return false;
	}else return true;		
}
