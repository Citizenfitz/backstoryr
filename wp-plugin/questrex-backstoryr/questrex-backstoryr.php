<?php
/**
 * Plugin Name: QuestRex Backstoryr
 * Plugin URI: https://citizenfitz.com
 * Description: AI-Enhanced TTRPG Character Backstory Generator
 * Version: 1.0.0
 * Author: CitizenFitz
 * Author URI: https://citizenfitz.com
 * Text Domain: questrex-backstoryr
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('QUESTREX_BACKSTORYR_VERSION', '1.0.0');
define('QUESTREX_BACKSTORYR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('QUESTREX_BACKSTORYR_PLUGIN_URL', plugin_dir_url(__FILE__));

// Define environment
define('QUESTREX_BACKSTORYR_IS_LOCAL', 
    (!empty($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) || 
    (!empty($_SERVER['SERVER_NAME']) && strpos($_SERVER['SERVER_NAME'], 'localhost') !== false)
);

/**
 * Get the API key from WordPress options or environment
 */
function questrex_backstoryr_get_api_key() {
    if (QUESTREX_BACKSTORYR_IS_LOCAL) {
        // In local development, use the environment variable
        return getenv('REACT_APP_XAI_API_KEY');
    }
    
    // In WordPress, use the option from the database
    return get_option('questrex_backstoryr_api_key');
}

/**
 * Add the options page to the WordPress admin menu
 */
function questrex_backstoryr_add_admin_menu() {
    add_options_page(
        'QuestRex Backstoryr Settings',
        'QuestRex Backstoryr',
        'manage_options',
        'questrex-backstoryr',
        'questrex_backstoryr_options_page'
    );
}

/**
 * Register plugin settings
 */
function questrex_backstoryr_settings_init() {
    register_setting('questrex_backstoryr', 'questrex_backstoryr_api_key');
    
    add_settings_section(
        'questrex_backstoryr_settings_section',
        'API Settings',
        'questrex_backstoryr_settings_section_callback',
        'questrex-backstoryr'
    );
    
    add_settings_field(
        'questrex_backstoryr_api_key',
        'xAI API Key',
        'questrex_backstoryr_api_key_render',
        'questrex-backstoryr',
        'questrex_backstoryr_settings_section'
    );
}

function questrex_backstoryr_settings_section_callback() {
    echo '<p>Enter your xAI API key below. You can get this from your xAI account.</p>';
}

function questrex_backstoryr_api_key_render() {
    $api_key = get_option('questrex_backstoryr_api_key');
    ?>
    <input type='password' 
           name='questrex_backstoryr_api_key' 
           value='<?php echo esc_attr($api_key); ?>'
           style='width: 300px;'
    >
    <?php
}

function questrex_backstoryr_options_page() {
    ?>
    <div class="wrap">
        <h2>QuestRex Backstoryr Settings</h2>
        <form action='options.php' method='post'>
            <?php
            settings_fields('questrex_backstoryr');
            do_settings_sections('questrex-backstoryr');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

/**
 * Clean asset path by removing any double dots or slashes
 */
function questrex_backstoryr_clean_asset_path($path) {
    // Remove the leading ./ if present
    $path = preg_replace('/^\.\//', '', $path);
    // Remove any double slashes
    $path = preg_replace('#/+#', '/', $path);
    // Ensure path starts with a single slash
    $path = '/' . ltrim($path, '/');
    return $path;
}

/**
 * Get the appropriate base URL for assets based on environment
 */
function questrex_backstoryr_get_asset_base_url() {
    if (QUESTREX_BACKSTORYR_IS_LOCAL) {
        return 'http://localhost:3000';
    }
    return QUESTREX_BACKSTORYR_PLUGIN_URL . 'assets/build';
}

/**
 * Display admin notice if API key is not set
 */
function questrex_backstoryr_admin_notice() {
    if (!questrex_backstoryr_get_api_key() && !QUESTREX_BACKSTORYR_IS_LOCAL) {
        ?>
        <div class="notice notice-error">
            <p><?php _e('QuestRex Backstoryr requires an API key. Please configure it in the <a href="' . admin_url('options-general.php?page=questrex-backstoryr') . '">Settings Page</a>.', 'questrex-backstoryr'); ?></p>
        </div>
        <?php
    }
}
add_action('admin_notices', 'questrex_backstoryr_admin_notice');

/**
 * Enqueue scripts and styles for the backstoryr
 */
function questrex_backstoryr_enqueue_assets() {
    // Only load assets when the shortcode is present
    global $post;
    if (!is_null($post) && has_shortcode($post->post_content, 'questrex-backstoryr')) {
        // Debug output
        error_log('Environment: ' . (QUESTREX_BACKSTORYR_IS_LOCAL ? 'Local Development' : 'WordPress Plugin'));
        error_log('Asset Base URL: ' . questrex_backstoryr_get_asset_base_url());
        
        // Ensure React is loaded
        wp_enqueue_script('wp-element');
        
        // Get the build directory manifest
        $manifest_path = QUESTREX_BACKSTORYR_PLUGIN_DIR . 'assets/build/asset-manifest.json';
        
        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            
            // Create an array to store all chunk handles
            $chunk_handles = array();
            
            // Enqueue all chunk files first
            if (isset($manifest['files']) && is_array($manifest['files'])) {
                foreach ($manifest['files'] as $file => $path) {
                    if (strpos($file, 'chunk.js') !== false) {
                        $handle = 'questrex-backstoryr-chunk-' . basename($file);
                        $chunk_handles[] = $handle;
                        $full_url = questrex_backstoryr_get_asset_base_url() . questrex_backstoryr_clean_asset_path($path);
                        wp_enqueue_script(
                            $handle,
                            $full_url,
                            array('wp-element'),
                            QUESTREX_BACKSTORYR_VERSION,
                            true
                        );
                    }
                }
            }
            
            // Enqueue main CSS
            if (isset($manifest['files']['main.css'])) {
                $css_url = questrex_backstoryr_get_asset_base_url() . questrex_backstoryr_clean_asset_path($manifest['files']['main.css']);
                wp_enqueue_style(
                    'questrex-backstoryr',
                    $css_url,
                    array(),
                    QUESTREX_BACKSTORYR_VERSION
                );
            }
            
            // Enqueue main JS after all chunks
            if (isset($manifest['files']['main.js'])) {
                $js_url = questrex_backstoryr_get_asset_base_url() . questrex_backstoryr_clean_asset_path($manifest['files']['main.js']);
                wp_enqueue_script(
                    'questrex-backstoryr',
                    $js_url,
                    array_merge(array('wp-element'), $chunk_handles),
                    QUESTREX_BACKSTORYR_VERSION,
                    true
                );
                
                // Localize script with necessary data
                wp_localize_script(
                    'questrex-backstoryr',
                    'questRexBackstoryrData',
                    array(
                        'ajaxUrl' => admin_url('admin-ajax.php'),
                        'nonce' => wp_create_nonce('questrex-backstoryr-nonce'),
                        'pluginUrl' => QUESTREX_BACKSTORYR_PLUGIN_URL,
                        'isLocal' => QUESTREX_BACKSTORYR_IS_LOCAL,
                        'isLoggedIn' => is_user_logged_in(),
                        'apiKey' => questrex_backstoryr_get_api_key()
                    )
                );
            }
        } else {
            error_log('Error: Manifest file not found at: ' . $manifest_path);
            if (QUESTREX_BACKSTORYR_IS_LOCAL) {
                error_log('In local development, make sure your React dev server is running on port 3000');
            }
        }
    }
}

