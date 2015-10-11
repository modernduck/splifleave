<?php
session_Start();
require("../include/inc-admin.php");

class Query{

	private $table;
	private $idKey = "id";
	function __construct($table, $idKey = null) {
       $this->table = $table;
       if(isset($idKey))
       	$this->idKey = $idKey;

   }

	public function selectAll($params, $orderBy = null)
	{

		if(count($params) == 0)
			$condition = "";
		else
		{
			$counter = 0;
			if(is_string($params))
				$condition = " WHERE {$params}";
				
			else
			{
				$condition = " WHERE ";
				foreach ($params as $key => $value) {
					# code...
					if($counter >0)
						$condition = $condition." AND ";
					if(!is_string($value))
						$condition = $condition." {$key} = {$value}";
					else
						$condition = $condition." {$key} = '{$value}'";
					$counter++;
				}
			}
		}
		$sql = "select * from {$this->table} $condition";
		mysql_query("SET NAMES 'utf8'");
		
		$dbquery = mysql_query($sql);
		//$result= mysql_fetch_array($dbquery);
		
		$result = array();
		while ($row = mysql_fetch_assoc($dbquery)) 
			array_push($result, $row);
		return $result;
	}

	public function selectOne($params, $orderBy = null)
	{
		if(count($params) == 0)
			$condition = "";
		else
		{
			$counter = 0;
			if(is_string($params))
				$condition = " WHERE {$params}";
			else
			{
				$condition = " WHERE ";
				foreach ($params as $key => $value) {
					# code...
					if($counter >0)
						$condition = $condition." AND ";
					if(!is_string($value))
						$condition = $condition." {$key} = {$value}";
					else
						$condition = $condition." {$key} = '{$value}'";
					$counter++;
				}
			}
		}
		$sql = "select * from {$this->table} $condition";
		mysql_query("SET NAMES 'utf8'");
		$dbquery = mysql_query($sql);
		return mysql_fetch_assoc($dbquery);
	}

	public function create($params)
	{
		$fields = "";
		$values = "";
		$counter = 0;
		foreach ($params as $key => $value) {
				# code...
			if($counter > 0)
			{
				$fields = $fields." , ";
				$values = $values." , ";
			}
			$fields = $fields." {$key}";
			if(!is_string($value))
				$values = $values." {$value}";
			else
				$values = $values." '{$value}'";
			$counter++;
		}

		$sql = "INSERT INTO {$this->table} ($fields) VALUES ($values)";;
		mysql_query("SET NAMES 'utf8'");
		$result= mysql_query($sql);

		return mysql_insert_id();
	}

	public function delete($params)
	{

		if(count($params) == 0)
			$condition = "";
		$counter = 0;
		if(is_string($params))
			$condition = " WHERE {$params}";
		else
		{
			$condition = " WHERE ";
			foreach ($params as $key => $value) {
				# code...
				if($counter >0)
					$condition = $condition." AND ";
				if(!is_string($value))
					$condition = $condition." {$key} = {$value}";
				else
					$condition = $condition." {$key} = '{$value}'";
				$counter++;
			}
		}
		$sql ="delete from {$this->table} $condition";
		mysql_query("SET NAMES 'utf8'");
		$result = mysql_query($sql);
		return $result;

	}

	public function update($params, $condition = null)
	{
		if(isset($condition))
		{
			$counter = 0;
			$command = "";
			foreach ($params as $key => $value) {
				if($counter > 0)
				{
					$command = $command." , ";
				}
				if(!is_string($value))
					$command = $command." {$key} = {$value}";
				else
					$command = $command." {$key} = '{$value}'";
				$counter++;
			}
			$sql = "UPDATE {$this->table} SET $command WHERE {$condition}";

			$result = mysql_query($sql);
			return $result;
			//return $sql;
		}else
		{
			$counter = 0;
			$command = "";
			foreach ($params as $key => $value) {

				if($counter > 0)
				{
					$command = $command." , ";
				}
				if(!is_string($value))
					$command = $command." {$key} = {$value}";
				else
					$command = $command." {$key} = '{$value}'";
				$counter++;
			}
			$sql = "UPDATE {$this->table} SET $command WHERE {$this->idKey} = {$params[$this->idKey]}";
			mysql_query("SET NAMES 'utf8'");
			$result = mysql_query($sql);
			return $result;
			//return $sql;
		}
	}

	public function getLastID($idName)
	{
		//echo $this->table;
		$sql = "SELECT MAX({$idName}) FROM {$this->table}";
		//echo $sql;
		$result = mysql_query($sql);
	    $row = mysql_fetch_row($result);
	    if(count($row) == 0)
	    	return array( $idName => 0);
	    $highest_id = $row[0];
	    if($highest_id == null)
	    	$highest_id = 0;
	    return array( $idName => $highest_id);
	}
	

}


//testing
/*$query = new Query("l_leavetable");
print_r($query->selectAll("TotalQty <= 5"));
$create_query = new Query("l_leavetable");
$result = $create_query->create(array(
	"EmplID" => "20110",
    "LeaveType" => "03",
    "StartDate" => "2014-11-01",
    "EndDate" => "2015-10-31",
    "TotalQty" => 5,
    "Used" => 0,
    "CreateDate" => "2015-10-02",
    "LastModifyDate" => "2015-10-02 22:05:28",
    "Status" => "F"

));
print_r($result);
$update_query = new Query("l_leavetable");
$update_query->update(array(
	"Status" => "Q"
),
	"Status = 'F'"

);
/*$delete_query = new Query("l_leavetable");
$delete_query->delete(array(
	"EmplID" => "20110",
    "LeaveType" => "03",
    "StartDate" => "2014-11-01",
    "EndDate" => "2015-10-31",
    "TotalQty" => 5,
    "Used" => 0,
    "CreateDate" => "2015-10-02",
    "LastModifyDate" => "2015-10-02 22:05:28",
    "Status" => "F"

));
/*
[EmplID] => 20110
            [LeaveType] => 02
            [StartDate] => 2014-11-01
            [EndDate] => 2015-10-31
            [TotalQty] => 5
            [Used] => 0
            [CreateDate] => 2015-10-02
            [LastModifyDate] => 2015-10-02 22:05:28
            [Status] => A
            */




