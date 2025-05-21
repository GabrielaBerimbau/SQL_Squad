<?php
class Config 
{
    private static $dbHost;
    private static $dbUser;
    private static $dbPass;
    private static $dbName;
    
    private static $conn = null;
    
    //load environment variables from .env file
    private static function loadEnv() 
    {
        $envFile = __DIR__ . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                //skip comments
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }
                
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);
                
                //remove quotes if present
                if (strpos($value, '"') === 0 || strpos($value, "'") === 0) {
                    $value = substr($value, 1, -1);
                }
                
                //set as environment variable
                putenv("$name=$value");
                $_ENV[$name] = $value;
            }
        }
    }
    
    public static function getConnection() 
    {
        //load environment variables if not already loaded
        self::loadEnv();
        
        // Set database credentials from environment variables
        self::$dbHost = getenv('DB_HOST');
        self::$dbUser = getenv('DB_USER');
        self::$dbPass = getenv('DB_PASS');
        self::$dbName = getenv('DB_NAME');
        
        if (self::$conn == null) 
        {
            try 
            {
                self::$conn = new mysqli(self::$dbHost, self::$dbUser, self::$dbPass, self::$dbName);
                
                if (self::$conn->connect_error) 
                {
                    throw new Exception("Connection failed: " . self::$conn->connect_error);
                }
            } 
            catch (Exception $e) 
            {
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