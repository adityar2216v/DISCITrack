<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

try {
    $db = new PDO(
        "mysql:host=localhost;dbname=your_database_name",
        "your_username",
        "your_password"
    );
    
    $stmt = $db->prepare("INSERT INTO questions (question_number) VALUES (:number)");
    $stmt->execute(['number' => $data['questionNumber']]);
    
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>