<?php
 
$db = new mysqli("localhost", "kfkqtrwx_base", "VjfJ85gT4zecx9xGDwuE", "kfkqtrwx_base", "3306");

if( $db->query("SELECT COUNT(*) as `TOTAL` FROM `users` WHERE `id`=".(sha1($_GET['user_id'])))[0] == 0 ){
  $db->query("INSERT INTO `users` (`id`, `user_id`, `access_token`, `refresh_token`) VALUES ('".sha1($_GET["user_id"])."', '".$_GET["user_id"]."', '".$_GET["access_token"]."', '".$_GET["refresh_token"]."')");
  echo json_encode([
    "token" => sha1($_GET["user_id"])
  ]);
}else{
  
  return sha1($_GET["user_id"]);
}
$db->close();