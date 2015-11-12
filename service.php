<?php
error_reporting(E_ERROR | E_PARSE);
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



function getNewLeaveTransID()
{
	
	$query = new Query('l_leavetrans');
	$last_id = $query->getLastID('TransID');
	$last_id = $last_id['TransID'];

	$new_id = $last_id + 1;
	//return $new_id;
	$current_year = date("Y");
	$thai_year = $current_year  + 2443;
	$prefix = substr($thai_year, 2);

	//$string_digit  =  stringDigit ($new_id, 5);
		
	$string_digit = sprintf("%05d", $new_id);
	
	return $prefix.$string_digit;
}

function filterApproveStatus ($Status)
{

}



function findEmailsByEmplID ($ids)
{
	$result = array();
	$sql = "SELECT`EmplID`, `Email`, `NameThai` FROM `l_empltable` WHERE ";
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
		$result[$row['EmplID']] = array(
			"email" =>$row['Email'],
			"NameThai" => $row['NameThai']
		);
		//$result[$row['EmplID']] = $row['Email'];
	return $result;
}

function getCurrentTrans($LeaveTransID, $Approve, $isCancle = false)
{
	$table = "l_approvetrans";
	if($isCancle)
		$table = "l_cancle_approvetrans";
	$sql = "SELECT *  FROM `{$table}` WHERE `LeaveTransID` = '{$LeaveTransID}' AND `Approve` = '{$Approve}' Order By `ApproveTransID` DESC LIMIT 0,1";
//	echo $sql;
	mysql_query("SET NAMES 'utf8'");
	$dbquery = mysql_query($sql);
	$result = mysql_fetch_assoc($dbquery);
	return $result;
}

function isLeavePass($leave_trans, $doc_owner_id, $isCancle = false)
{
	$PASS_STATUS = 3;
	$sql = 	"SELECT * FROM `l_approverlist` WHERE EmplID = '{$doc_owner_id}'";
	mysql_query("SET NAMES 'utf8'");
	$dbquery = mysql_query($sql);
	$result = mysql_fetch_assoc($dbquery);
	$status = array();
	$checker = array("Approver1", "Approver2", "Approver3");
	$isWho = array();
	$approver_ids = array();
	$order_approve = 0;

	foreach ($checker as $item) {
		$isWho[$item]  = false;
		if(isset($result[$item]) && !empty($result[$item]))
		{
			//echo 'asd';
			//echo $result[$item].',';
			$result2 = getCurrentTrans($leave_trans, $result[$item], $isCancle);
			array_push($status, $result2['Status']);
			$isWho[$item] = true;
			$approver_ids[$item] = $result[$item];
		}
	}

	$isPass = true;
	foreach ($status as $item) {
		$isPass = ($item == $PASS_STATUS) & $isPass;
		if($isPass)
			$order_approve++;
	}
	if($order_approve <= 0)
		$isPass = false;
	return array(
		"result" => $isPass,
		"sql" => $sql,
		"status" => $status,
		"approvers_ids" => $approver_ids,
		"order_approve" => $order_approve,
		"hr" => $result['HRID'],
		"isWho" => $isWho,
	);
}

function markAsWaiting($leave_trans, $approver_id, $isCancle = false)
{
	
	$status = 2;//WAITING
	$query;
	if($isCancle)
	{
		$query = new Query('l_cancle_approvetrans');
	}else
	{
		$query = new Query('l_approvetrans');

	}
		
	return $query->create(array(
		"LeaveTransID" => $leave_trans,
		"Approve" => $approver_id,
		"Status" => $status
	));

}

