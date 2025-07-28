<?php
session_start();

// Lista de usuários (simulação)
$usuarios = [
    "cliente1" => ["senha" => "1234", "tipo" => "cliente"],
    "barbeiro1" => ["senha" => "abcd", "tipo" => "barbeiro"]
];

// Lógica de login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = $_POST['usuario'] ?? '';
    $senha = $_POST['senha'] ?? '';

    if (isset($usuarios[$usuario]) && $usuarios[$usuario]['senha'] === $senha) {
        $_SESSION['usuario'] = $usuario;
        $_SESSION['tipo'] = $usuarios[$usuario]['tipo'];
    } else {
        $erro = "Usuário ou senha inválidos.";
    }
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: index.php");
    exit();
}
?>

<?php if (!isset($_SESSION['usuario'])): ?>
    <div class="login-box">
        <h2>Login</h2>
        <?php if (isset($erro)) echo "<p style='color:red;'>$erro</p>"; ?>
        <form method="POST">
            <label>Usuário:
                <input type="text" name="usuario" required>
            </label>
            <label>Senha:
                <input type="password" name="senha" required>
            </label>
            <button type="submit">Entrar</button>
        </form>
    </div>

<?php else: ?>
    <div class="logout">
        Olá, <strong><?= htmlspecialchars($_SESSION['usuario']) ?></strong>! (<a href="?logout=true">Sair</a>)
    </div>

    <?php if ($_SESSION['tipo'] === 'cliente'): ?>
        <h2>Agendamento - Cliente</h2>

        <table>
            <thead>
                <tr><th>Serviço</th><th>Preço (R$)</th></tr>
            </thead>
            <tbody>
                <tr><td>Corte Masculino</td><td>30</td></tr>
                <tr><td>Barba</td><td>20</td></tr>
            </tbody>
        </table>

        <h3>Horários Disponíveis</h3>
        <table>
            <thead><tr><th>Dia</th><th>Hora</th><th>Status</th></tr></thead>
            <tbody>
                <tr><td>Segunda</td><td>09:00</td><td>Disponível</td></tr>
                <tr><td>Quarta</td><td>14:00</td><td>Disponível</td></tr>
                <tr><td>Sábado</td><td>11:00</td><td>Disponível</td></tr>
            </tbody>
        </table>

    <?php elseif ($_SESSION['tipo'] === 'barbeiro'): ?>
        <h2>Agendamento - Barbeiro</h2>

        <table>
            <thead>
                <tr><th>Serviço</th><th>Preço (R$)</th></tr>
            </thead>
            <tbody contenteditable="true">
                <tr><td>Corte Masculino</td><td>30</td></tr>
                <tr><td>Barba</td><td>20</td></tr>
            </tbody>
        </table>

        <h3>Horários da Semana</h3>
        <table>
            <thead><tr><th>Dia</th><th>Hora</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>
                <tr><td>Segunda</td><td>09:00</td><td>Marcado - cliente1</td><td><button>Cancelar</button></td></tr>
                <tr><td>Quarta</td><td>14:00</td><td>Disponível</td><td><button>Indisponível</button></td></tr>
            </tbody>
        </table>

    <?php endif; ?>

<?php endif; ?>

</body>
</html>
