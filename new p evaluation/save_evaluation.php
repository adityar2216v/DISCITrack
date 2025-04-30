<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'student_evaluation';
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents('php://input'), true);

    $sql = "INSERT INTO evaluations (student_name, roll_no, erp, subject, q1, q2, q3, q4, q5) 
            VALUES (:name, :rollNo, :erp, :subject, :q1, :q2, :q3, :q4, :q5)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name' => $data['name'],
        ':rollNo' => $data['rollNo'],
        ':erp' => $data['erp'],
        ':subject' => $data['subject'],
        ':q1' => $data['q1'],
        ':q2' => $data['q2'],
        ':q3' => $data['q3'],
        ':q4' => $data['q4'],
        ':q5' => $data['q5']
    ]);

    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>