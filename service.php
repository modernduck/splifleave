<?php
session_start();
require("./query.php");
/*
* Develop by Sompop Kulapalanont
* Email : sompop.kulapalanont@gmail.com
*/

function sendEmail($to, $subject, $message, $from = "admin@splifetech.com")
{
	$headers = 'From: {$from}' . "\r\n" .
	    'Reply-To: {$from}' . "\r\n" .
	    'X-Mailer: PHP/' . phpversion();

	return mail($to, $subject, $message, $headers);
	
}

function filterApproveStatus ($Status)
{

}

function findEmailsByEmplID ($ids)
{
	$result = array();
	$sql = "SELECT`EmplID`, `Email` FROM `l_empltable` WHERE ";
	$counter = 0;
	foreach ($ids as $key => $value) {
		# code...
		if($counter > 0)
			$sql = $sql." OR ";
		$sql = $sql."`EmplID` = ".$value;
		//`EmplID` = 20033 OR `EmplID` = 20110 
		$counter++;
	}
	$dbquery = mysql_query($sql);
		//$result= mysql_fetch_array($dbquery);
		
	$result = array();
	while ($row = mysql_fetch_assoc($dbquery)) 
		$result[$row['EmplID']] = $row['Email'];
	return $result;
}

function getCurrentTrans($LeaveTransID, $Approve)
{
		$sql = "SELECT *  FROM `l_approvetrans` WHERE `LeaveTransID` = '{$LeaveTransID}' AND `Approve` = '{$Approve}' Order By `ApproveTransID` DESC LIMIT 0,1";
	//	echo $sql;
		mysql_query("SET NAMES 'utf8'");
		$dbquery = mysql_query($sql);
		$result = mysql_fetch_assoc($dbquery);
		return $result;
}

function isLeavePass($leave_trans, $doc_owner_id)
{
	$PASS_STATUS = 3;
	$sql = 	"SELECT * FROM `l_approverlist` WHERE EmplID = '{$doc_owner_id}'";
	mysql_query("SET NAMES 'utf8'");
	$dbquery = mysql_query($sql);
	$result = mysql_fetch_assoc($dbquery);
	$status = array();
	$checker = array("Approver1", "Approver2", "Approver3");
	$approver_ids = array();
	foreach ($checker as $item) {
		if(isset($result[$item]) && !empty($result[$item]))
		{
			//echo 'asd';
			//echo $result[$item].',';
			$result2 = getCurrentTrans($leave_trans, $result[$item]);
			array_push($status, $result2['Status']);
			$approver_ids[$item] = $result[$item];
		}
	}

	$isPass = true;
	foreach ($status as $item) {
		$isPass = ($item == $PASS_STATUS) & $isPass;
	}
	return array(
		"result" => $isPass,
		"sql" => $sql,
		"status" => $status,
		"approvers_ids" => $approver_ids
	);
}

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
		$params = $_GET['params'];
		$query = new Query('l_approvetrans');
		//should lock with current login user
		$current_status = $params['Status'];

		$EmplID = $params['EmplID'];
		unset($params['EmplID']);
		$data = $query->create($params);
		$result = isLeavePass($params['LeaveTransID'], $EmplID);
		$approvers_ids = $result['approvers_ids'];

		$email_id_list = array();
		array_push($email_id_list, $EmplID);
		$email_id_list = array_merge($email_id_list, $approvers_ids);
		
		$emails = findEmailsByEmplID($email_id_list);

		$owner_email = $emails[$EmplID];


		if($result['result'])
		{
			//email to hr
			$email_result = sendEmail($owner_email, "ลาได้", "ลาดได้นี่คือการทดสอบ");
			if(!$email_result)
				$email_result = error_get_last();
			echo json_encode(array(
				"status" => "approved",
				"email_result" => $email_result,
				"emails" => $emails,
				"email_id_list" => $email_id_list
			));
		}else
		{
			//email บอก เจ้าของ doc
			//email บอกทุกคนยกเว้นตัวเอง
			echo json_encode(array(
				"status" => $data,
				
				"params" => $params,
			));
		}


	}else if($action == "test")
	{
		$params = $_GET['params'];	
		$doc_owner_id ="20110";
		$leave_trans = "5800003";
		$emails = findEmailsByEmplID(array("20033", "20110"));
		echo json_encode($emails);
	}

	else if($action == "approve_status")
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