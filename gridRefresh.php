<?php
require_once('gridServer.php');

$marker = $_POST['marker'];

$grid = new Grid();
echo $grid->getUpdates($marker);
?>