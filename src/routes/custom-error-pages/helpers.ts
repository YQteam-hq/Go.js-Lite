export const defaultTemplates = {
  '403': {
    title: '403 Forbidden',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Forbidden</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .error-code { font-size: 72px; font-weight: bold; color: #e74c3c; margin-bottom: 20px; }
        .error-message { font-size: 24px; color: #333; margin-bottom: 20px; }
        .error-details { font-size: 16px; color: #666; margin-bottom: 30px; }
        .back-button { background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .back-button:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">403</div>
        <div class="error-message">Forbidden</div>
        <div class="error-details">You do not have permission to access this page.</div>
        <button class="back-button" onclick="history.back()">Back to previous page</button>
    </div>
</body>
</html>`
  },
  '404': {
    title: '404 Not Found',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .error-code { font-size: 72px; font-weight: bold; color: #e74c3c; margin-bottom: 20px; }
        .error-message { font-size: 24px; color: #333; margin-bottom: 20px; }
        .error-details { font-size: 16px; color: #666; margin-bottom: 30px; }
        .back-button { background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .back-button:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">404</div>
        <div class="error-message">Page Not Found</div>
        <div class="error-details">The page you are looking for does not exist or has been removed.</div>
        <button class="back-button" onclick="history.back()">Back to previous page</button>
    </div>
</body>
</html>`
  },
  '500': {
    title: '500 Internal Server Error',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 Internal Server Error</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .error-code { font-size: 72px; font-weight: bold; color: #e74c3c; margin-bottom: 20px; }
        .error-message { font-size: 24px; color: #333; margin-bottom: 20px; }
        .error-details { font-size: 16px; color: #666; margin-bottom: 30px; }
        .back-button { background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .back-button:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">500</div>
        <div class="error-message">Internal Server Error</div>
        <div class="error-details">The server encountered an unexpected error and could not complete your request.</div>
        <button class="back-button" onclick="history.back()">Back to previous page</button>
    </div>
</body>
</html>`
  }
}

export function generateTemplate(error_code: string) {
  return defaultTemplates[error_code as keyof typeof defaultTemplates]
}
