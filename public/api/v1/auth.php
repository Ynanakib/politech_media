<?php 

$inputJSON = file_get_contents('php://input');
$array = json_decode($inputJSON, TRUE);

?>
{
    "access_token" : "<?= $array['access_token'] ?>",
    "refresh_token" : "<?= $array['refresh_token'] ?>",
    "user_id" : "<?= $array['user_id'] ?>"
}