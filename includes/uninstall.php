<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('s3dc-settings');
