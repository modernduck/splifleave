<?
Session_Start();
require("../include/inc-admin.php");


$page_title = "สร้างใบลาคลอด";

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

<table border=0 style="height:25px">
<tr><td>
 <a href="../main/main-menu.php">เมนูหลัก</a> <b>/</b> <font class=header2>รายการ <?=$page_title?></font>
</td></tr>
</table>

<?=$msg?>


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
		 <td><input type="hidden"  name="" value="" ></td>
		 <td>รหัส</td>
		 <td><input type=hidden  name=""  value="" ></td>
		 <td>วันที่เริ่มงาน</td>
		 <td><input type=hidden  name=""  value="" ></td>
	 </tr>
	 <tr>
		 <td>แผนก</td>
		 <td><input type="hidden"  name="" value="" ></td>
		 <td>ตำแหน่ง</td>
		 <td><input type="hidden"  name="" value="" ></td>
		 <td></td>
		 <td></td>
	 </tr>
	  <tr>
		 <td colspan="6"> บริเวณนี้ให้แสดงสิทธิ์การลาคลอด ของพนักงาน โดยดึงจาก ตาราง   LeaveTable </td>
		 
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
		 <td width="10%"> </td>
		 <td>ขึ้นหัวข้อ ลาคลอด</td>
		 
	 </tr>
	 <tr>
	 <td></td>
		 <td>จากวันที่  (เลือกจากปฏิทิน)  เวลา  เป็น dropdown 2 อัน ให้ใส่ชั่วโมง และ นาที    ถึงวันที่    (เลือกจากปฏิทิน)  เวลา เป็น dropdown 2 อัน ให้ใส่ชั่วโมง และ นาที </td>
		
	 </tr>
	 <tr>
	 <td></td>
		 <td>รวม จำนวน ....... วัน ............ ชั่วโมง ..........นาที  *วิธีคำนวนให้ดูจากเอกสาารแนบ ถ้าเกินจากสิทธิ์ ให้ขึ้นหนังสือตัวแดงว่า "ลาเกินสิทธิ์ กรุณาตรวจสอบวันลาอีกครั้ง"</td>		 
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
<table  border=0><tr><td align=center><b>ผู้อนุมัติ : </b></td></table></legend>
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
<table  border=0><tr><td align=center><b>ผู้อนุมัติ : </b></td></table></legend>
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
<table  border=0><tr><td align=center><b>ผู้อนุมัติ : </b></td></table></legend>
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
		 <td width="20%"> ชื่อผู้รับเรื่อง :</td>
		 <td> </td>
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

<?
showtail("../");
require("../include/inc-admin-close.php");
?>