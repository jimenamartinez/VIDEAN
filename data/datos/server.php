<?php
 $fname = $_GET['file'];
//var_dump(__FILE__, __LINE__, $fname);

$content2 = file_get_contents($fname);
//var_dump(__FILE__, __LINE__, $content2);

          //header("Content-Type: application/json");
         echo $_GET['callback'] . '(' . $content2 . ')';

?>