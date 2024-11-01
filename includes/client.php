<?php

class S3DCPlugin
{
    private static $instance = null;

    private function __construct()
    {
        add_shortcode('s3dc', [$this, 'handle_shortcode']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_styles']);
    }

    public function enqueue_scripts()
    {
        wp_enqueue_script('s3dc-three', S3DC_ASSETS . 'js/three.min.js', null);
        wp_enqueue_script('s3dc-gsap', S3DC_ASSETS . 'js/gsap.min.js', null);
        wp_enqueue_script('s3dc-base64-assets', S3DC_ASSETS . 'js/base64-assets.js', null);

        $deps_client = array('jquery', 's3dc-three', 's3dc-gsap', 's3dc-base64-assets');
        wp_enqueue_script('s3dc-client', S3DC_MODULES . 'js/client.js', $deps_client);
    }

    public function enqueue_styles()
    {
        wp_enqueue_style('s3dc-client-styles', S3DC_ASSETS . 'css/client-styles.css');
    }

    // Replace shortcode with div element, in which all necessary parameters are defined as data- attributes.
    // After the page loads, the javascript function will replace the div element with a canvas containing the 3d cube model.
    public function handle_shortcode($atts)
    {

        $a = shortcode_atts(array(
            'side1' => '',
            'side2' => '',
            'side3' => '',
            'side4' => '',
            'link1' => '',
            'link2' => '',
            'link3' => '',
            'link4' => '',
            'target' => '_blank',
            'clickable' => '0',
        ), $atts);

        // Sanitize fields
        foreach ($a as $name => &$field) {
            if ($name === 'clickable' || $name === 'target') {
                $field = sanitize_text_field($field);
            } else {
                $field = esc_url($field);
            }
        }

        $a['antialiasing'] = get_option("s3dc-settings")['antialiasing'];

        $params = '';

        foreach ($a as $key => $value) {
            $params .= "data-$key='" . "$value' ";
        }

        return "<div class='s3dc-dataset' $params></div>";
    }

    public static function get_instance()
    {
        if (self::$instance == null) {
            self::$instance = new S3DCPlugin();
        }

        return self::$instance;
    }

}

S3DCPlugin::get_instance();
