<?php
require_once('gridServer.php');

$token = $_POST['token'];
$x = $_POST['x'];
$y = $_POST['y'];

$grid = new Grid();
$grid->moveToken($token, $x, $y);
?>