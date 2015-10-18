<?php
session_start();
require("./query.php");
/*
* Develop by Sompop Kulapalanont
* Email : sompop.kulapalanont@gmail.com
*/

function sendEmail($to, $subject, $message, $from = "admin@splifetech.com")
{
	$headers = "From: {$from}" . "\r\n" .
	    "Reply-To: {$from}" . "\r\n" .
	    'X-Mailer: PHP/' . phpversion();

	return mail($to, $subject, $message, $headers);
	//$result = mail($to, $subject, $message, $headers);
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
		"approvers_ids" => $approver_ids,
		"hr" => $result['HRID']
	);
}

function notifyLeaveTrans($leave_trans ,$owner_id, $message)
{
	$sql = 	"SELECT * FROM `l_approverlist` WHERE EmplID = '{$owner_id}'";
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
			$approver_ids[$item] = $result[$item];
		}
	}
	$emails = findEmailsByEmplID($approver_ids);
	foreach ($emails as $email) {
		# code...

		sendEmail($email, "Employee's Leave ({$leave_trans}) Notification", $message);
	}
}


/*
* Main service
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
		if($table == 'l_leavetrans')
			$params['LeaveTransID'] = $params['LeaveTransID']."";
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
		$hr_id = $result['hr'];

		$email_id_list = array();
		array_push($email_id_list, $EmplID);
		$email_id_list = array_merge($email_id_list, $approvers_ids);
		
		$emails = findEmailsByEmplID($email_id_list);
		$tmp = array();
		$tmp[0] = $hr_id;
		$hr_emails = findEmailsByEmplID($tmp);

		$hr_email = $hr_emails[$hr_id];
		$owner_email = $emails[$EmplID];

		if($params['Status'] == 6)
		{
			$url = "http://leave.splifetech.com/leave/sick.php#/read/{$params['LeaveTransID']}";
			sendEmail($owner_email, "Leave's form {$params['LeaveTransID']} have been acknowledged", "Leave's form {$params['LeaveTransID']} have been acknowledged {$url} ");
			sendEmail($hr_email, "Leave's form {$params['LeaveTransID']} have been acknowledged", "Leave's form {$params['LeaveTransID']} have been acknowledged {$url} ");
			echo json_encode(array(
				"status" => "acknowledged",
				
			));
		}else if($result['result'])
		{
			//email to hr
			/*$email_result = sendEmail($owner_email, "ลาได้", "ลาดได้นี่คือการทดสอบ");
			if(!$email_result)
				$email_result = error_get_last();*/
			$result_email = array();
			$url = "http://leave.splifetech.com/leave/sick.php#/read/{$params['LeaveTransID']}";
			foreach ($emails as $id => $email) {
				# code...
				$result_email[$id] = sendEmail($email, "Leave's form {$params['LeaveTransID']} have been Approved", "Leave's form {$params['LeaveTransID']} have been approved. You could view a form at $url");
			}
			//send email to hr
			$hr_result = sendEmail($hr_email, "Leave's form {$params['LeaveTransID']} have been Approved and Ready to be acknowledged", "Leave's form {$params['LeaveTransID']} have been approved. You could view a form at $url");

			//update leavesTran
			$query = new Query('l_leavetrans');
			$query->update(array(
				"Status" => 3
			), "LeaveTransID = {$params['LeaveTransID']}");
			
			$_query = new Query('l_leavetrans');
			$leave_tran = $_query->selectOne(array(
				'LeaveTransID' => $params['LeaveTransID']
			));
			//deduct what it got
			//it got 
			$_old_query = new Query('l_leavetable');
			$old_leave = $_old_query->selectOne(array(
				'EmplID' => $leave_tran['EmplID'],
				'LeaveType' => $leave_tran['LeaveType']
			));
			$old_leave_min = $old_leave['Used'];
			//current leave trans min

			$current_leave_min = $leave_tran["TotalDay"] * 8 * 60 + $leave_tran["TotalHour"] * 60 + $leave_tran["TotalMin"];

			$new_min = $old_leave_min + $current_leave_min;


			$_update_query = new Query('l_leavetable');
			$_update_query->update(array(
				'Used' => $new_min
			), "EmplID = {$leave_tran['EmplID']} AND LeaveType = {$leave_tran['LeaveType']}");
			//deduct leave min



			echo json_encode(array(
				"status" => "approved",
				"email_result" => $email_result,
				"emails" => $emails,
				"hr_emails" => $hr_emails,

				"hr_result" => $hr_result,
				"email_id_list" => $email_id_list
			));
		}else if($params["Status"] == 5){
			$email_result =sendEmail($owner_email, "Your Leave's form {$params['LeaveTransID']} need to be re-edit", "Your leave form need to be re-edit you could edit and resend again http://leave.splifetech.com/leave/sick.php#/read/{$params['LeaveTransID']}");
			//update status
			$query = new Query('l_leavetrans');
			$query->update(array(
				"Status" => 5
			), "LeaveTransID = {$params['LeaveTransID']}");
			
			

			echo json_encode(array(
				"status" => $data,
				"owner_result" => $email_result,
				"params" => $params,
			));
		}else if($params["Status"] == 3)
		{
			$url = "http://leave.splifetech.com/leave/sick.php#/read/{$params['LeaveTransID']}";
			$result_email = array();
			foreach ($emails as $id => $email) {
				# code...
				$result_email[$id] = sendEmail($email, "Leave's form {$params['LeaveTransID']} have been preapprove", "Leave's form {$params['LeaveTransID']} have been preapproved you could view at {$url}");
			}
			//email บอก เจ้าของ doc
			//email บอกทุกคนยกเว้นตัวเอง
			echo json_encode(array(
				"status" => $data,
				"result_email" => $result_email,
				"params" => $params,
			));
		}else if($params["Status"] == 4)
		{
			$url = "http://leave.splifetech.com/leave/sick.php#/read/{$params['LeaveTransID']}";
			$result_email = array();
			foreach ($emails as $id => $email) {
				# code...
				$result_email[$id] = sendEmail($email, "Leave's form {$params['LeaveTransID']} have been denied!", "Leave's form {$params['LeaveTransID']} have been denied! due to {$params['Remark']} from user {$_SESSION['adm_user_name']}");
			}
			//email บอก เจ้าของ doc
			//email บอกทุกคนยกเว้นตัวเอง
			echo json_encode(array(
				"status" => $data,
				"result_email" => $result_email,
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

		if($table == 'l_leavetrans')
		{
			if(isset($params->Status))
			{
				if($params->Status == 1)
				{
					$array = array();
					$array[0] = $params->EmplID;
					$emails = findEmailsByEmplID($array);
					$owner_email = $emails[$params->EmplID];
					$url = "http://leave.splifetech.com/leave/sick.php#/read/{$params->LeaveTransID}";
					$message = "you can edit your leave form at $url";
					sendEmail($owner_email, "Your leave form have been save", $message, "noreply@spliftech.com");
					$data= array(
						'data' => $data,
						'email' => $owner_email,
					);
				}else if($params->Status == 2)
				{
					//notify everyone who involve
					$url = "http://leave.splifetech.com/leave/sick.php#/read/{$params->LeaveTransID}";
					$message = "Employee ID {$params->EmplID} 's leave application need you to verify you could verify at {$url}";
					notifyLeaveTrans($params->LeaveTransID, $params->EmplID, $message);
				}

			}
			
		}

		echo json_encode($data);
		
	}
}
	

?>