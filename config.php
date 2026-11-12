<?php
// Modifiez selon votre hébergement (ou utilisez des variables d'environnement).
// Ne publiez JAMAIS de vrais identifiants sur GitHub.
return [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'name' => getenv('DB_NAME') ?: 'padel_avenue',
    'user' => getenv('DB_USER') ?: 'root',
    'pass' => getenv('DB_PASS') ?: '',
];
