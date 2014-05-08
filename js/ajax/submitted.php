<?php

function emptyCheck($input)
{
    if ($input['value'] !== '')
        return true;
    else
        return false;
}

function lengthCheck($input)
{
    
    if (strlen($input['value']) >= $input['minChar'] && strlen($input['value']) <= $input['maxChar'])
        return true;
    else
        return false;
}

function mailCheck($input)
{
    return true;
}

function passwordCheck($input)
{
    return true;
}

function passwordRepeatCheck($input)
{
    return true;
}

function existingPseudoCheck($input)
{
    return true;
}

function existingMailCheck($input)
{
    return true;
}

$countInputs = count($_POST['dataForm']);
for ($i = 0; $i < $countInputs; ++$i)
{
    foreach ($_POST['dataForm'][$i] as $key => $value)
    {
        if (is_numeric($key))
        {
            $test = $_POST['dataForm'][$i][$key]($_POST['dataForm'][$i]);
            if ($_POST['dataForm'][$i][$key] === 'passwordCheck')
                $passwordValue = $_POST['dataForm'][$i]['value'];
            if ($_POST['dataForm'][$i][$key] === 'passwordRepeatCheck')
                $passwordRepeatValue = $_POST['dataForm'][$i]['value'];
            if(!$test)
                $exit = true;
            else
                $exit = false;
        }
    }
    if($exit)
        $i = $countInputs;
}
if(!$exit)
{
    if ($passwordValue === $passwordRepeatValue)
        echo true;
    else
        echo false;
}
else
    echo false;
?>
