<?php
require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['success' => false, 'error' => 'Méthode non autorisée'], 405);

$in = json_decode(file_get_contents('php://input'), true);
$name = trim($in['customer']['name'] ?? '');
$phone = trim($in['customer']['phone'] ?? '');
$addr = trim($in['customer']['address'] ?? '');
$items = $in['items'] ?? [];

if (mb_strlen($name) < 2 || mb_strlen($name) > 100 || !preg_match('/^[0-9+ ]{8,15}$/', $phone)
    || $addr === '' || mb_strlen($addr) > 255 || !is_array($items) || !$items) {
    json_out(['success' => false, 'error' => 'Données invalides'], 422);
}

try {
    $pdo = db();
    $pdo->beginTransaction();
    $get = $pdo->prepare('SELECT id, price FROM products WHERE id = ? AND active = 1');
    $lines = []; $total = 0;
    foreach ($items as $it) {
        $id = (int)($it['id'] ?? 0); $qty = (int)($it['qty'] ?? 0);
        if ($qty < 1 || $qty > 50) throw new RuntimeException('Quantité invalide');
        $get->execute([$id]);
        $p = $get->fetch();
        if (!$p) throw new RuntimeException('Produit introuvable');
        $total += $p['price'] * $qty;   // prix lu en base, jamais envoyé par le navigateur
        $lines[] = [$id, $qty, $p['price']];
    }
    $pdo->prepare('INSERT INTO orders (customer_name, phone, address, total) VALUES (?,?,?,?)')
        ->execute([$name, $phone, $addr, $total]);
    $orderId = (int)$pdo->lastInsertId();
    $ins = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)');
    foreach ($lines as [$pid, $q, $price]) $ins->execute([$orderId, $pid, $q, $price]);
    $pdo->commit();
    json_out(['success' => true, 'order_id' => $orderId, 'total' => $total]);
} catch (RuntimeException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    json_out(['success' => false, 'error' => $e->getMessage()], 422);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    json_out(['success' => false, 'error' => 'Erreur serveur'], 500);
}
