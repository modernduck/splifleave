<?
Session_Start();
require("../include/inc-admin.php");


$page_title = "���ҧ��Ҥ�ʹ";

$param_get = get_param_reqeust();
$user_name = $_SESSION[adm_user_name];  // ���ͼ�������ҹ
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
<div align=left><h1 class=header1>��¡�� <?=$page_title?></h1></div>

<table border=0 style="height:25px">
<tr><td>
 <a href="../main/main-menu.php">������ѡ</a> <b>/</b> <font class=header2>��¡�� <?=$page_title?></font>
</td></tr>
</table>

<?=$msg?>


<form name="form1" topmargin=0  id="form1" method="post" action="" >
<input type=hidden name=frmhide id=frmhide value="">
<input type=hidden name=orderby id=orderby value="<?=$_POST[orderby];?>">
<input type=hidden name=orderdirection id=orderdirection value="<?=$_POST[orderdirection];?>">
<input type=hidden name=ordercolumn id=ordercolumn value="<?=$_POST[ordercolumn];?>">

<br>
<!-- #############  ��������´��ѡ�ҹ ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>��������´��ѡ�ҹ</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"></td>
		 <td width="30%"></td>
		 <td width="10%">������͡���</td>
		 <td width="30%"><input type=hidden  name=""  value="" ></td>
		 <td width="10%"></td>
		 <td width="20%"></td>
	 </tr>
	 <tr>
		 <td>���;�ѡ�ҹ</td>
		 <td><input type="hidden"  name="" value="" ></td>
		 <td>����</td>
		 <td><input type=hidden  name=""  value="" ></td>
		 <td>�ѹ���������ҹ</td>
		 <td><input type=hidden  name=""  value="" ></td>
	 </tr>
	 <tr>
		 <td>Ἱ�</td>
		 <td><input type="hidden"  name="" value="" ></td>
		 <td>���˹�</td>
		 <td><input type="hidden"  name="" value="" ></td>
		 <td></td>
		 <td></td>
	 </tr>
	  <tr>
		 <td colspan="6"> ����ǳ�������ʴ��Է������Ҥ�ʹ �ͧ��ѡ�ҹ �´֧�ҡ ���ҧ   LeaveTable </td>
		 
	 </tr>
		</table>
			 
			 
			
  	</fieldset>
</div>

<!-- #############  ��������´����� ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>��������´�����</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> </td>
		 <td>�����Ǣ�� �Ҥ�ʹ</td>
		 
	 </tr>
	 <tr>
	 <td></td>
		 <td>�ҡ�ѹ���  (���͡�ҡ��ԷԹ)  ����  �� dropdown 2 �ѹ ������������ ��� �ҷ�    �֧�ѹ���    (���͡�ҡ��ԷԹ)  ���� �� dropdown 2 �ѹ ������������ ��� �ҷ� </td>
		
	 </tr>
	 <tr>
	 <td></td>
		 <td>��� �ӹǹ ....... �ѹ ............ ������� ..........�ҷ�  *�Ըդӹǹ���٨ҡ�͡����Ṻ ����Թ�ҡ�Է��� �����˹ѧ��͵��ᴧ��� "���Թ�Է��� ��سҵ�Ǩ�ͺ�ѹ���ա����"</td>		 
	 </tr>
	 <tr>
		 <td>�����˵ء����  </td>
<td></td>		 
	 </tr>
	 <tr>
	 <td></td>
		 <td>�͡���Ṻ ��˹�����Թ 5 ��� �����ԧ���������ҧ leave_attach</td>		 
	 </tr>
		</table>
			
  	</fieldset>
</div>

<!-- #############  ���͹��ѵ��ӴѺ��� 1 ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>���͹��ѵ� : </b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> ���ͼ��͹����</td>
		 
	 </tr>
	 <tr>
		 <td> �� radio ������͡��� ͹��ѵ� , ���͹���� , ��Ѻ���� </td>
		
	 </tr>
	 <tr>
		 <td>�����˵��������</td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>
<!-- #############  ���͹��ѵ��ӴѺ��� 2 ����� �֧������ʴ� ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>���͹��ѵ� : </b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> ���ͼ��͹����</td>
		 
	 </tr>
	 <tr>
		 <td> �� radio ������͡��� ͹��ѵ� , ���͹���� , ��Ѻ���� </td>
		
	 </tr>
	 <tr>
		 <td>�����˵��������</td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>

<!-- #############  ���͹��ѵ��ӴѺ��� 3 ����� �֧������ʴ� ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>���͹��ѵ� : </b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="10%"> ���ͼ��͹����</td>
		 
	 </tr>
	 <tr>
		 <td> �� radio ������͡��� ͹��ѵ� , ���͹���� , ��Ѻ���� </td>
		
	 </tr>
	 <tr>
		 <td>�����˵��������</td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>


<!-- #############  HR ################# -->
<div align=center style="padding:10px 0px 10px 0px;" align=center>
<fieldset style="width:80%" align=left>
<legend>
<table  border=0><tr><td align=center><b>Ἱ��ؤ�ż���Ѻ����ͧ</b></td></table></legend>
     <table style="width:80%" align=center>
	  <tr>
		 <td width="20%"> ���ͼ���Ѻ����ͧ :</td>
		 <td> </td>
	 </tr>
	 <tr>
		 <td> �� checkbox ��¹��� "�Ѻ��Һ" </td>
		  <td> ����ѹ��� </td>
	 </tr>
	 <tr>
		 <td>�����˵��������</td>	
		<td></td>		 
	 </tr>
	 </table>
		
  	</fieldset>
</div>

</form>

������ 2 ����  "��ŧ"  "¡��ԡ"  ����ͧ�͡Ẻ���ͧ��¤� ��Ҩ��ҧ���˹��˹

<?
showtail("../");
require("../include/inc-admin-close.php");
?>