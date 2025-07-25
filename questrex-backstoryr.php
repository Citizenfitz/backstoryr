<?php
/**
 * Plugin Name: QuestRex Backstoryr
 * Plugin URI: https://github.com/Citizenfitz/backstoryr
 * Description: Fantasy RPG Character Generator and Prompt Creator
 * Version: 0.1.0
 * Author: Citizenfitz
 * Text Domain: questrex-backstoryr
 */

if (!defined('ABSPATH')) {
    exit;
}

function questrex_backstoryr_enqueue_scripts() {
    $asset_manifest = plugin_dir_path(__FILE__) . 'build/asset-manifest.json';
    
    if (file_exists($asset_manifest)) {
        $manifest = json_decode(file_get_contents($asset_manifest), true);
        
        if (isset($manifest['files']['main.css'])) {
            wp_enqueue_style(
                'questrex-backstoryr',
                plugins_url('build/' . $manifest['files']['main.css'], __FILE__),
                array(),
                '0.1.0'
            );
        }
        
        if (isset($manifest['files']['main.js'])) {
            wp_enqueue_script(
                'questrex-backstoryr',
                plugins_url('build/' . $manifest['files']['main.js'], __FILE__),
                array(),
                '0.1.0',
                true
            );
        }
    }
}
add_action('wp_enqueue_scripts', 'questrex_backstoryr_enqueue_scripts');

function questrex_backstoryr_shortcode() {
    return '<div id="questrex-root"></div>';
}
add_shortcode('questrex_backstoryr', 'questrex_backstoryr_shortcode'); 