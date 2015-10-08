<?php
session_start();
require("./query.php");
/*
* Develop by Sompop Kulapalanont
* Email : sompop.kulapalanont@gmail.com
*/

$action = $_GET['action'];
$table = $_GET['table'];
$params = $_GET['params'];

if($action == "query")
{
	$query = new Query($table);
	echo json_encode($query->selectAll($params));
}else if($action == "get")
{
	$query = new Query($table);
	$data = $query->selectOne($params);
	echo json_encode($data);
	
}



?>