<?php
//Type here your request to check if the typed login already exists or not
//Just be sure to echo "true" if it exists or "false" if it doesn't

$existingPseudo = file_get_contents(dirname(dirname(dirname(__FILE__))) . '/misc/db.txt');
if($existingPseudo === $_POST['login'])
    echo true;
else
    echo false;
?>
