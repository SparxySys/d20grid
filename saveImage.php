<?php
$data = rawurldecode($_POST['imgData']);
$fname = rawurldecode($_POST['fname']);
$file = "grids/" . $fname . ".png";

$filteredData = substr($data, strpos($data, ",")+1);
file_put_contents($file, base64_decode($filteredData));

echo $data;
?>