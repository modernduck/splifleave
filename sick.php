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


<script type="text/javascript" src="https://code.angularjs.org/1.4.7/angular.min.js"></script>
<script type="text/javascript" src="https://code.angularjs.org/1.4.7/angular-route.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.4/ui-bootstrap.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.13.4/ui-bootstrap-tpls.min.js"></script>
<script type="text/javascript" src="./ng-file-upload-shim.min.js"></script>
<script type="text/javascript" src="./ng-file-upload.min.js"></script>

<script type="text/javascript" src="./main.js"></script>
<script type="text/javascript" src="./leave.ctrl.js"></script>
<script type="text/javascript" src="./approve.ctrl.js"></script>
<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

<section ng-app="sick" >

	<div ng-view>

	</div>
	<input type="hidden" name="current_user" ng-model="current_user" value="<?php echo $user_name; ?>" />

</section>
<?
showtail("../");
require("../include/inc-admin-close.php");
?>