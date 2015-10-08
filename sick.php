<?
Session_Start();
require("../include/inc-admin.php");

$page_title = "สร้างใบลาป่วย / กิจ / พักผ่อน";


$param_get = get_param_reqeust();
$user_name = $_SESSION[adm_user_name];  // ชื่อผู้เข้าใช้งาน
$aa= array();
$aerr = array();
$msg ="";
$success="";

if ($_POST[frmhide]!=""){
	$aa = requestform2array("frm","");


}elseif($_GET[mode]=="CLEARPARAM"){
	$aa = array();
	

}else{
	$aa = $_SESSION[$page_session];
}


$_SESSION[$page_session] = $aa;

showhead("../");
?>
<div align=left><h1 class=header1>รายการ <?=$page_title?></h1></div>

<script type="text/javascript" src="https://code.angularjs.org/1.4.7/angular.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.4/ui-bootstrap.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.4/ui-bootstrap-tpls.min.js"></script>
<script type="text/javascript" src="./main.js"></script>
<script type="text/javascript" src="./leave.ctrl.js"></script>
<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

<section ng-app="sick" ng-controller="LeaveCtrl">

<form name="form1" topmargin=0  id="form1" method="post" action="" >
<input type=hidden name=frmhide id=frmhide value="">
<input type=hidden name=orderby id=orderby value="<?=$_POST[orderby];?>">
<input type=hidden name=orderdirection id=orderdirection value="<?=$_POST[orderdirection];?>">
<input type=hidden name=ordercolumn id=ordercolumn value="<?=$_POST[ordercolumn];?>">

<br>
<!-- #############  รายละเอียดพนักงาน ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>รายละเอียดพนักงาน</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		  <td width="10%"></td>
		 <td width="30%"></td>
		 <td width="10%">รหัสสเอกสาร</td>
		 <td width="30%"><input type=hidden  name=""  value="" ></td>
		 <td width="10%"></td>
		 <td width="20%"></td>
	 </tr>
	  <tr>
		 <td>ชื่อพนักงาน</td>
		 <td>{{user.NameThai}}<input type="hidden"  name="" value="" ></td>
		 <td>รหัส</td>
		 <td>{{user.EmplID}}<input type=hidden  name=""  value="" ></td>
		 <td>วันที่เริ่มงาน</td>
		 <td>{{user.StartDate | date}}<input type=hidden  name=""  value="" ></td>
	 </tr>
	 <tr>
		 <td>แผนก</td>
		 <td>{{user.Department2}}<input type="hidden"  name="" value="" ></td>
		 <td>ตำแหน่ง</td>
		 <td>{{user.EmplLevel}}<input type="hidden"  name="" value="" ></td>
		 <td></td>
		 <td></td>
	 </tr>
	   <tr>
		 <td colspan="6"> <span ng-repeat="item in leaves"> {{item.LeaveType | leaveType}} {{item.TotalQty -  item.Used | minToDays}} วัน </span></td>
		 
	 </tr>
		</table>
			 
			 			
  	</fieldset>
</div>

