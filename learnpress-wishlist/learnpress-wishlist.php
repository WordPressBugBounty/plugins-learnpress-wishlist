<?php
/**
 * Plugin Name: LearnPress - Course Wishlist
 * Plugin URI: https://thimpress.com/product/learnpress-course-wishlist/
 * Description: Wishlist feature.
 * Author: ThimPress
 * Version: 4.1.3
 * Author URI: http://thimpress.com
 * Tags: learnpress
 * Text Domain: learnpress-wishlist
 * Domain Path: /languages/
 * Require_LP_Version: 4.3.2.7
 * Requires Plugins: learnpress
 * Requires at least: 6.0
 * Requires PHP: 7.4
 *
 * @package LearnPress-Course-Wishlist
 */

defined( 'ABSPATH' ) || exit;

const LP_ADDON_WISHLIST_FILE = __FILE__;
const LP_ADDON_WISHLIST_PATH = __DIR__;

use LearnPress\Wishlist\TemplateHooks\CoursesWishlistTemplate;
use LearnPress\Wishlist\TemplateHooks\CourseWishlistTemplate;

/**
 * Class LP_Addon_Wishlist_Preload
 */
class LP_Addon_Wishlist_Preload {
	public static $instance;
	/**
	 * @var LP_Addon_Wishlist
	 */
	public static $addon;
	/**
	 * @var array
	 */
	public static $addon_info = array();
	/**
	 * @var string
	 */
	public $require_error = '';

	/**
	 * Singleton.
	 *
	 * @return LP_Addon_Wishlist_Preload
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * LP_Addon_Wishlist_Preload constructor.
	 */
	protected function __construct() {
		// Set Base name plugin.
		define( 'LP_ADDON_WISHLIST_BASENAME', plugin_basename( LP_ADDON_WISHLIST_FILE ) );

		// Set version addon for LP check .
		if ( ! function_exists( 'is_plugin_active' )
			&& is_readable( ABSPATH . 'wp-admin/includes/plugin.php' ) ) {
			include_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		self::$addon_info = get_file_data(
			LP_ADDON_WISHLIST_FILE,
			array(
				'Name'               => 'Plugin Name',
				'Require_LP_Version' => 'Require_LP_Version',
				'Version'            => 'Version',
			)
		);

		define( 'LP_ADDON_WISHLIST_VER', self::$addon_info['Version'] );
		define( 'LP_ADDON_WISHLIST_REQUIRE_VER', self::$addon_info['Require_LP_Version'] );

		if ( ! $this->check_requirements() ) {
			return;
		}

		include_once LP_ADDON_WISHLIST_PATH . '/vendor/autoload.php';

		// Sure LP loaded.
		add_action( 'learn-press/ready', array( $this, 'load' ) );
	}

	/**
	 * Check requirements
	 *
	 * @return bool
	 */
	protected function check_requirements(): bool {
		try {
			if ( ! is_plugin_active( 'learnpress/learnpress.php' )
				|| version_compare(
					get_option( 'learnpress_version', '3.0.0' ),
					LP_ADDON_WISHLIST_REQUIRE_VER,
					'<'
				) ) {
				$this->require_error = 'require_lp';
				throw new Exception();
			}

			return true;
		} catch ( Throwable $e ) {
			add_action( 'admin_notices', array( $this, 'show_note_errors' ) );

			return false;
		}
	}

	/**
	 * Load addon
	 */
	public function load() {
		include_once LP_ADDON_WISHLIST_PATH . '/inc/load.php';
		self::$addon = LP_Addon_Wishlist::instance();
		CourseWishlistTemplate::instance();
		CoursesWishlistTemplate::instance();
	}

	/**
	 * Show notice errors
	 */
	public function show_note_errors() {
		$message = '';
		switch ( $this->require_error ) {
			case 'require_lp':
				$message = sprintf(
					esc_html__(
						'Addon %1$s require install LearnPress version %2$s or later',
						'learnpress-wishlist'
					),
					self::$addon_info['Name'],
					LP_ADDON_WISHLIST_REQUIRE_VER,
				);
				break;
			default:
				break;
		}

		echo sprintf(
			'<div class="notice notice-error"><p>%s</p></div>',
			$message
		);
	}
}

LP_Addon_Wishlist_Preload::instance();
