<?php
session_start();
require("./query.php");
/*
* Develop by Sompop Kulapalanont
* Email : sompop.kulapalanont@gmail.com
*/
if(isset($_GET) && isset($_GET['action']) )
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
	}else if($action == "user")
	{
		echo json_encode(array(
			"user" => $_SESSION[adm_user_name]

		));
	}
	else if($action == "check_approve")
	{
		$params = $_GET['params'];

		$table = "l_approverlist";
		$query = new Query($table);
		$data = $query->selectOne($params);
			
		//check if data exist
		if(!$data)
		{
			echo json_encode(array(
					"result" => "fail"
				));
			return false;
		}
		$user_query = new Query("l_empltable");
		$curent_user_data = $user_query->selectOne(array(
			"UserID" => $_SESSION[adm_user_name]
		));
		//check if current_user data exist
		if(!$curent_user_data)
		{
				echo json_encode(array(
					"result" => "fail"
				));
				return false;
		}
		$curent_user_id = $curent_user_data["EmplID"];
		$check_lists = array(
			'Approver1', 'Approver2', 'Approver3', 'HRID'
		);
		foreach ($check_lists as $item) {
			# code...
			if($data[$item] == $curent_user_id)
			{
				echo json_encode(array(
					"result" => "success",
					"level" => $item
				));
				
				
				return true;
				break;
			}
		}

		echo json_encode(array(
				"result" => "fail",
				"message" => "not any approve"
			));
	}else if($action == "approve")
	{

	}else if($action == "approve_status")
	{
		$params = $_GET['params'];
		$sql = "SELECT *  FROM `l_approvetrans` WHERE `LeaveTransID` = '{$params['LeaveTransID']}' AND `Approve` = '{$params['Approve']}' Order By `ApproveTransID` DESC LIMIT 0,1";



		mysql_query("SET NAMES 'utf8'");
		$dbquery = mysql_query($sql);
		$result = mysql_fetch_assoc($dbquery);
		if($result)
			echo json_encode( $result );
		else
			echo json_encode(null);
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
	}else if($action == 'update')
	{
		$query = new Query($table);
		
		if(isset($request->condition))
		{
			
			$data = $query->update($params, $request->condition);	
		}else
		{
			
			$data = $query->update($params);
		}

		echo json_encode($data);
		
	}
}
	

?>