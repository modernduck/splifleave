<?php

$filename = $_POST['order'].$_FILES['file']['name'];
$dir = $_POST['dir'];
$destination = 'uploads/'. $dir .'-' . $filename;
//echo $destination;
//echo $_FILES['file']['tmp_name'];

$ext = pathinfo( $_FILES['file']['name'], PATHINFO_EXTENSION);

$filename = $_POST['order'].".".$ext;
$destination = 'uploads/'. $dir .'-' . $filename;
if(!move_uploaded_file( $_FILES['file']['tmp_name'] , $destination ))
{
	echo json_encode(array(
		"status" => "error",
		"message" => error_get_last()
	));
	
}else 
	echo json_encode(array(
		"status" => "complete",
		"destination" => $destination
	));