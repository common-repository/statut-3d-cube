<?php

class S3DCPluginMenu
{
    private static $instance = null;

    private function __construct()
    {
        add_action('admin_menu', [$this, 'init_admin_menu']);
        add_action('admin_init', [$this, 'add_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_styles']);
        register_activation_hook(S3DC_ROOT, [$this, 'handle_activation']);
    }

    public function enqueue_scripts($hook)
    {
        if (S3DC_HOOK_SUFFIX == $hook) {
            wp_enqueue_script('s3dc-admin', S3DC_MODULES . 'js/admin.js', null, false, true);
        }
    }

    public function enqueue_styles($hook)
    {
        if (S3DC_HOOK_SUFFIX == $hook) {
            wp_enqueue_style('s3dc-admin-styles', S3DC_ASSETS . 'css/admin-styles.css');
        }
    }

    public function add_settings()
    {
        register_setting(
            's3dc-settings-group',
            's3dc-settings',
            [$this, 'sanitize_callback']
        );

        add_settings_section(
            's3dc_settings_section',
            'Base options',
            '',
            's3dc'
        );

        add_settings_field(
            's3dc_antialiasing',
            'Antialiasing',
            [$this, 'render_setting'],
            's3dc',
            's3dc_settings_section',
            [
                "name" => 's3dc-settings[antialiasing]',
                "option" => 'antialiasing',
                "label" => 'Enable antialiasing (smoother edges)',
                "type" => 'checkbox',
            ]
        );
    }

    public function render_setting(array $args)
    {

        $options = get_option('s3dc-settings');
        $option = $args['option'];
        $name = $args['name'];
        $type = $args['type'];
        $label = $args['label'];

        if ($type === 'checkbox') {

            $is_checked = checked(1, $options[$option], false);

            echo '<div>
            <input
            type="' . $type . '"
            id="' . $name . '"
            name="' . $name . '"
            ' . $is_checked . '
            />
            <label
            for="' . $name . '">' . $label . '
            </label>
            </div>';
        }

    }

    public function handle_activation() // TODO

    {
        add_option('s3dc-settings', ['antialiasing' => 1]);
    }

    public static function get_instance()
    {
        if (self::$instance == null) {
            self::$instance = new S3DCPluginMenu();
        }

        return self::$instance;
    }

    public function init_admin_menu()
    {
        add_menu_page(
            'Statut 3D Cube',
            'Statut 3D Cube',
            'manage_options',
            's3dc',
            [$this, 'add_admin_menu'],
            'data:image/svg+xml;base64,PHN2ZyBpZD0iczNkYy1pY29uIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTEuODQ2IDUxMS44NDYiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDUxMS44NDYgNTExLjg0NiIgIGZpbGw9IndoaXRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxwYXRoIGQ9Im0yMjUuMzM2IDI1OC4wMjEtMTYzLjQ0LTg4LjgyNGMtNy4yNy0zLjk0OS0xNS44NTUtMy43ODYtMjIuOTY5LjQ0My03LjExNCA0LjIyOC0xMS4zNTkgMTEuNjkzLTExLjM1OSAxOS45Njl2MjA2LjA1MmMwIDguMzM3IDQuNTAyIDE2LjA3NiAxMS43NSAyMC4xOTdsMTYzLjQ0MyA5Mi45MTdjMy42MDMgMi4wNDggNy41NDMgMy4wNzEgMTEuNDg0IDMuMDcxIDQuMDE2IDAgOC4wMzEtMS4wNjMgMTEuNjgyLTMuMTg4IDcuMjMxLTQuMjA3IDExLjU0OC0xMS43MTQgMTEuNTQ4LTIwLjA4MXYtMjEwLjE0M2MwLTguNTIxLTQuNjUtMTYuMzQzLTEyLjEzOS0yMC40MTN6Ii8+PHBhdGggZD0ibTQ1NC42MjEgMTE1LjZjLS4wMTEtOC43LTQuODE3LTE2LjU5MS0xMi41NC0yMC41OTRsLTE3OC4yMjYtOTIuMzk5Yy02Ljc0OC0zLjUtMTQuNzkxLTMuNDc0LTIxLjUxNC4wNjVsLTE3NS42MDUgOTIuMzk5Yy03LjY0NiA0LjAyNS0xMi40MDIgMTEuODkyLTEyLjQxMyAyMC41MzMtLjAxIDguNjM5IDQuNzI3IDE2LjUxNyAxMi4zNjIgMjAuNTU5bDE3NS42MDYgOTIuOTc2YzMuNCAxLjc5OSA3LjEzMyAyLjY5OSAxMC44NjggMi42OTkgMy42ODkgMCA3LjM3OS0uODc4IDEwLjc0NS0yLjYzNWwxNzguMjMtOTIuOTc0YzcuNzE0LTQuMDI0IDEyLjQ5OS0xMS45MjkgMTIuNDg3LTIwLjYyOXoiLz48cGF0aCBkPSJtNDcyLjkxOSAxNjkuNjRjLTcuMTEtNC4yMjktMTUuNjk5LTQuMzk2LTIyLjk2Ni0uNDQ0bC0xNjMuNDQ1IDg4LjgyNWMtNy40ODcgNC4wNy0xMi4xMzcgMTEuODkxLTEyLjEzNyAyMC40MTJ2MjEwLjE0M2MwIDguMzY3IDQuMzE3IDE1Ljg3NCAxMS41NDggMjAuMDgxIDMuNjUxIDIuMTI1IDcuNjY1IDMuMTg3IDExLjY4MiAzLjE4NyAzLjk0IDAgNy44ODItMS4wMjMgMTEuNDg0LTMuMDdsMTYzLjQ0NC05Mi45MTdjNy4yNDgtNC4xMjEgMTEuNzQ5LTExLjg2IDExLjc0OS0yMC4xOTd2LTIwNi4wNTFjMC04LjI3Ni00LjI0NS0xNS43NDEtMTEuMzU5LTE5Ljk2OXoiLz48L2c+PC9zdmc+'
        );
    }

    public function add_admin_menu()
    {
        include S3DC_PATH . 'assets/html/admin-page.html';
    }

    public function sanitize_callback($options)
    {
        foreach ($options as $name => &$val) {
            $val = isset($val) ? 1 : 0;
        }
        return $options;
    }
}

S3DCPluginMenu::get_instance();
