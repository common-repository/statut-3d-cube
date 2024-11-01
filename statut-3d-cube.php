<?php
/**
 * Plugin Name:       Statut 3D Cube
 * Plugin URI:        https://plugins.statut.systems/3d-cube/
 * Description:       Displays interactive 3D cube.
 * Version:           1.2.4
 * Author:            Statut Systems
 * Author URI:        https://statut.systems/
 *
 **/

define('S3DC_ROOT', __FILE__);

define('S3DC_PATH', plugin_dir_path(__FILE__));

define('S3DC_URL', plugin_dir_url(__FILE__));

define('S3DC_HOOK_SUFFIX', 'toplevel_page_s3dc');

define('S3DC_ASSETS', S3DC_URL . 'assets/');

define('S3DC_MODULES', S3DC_ASSETS);

define('S3DC_SETTINGS_UPDATE', 'S3DC_SETTINGS_UPDATE');

define('S3DC_SETTINGS', 'S3DC_SETTINGS');

require_once is_admin()
? __DIR__ . '/includes/admin.php'
: __DIR__ . '/includes/client.php';
