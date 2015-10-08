<?php
session_start();
require("./query.php");
/*
* Develop by Sompop Kulapalanont
* Email : sompop.kulapalanont@gmail.com
*/

$action = $_GET['action'];
$table = $_GET['table'];


if($action == "query")
{
	$params = $_GET['params'];
	$query = new Query($table);
	echo json_encode($query->selectAll($params));
}else if($action == "get")
{
	$params = $_GET['params'];
	$query = new Query($table);
	$data = $query->selectOne($params);
	echo json_encode($data);
	
}else if($action == "update")
{

}else if($action == "create")
{

}else if($action == "upload")
{
	
}



?>