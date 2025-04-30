<?php
require 'vendor/autoload.php'; // Make sure to install TCPDF using Composer

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Create new PDF document
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        
        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        
        // Process uploaded images
        if (isset($_FILES['images'])) {
            foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
                $pdf->AddPage();
                $pdf->Image($tmp_name, 10, 10, 190);
            }
        }
        
        // Save PDF
        $pdfPath = 'uploads/' . uniqid() . '.pdf';
        $pdf->Output(__DIR__ . '/' . $pdfPath, 'F');
        
        echo json_encode([
            'success' => true,
            'pdfUrl' => $pdfPath
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
?>```php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Validate request data
        if (!isset($_FILES['images']) || empty($_FILES['images'])) {
            throw new Exception('No images provided');
        }

        // Create new PDF document
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        
        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        
        // Process uploaded images
        foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
            if (!is_uploaded_file($tmp_name)) {
                throw new Exception('Invalid image upload');
            }
            $pdf->AddPage();
            $pdf->Image($tmp_name, 10, 10, 190);
        }
        
        // Save PDF
        $pdfPath = 'uploads/' . uniqid() . '.pdf';
        if (!$pdf->Output(__DIR__ . '/' . $pdfPath, 'F')) {
            throw new Exception('Failed to save PDF');
        }
        
        echo json_encode([
            'success' => true,
            'pdfUrl' => $pdfPath
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
```