<?php

// Set file path for storing airdrop data
$dataFile = "/var/www/airdrop_bot/airdrop_data.txt";

// Ensure the script is receiving data via POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Retrieve form inputs safely
    $telegram = isset($_POST['telegram']) ? trim($_POST['telegram']) : '';
    $x_username = isset($_POST['x_username']) ? trim($_POST['x_username']) : '';
    $wallet = isset($_POST['wallet']) ? trim($_POST['wallet']) : '';

    // Validate inputs
    if (empty($telegram) || empty($x_username) || empty($wallet)) {
        echo json_encode(["message" => "All fields are required."]);
        http_response_code(400);
        exit();
    }

    // Validate wallet format (must start with "SP")
    if (strpos($wallet, "SP") !== 0) {
        echo json_encode(["message" => "Invalid wallet format."]);
        http_response_code(400);
        exit();
    }

    // Get user IP address
    $ip_address = $_SERVER['REMOTE_ADDR'];

    // Check for duplicate entries
    if (file_exists($dataFile)) {
        $existingData = file_get_contents($dataFile);
        if (strpos($existingData, $telegram) !== false || strpos($existingData, $x_username) !== false || strpos($existingData, $wallet) !== false) {
            echo json_encode(["message" => "Duplicate entry detected."]);
            http_response_code(403);
            exit();
        }
    }

    // Create log entry
    $entry = "Telegram: $telegram, X: $x_username, Wallet: $wallet, IP: $ip_address\n";

    // Try writing to the file
    if (file_put_contents($dataFile, $entry, FILE_APPEND | LOCK_EX)) {
        echo json_encode(["message" => "Airdrop request successfully submitted."]);
        http_response_code(200);
    } else {
        echo json_encode(["message" => "Failed to save data."]);
        http_response_code(500);
    }
} else {
    // Invalid request method
    echo json_encode(["message" => "Invalid request method."]);
    http_response_code(405);
}

?>

