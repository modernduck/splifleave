<?php
session_Start();
require("./query.php");
/*
* Develop by Sompop Kulapalanont
* Email : sompop.kulapalanont@gmail.com
*/

class LeaveTable {
	private $is_new  = true;
	private $id;
	 private $table = "l_leavetable";
	 private $query;

	function __construct() {
       
       $this->query = new Query($this->table);
   }

	public function findAll($params)
	{
		
		return $this->query->selectAll($params);
	}

	

	public function save()
	{
		//insert in db
		if($this->is_new)
		{

		}else
		{
			//find by id then update attribute
		}
	}

}


$leave = new LeaveTable();
print_r($leave->findAll());
?>