<!-- #############  รายละเอียดการลา ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>รายละเอียดการลา</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="20%"> </td>
		 <td>
		 	
		 	 <label ng-repeat="n in leaves">
	          <input type="radio" name="pageNumber" ng-model="$parent.selectedType" ng-value="n" ng-click="updateType()" /> {{n.LeaveType | leaveType}} 
	         </label>
		 	
		 </td>
		 
	 </tr>
	 <tr>
	 	<td colspan="2"><h4>เริ่มลา</h4></td>
	 </tr>
	 <tr>
	 	<td>
	 		วันที่ 
	 	</td>
		 <td>
		 	<a href="" style="color:white;" class="btn btn-primary" ng-click="isShowDate = true;" ng-hide="isShowDate">เลือกวัน </a>
		 	
		 	<div style="display:inline-block; min-height:290px;position:relative" ng-show="isShowDate">
		      <datepicker ng-change="updateDateTime()" ng-model="date_time_from" min-date="minDate" max-date="maxDate" show-weeks="true" class="well well-sm" ></datepicker>
		      <a class="btn btn-primary"  style="width:100%;color:white;" ng-click="isShowDate = false;" href="">ปิด</a>
		      <input type="text"  ng-model="date_time_from" required  ng-show="false"  />
		      
		    </div>
		    <span style="font-size:1.5em;">{{date_time_from | date:"dd/MM/yyyy"}}</span> 
		 	

		</td> 	
		
	 </tr>
	 <tr>
	 	<td>เวลา</td>
	 	<td>
	 		<timepicker ng-change="updateDateTime()" ng-model="mytime"  hour-step="1" minute-step="30" show-meridian="false" min="min_time" max="max_time"></timepicker>
		 	

	 	</td>

	 </tr>
	  <tr>
	 	<td colspan="2"><h4>ถึง</h4></td>
	 </tr>
	 <tr>
	 	<td>
	 		วันที่ 
	 	</td>
		 <td>
		 	<a href="" style="color:white;" class="btn btn-primary" ng-click="isShowDate2 = true;" ng-hide="isShowDate2">เลือกวัน </a>
		 	
		 	<div style="display:inline-block; min-height:290px;position:relative" ng-show="isShowDate2">
		      <datepicker ng-change="updateDateTime()" ng-model="date_time_to" min-date="date_time_from" show-weeks="true" class="well well-sm" ></datepicker>
		      <a class="btn btn-primary"  style="width:100%;color:white;" ng-click="isShowDate2 = false;" href="">ปิด</a>
		      <input type="text"  ng-model="date_time_to" required  ng-show="false"  />
		      
		    </div>
		    <span style="font-size:1.5em;">{{date_time_to | date:"dd/MM/yyyy"}}</span> 
		 	

		</td> 	
		
	 </tr>
	 <tr>
	 	<td>เวลา</td>
	 	<td>
	 		<timepicker ng-change="updateDateTime()" ng-model="mytime2"  hour-step="1" minute-step="30" show-meridian="false" min="min_time" max="max_time"></timepicker>
		 	

	 	</td>

	 </tr>

	 <tr>
	 <td></td>
		 <td>รวม จำนวน {{time_used | leaveDays}} วัน {{time_used | leaveHours}} ชั่วโมง {{time_used | leaveMinutes}} นาที <span style="color:red;">{{time_used | leaveStatus:selectedType}} </span></td>		 
	 </tr>
	 <tr>
		 <td>หมายเหตุการลา  </td>
<td></td>		 
	 </tr>
	 <tr>
	 <td></td>
		 <td>เอกสารแนบ กำหนดไม่เกิน 5 ไฟล์ เก็บเป็นลิงค์ไว้ที่ตาราง leave_attach</td>		 
	 </tr>
		</table>
			 
			 
			
  	</fieldset>
</div>

<!-- #############  ผู้อนุมัติลำดับที่ 1 ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>ผู้อนุมัติ</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> ชื่อผู้อนุม้ติ</td>
		 
	 </tr>
	 <tr>
		 <td> เป็น radio ให้เลือกว่า อนุมัติ , ไม่อนุม้ติ , กลับไปแก้ไข </td>
		
	 </tr>
	 <tr>
		 <td>หมายเหตุเพิ่มเติม</td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>
<!-- #############  ผู้อนุมัติลำดับที่ 2 ถ้ามี จึงจะให้แสดง ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>ผู้อนุมัติ</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> ชื่อผู้อนุม้ติ</td>
		 
	 </tr>
	 <tr>
		 <td> เป็น radio ให้เลือกว่า อนุมัติ , ไม่อนุม้ติ , กลับไปแก้ไข </td>
		
	 </tr>
	 <tr>
		 <td>หมายเหตุเพิ่มเติม</td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>

<!-- #############  ผู้อนุมัติลำดับที่ 3 ถ้ามี จึงจะให้แสดง ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>ผู้อนุมัติ</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> ชื่อผู้อนุม้ติ</td>
		 
	 </tr>
	 <tr>
		 <td> เป็น radio ให้เลือกว่า อนุมัติ , ไม่อนุม้ติ , กลับไปแก้ไข </td>
		
	 </tr>
	 <tr>
		 <td>หมายเหตุเพิ่มเติม</td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>

<!-- #############  HR ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>แผนกบุคคลผู้รับเรื่อง</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> ชื่อผู้รับเรื่อง</td>
		 <td></td>
	 </tr>
	 <tr>
		 <td> เป็น checkbox เขียนว่า "รับทราบ" </td>
		  <td> ขึ้นวันที่ </td>
	 </tr>
	 <tr>
		 <td>หมายเหตุเพิ่มเติม</td>	
		<td></td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>
</form>

ปุ่มมี 2 ปุ่ม  "ตกลง"  "ยกเลิก"  ให้น้องออกแบบได้เองเลยคะ ว่าจะวางตำแหน่งไหน
</section>
<?
showtail("../");
require("../include/inc-admin-close.php");
?>