/**
 * Register shortcode
 */
function questrex_backstoryr_shortcode() {
    // Check if API key is available
    if (!questrex_backstoryr_get_api_key()) {
        return '<div class="backstoryr-error">API key not configured. Please contact the site administrator.</div>';
    }
    
    // Ensure assets are loaded
    questrex_backstoryr_enqueue_assets();
    
    ob_start();
    ?>
    <div class="backstoryr-wrapper">
        <div id="questrex-root">
            <div id="questrex-modal-container"></div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Handle the backstory generation AJAX request
 */
function questrex_backstoryr_generate_backstory() {
    // Verify nonce
    if (!check_ajax_referer('questrex-backstoryr-nonce', 'nonce', false)) {
        wp_send_json_error('Invalid security token');
        wp_die();
    }

    // Get the prompt from the request
    $prompt = sanitize_text_field($_POST['prompt']);
    if (empty($prompt)) {
        wp_send_json_error('No prompt provided');
        wp_die();
    }

    // Get the API key
    $api_key = questrex_backstoryr_get_api_key();
    if (empty($api_key)) {
        wp_send_json_error('API key not configured');
        wp_die();
    }

    // Make the request to xAI API
    $response = wp_remote_post('https://api.x.ai/v1/chat/completions', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode(array(
            'model' => 'grok-3-latest',
            'messages' => array(
                array(
                    'role' => 'system',
                    'content' => 'You are a creative writing assistant specializing in fantasy RPG character backstories.'
                ),
                array(
                    'role' => 'user',
                    'content' => $prompt
                )
            ),
            'max_tokens' => 150,
            'temperature' => 0.7
        ))
    ));

    // Check for errors
    if (is_wp_error($response)) {
        wp_send_json_error('Failed to connect to API: ' . $response->get_error_message());
        wp_die();
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $status_code = wp_remote_retrieve_response_code($response);

    if ($status_code !== 200) {
        $error_message = 'API Error';
        if (isset($body['error']['message'])) {
            $error_message = $body['error']['message'];
        }
        wp_send_json_error($error_message);
        wp_die();
    }

    // Return the response
    wp_send_json_success(array(
        'backstory' => $body['choices'][0]['message']['content']
    ));
    wp_die();
}

/**
 * Initialize plugin
 */
function questrex_backstoryr_init() {
    add_shortcode('questrex-backstoryr', 'questrex_backstoryr_shortcode');
    add_action('wp_enqueue_scripts', 'questrex_backstoryr_enqueue_assets');
    add_action('admin_menu', 'questrex_backstoryr_add_admin_menu');
    add_action('admin_init', 'questrex_backstoryr_settings_init');
    
    // Add AJAX endpoints
    add_action('wp_ajax_questrex_backstoryr_generate', 'questrex_backstoryr_generate_backstory');
    add_action('wp_ajax_nopriv_questrex_backstoryr_generate', 'questrex_backstoryr_generate_backstory');
}

// Initialize
add_action('init', 'questrex_backstoryr_init'); 