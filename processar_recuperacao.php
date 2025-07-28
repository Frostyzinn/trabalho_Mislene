<?php

include_once 'crud.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);

    if ($email) {
     
        $sql = "SELECT * FROM usuarios WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            $usuario = $resultado->fetch_assoc();

            $token = bin2hex(random_bytes(32));
            $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

          
            $sql_token = "UPDATE usuarios SET token_recuperacao = ?, token_expira = ? WHERE email = ?";
            $stmt = $conn->prepare($sql_token);
            $stmt->bind_param("sss", $token, $expira, $email);
            $stmt->execute();

            $link = "http://seusite.com/redefinir-senha.php?token=" . $token;

            require 'PHPMailer/PHPMailerAutoload.php'; 

            $mail = new PHPMailer();
            $mail->isSMTP();
            $mail->Host = 'smtp.seuservidor.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'seuemail@dominio.com';
            $mail->Password = 'sua_senha';
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            $mail->setFrom('seuemail@dominio.com', 'Suporte');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = 'Recuperação de Senha';
            $mail->Body = "Olá, clique no link abaixo para redefinir sua senha:<br><br><a href='$link'>$link</a><br><br>Este link expira em 1 hora.";

            if ($mail->send()) {
                echo "Um link de recuperação foi enviado para seu e-mail.";
            } else {
                echo "Erro ao enviar e-mail. Tente novamente.";
            }
        } else {
            echo "E-mail não encontrado.";
        }
    } else {
        echo "E-mail inválido.";
    }
} else {
    echo "Acesso inválido.";
}
?>
