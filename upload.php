<?php
echo "yo gile";
$filename = $_POST['order'].$_FILES['file']['name'];
$dir = $_POST['dir'];
$destination = 'uploads/'. $dir .'-' . $filename;
//echo $destination;
//echo $_FILES['file']['tmp_name'];
print_r($_FILES);
$ext = pathinfo( $_FILES['file']['name'], PATHINFO_EXTENSION);

$filename = $_POST['order'].".".$ext;
$destination = 'uploads/'. $dir .'-' . $filename;
if(!move_uploaded_file( $_FILES['file']['tmp_name'] , $destination ))
{
	echo "cannot";
	print_r(error_get_last());
}else 
	echo "should work at {$destination}";