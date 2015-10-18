<?php
$to      = 'sompop.kulapalanont@gmail.com';
$subject = 'the subject';
$message = 'hello';
$headers = 'From: admin@splifetech.com' . "\r\n" .
    'Reply-To: admin@splifetech.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

$result = mail($to, $subject, $message, $headers);
print_r(array(
	"result" => $result
));
?>