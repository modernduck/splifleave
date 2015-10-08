<?php
session_start();
require("./query.php");
/*
* Develop by Sompop Kulapalanont
* Email : sompop.kulapalanont@gmail.com
*/
if(isset($_GET) && isset($_GET['action']) && isset($_GET['table']))
{
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
		
	}else if($action == "last_id")
	{
		$params = $_GET['params'];
		$query = new Query($table);
		$id_name = $params['idName'];
		$data = $query->getLastID($id_name);
		echo json_encode($data);
	}
}else if(isset($_POST))
{
	$postdata = file_get_contents("php://input");
    $request = json_decode($postdata);

	$action = $request->action;
	$table = $request->table;
	$params = $request->params;

	if($action == 'create')
	{
		//echo "gonna create";
		$query = new Query($table);
		$data = $query->create($params);
		echo json_encode($data);
	}
}
	

?>