<?php
    $username = "wookiee95";
    $password = "Wkddnrwls95!";
    $mysqli = new mysqli("208.109.65.254", "adminaccuser", "6hbNsBCcn)3?", "db_accounts");
    if($mysqli -> connection_errno){
        echo "Failed to connect";
    }
    $result = mysqli_query($mysqli, "select * from users where username = '$username' and password = '$password'");
    while ($row = $result -> fetch_row()){
        printf("%s %s\n", $row[1], $row[2]);
    }
?>