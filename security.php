<?php

// Simple XSS cleaning function
function clean_xss($data) 
{
    if (is_array($data)) 
    {
        return array_map('clean_xss', $data);
    }
    
    // Convert spec chars to HTML entities
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    
    // Rem bad tags
    $data = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $data);
    $data = preg_replace('/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/mi', '', $data);
    
    // Rem event handlers
    $data = preg_replace('/on\w+="[^"]*"/i', '', $data);
    
    // Remove JS urls
    $data = preg_replace('/javascript:/i', '', $data);
    
    return $data;
}

// Clean all POST data automatically
if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    $_POST = clean_xss($_POST);
}

// Clean all GET data automatically
if (!empty($_GET)) 
{
    $_GET = clean_xss($_GET);
}

// Set basic security headers
header('X-XSS-Protection: 1; mode=block');
header('X-Content-Type-Options: nosniff');

?>

<script>
// Simple XSS protection for client-side
function escapeHtml(text) 
{
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clean user inputs on form submission
document.addEventListener('DOMContentLoaded', function() 
{
    // Add XSS protection to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) 
        {
            const inputs = form.querySelectorAll('input[type="text"], textarea');
            inputs.forEach(input => 
            {
                // Basic XSS cleaning
                input.value = input.value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+=/gi, '');
            });
        });
    });
    
    // Sanitize dyna content
    window.safeSetHTML = function(element, content) 
    {
        if (typeof content === 'string') 
        {
            element.textContent = content;
        }
    };
    
    window.safeSetAttribute = function(element, attr, value) 
    {
        if (typeof value === 'string') 
        {
            element.setAttribute(attr, escapeHtml(value));
        }
    };
});
</script>