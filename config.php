
<?php
//enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

class Config 
{
    private static $dbHost;
    private static $dbUser;
    private static $dbPass;
    private static $dbName;
    
    private static $conn = null;
    
    // Load environment variables from .env file
    private static function loadEnv() 
    {
        $envFile = __DIR__ . '/.env';
        error_log("Looking for .env file at: " . $envFile);
        
        if (file_exists($envFile)) {
            error_log(".env file found, loading...");
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                //skip comments and empty lines
                if (strpos(trim($line), '#') === 0 || empty(trim($line))) {
                    continue;
                }
                
                //check if line contains '='
                if (strpos($line, '=') === false) {
                    continue;
                }
                
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);
                
                //remove quotes if present
                if ((strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) ||
                    (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1)) {
                    $value = substr($value, 1, -1);
                }
                
                //set as environment variable
                putenv("$name=$value");
                $_ENV[$name] = $value;
                error_log("Loaded env var: $name = $value");
            }
        } else {
            error_log("Warning: .env file not found at " . $envFile);
            error_log("Current directory: " . __DIR__);
            error_log("Files in directory: " . print_r(scandir(__DIR__), true));
        }
    }
    
    public static function getConnection() 
    {
        // Load environment variables if not already loaded
        self::loadEnv();
        
        // Set database credentials from environment variables with fallbacks
        self::$dbHost = getenv('DB_HOST') ?: 'localhost';
        self::$dbUser = getenv('DB_USER');
        self::$dbPass = getenv('DB_PASS');
        self::$dbName = getenv('DB_NAME'); // Update this to your actual database name
        
        // Debug: Log connection attempt
        error_log("Attempting to connect to database:");
        error_log("Host: " . self::$dbHost);
        error_log("User: " . self::$dbUser);
        error_log("Database: " . self::$dbName);
        error_log("Password length: " . strlen(self::$dbPass));
        
        if (self::$conn == null) 
        {
            try 
            {
                self::$conn = new mysqli(self::$dbHost, self::$dbUser, self::$dbPass, self::$dbName);
                
                if (self::$conn->connect_error) 
                {
                    throw new Exception("Connection failed: " . self::$conn->connect_error);
                }
                
                // Set charset to utf8mb4 for better compatibility
                self::$conn->set_charset("utf8mb4");
                
                // Debug: Log successful connection
                error_log("Database connection successful to " . self::$dbName);
                
            } 
            catch (Exception $e) 
            {
                error_log("Database connection error: " . $e->getMessage());
                
                // Try to provide more specific error information
                if (strpos($e->getMessage(), 'Access denied') !== false) {
                    error_log("Access denied - check username/password");
                } elseif (strpos($e->getMessage(), 'Unknown database') !== false) {
                    error_log("Database '" . self::$dbName . "' does not exist");
                } elseif (strpos($e->getMessage(), "Can't connect") !== false) {
                    error_log("Cannot connect to MySQL server - check if MySQL is running");
                }
                
                die("Database connection error: " . $e->getMessage());
            }
        }
        return self::$conn;
    }
    
    public static function closeConnection() 
    {
        if (self::$conn != null) 
        {
            self::$conn->close();
            self::$conn = null;
        }
    }
    
    // Test database connection
    public static function testConnection() 
    {
        try {
            $conn = self::getConnection();
            
            // Test with a simple query
            $result = $conn->query("SELECT 1 as test");
            if ($result) {
                return ['success' => true, 'message' => 'Database connection and query successful'];
            } else {
                return ['success' => false, 'message' => 'Connection successful but query failed'];
            }
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public static function generateToken($length = 32) 
    {
        return bin2hex(random_bytes($length / 2));
    }
    
    public static function generateSalt($length = 16) 
    {
        return bin2hex(random_bytes($length / 2));
    }
}
?>