function notifyLeaveTrans($leave_trans ,$owner_id, $message, $isCancle = false)
{
	$sql = 	"SELECT * FROM `l_approverlist` WHERE EmplID = '{$owner_id}'";
	mysql_query("SET NAMES 'utf8'");
	$dbquery = mysql_query($sql);
	$result = mysql_fetch_assoc($dbquery);
	$status = array();
	//$checker = array("Approver1", "Approver2", "Approver3");
	$checker = array("Approver1");
	$approver_ids = array();
	foreach ($checker as $item) {
		if(isset($result[$item]) && !empty($result[$item]))
		{
			//echo 'asd';
			//echo $result[$item].',';
			$approver_ids[$item] = $result[$item];
		}
	}
	$approver_id = $approver_ids["Approver1"];
	if($isCancle)
		markAsWaiting($leave_trans, $approver_id, true);
	else
		markAsWaiting($leave_trans, $approver_id);
	$emails = findEmailsByEmplID($approver_ids);
	$result = array();
	foreach ($emails as $email) {
		# code...
		array_push(
			$result, 
			sendEmail($email['email'], "รายการรออนุมัติ({$leave_trans})", $message)
		);
	}
	return array(
		'emails' => $emails,
		'result' => $result,
	);
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
	else if($action == "get_approve_status")
	{
		$params = $_GET['params'];
		$result = getCurrentTrans($params['LeaveTransID'], $params['Approve']);

		if($result)
			echo json_encode($result);
		else
			echo json_encode(array(
				"status" => false
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
	}else if($action == "approve" || $action == "approve_cancle")
	{
		$params = $_GET['params'];
		$query = new Query('l_approvetrans');
		$isCancle = false;
		if($action == "approve_cancle")
		{
			$query = new Query('l_cancle_approvetrans');
			$isCancle = true;
		}

		//should lock with current login user
		$current_status = $params['Status'];

		$EmplID = $params['EmplID'];//id of leaves owner
		//instead of create new make it update from before
		unset($params['EmplID']);
		$data = $query->update(
			$params, 
			"Status = 2  AND LeaveTransID = {$params['LeaveTransID']} AND Approve = {$params['Approve']}"	
		);
		//

		$result = isLeavePass($params['LeaveTransID'], $EmplID, $isCancle);


		$approvers_ids = $result['approvers_ids'];
		$hr_id = $result['hr'];

		$email_id_list = array();
			array_push($email_id_list, $EmplID);


		//Before add everyone
		$email_id_list = array_merge($email_id_list, $approvers_ids);

		//"email_id_list":{"0":"12294","Approver1":"10576","Approver2":"20181"}
		$correct_email_id_list = array();

		if($result['order_approve'] == 1 )
			$correct_email_id_list["0"] = $email_id_list["Approver2"];
		else if($result['order_approve'] == 2 )
			$correct_email_id_list["1"] = $email_id_list["Approver3"];
		else
			$correct_email_id_list = $email_id_list;
		
		$older_approve_email_id_list = array();
		if($result['order_approve'] == 1 )
			$older_approve_email_id_list["0"] = $email_id_list["Approver1"];
		if($result['order_approve'] == 2 )
			$older_approve_email_id_list["1"] = $email_id_list["Approver2"];
		


		//$emails = findEmailsByEmplID($email_id_list);
		$emails = findEmailsByEmplID($correct_email_id_list);
		$tmp = array();
		$tmp[0] = $EmplID;
		$owner_emails = findEmailsByEmplID($tmp);

		$tmp = array();
		$tmp[0] = $hr_id;
		$hr_emails = findEmailsByEmplID($tmp);

		$hr_email = $hr_emails[$hr_id]['email'];
		//owner email
		$owner_email = $owner_emails[$EmplID]['email'];

		//might need to get current status of leave?
		$query = new Query("l_empltable");
			$info = $query->selectOne(array(
				"EmplID" =>$EmplID 
			));

		if($params['Status'] == 6)
		{
			//CASE 6 HR APPROVE
			$url = "snapacorp/leave/sick.php#/read/{$params['LeaveTransID']}";
			sendEmail($owner_email, "Leave's form {$params['LeaveTransID']} have been acknowledged", "Leave's form {$params['LeaveTransID']} have been acknowledged {$url} ");
			sendEmail($hr_email, "Leave's form {$params['LeaveTransID']} have been acknowledged", "Leave's form {$params['LeaveTransID']} have been acknowledged {$url} ");
			echo json_encode(array(
				"status" => "acknowledged",
				
			));
		}else if($result['result'])
		{
			//CASE APPROVE AND IS PASS

			$result_email = array();
			$url = "snapacorp/leave/sick.php#/read/{$params['LeaveTransID']}";
			foreach ($emails as $id => $email) {
				# code...
				$result_email[$id] = sendEmail($email['email'], "Leave's form {$params['LeaveTransID']} have been Approved", "Leave's form {$params['LeaveTransID']} have been approved. You could view a form at $url");
			}

			//send email to hr
			$hr_result = sendEmail($hr_email, "Leave's form {$params['LeaveTransID']} have been Approved and Ready to be acknowledged", "Leave's form {$params['LeaveTransID']} have been approved. You could view a form at $url");
			markAsWaiting($params['LeaveTransID'], $hr_id, $isCancle);
			//update leavesTran

			$query = new Query('l_leavetrans');
			$newStatus = 3;

			if($isCancle)
			{
				
				$newStatus = 7;
			}

			$query->update(array(
				"Status" => $newStatus
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
			if($isCancle)
				$new_min = $old_leave_min - $current_leave_min;
			else
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
				"email_id_list" => $email_id_list,
				"isCancle" => $isCancle,
				"order_approve" => $order_approve,
			));

		}else if($params["Status"] == 5){
			//CASE GO BACK AND RE EDIT
			$email_result =sendEmail($owner_email, "Your Leave's form {$params['LeaveTransID']} need to be re-edit", "Your leave form need to be re-edit you could edit and resend again snapacorp/leave/sick.php#/read/{$params['LeaveTransID']}");
			//mail to anyone before that
			$older_emails = findEmailsByEmplID($older_approve_email_id_list);
			foreach ($older_emails as $id => $email) {
				# code...
				//send to every one but self? and so id could not be the same as
				$message = "เรียนหมายเลข {$id} ขณะนี้ใบลาของคุณ {$info['NameThai']} เลขที่ {$params->LeaveTransID} ถูกให้กลับไปแก้ใหม่จะมีการแจ้งเตือนอีกครั้งถ้า คุณ {$info['NameThai']} มีการแก้ไข้";
				$result_email[$id] = sendEmail($email['email'], "ใบลา {$params['LeaveTransID']} ถูกให้กลับไปแก้ใหม่", $message);
			}
			//update status
			if($isCancle)
				$query = new Query('l_cancle_leavetrans');
			else
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
			//CASE APPROVE BUT NOT ALL PASS
			$url = "snapacorp/leave/sick.php#/read/{$params['LeaveTransID']}";
			$result_email = array();
			

			if($result['order_approve'] == 1 )
			{
				//pass alrady 1 which mean need to approve number 2
				$next_approver_id = $email_id_list["Approver2"];;
				markAsWaiting($params['LeaveTransID'], $next_approver_id, $isCancle);
			}else if($result['order_approve'] == 2 )
			{
				$next_approver_id = $email_id_list["Approver3"];;
				markAsWaiting($params['LeaveTransID'], $next_approver_id, $isCancle);
			}
			
			foreach ($emails as $id => $email) {
				# code...
				//send to every one but self? and so id could not be the same as
				$url = "snapacorp/leave/sick.php#/approve";
				$message = "ขณะนี้ท่านมีรายการรออนุมัติ 1 รายการ จาก คุณ {$info['NameThai']} เลขที่ {$params->LeaveTransID} ซึ่งสามารถใช้งานภายในบริษัทผ่าน {$url} หรือ หากเข้าผ่านเว็บไซต์ กรุณากดลิงค์ http://58.97.116.246:9191/leave/ ";
				$result_email[$id] = sendEmail($email['email'], "Leave's form {$params['LeaveTransID']} have been preapprove (#{$id})", $message);
			}
			
			//email บอกทุกคนยกเว้นตัวเอง
			echo json_encode(array(
				"status" => $data,
				"result_email" => $result_email,
				"email_id_list" => $email_id_list,
				"order_approve" => $result['order_approve'],
				"isWho" => $result['isWho'],
				"correct_email_id_list" => $correct_email_id_list,
				"emails" => $emails,
				"params" => $params,
			));
		}else if($params["Status"] == 4)
		{
			//CASE DENIED
			$url = "snapacorp/leave/sick.php#/read/{$params['LeaveTransID']}";
			$result_email = array();

			//email to owner and ppl before
			$older_emails = findEmailsByEmplID($older_approve_email_id_list);
			foreach ($older_emails as $id => $email) {
				# code...
				$result_email[$id] = sendEmail($email['email'], "Leave's form {$params['LeaveTransID']} have been denied!", "To {$id} Leave's form {$params['LeaveTransID']} have been denied! due to {$params['Remark']} from user {$_SESSION['adm_user_name']}");
			}
			if($isCancle)
				$query = new Query('l_cancle_leavetrans');
			else
				$query = new Query('l_leavetrans');
			$query->update(array(
				"Status" => 4
			), "LeaveTransID = {$params['LeaveTransID']}");
			
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
		/*$params = $_GET['params'];	
		$doc_owner_id ="20110";
		$leave_trans = "5800003";
		$emails = findEmailsByEmplID(array("20033", "20110"));
		echo json_encode($emails);*/
		//echo getNewLeaveTransID();'
		$sql = "SELECT `l_leavetrans`.Status, NameThai, `l_leavetrans`.LeaveTransID, `l_leavetrans`.LeaveStartDate, `l_leavetrans`.LeaveEndDate, `l_leavetrans`.LeaveType FROM `l_leavetrans`";
		$sql = $sql." LEFT JOIN `l_empltable` ON `l_empltable`.EmplID = `l_leavetrans`.EmplID LEFT JOIN `l_approvetrans` ON `l_approvetrans`.`LeaveTransID` =  `l_leavetrans`.`LeaveTransID` WHERE `l_approvetrans`.`Status` = 2 ";
	
		mysql_query("SET NAMES 'utf8'");
		
		$dbquery = mysql_query($sql);
		//$result= mysql_fetch_array($dbquery);
		
		$result = array();
		while ($row = mysql_fetch_assoc($dbquery)) 
			array_push($result, $row);
		
		echo json_encode($result);
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
	}else if($action == "approve_cancle_status")
	{
		$params = $_GET['params'];
		$sql = "SELECT *  FROM `l_cancle_approvetrans` WHERE `LeaveTransID` = '{$params['LeaveTransID']}' AND `Approve` = '{$params['Approve']}' Order By `ApproveTransID` DESC LIMIT 0,1";



		mysql_query("SET NAMES 'utf8'");
		$dbquery = mysql_query($sql);
		$result = mysql_fetch_assoc($dbquery);
		if($result)
			echo json_encode( $result );
		else
			echo json_encode(null);
	}

	else if($action == "fetch_approve_requests")
	{
		$params = $_GET['params'];
		$approve_id = $params['approve_id'];
		if(isset($params['Status']))
			$status = $params['Status'];
		else
			$status = 2;
		$sql = "SELECT `l_leavetrans`.Status, NameThai, `l_leavetrans`.LeaveTransID, `l_leavetrans`.LeaveStartDate, `l_leavetrans`.LeaveEndDate, `l_leavetrans`.LeaveType FROM `l_leavetrans`";
		$sql = $sql." LEFT JOIN `l_empltable` ON `l_empltable`.EmplID = `l_leavetrans`.EmplID LEFT JOIN `l_approvetrans` ON `l_approvetrans`.`LeaveTransID` =  `l_leavetrans`.`LeaveTransID` WHERE `l_approvetrans`.`Status` = {$status} AND `l_approvetrans`.`Approve` = {$approve_id}";
		mysql_query("SET NAMES 'utf8'");
		$dbquery = mysql_query($sql);
		//$result= mysql_fetch_array($dbquery);
		
		$result = array();
		while ($row = mysql_fetch_assoc($dbquery)) 
			array_push($result, $row);
		
		echo json_encode($result);
	}
	else if($action == "fetch_cancle_approve_requests")
	{
		$params = $_GET['params'];
		$approve_id = $params['approve_id'];
		if(isset($params['Status']))
			$status = $params['Status'];
		else
			$status = 2;
		$sql = "SELECT `l_cancle_leavetrans`.Status, NameThai, `l_cancle_leavetrans`.LeaveTransID, `l_cancle_leavetrans`.LeaveStartDate, `l_cancle_leavetrans`.LeaveEndDate, `l_cancle_leavetrans`.LeaveType FROM `l_cancle_leavetrans`";
		$sql = $sql." LEFT JOIN `l_empltable` ON `l_empltable`.EmplID = `l_cancle_leavetrans`.EmplID LEFT JOIN `l_cancle_approvetrans` ON `l_cancle_approvetrans`.`LeaveTransID` =  `l_cancle_leavetrans`.`LeaveTransID` WHERE `l_cancle_approvetrans`.`Status` = {$status} AND `l_cancle_approvetrans`.`Approve` = {$approve_id}";
		mysql_query("SET NAMES 'utf8'");
		$dbquery = mysql_query($sql);
		//$result= mysql_fetch_array($dbquery);
		
		$result = array();
		while ($row = mysql_fetch_assoc($dbquery)) 
			array_push($result, $row);
		
		echo json_encode($result);
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
		

		if($table == 'l_leavetrans')
		{

			$params->LeaveTransID = getNewLeaveTransID();
			$data = $query->create($params);
			if(isset($params->Status))
			{
				if($params->Status == 1)
				{
					$array = array();
					$array[0] = $params->EmplID;
					$emails = findEmailsByEmplID($array);
					$owner_email = $emails[$params->EmplID]['email'];
					$url = "http://snapacorp.com/leave/sick.php#/read/{$params->LeaveTransID}";
					$message = "you can edit your leave form at $url";
					sendEmail($owner_email, "Your leave form have been save", $message, "noreply@spliftech.com");
					$data= array(
						'data' => $data,
						'email' => $owner_email,
					);
				}else if($params->Status == 2)
				{
					//notify everyone who involve

					//add approver 1
					$query = new Query("l_empltable");
					$info = $query->selectOne(array(
						"EmplID" =>$params->EmplID
					));
					$url = "http://snapacorp.com/leave/sick.php#/read/{$params->LeaveTransID}";
					$message = "ขณะนี้ท่านมีรายการรออนุมัติ 1 รายการ จาก คุณ {$info['NameThai']} เลขที่ {$params->LeaveTransID}  ซึ่งสามารถใช้งานภายในบริษัทผ่าน ลิงค์ {$url}  หรือ หากเข้าผ่านเว็บไซต์ กรุณากดลิงค์ http://58.97.116.246:9191/leave/ ";
					$response = notifyLeaveTrans($params->LeaveTransID, $params->EmplID, $message);
					$data= array(
						'data' => $data,
						'result' => $response,
					);
					
				}

			}
			
		}else if('l_cancle_leavetrans')
		{
			$data = $query->create($params);
			$params->LeaveTransID;
			$message = "ขณะนี้ท่านมีรายการรออนุมัติ 1 รายการ จาก คุณ {$info['NameThai']} เลขที่ {$params->LeaveTransID}  ซึ่งสามารถใช้งานภายในบริษัทผ่าน ลิงค์  หรือ หากเข้าผ่านเว็บไซต์ กรุณากดลิงค์ http://58.97.116.246:9191/leave/ ";
			$response = notifyLeaveTrans($params->LeaveTransID, $params->EmplID, $message, true);
			$data= array(
				'data' => $data,
				'result' => $response,
			);
		}
		else
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
					$owner_email = $emails[$params->EmplID]['email'];
					$url = "http://snapacorp.com/leave/sick.php#/read/{$params->LeaveTransID}";
					$message = "you can edit your leave form at $url";
					sendEmail($owner_email, "Your leave form have been save", $message, "noreply@spliftech.com");
					$data= array(
						'data' => $data,
						'email' => $owner_email,
					);
				}else if($params->Status == 2)
				{
					//notify everyone who involve
					$query = new Query("l_empltable");
					$info = $query->selectOne(array(
						"EmplID" =>$params->EmplID
					));
					$url = "http://snapacorp.com/leave/sick.php#/read/{$params->LeaveTransID}";
					$message = "ขณะนี้ท่านมีรายการรออนุมัติ 1 รายการ จาก คุณ {$info['NameThai']} เลขที่ {$params->LeaveTransID} (รหัสเอกสาร) ซึ่งสามารถใช้งานภายในบริษัทผ่าน ลิงค์ {$url} หรือ หากเข้าผ่านเว็บไซต์ กรุณากดลิงค์ http://58.97.116.246:9191/leave/ ";
					$response = notifyLeaveTrans($params->LeaveTransID, $params->EmplID, $message);
					$data= array(
						'data' => $data,
						'result' => $response,
					);
				}else if($params->Status == 7)
				{
					//ยกเลิกเอกสาร
					$sql = "DELETE FROM `l_approvetrans` WHERE LeaveTransID = {$params->LeaveTransID}";
					mysql_query($sql);

				}

			}
			
		}

		echo json_encode($data);
		
	}else if($action == "fetch_approve_requests")
	{
		$lists = $params->requests;
		$sql = "SELECT `l_leavetrans`.Status, NameThai, `l_leavetrans`.LeaveTransID, `l_leavetrans`.LeaveStartDate, `l_leavetrans`.LeaveEndDate, `l_leavetrans`.LeaveType FROM `l_leavetrans`";
		$sql = $sql." LEFT JOIN `l_empltable` ON `l_empltable`.EmplID = `l_leavetrans`.EmplID WHERE `l_leavetrans`.Status = 2 AND ";
		if(count($lists) == 0)
			$sql = $sql." 1";
		$counter = 0;
		foreach ($lists as $item) {
			# code...
			if($counter > 0)
				$sql = $sql." OR ";
			$sql = $sql." `l_leavetrans`.EmplID = ".$item->EmplID;
			$counter++;
		}
		
		mysql_query("SET NAMES 'utf8'");
		
		$dbquery = mysql_query($sql);
		//$result= mysql_fetch_array($dbquery);
		
		$result = array();
		while ($row = mysql_fetch_assoc($dbquery)) 
			array_push($result, $row);
		
		echo json_encode($result);
		/*echo json_encode(array(
			'sql' => $sql,
			'data' => $result,
			'params' => $params,
			'request' => $params->requests,
		));*/
	}
}
	

?>