# WPX newsletter source record

Read-only discovery on 28 October 2026, Australia/Perth. See [the migration handoff](wpx-newsletter-discovery.md) for the goal, full flow, differences and acceptance work.

Downloaded only through /Users/sacino/ranked-ai-builder/scripts/wpx-sftp using the dedicated account for dev.musclehacking.com. The handler is reproduced unchanged. Both secret values in the configuration have been replaced. No secret or subscriber address is retained.

## Original remote file fingerprints

These sizes and SHA-256 hashes were calculated before redaction. They identify the inspected remote files; the configuration fingerprint does not match the redacted snapshot below.

```json
{
  "subscription-handler.php": {
    "bytes": 3994,
    "sha256": "b57c2e76dfc0ebb9cf0bb1c20b2b700d25f3ea9cd3f3a2e24c9a790c157fa751"
  },
  "config_123123123.php": {
    "bytes": 250,
    "sha256": "e2b347e3103ae9c80601da9dff61ea4de6427f1ed4a2cee763f1c0d8ceeb4b0a"
  }
}
```

## subscription-handler.php

```php
<?php
// Load our API keys
include_once($_SERVER['DOCUMENT_ROOT'] . '/config_123123123.php');

// Array of allowed origins for CORS
$allowedOrigins = ['https://www.musclehacking.com'];

// Retrieve the request's origin
$requestOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if the request method is POST and if the origin is allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !in_array($requestOrigin, $allowedOrigins)) {
    // If the request is not a POST or if it's from a disallowed origin, set a generic "Not Allowed" error
    http_response_code(403); // Using 403 Forbidden as a generic error code
    echo json_encode(['error' => 'Not Allowed']);
    exit;
} else {
    // For allowed origins, set appropriate CORS headers to facilitate cross-origin requests
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Access-Control-Allow-Methods: POST'); // Explicitly allow only POST requests
    header('Access-Control-Allow-Headers: Content-Type'); // Specify allowed headers
}

// ? Log file permissions

$logFile = dirname(__FILE__) . '/error_log.txt'; // Logging setup.
$enableLogging = false; // Enable or disable logging.

function logMessage($message, $enableLogging) {
    global $logFile;
    if ($enableLogging) {
        // Log the message with date, time, and append a new line at the end
        error_log(date("[Y-m-d H:i:s]") . " " . $message . PHP_EOL, 3, $logFile);
    }
}

header('Content-Type: application/json');

$recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
if (empty($recaptchaResponse)) {
    logMessage('No reCAPTCHA response in input.', $enableLogging);
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request: Missing reCAPTCHA response.']);
    exit;
}

// reCAPTCHA verification
$recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify';
$recaptchaData = http_build_query([
    'secret' => RECAPTCHA_SECRET_KEY,
    'response' => $recaptchaResponse,
    'remoteip' => $_SERVER['REMOTE_ADDR']
]);
$recaptchaOptions = [
    'http' => [
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => $recaptchaData
    ]
];
$recaptchaContext = stream_context_create($recaptchaOptions);
$recaptchaResult = file_get_contents($recaptchaURL, false, $recaptchaContext);
$recaptchaSuccess = json_decode($recaptchaResult, true)['success'] ?? false;

if (!$recaptchaSuccess) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'reCAPTCHA verification failed.']);
    exit;
}

$email = $_POST['email'] ?? '';

// Preparing data for GetResponse API
$postData = [
    'email' => $email,
    'dayOfCycle' => '0',
    'campaign' => ['campaignId' => 'qwsfu'],
];

$ch = curl_init('https://api.getresponse.com/v3/contacts');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Auth-Token: api-key ' . GETRESPONSE_API_KEY,
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Enhanced error handling for 409 Conflict
if ($status == 409) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already subscribed or exists in the campaign.']);
    logMessage('Email already subscribed or exists in the campaign.', $enableLogging);
    exit;
} elseif ($status != 202) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit data to GetResponse. HTTP Status: ' . $status]);
    logMessage('Failed to submit data to GetResponse. HTTP Status: ' . $status, $enableLogging);
    exit;
}

curl_close($ch);

$thankYouUrl = 'https://www.musclehacking.com/one-last-step/';
echo json_encode(['success' => true, 'message' => 'Form submitted successfully.', 'thankYouUrl' => $thankYouUrl]);
logMessage('Form submitted successfully.', $enableLogging);
```

## config_123123123.php, secret values removed

```php
<?php
define('RECAPTCHA_SECRET_KEY', '[REDACTED_RECAPTCHA_SECRET_KEY]'); // The secret key for Google reCAPTCHA validation.
define('GETRESPONSE_API_KEY', '[REDACTED_GETRESPONSE_API_KEY]'); // The API key for communicating with GetResponse.
```

## GetResponse campaign readback, approved fields only

Authenticated GET only. The response was restricted to the list identity and confirmation settings before being recorded. No contact collection was requested. The API key was not retained.

```json
{
  "method": "GET",
  "resource": "/v3/campaigns/qwsfu",
  "status": 200,
  "campaignId": "qwsfu",
  "name": "musclehacking",
  "languageCode": "EN",
  "optinTypes": {
    "api": "double",
    "email": "single",
    "import": "single",
    "webform": "double"
  },
  "confirmation": {
    "mimeType": "text/plain",
    "redirectType": "hosted",
    "subscriptionConfirmationBodyId": "TfUp",
    "subscriptionConfirmationSubjectId": "yrjU"
  },
  "confirmationRedirectUrlWithoutQuery": "",
  "confirmationRedirectHasQuery": false
}
```

## Harmless public-handler GET

No signup POST or challenge submission was made. This GET confirms that the public route rejects an unsupported request as the source specifies.

```json
{
  "method": "GET",
  "status": 403,
  "bodyMatchesExpectedRejection": true,
  "contentType": "text/html; charset=UTF-8",
  "allowOrigin": null
}
```
