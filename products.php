<?php
require __DIR__ . '/db.php';
try {
    json_out(db()->query('SELECT id, category, name, price, image FROM products WHERE active = 1 ORDER BY id')->fetchAll());
} catch (Throwable $e) {
    json_out(['error' => 'Service indisponible'], 500);
}
