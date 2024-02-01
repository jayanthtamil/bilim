<?php

namespace Drupal\bilim\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\File\FileSystemInterface;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;
use Drupal\file\Entity\File;
use Drupal\flag\Entity\Flag;
use Drupal\flag\Event\FlagEvents;
use Drupal\flag\Event\FlaggingEvent;
use Drupal\flag\Event\UnflaggingEvent;
use Drupal\flag\FlagInterface;
use Drupal\flag\FlagService;
use Drupal\flag\FlagLinkBuilderInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\Core\Session\SessionManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Archiver\Zip;
use Drupal\migrate\Plugin\migrate\process\Explode;
use Drupal\Tests\views\Kernel\Handler\FieldFileSizeTest;
use PhpParser\Node\Stmt\ElseIf_;
use Drupal\Core\Archiver\Annotation\Archiver;
use function GuzzleHttp\json_decode;
use function GuzzleHttp\json_encode;
use Drupal\Core\Url;
use Drupal\Component\Utility\Html;
use Drupal\Component\Serialization\Json;

/**
 * Class BilimController.
 */
class BilimController extends ControllerBase {
	public $bcr;
	public function __construct() {
		global $bcr;
	}

	/**
	 * Array values to merge and remove duplicates
	 * 2 params (existing value, new input)
	 */
	public function arrayMnp($org_val, $inp_val) {
		// $bcr = new BilimController();
		$input_val = array (
				"target_id" => $inp_val
		);
		$merged_val = array_merge ( $org_val, $input_val );
		// $res = $this->rm_unique($merged_val,"target_id");
		return $merged_val;
	}

	/**
	 * *
	 *
	 * function to flatten multidimension array
	 */
	function flatten_array($array) {
		$return = array ();
		array_walk_recursive ( $array, function ($a) use (&$return) {
			$return [] = $a;
		} );
		return $return;
	}

	/**
	 * *
	 * function for date comparision
	 */
	function date_compare($element1, $element2) {
		$datetime1 = strtotime ( $element1 ['datetime'] );
		$datetime2 = strtotime ( $element2 ['datetime'] );
		return $datetime1 - $datetime2;
	}

	/**
	 * *
	 *
	 * function to remove duplicates
	 */
	function rm_unique($array, $key) {
		$temp_array = [ ];
		foreach ( $array as &$v ) {
			if (! isset ( $temp_array [$v [$key]] ))
				$temp_array [$v [$key]] = &$v;
		}
		$array = array_values ( $temp_array );
		return $array;
	}

	/**
	 * Swap Elem into the existing
	 *
	 * @param array $array
	 * @param int|string $new_pos
	 * @param int|string $tid
	 *
	 */
	public function swapElem(&$array, $new_pos, $tid) {
		$sarray = $array;
		$ckey_val = array_keys ( $array, array (
				'target_id' => $tid
		) );
		$cur_pos = $ckey_val [0];
		$out = array_splice ( $sarray, $cur_pos, 1 );
		array_splice ( $sarray, $new_pos, 0, $out );
		return $sarray;
	}

	/**
	 * New Item into an Existing List
	 *
	 * @param array $array
	 * @param int|string $position
	 * @param mixed $insert
	 *
	 */
	public function array_insert(&$array, $position, $insert) {
		if (is_int ( $position )) {
			array_splice ( $array, $position, 0, $insert );
		} else {
			$pos = array_search ( $position, array_keys ( $array ) );
			$pos = $pos - 1;
			$array = array_merge ( array_slice ( $array, 0, $pos ), $insert, array_slice ( $array, $pos ) );
		}
		return $array;
	}

	/**
	 * Get Id Elements from Array
	 */
	public function getIdValues($array) {
		$result = array_column ( $array, 'id' );
		return $result;
	}

	/**
	 * *
	 * Node Operations
	 */

	/**
	 * ***
	 * Get field name of the Node relation
	 * Annexes Contains - Annexes folder | Page | Screen
	 * Annexes Folder contains - Annexes folder | Page | Screen
	 * Chapter Contains - Chapter | Page | Screen | Question | Custom | Feedback
	 * Feedback Contains -Simple Page | Simple Content
	 * Page Contains - Partpage | Feedback
	 * Partpage contains - Simple Page | Simple Content
	 * Question Contains - Simple Page | Simple Content
	 * Screen Contains - Simple Page | Simple Content
	 * Simple Page Contains - Part page
	 * Starting Starting page - Contains Screen Page
	 * Structure contains - Chapter | Page | Screen | Question | Custom | Feedback
	 */
	function getNodeRelFieldName($type) {
		$field = '';

		if ($type == 'course') :
			$field = 'field_crs_children';
		 elseif ($type == 'starting') :
			$field = 'field_str_children';
		 elseif ($type == 'structure') :
			$field = 'field_struct_children';
		 elseif ($type == 'annexes') :
			$field = 'field_anx_children';
		 elseif ($type == 'page') :
			$field = 'field_page_children';
		 elseif ($type == 'custom') :
			$field = 'field_custom_children';
		 elseif ($type == 'feedback') :
			$field = 'field_feedback_children';
		 elseif ($type == 'associate_content') :
			$field = 'field_associate_content_children';
		 elseif ($type == 'question') :
			$field = 'field_ques_children';
		 elseif ($type == 'chapter') :
			$field = 'field_chap_children';
		 elseif ($type == 'question') :
			$field = 'field_ques_children';
		 elseif ($type == 'screen') :
			$field = 'field_scr_children';
		 elseif ($type == 'partpage') :
			$field = 'field_pp_children';
		 elseif ($type == 'simple_partpage') :
			$field = 'field_spp_children';
		 elseif ($type == 'simple_page') :
			$field = 'field_sp_children';
		 elseif ($type == 'simple_content') :
			$field = 'field_sc_children';
		 elseif ($type == 'annexes_folder') :
			$field = 'field_af_children';
		 elseif ($type == 'domain_content_root') :
			$field = 'field_dcr_children';
		 elseif ($type == 'content_folder') :
			$field = 'field_cf_children';
		 elseif ($type == 'domain_styles_root') :
			$field = 'field_dsr_children';
		 elseif ($type == 'style_folder') :
			$field = 'field_sf_children';
		 elseif ($type == 'style') :
			$field = 'field_s_courses';
		 elseif ($type == 'domain') :
			$field = 'field_domain_children';
		endif;

		return $field;
	}

	/**
	 * *
	 * Conc all array to comma seperated string
	 */
	public function getTargetIds($array = array ()) {
		$child_ids = array ();
		foreach ( $array as $a ) :
			$child_ids [] = $a ['target_id'];
		endforeach
		;
		return $child_ids;
	}

	/**
	 * *
	 * Remove Single Child from node relation.
	 * node - current parent node
	 * field - field name based on the type
	 * tid - target child id to remove
	 */
	public function removeChildFromNode($node, $field, $tid) {
		if (null != $node) {
			if ($node->hasField ( $field )) {
				$uid = \Drupal::currentUser ()->id ();
				$items = $node->get ( $field );
				for($i = 0; $i < $items->count (); $i ++) {
					if ($items->get ( $i )->target_id == $tid) {
						$items->removeItem ( $i );
						// Caution: decrement the counter as removeItem() also does a rekey().
						$i --;
					}
				}
				// $items->rekey();
				$node->setRevisionUserId ( $uid );
				$node->save ();
			}
		}
	}

	/**
	 * *
	 * Get Children with type
	 *
	 * Retruns a array of children for nodes (course)
	 */
	public function getChildrenByType($nids, $type) {
		$nodes = Node::loadMultiple ( $nids );
		$id = '';
		if (! empty ( $nodes )) :
			foreach ( $nodes as $ns ) :
				$gtype = $ns->getType ();
				if ($gtype == $type) :
					$id = $ns->id ();
        endif;

			endforeach
			;
    endif;

		return $id;
	}

	/**
	 * *
	 * Get Children from the node id
	 *
	 * Retruns array of children for nodes (course)
	 */
	public function getElemChildren($nid, $field) {
		$n = Node::load ( $nid );
		$crs_children = $n->$field->getValue ();
		$result = $this->getTargetIds ( $crs_children );
		return $result;
	}
	public function getElemChildrenWithKey($nid, $field) {
		$n = Node::load ( $nid );
		$crs_children = $n->$field->getValue ();
		$nodes = Node::loadMultiple ( $crs_children );
		if (! empty ( $nodes )) :
			foreach ( $nodes as $ns ) :
				$gtype = $ns->getType ();
				$val = $ns->field_chap_display_order->getValue ();
				$res_nodes [] = array (
						'id' => $ns->id (),
						'val' => $val
				);
			endforeach
			;
    endif;

		return $res_nodes;
	}

	/**
	 * *
	 * Add New child and update id to its parent.
	 * $pid = Parent id
	 */
	public function addChildElem($pid, $chlds, $ftype, $ftitle, $pch_fld) {
		$da = array (
				'type' => $ftype,
				'title' => $ftitle
		);
		$uid = \Drupal::currentUser ()->id ();
		$node = Node::create ( $da );
		$node->set ( 'uid', [ 
				[ 
						'target_id' => $uid
				]
		] );
		$node->save ();

		if ($node > 0) :
			$fid = $node->id ();
			$new_chld = '';
			if ($pid > 0) :
				$pn = Node::load ( $pid );
				if (! empty ( $chlds )) :
					if ($ftype == 'feedback') {
						$ac_id = '';
						foreach ( $chlds as $chld ) {
							$child = Node::load ( $chld );
							if ($child->getType () == 'associate_content' || $child->getType () == 'feedback') {
								$ac_id = $child->id ();
							}
						}
						if ($ac_id) {
							$ac_key = array_search ( $ac_id, $chlds );
							unset ( $chlds [$ac_key] );
							$input_val = array (
									$fid,
									$ac_id
							);
						} else {
							$input_val = array (
									$fid
							);
						}
						$new_chld = array_merge ( $chlds, $input_val );
					} else {
						$input_val = array (
								$fid
						);
						$new_chld = array_merge ( $chlds, $input_val );
						// $new_chld = $this->arrayMnp($chlds,$fid);
					}
				else :
					$new_chld = array (
							"target_id" => $fid
					);
				endif;
				$pn->set ( $pch_fld, $new_chld );
				$pn->setRevisionUserId ( $uid );
				$pn->save ();
      endif;
    endif;


	}

	/**
	 * *
	 * Unpublish parent and its children nodes.
	 *
	 * Retruns a array of children for nodes (course)
	 */
	public function getElemDeleteChildren($nid, $field) {
		$n = Node::load ( $nid );
		$crs_children = $n->$field->getValue ();
		$ptype = $n->getType ();

		$media_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course_element', $nid )->execute ();

		if ($media_ids) {
			$medias = Node::loadMultiple ( $media_ids );

			foreach ( $medias as $media ) {
				$media->delete ();
			}
		}

		if ($ptype != 'simple_content') :
			if (! empty ( $crs_children )) :
				foreach ( $crs_children as $cc ) :
					$cn = Node::load ( $cc ['target_id'] );
					if (! empty ( $cn )) :
						$nids [] = array (
								'id' => $cn->id ()
						);
						$ctype = $cn->getType ();
						if ($ctype != 'simple_content') :
							$cfield = $this->getNodeRelFieldName ( $ctype );
							$nids [] = $this->getElemDeleteChildren ( $cc ['target_id'], $cfield );
            endif;

						$cn->delete ();
          endif;

				endforeach
				;
      endif;
    endif;


		return $nids;
	}

	/**
	 * *
	 * Get clone node and its children
	 *
	 * Retruns a array of children for nodes (course)
	 */
	public function cloneElemChildren($nid) {
		$n = Node::load ( $nid );
		$last_pnode_id = $n->id ();
		// get children
		$type = $n->getType ();
		$field = $this->getNodeRelFieldName ( $type );
		$crs_children = $n->$field->getValue ();
		$chIds = [ ];
		// clone all children
		if (! empty ( $crs_children )) :
			foreach ( $crs_children as $cc ) :
				$cn = Node::load ( $cc ['target_id'] );
				if (! empty ( $cn )) :
					$ctype = $cn->getType ();
					/**
					 * * Clone a Child Node
					 */
					$c_clone_node = $cn->createDuplicate ();
					if ($ctype == 'screen') :
						$c_clone_node->set ( 'field_scr_connections', 'repeat' );
					 elseif ($ctype == 'page') :
						$c_clone_node->set ( 'field_page_connections', 'repeat' );
					endif;
					$c_clone_node->save ();
					$last_cnode_id = $c_clone_node->id ();

					// get Course medias
					$cm_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course_element', $cc ['target_id'] )->execute ();

					// Add elements to course medias
					if (! empty ( $cm_ids )) {
						$course_medias = Node::loadMultiple ( $cm_ids );
						$file_system = \Drupal::service ( 'file_system' );
						foreach ( $course_medias as $cm ) {
							$cm_type = $cm->get ( 'field_cm_type' )->getString ();
							/*
							 * if(strpos($cm_type,'image') !== false){
							 * $cm_elements = $cm->get('field_cm_course_element')->getValue();
							 * $elem_arr = array_column($cm_elements,'target_id');
							 * if(!empty($elem_arr)){
							 * $elem_arr[] = $last_cnode_id;
							 * $cm->set('field_cm_course_element',$elem_arr);
							 * $cm->save();
							 * }
							 * }
							 */

							$dup_cm = $cm->createDuplicate ();
							$dup_file_path = $dup_cm->get ( 'field_cm_file_path' )->getString ();
							$file_name = end ( explode ( '/', $dup_file_path ) );
							$oldUniqueId = current ( explode ( '_', $file_name ) );
							$newUniqueId = uniqid ();
							$dest_src = str_replace ( $oldUniqueId, $newUniqueId, $dup_file_path );
							$full_path = $file_system->realpath ( $dup_file_path );
							$dest_path = $file_system->realpath ( $dest_src );
							if (strpos ( $cm_type, 'zip' ) !== false) {
								$file_save = $this->recurseCopy ( $full_path, $dest_path );
							} elseif (strpos ( $cm_type, 'video' ) !== false || strpos ( $cm_type, 'audio' ) !== false || strpos ( $cm_type, 'octet' ) !== false || strpos ( $cm_type, 'stream' ) !== false) {
								$dup_cm->save ();
								$wav_json_path = $dup_cm->get ( 'field_cm_wav_json_path' )->getString ();
								if ($wav_json_path) {
									$dest_json_path = str_replace ( $cm->id (), $dup_cm->id (), $wav_json_path );
									$src_json_path = $file_system->realpath ( $wav_json_path );
									$dest_json_realpath = $file_system->realpath ( $dest_json_path );
									$file_copy = $file_system->copy ( $src_json_path, $dest_json_realpath, FileSystemInterface::EXISTS_RENAME );
									$dup_cm->set ( 'field_cm_wav_json_path', $dest_json_path );
								}
								$mp3_path = $dup_cm->get ( 'field_cm_audio_path' )->getString ();
								if ($mp3_path) {
									$dest_mp3_path = str_replace ( $cm->id (), $dup_cm->id (), $mp3_path );
									$src_mp3_path = $file_system->realpath ( $mp3_path );
									$dest_mp3_realpath = $file_system->realpath ( $dest_mp3_path );
									$file_copy = $file_system->copy ( $src_mp3_path, $dest_mp3_realpath, FileSystemInterface::EXISTS_RENAME );
									$dup_cm->set ( 'field_cm_audio_path', $dest_mp3_path );
								}
								$file_save = $file_system->copy ( $full_path, $dest_path, FileSystemInterface::EXISTS_RENAME );
							} else {
								$file_save = $file_system->copy ( $full_path, $dest_path, FileSystemInterface::EXISTS_RENAME );
							}

							if (strpos ( $cm->getTitle (), $cc ['target_id'] ) !== false) {
								$old_title = $cm->getTitle ();
								$new_title = str_replace ( $cc ['target_id'], $last_cnode_id, $old_title );
								$dup_cm->setTitle ( $new_title );
								$dup_cm->set ( 'field_cm_subtitle', $new_title );
							}

							$dup_cm->set ( 'field_cm_file_path', $dest_src );
							$dup_cm->set ( 'field_cm_course_element', $c_clone_node->id () );
							$dup_cm->save ();

							// Update Templates HTML & Media Params
							$mdata = [ ];
							$mdata = [ 
									'cm_id' => $cm->id (),
									'cloned_id' => $dup_cm->id (),
									'old_path' => $oldUniqueId,
									'new_path' => $newUniqueId
							];
							$this->updateTempHtml ( $last_cnode_id, $mdata );
						}
					}

					$chIds [$cn->id ()] = $last_cnode_id;

					$ch_ids [] = array (
							'target_id' => $last_cnode_id
					);
					if ($ctype != 'simple_content') :
						$cfield = $this->getNodeRelFieldName ( $ctype );
						$arr = [ ];
						$arr = $this->cloneElemChildren ( $last_cnode_id );
						foreach ( $arr as $key => $val ) {
							$chIds [$key] = $val;
						}
            
          endif;
        endif;


			endforeach
			;
			if (! empty ( $ch_ids )) :
				// update relationship to parent
				$upd = Node::load ( $last_pnode_id );
				$upd->set ( $field, $ch_ids );
				$upd->save ();
      endif;
    endif;


		return $chIds;
	}

	/**
	 * Get Tree by Content Type
	 * Starting - Screen Page
	 * Annexes - Annexes folder | Page | Screen
	 * structure - Chapter | Page | Screen | Question | Custom | Feedback
	 * Chapter - Chapter | Page | Screen | Question | Custom | Feedback
	 * Page - Partpage | Feedback
	 * Question - Simple Page | Simple Content
	 * Screen - Simple Page | Simple Content
	 */
	public function getCourseChildrenByChildren($param) {
		$nodes = Node::loadMultiple ( $param );
		$result = array ();
		foreach ( $nodes as $n ) {
			$type = $n->getType ();
			$chld = '';
			$chld_elem = [ ];

			$field = $this->getFieldNameByKey ( $type, 'template type' );
			if ($field) {
				$template_type = $n->get ( $field )->getString ();
			}

			$field_name = $this->getNodeRelFieldName ( $type );
			if ($field_name != '') :
				$chld = $n->get ( $field_name )->getValue ();
        endif;

			if ($type == 'chapter') :
				$in_chld = $n->get ( 'field_chap_chapter' )->getValue ();
				if (! empty ( $in_chld )) :
					$in_chld_str = $this->getTargetIds ( $in_chld );
					$chld_elem = $this->getCourseChildrenByChildren ( $in_chld_str );
          endif;
        endif;


			if (! empty ( $chld )) :
				$chld_str = $this->getTargetIds ( $chld );
				$chld_elem = $this->getCourseChildrenByChildren ( $chld_str );
        endif;

			if ($type == 'screen') :
				$temp_id = $n->get ( 'field_scr_template' )->getString ();
				if (! empty ( $temp_id )) {
					$template = $this->getTemplateInfo ( $temp_id );
				}

				// $linkedIds = $n->get('field_scr_linked_elements')->getValue();
				// $linkedIds = array_column($linkedIds, 'target_id');

				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'template_type' => $template_type,
						'name' => $n->title->value,
						'summary' => $n->get ( 'field_scr_summary' )->getString (),
						'connections' => $n->get ( 'field_scr_connections' )->getValue (),
						'children' => $chld_elem,
						// 'linkedIds' => $linkedIds,
						'template' => ! empty ( $template ) ? $template : '',
						'htmlParam' => $n->get ( 'field_scr_html_params' )->getString ()
				);
			 elseif ($type == 'page') :
				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'template_type' => $template_type,
						'name' => $n->title->value,
						'isevaluation' => $n->get ( 'field_page_isevaluation' )->value,
						'hasfeedback' => $n->get ( 'field_page_hasfeedback' )->value,
						'hasassociatecontent' => $n->get ( 'field_page_hasassociatecontent' )->value,
						'summary' => $n->get ( 'field_page_summary' )->getString (),
						'connections' => $n->get ( 'field_page_connections' )->getValue (),
						'props_param' => $n->get ( 'field_page_prop_params' )->value,
						'children' => $chld_elem
				);
			 elseif ($type == 'partpage') :
				$temp_id = $n->get ( 'field_pp_template' )->getString ();

				if (! empty ( $temp_id )) {
					$template = $this->getTemplateInfo ( $temp_id );
				}

				// $linkedIds = $n->get('field_pp_linked_elements')->getValue();
				// $linkedIds = array_column($linkedIds, 'target_id');

				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'template_type' => $template_type,
						'name' => $n->title->value,
						'summary' => $n->get ( 'field_pp_summary' )->getString (),
						'connections' => $n->get ( 'field_pp_connections' )->getValue (),
						'children' => $chld_elem,
						// 'linkedids' => $linkedIds,
						'template' => ! empty ( $template ) ? $template : '',
						'htmlParam' => $n->get ( 'field_pp_html_params' )->getString ()
				);
			 elseif ($type == 'simple_partpage') :
				$temp_id = $n->get ( 'field_spp_template' )->getString ();
				if (! empty ( $temp_id )) {
					$template = $this->getTemplateInfo ( $temp_id );
				}

				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'template_type' => $template_type,
						'name' => $n->title->value,
						'summary' => $n->get ( 'field_spp_summary' )->getString (),
						'connections' => $n->get ( 'field_spp_connections' )->getValue (),
						'children' => $chld_elem,
						// 'linkedids' => $linkedIds,
						'template' => ! empty ( $template ) ? $template : '',
						'htmlParam' => $n->get ( 'field_spp_html_params' )->getString ()
				);

			elseif ($type == 'chapter') :
				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'name' => $n->title->value,
						'isevaluation' => $n->get ( 'field_chap_isevaluation' )->value,
						'hasfeedback' => $n->get ( 'field_chap_hasfeedback' )->value,
						'hasassociatecontent' => $n->get ( 'field_chap_hasassociatecontent' )->value,
						'styleSummary' => $n->get ( 'field_style_summary' )->value,
						'direct_evaluation' => $n->get ( 'field_direct_evaluation' )->value,
						'theme_ref' => $n->get ( 'field_chap_theme_ref' )->value,
						'props_param' => $n->get ( 'field_chap_prop_params' )->value,
						// 'eval_param' => $n->get('field_chap_eval_param')->value,
						'children' => $chld_elem
				);
			 elseif ($type == 'custom') :
				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'name' => $n->title->value,
						'hasassociatecontent' => $n->get ( 'field_custom_hasassociatecontent' )->value,
						'props_param' => $n->get ( 'field_custom_prop_params' )->value,
						'isevaluation' => $n->get ( 'field_custom_isevaluation' )->value,
						'children' => $chld_elem
				);
			 elseif ($type == 'question') :
				$temp_id = $n->get ( 'field_ques_template' )->getString ();
				if (! empty ( $temp_id )) {
					$template = $this->getTemplateInfo ( $temp_id );
				}

				// $linkedIds = $n->get('field_ques_linked_elements')->getValue();
				// $linkedIds = array_column($linkedIds, 'target_id');

				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'template_type' => $template_type,
						'name' => $n->title->value,
						'children' => $chld_elem,
						// 'linkedids' => $linkedIds,
						'template' => ! empty ( $template ) ? $template : '',
						'htmlParam' => $n->get ( 'field_ques_html_params' )->getString ()
				);
			 elseif ($type == 'simple_content') :
				$temp_id = $n->get ( 'field_sc_template' )->getString ();
				if (! empty ( $temp_id )) {
					$template = $this->getTemplateInfo ( $temp_id );
				}

				// $linkedIds = $n->get('field_sc_linked_elements')->getValue();
				// $linkedIds = array_column($linkedIds, 'target_id');

				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'template_type' => $template_type,
						'name' => $n->title->value,
						'children' => $chld_elem,
						'summary' => $n->get ( 'field_sc_summary' )->value,
						// 'linkedids' => $linkedIds,
						'template' => ! empty ( $template ) ? $template : '',
						'htmlParam' => $n->get ( 'field_sc_html_params' )->getString ()
				);
			 elseif ($type == 'simple_page') :
				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'template_type' => $template_type,
						'name' => $n->title->value,
						'summary' => $n->get ( 'field_sp_summary' )->value,
						'children' => $chld_elem
				);
			else :
				$result [] = array (
						'id' => $n->id (),
						'type' => $n->getType (),
						'name' => $n->title->value,
						'children' => $chld_elem
				);
			endif;
		}
		return $result;
	}
	public function getTemplateInfo($nid, $variant_id = null) {
		$n = Node::load ( $nid );
		$interaction = '';
		$framework_min = '';
		$framework_max = '';
		$course_context = '';
		$temp_info = [ ];
		if ($n) {
			if ($n->getType () == 'template') {
				$interaction = $n->get ( 'field_t_interaction' )->getString ();
				$framework_min = $n->get ( 'field_t_framework_min' )->getString();
				$framework_max = $n->get ( 'field_t_framework_max' )->getString();
				$theme = $n->get ( 'field_t_theme' )->getString ();			
				$course_context = $n->get ( 'field_t_course_context' )->getString ();
  			
				$temp_info = [ 
						'id' => $variant_id ?? $nid,
						'interaction' => $interaction,
						'theme' => $theme ? ucfirst ( $theme ) : '',
						'framework_min' => $framework_min,
						'framework_max' => $framework_max,
						'course_context' => !empty($course_context) ? $course_context : 'null'
				];
			} elseif ($n->getType () == 'templatevariant') {
				$temp_id = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'template' )->condition ( 'field_t_variants', $nid, 'IN' )->execute ();

				if (! empty ( $temp_id )) {
					$temp_id = implode ( '', $temp_id );

					$temp_info = $this->getTemplateInfo ( $temp_id, $nid );
				}
			}
		}

		return $temp_info;
	}

	/**
	 * Get Domain Tree of platform components
	 */
	public function getDomainTreeChildrenByChildren($parent_id, $param, $root, $cf) {
		global $base_url;
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_domain' );

		$domain = $parent_id;
		$nodes = Node::loadMultiple ( $param );
		$result = [ ];
		$dcr = 0;
		$link = '';

		foreach ( $nodes as $n ) {
			$type = $n->getType ();
			$nid = $n->id ();
			$chld = '';
			$chld_elem = [ ];
			$status = false;
			$curnode = false;
			if ($type == 'content_folder') :

				$s_dmn = $tempstore->get ( 's_domain' );
				$chld = $n->get ( 'field_cf_content_folder' )->getValue ();
				$link = $base_url . '/platform/domainview/' . $domain . '/' . $s_dmn . '/' . $nid;

				if ($cf == $nid) :
					$status = true;
					$curnode = true;
					$p_ids = $this->getParentCFByChild ( $nid, 'field_cf_content_folder' );
					$tempstore->set ( 'parent_ids', $p_ids );
				 elseif ($s_dmn == $nid) :
					$status = true;
				endif;

			else :
				if ($type == 'domain_content_root') {
					$tempstore->set ( 's_domain', $nid );
					$link = $base_url . '/platform/domainview/' . $domain . '/' . $nid . '/0';
					$field_name = $this->getNodeRelFieldName ( $type );
					if ($field_name != '') :
						$chld = $n->get ( $field_name )->getValue ();
	          endif;

					if ($cf == 0) :
						if ($root == $nid) :
							$curnode = true;
	            endif;
	          endif;


					if ($root == $nid) :
						$status = true;
	          endif;

					$tempstore->set ( 'parent_ids', '' );
				}
			endif;

			if (! empty ( $chld )) :
				$chld_str = $this->getTargetIds ( $chld );

				$chld_nodes = Node::loadMultiple ( $chld_str );
				$chld_arr = [ ];
				foreach ( $chld_nodes as $key => $chld_node ) {
					$chld_type = $chld_node->getType ();
					if ($chld_type != 'course') {
						$chld_arr [] = $chld_node->id ();
					}
				}
				$chld_elem = $this->getDomainTreeChildrenByChildren ( $domain, $chld_arr, $root, $cf );
        endif;

			$result [] = array (
					'id' => $nid,
					'title' => $n->title->value,
					'type' => $n->getType (),
					'link' => $link,
					'children' => $chld_elem,
					'curnode' => $curnode,
					'status' => $status
			);
		}

		return $result;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get Domian Content Roots & Content Types by Domain
	 */
	public function getCFbyDomain($domainId, $root = null, $cf = null) {
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_domain' );
		$qn = Node::load ( $domainId );
		$crs_children = $qn->get ( 'field_domain_children' )->getValue ();
		// get children
		$chlds = $this->getTargetIds ( $crs_children );
		$nodes = Node::loadMultiple ( $chlds );
		$children = [ ];

		foreach ( $nodes as $node ) {
			if ($node->bundle () == 'domain_content_root') {
				$children [] = $node->id ();
			}
		}

		$result = $this->getDomainTreeChildrenByChildren ( $domainId, $children, $root, $cf );

		$p_ids = $tempstore->get ( 'parent_ids' );
		$result ['parent_ids'] = $p_ids;

		return $result;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get domain root folders
	 */
	public function getContentbyDomain($domainId, $root, $cf) {
		$flag_id = 'bookmark';
		$flag = \Drupal::service ( 'flag' )->getFlagById ( 'bookmark' );
		$flag_link_service = \Drupal::service ( 'flag.link_builder' );

		$result = [ ];
		$course_arr = [ ];
		/*
		 * if($root > 0):
		 * if($cf > 0):
		 * $qn = Node::load($cf);
		 *
		 * //sub content folders
		 * $cf_chld = $qn->get('field_cf_content_folder')->getValue();
		 * $cf_chlds = $this->getTargetIds($cf_chld);
		 *
		 * //courses
		 * $crs_chld = $qn->get('field_cf_children')->getValue();
		 * $crs_chlds = $this->getTargetIds($crs_chld);
		 *
		 * $chlds = array_merge($cf_chlds,$crs_chlds);
		 * else:
		 * $qn = Node::load($root);
		 * $chld = $qn->get('field_dcr_children')->getValue();
		 * $chlds = $this->getTargetIds($chld);
		 * endif;
		 * else:
		 * $qn = Node::load($domainId);
		 * $chld = $qn->get('field_domain_children')->getValue();
		 * $chlds = $this->getTargetIds($chld);
		 * endif;
		 */

		if ($root > 0) {
			if ($cf > 0) {
				$qn = Node::load ( $cf );

				// sub content folders
				$cf_chld = $qn->get ( 'field_cf_content_folder' )->getValue ();
				$cf_chlds = $this->getTargetIds ( $cf_chld );

				// courses
				$crs_chld = $qn->get ( 'field_cf_children' )->getValue ();
				$crs_chlds = $this->getTargetIds ( $crs_chld );

				$chlds = array_merge ( $cf_chlds, $crs_chlds );
			} else {
				$qn = Node::load ( $root );
				$chld = $qn->get ( 'field_dcr_children' )->getValue ();
				$chlds = $this->getTargetIds ( $chld );
			}
		} else {
			$qn = Node::load ( $domainId );
			$chld = $qn->get ( 'field_domain_children' )->getValue ();
			$chlds = $this->getTargetIds ( $chld );
		}

		$nodes = Node::loadMultiple ( $chlds );
		foreach ( $nodes as $n ) {
			$type = $n->getType ();

			if ($type == 'course') {
				$flag_link = $flag_link_service->build ( $n->getEntityTypeId (), $n->id (), $flag_id );
				$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $n->id () )->execute ();

				$duplicateincompleteValues = $n->get ( 'field_duplicateincomplete' )->getValue ();

				$style_id = implode ( '', $style_ids );
				$style = Node::load ( $style_id );
				$displayValue = 'desktop';
				if ($style) {
					$fid = $style->get ( 'field_s_style_file' )->getValue ();
					if ($fid) {
						$file = File::load ( $fid [0] ['target_id'] );
						$uri = $file->get ( 'uri' )->getString ();
					}
					$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
					$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
					if (! empty ( $blmconfig_data )) {
						$blmconfig = json_decode ( $blmconfig_data, true );
						$displayValue = $blmconfig ['display'];
					}
				}

				$lang = $n->get ( 'field_crs_lang' )->value;
				$flag_url = $this->getCountryFlagsByLang ( $lang );

				$result [] = array (
						'id' => $n->id (),
						'type' => $type,
						'title' => $n->title->value,
						'display' => $displayValue,
						'language' => $lang,
						'flag_url' => $flag_url,
						'style_id' => $style_id,
						'style_name' => $style->getTitle (),
						'framework' => $style->get ( 'field_s_framework' )->value,
						'desc' => $n->get ( 'field_crs_short_desc' )->value,
						'date' => date ( 'd-m-Y', $n->getCreatedTime () ),
						'time' => date ( 'H:i', $n->getCreatedTime () ),
						'changed' => $n->getChangedTime (),
						'flag_link' => $flag_link,
						'duplicateincompleteValues' =>$duplicateincompleteValues,
				);
			} else {
				if ($type == 'domain_content_root') {
					$dcr_chlds = $n->get ( 'field_dcr_children' )->getValue ();
					$dcr_chlds = $this->getTargetIds ( $dcr_chlds );
					$cf_nodes = Node::loadMultiple ( $dcr_chlds );

					foreach ( $cf_nodes as $cf_node ) {
						if ($cf_node->getType () == 'course') {
							$flag_link = $flag_link_service->build ( $cf_node->getEntityTypeId (), $cf_node->id (), $flag_id );
							$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $cf_node->id () )->execute ();
							//$duplicateincompleteValues = $cf_node->get ( 'field_duplicateincomplete' )->getValue ();
							$style_id = implode ( '', $style_ids );
							$style = Node::load ( $style_id );
							$displayValue = 'desktop';
							if ($style) {
								$fid = $style->get ( 'field_s_style_file' )->getValue ();
								if ($fid) {
									$file = File::load ( $fid [0] ['target_id'] );
									$uri = $file->get ( 'uri' )->getString ();
								}
								$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
								$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
								if (! empty ( $blmconfig_data )) {
									$blmconfig = json_decode ( $blmconfig_data, true );
									$displayValue = $blmconfig ['display'];
								}
							}
						}
						if ($cf_node->getType () == 'content_folder') {
							$result [] = array (
									'id' => $cf_node->id (),
									'type' => $cf_node->getType (),
									'title' => $cf_node->title->value,
									'display' => $displayValue,
									'desc' => '',
									'date' => date ( 'd-m-Y', $cf_node->getCreatedTime () ),
									'time' => date ( 'H:i', $cf_node->getCreatedTime () ),
									'changed' => $cf_node->getChangedTime (),
									'flag_link' => $flag_link ? $flag_link : '',
									'duplicateincompleteValues' =>$duplicateincompleteValues,
							);
						} else {
							
							$duplicateincompleteValues = $cf_node->get ( 'field_duplicateincomplete' )->getValue ();
							$lang = $cf_node->get ( 'field_crs_lang' )->value;
							$flag_url = $this->getCountryFlagsByLang ( $lang );

							$course_arr [] = array (
									'id' => $cf_node->id (),
									'type' => $cf_node->getType (),
									'title' => $cf_node->title->value,
									'display' => $displayValue,
									'language' => $lang,
									'flag_url' => $flag_url,
									'style_id' => $style_id,
									'style_name' => $style->getTitle (),
									'framework' => $style->get ( 'field_s_framework' )->value,
									'desc' => '',
									'date' => date ( 'd-m-Y', $cf_node->getCreatedTime () ),
									'time' => date ( 'H:i', $cf_node->getCreatedTime () ),
									'changed' => $cf_node->getChangedTime (),
									'flag_link' => $flag_link ? $flag_link : '',
									'duplicateincompleteValues' =>$duplicateincompleteValues,
							);
						}
					}
					$result = array_merge ( $result, $course_arr );
				} elseif ($type == 'content_folder') {
					//$duplicateincompleteValues = $n->get ( 'field_duplicateincomplete' )->getValue ();
					$result [] = array (
							'id' => $n->id (),
							'type' => $type,
							'title' => $n->title->value,
							'desc' => '',
							'date' => date ( 'd-m-Y', $n->getCreatedTime () ),
							'time' => date ( 'H:i', $n->getCreatedTime () ),
							'changed' => $n->getChangedTime (),
							'flag_link' => '',
						//	'duplicateincompleteValues' =>$duplicateincompleteValues,
					);
				}
			}
		}

		return $result;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get domain view details
	 */
	public function getDomainViewInfo($domainId, $root, $cf) {
		$qn = Node::load ( $domainId );
		$result ['domain'] = $qn->title->value;
		if ($root > 0) :
			if ($cf > 0) :
				$array = array (
						$domainId,
						$root,
						$cf
				);
				$nodes = Node::loadMultiple ( $array );
			else :
				$array = array (
						$domainId,
						$root
				);
				$nodes = Node::loadMultiple ( $array );
			endif;

			foreach ( $nodes as $n ) :
				$type = $n->getType ();
				$result ['breadcrumb'] [] = array (
						'id' => $n->id (),
						'type' => $type,
						'title' => $n->title->value
				);
			endforeach
			;
		else :
			$result ['breadcrumb'] [] = array (
					'id' => $qn->id (),
					'type' => $qn->getType (),
					'title' => $qn->title->value
			);
		endif;

		$arr_brd = end ( $result ['breadcrumb'] );
		$result ['page_title'] = $arr_brd ['title'];
		$result ['page_id'] = $arr_brd ['id'];
		$result ['page_type'] = $arr_brd ['type'];
		return $result;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get Domians
	 */
	public function getDomains() {
		$user = \Drupal\user\Entity\User::load ( \Drupal::currentUser ()->id () );
		$uid = $user->get ( 'uid' )->value;
		$roles = $user->getRoles ();
		$nids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->execute ();

		if (! $nids && in_array ( 'supervisor', $roles )) {
			$parentId = $user->get ( 'field_parent' )->getString ();
			if (! $parentId) {
				$parentId = 4;
			}
			$nids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->condition ( 'uid', $parentId )->execute ();
		} elseif (in_array ( 'domain_admin', $roles )) {
			$customer = $user->get ( 'field_customer' )->getString ();
			$nids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->condition ( 'title', $customer )->execute ();
		}
		$nodes = Node::loadMultiple ( $nids );

		$hasChildren = false;
		foreach ( $nodes as $n ) {
			$children = $n->get ( 'field_domain_children' )->getValue ();
			$arr = array_column ( $children, 'target_id' );
			$dcr_children = '';

			foreach ( $arr as $id ) {
				$child = Node::load ( $id );
				if ($child && $child->getType () == 'domain_content_root') {
					$dcrChildren = $child->get ( 'field_dcr_children' )->getString ();
					foreach ( $dcrChildren as $dcr_child ) {
						$dcr = Node::load ( $dcr_child );
						if ($dcr) {
							$dcr_children = $dcr;
						}
					}
				}
			}

			if ($dcr_children) {
				$hasChildren = true;
			}

			$result [] = array (
					'id' => $n->id (),
					'name' => $n->getTitle (),
					'has_children' => $hasChildren
			);
		}
		return $result;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get domain name
	 */
	public function getDomainName($nid) {
		$domain_name = 'NA';
		$cfs = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'content_folder' )->condition ( 'field_cf_children', $nid )->range ( 0, 1 )->execute ();
		$cf_id = current ( $cfs );

		if (! empty ( $cf_id )) {
			$dcr = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_content_root' )->condition ( 'field_dcr_children', $cf_id )->range ( 0, 1 )->execute ();
			$dcr_id = current ( $dcr );
		} else {
			$dcr = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_content_root' )->condition ( 'field_dcr_children', $nid )->range ( 0, 1 )->execute ();
			$dcr_id = current ( $dcr );
		}
		if (! empty ( $dcr_id )) {
			$domain = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->condition ( 'field_domain_children', $dcr_id )->execute ();
			$dm_id = current ( $domain );
		}
		if (! empty ( $dm_id )) {
			$n = Node::load ( $dm_id );
			$domain_name = $n->getTitle ();
		}
		return $domain_name;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get Latest Courses
	 */
	public function getLatestCourses() {
		$user = \Drupal\user\Entity\User::load ( \Drupal::currentUser ()->id () );
		$uid = $user->get ( 'uid' )->value;
		$roles = $user->getRoles ();
		/*
		 * $parentId = $user->get('field_parent')->getString();
		 * $childIds = \Drupal::entityQuery('user')
		 * ->condition('field_parent',$uid)
		 * ->execute();
		 * if($childIds && $parentId) {
		 * $uidsArr = array_merge($childIds,[$uid,$parentId]);
		 * }
		 * elseif (!$parentId) {
		 * $uidsArr = array_merge($childIds,[$uid]);
		 * }
		 * elseif(!$childIds) {
		 * $uidsArr = [$uid,$parentId];
		 * }
		 * else {
		 * $uidsArr = [$uid];
		 * }
		 * $uids = array_unique($uidsArr);
		 */

		/*
		 * $query = \Drupal::entityQuery('node')
		 * ->condition('type','course');
		 * $group = $query->orConditionGroup()
		 * ->condition('uid', $uid)
		 * ->condition('field_changedby', $uid);
		 * $nids = $query->condition($group)
		 * ->sort('uid.changed', 'DESC')
		 * ->sort('created', 'DESC')
		 * ->range(0,4)
		 * ->execute();
		 */
		$courseValues = $user->get ( 'field_crs' )->getValue ();
		$coursesIds = array_column ( $courseValues, 'target_id' );
		$flag_id = 'bookmark';
		$flag = \Drupal::service ( 'flag' )->getFlagById ( 'bookmark' );
		$flag_link_service = \Drupal::service ( 'flag.link_builder' );
		$result = [ ];

		if (! empty ( $coursesIds )) {
			$courses = Node::loadMultiple ( $coursesIds );
			$crs_props = [ ];
			foreach ( $courses as $crs ) {
				$duplicateincompleteValues = $crs->get ( 'field_duplicateincomplete' )->getValue ();
				// $domain_name = $this->getDomainName($crs->id());
				$crs_props [] = $this->getPropertiesByCourse ( $crs );
				$ids = $this->getDomainFromCourse ( $crs->id (), $crs->getType () );
				$domainId = $ids ['ids'] ['d_id'];
				$dcr_id = $ids ['ids'] ['dcr_id'];
				$domain_chld = 0;

				if ($ids ['ids'] ['cf_children']) {
					$domain_chld = $ids ['ids'] ['cf_children'];
				} elseif ($ids ['ids'] ['cf_content_folder']) {
					$domain_chld = $ids ['ids'] ['cf_content_folder'];
				}

				if ($domainId) {
					$domain = Node::load ( $domainId );

					$domain_name = $domain->getTitle ();
					if (in_array ( 'domain_admin', $roles )) {
						$customer = $user->get ( 'field_customer' )->getString ();
						if ($customer != $domain_name) {
							continue;
						}
					}
					$flag_link = $flag_link_service->build ( $crs->getEntityTypeId (), $crs->id (), $flag_id );
					if ($domain_chld == 0) {
						$domainview_url = $domainId . '/0/0';
					} else {
						$domainview_url = $domainId . '/' . $dcr_id . '/' . $domain_chld;
					}

					$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $crs->id () )->execute ();

					$style_id = implode ( '', $style_ids );
					$style = Node::load ( $style_id );
					$displayValue = 'desktop';
					if ($style) {
						$fid = $style->get ( 'field_s_style_file' )->getValue ();
						if ($fid) {
							$file = File::load ( $fid [0] ['target_id'] );
							$uri = $file->get ( 'uri' )->getString ();
						}
						$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
						$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
						if (! empty ( $blmconfig_data )) {
							$blmconfig = json_decode ( $blmconfig_data, true );
							$displayValue = $blmconfig ['display'];
						}
					}

					$lang = $crs->get ( 'field_crs_lang' )->value;
					$flag_url = $this->getCountryFlagsByLang ( $lang );

					$result [] = array (
							'id' => $crs->id (),
							'domain' => $domain_name,
							'domainview_url' => $domainview_url,
							'display' => $displayValue,
							'flag_url' => $flag_url,
							'name' => $crs->getTitle (),
							'date' => date ( 'd-m-Y', $crs->getChangedTime () ),
							'time' => date ( 'H:i', $crs->getChangedTime () ),
							'flag_link' => $flag_link,
							'duplicateincompleteValues'=> $duplicateincompleteValues  //getLatestCourses
					);
				}
			}
			$result ['crs_props'] = $crs_props;
		}

		return $result;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get Favourite Courses
	 */
	public function getFavCourses() {
		$user = \Drupal\user\Entity\User::load ( \Drupal::currentUser ()->id () );
		$uid = $user->get ( 'uid' )->value;
		$roles = $user->getRoles ();
		$flag = \Drupal::service ( 'flag' )->getFlagById ( 'flag_id' );
		$fuser = \Drupal::currentUser ();
		$session_id = \Drupal::service ( 'session_manager' )->getId ();

		// Use a query.
		$query = \Drupal::database ()->select ( 'flagging', 'f' )->fields ( 'f', array () )->condition ( 'uid', $fuser->id () )->range ( 0, 4 );

		if ($fuser->isAnonymous ()) {
			$query->condition ( 'session_id', $session_id );
		}

		$fresult = $query->execute ()->fetchAll ();

		$flag_result = array ();
		if (! empty ( $fresult )) :
			foreach ( $fresult as $fr ) :
				$flag_result [] = $fr->entity_id;
			endforeach
			;
      endif;

		$flag_id = 'bookmark';
		$flag = \Drupal::service ( 'flag' )->getFlagById ( 'bookmark' );
		$flag_link_service = \Drupal::service ( 'flag.link_builder' );
		$result = [ ];
		$crs_props = [ ];
		if (! empty ( $flag_result )) {
			$nodes = Node::loadMultiple ( $flag_result );
			foreach ( $nodes as $n ) {
				$duplicateincompleteValues = $n->get ( 'field_duplicateincomplete' )->getValue ();
				$crs_props [] = $this->getPropertiesByCourse ( $n );
				$ids = $this->getDomainFromCourse ( $n->id (), 'course' );
				$domainId = $ids ['ids'] ['d_id'];
				$dcr_id = $ids ['ids'] ['dcr_id'];
				$domain_chld = 0;

				if ($ids ['ids'] ['cf_children']) {
					$domain_chld = $ids ['ids'] ['cf_children'];
				} elseif ($ids ['ids'] ['cf_content_folder']) {
					$domain_chld = $ids ['ids'] ['cf_content_folder'];
				}

				if ($domainId) {
					$domain = Node::load ( $domainId );
					$domain_name = $domain->getTitle ();
				}
				// $domain_name = $this->getDomainName($n->id());
				if (in_array ( 'domain_admin', $roles )) {
					$customer = $user->get ( 'field_customer' )->getString ();
					if ($customer != $domain_name) {
						continue;
					}
				}
				$nid = $n->id ();
				$flag_link = $flag_link_service->build ( $n->getEntityTypeId (), $n->id (), $flag_id );
				if ($domain_chld == 0) {
					$domainview_url = $domainId . '/0/0';
				} else {
					$domainview_url = $domainId . '/' . $dcr_id . '/' . $domain_chld;
				}

				$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $nid )->execute ();

				$style_id = implode ( '', $style_ids );
				$style = Node::load ( $style_id );
				$displayValue = 'desktop';
				if ($style) {
					$fid = $style->get ( 'field_s_style_file' )->getValue ();
					if ($fid) {
						$file = File::load ( $fid [0] ['target_id'] );
						$uri = $file->get ( 'uri' )->getString ();
					}
					$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
					$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
					if (! empty ( $blmconfig_data )) {
						$blmconfig = json_decode ( $blmconfig_data, true );
						$displayValue = $blmconfig ['display'];
					}
				}

				$lang = $n->get ( 'field_crs_lang' )->value;
				$flag_url = $this->getCountryFlagsByLang ( $lang );

				$result [] = array (
						'id' => $n->id (),
						'domain' => $domain_name,
						'domainview_url' => $domainview_url,
						'display' => $displayValue,
						'flag_url' => $flag_url,
						'name' => $n->getTitle (),
						'desc' => $n->get ( 'field_crs_short_desc' )->value,
						'date' => date ( 'd-m-Y', $n->getCreatedTime () ),
						'time' => date ( 'H:i', $n->getCreatedTime () ),
						'flag_link' => $flag_link,
						'duplicateincompleteValues' =>$duplicateincompleteValues  //getFavCourses
				);
			}
			$result ['crs_props'] = $crs_props;
		}
		return $result;
	}
	public function getSFbyDomain($domainId, $root = null, $sf = null) {
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_style' );
		$qn = Node::load ( $domainId );
		$style_children = $qn->get ( 'field_domain_children' )->getValue ();
		// get children
		$chlds = $this->getTargetIds ( $style_children );
		$nodes = Node::loadMultiple ( $chlds );
		$children = [ ];

		foreach ( $nodes as $node ) {
			if ($node->bundle () == 'domain_styles_root') {
				$children [] = $node->id ();
			}
		}

		$result = $this->getStyleTreeChildrenByChildren ( $domainId, $children, $root, $sf );
		$p_id = $tempstore->get ( 'parent_ids' );
		$result ['parent_ids'] = $p_id;
		return $result;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get domain style root folders
	 */
	public function getStylebyDomain($domainId, $root, $sf) {
		$flag_id = 'bookmark';
		$flag = \Drupal::service ( 'flag' )->getFlagById ( 'bookmark' );
		$flag_link_service = \Drupal::service ( 'flag.link_builder' );

		$result = [ ];
		$style_arr = [ ];
		if ($root > 0) {
			if ($sf > 0) {
				$qn = Node::load ( $sf );

				// sub content folders
				$sf_chld = $qn->get ( 'field_sf_style_folder' )->getValue ();
				$sf_chlds = $this->getTargetIds ( $sf_chld );

				// courses
				$stl_chld = $qn->get ( 'field_sf_children' )->getValue ();
				$stl_chlds = $this->getTargetIds ( $stl_chld );

				$chlds = array_merge ( $sf_chlds, $stl_chlds );
			} else {
				$qn = Node::load ( $root );
				$chld = $qn->get ( 'field_dsr_children' )->getValue ();
				$chlds = $this->getTargetIds ( $chld );
			}
		} else {
			$qn = Node::load ( $domainId );
			$chld = $qn->get ( 'field_domain_children' )->getValue ();
			$chlds = $this->getTargetIds ( $chld );
		}

		$nodes = Node::loadMultiple ( $chlds );
		foreach ( $nodes as $n ) {
			$type = $n->getType ();
			if ($type == 'course') {
				$flag_link = $flag_link_service->build ( $n->getEntityTypeId (), $n->id (), $flag_id );
				$result [] = array (
						'id' => $n->id (),
						'type' => $type,
						'title' => $n->title->value,
						'desc' => $n->get ( 'field_crs_short_desc' )->value,
						'date' => date ( 'd-m-Y', $n->getCreatedTime () ),
						'time' => date ( 'H:i', $n->getCreatedTime () ),
						'changed' => $n->getChangedTime (),
						'flag_link' => $flag_link
				);
			} else {
				if ($type == 'domain_styles_root') {
					$dsr_chld = $n->get ( 'field_dsr_children' )->getValue ();
					$dsr_chlds = $this->getTargetIds ( $dsr_chld );
					$sf_nodes = Node::loadMultiple ( $dsr_chlds );

					foreach ( $sf_nodes as $sf_node ) {

						if ($sf_node->getType () == 'style_folder') {
							$result [] = array (
									'id' => $sf_node->id (),
									'type' => $sf_node->getType (),
									'title' => $sf_node->title->value,
									'desc' => '',
									'date' => date ( 'd-m-Y', $sf_node->getCreatedTime () ),
									'time' => date ( 'H:i', $sf_node->getCreatedTime () ),
									'changed' => $sf_node->getChangedTime (),
									'flag_link' => ''
							);
						} elseif ($sf_node->getType () == 'style') {
							$style_arr [] = array (
									'id' => $sf_node->id (),
									'type' => $sf_node->getType (),
									'title' => $sf_node->title->value,
									'desc' => '',
									'date' => date ( 'd-m-Y', $sf_node->getCreatedTime () ),
									'time' => date ( 'H:i', $sf_node->getCreatedTime () ),
									'changed' => $sf_node->getChangedTime (),
									'flag_link' => ''
							);
						}
					}
					$result = array_merge ( $result, $style_arr );
				} elseif ($type == 'style_folder' || $type == 'style') {
					$result [] = array (
							'id' => $n->id (),
							'type' => $type,
							'title' => $n->title->value,
							'desc' => '',
							'date' => date ( 'd-m-Y', $n->getCreatedTime () ),
							'time' => date ( 'H:i', $n->getCreatedTime () ),
							'changed' => $n->getChangedTime (),
							'flag_link' => ''
					);
				}
			}
		}

		return $result;
	}

	/**
	 * Get Style Tree of platform components
	 */
	public function getStyleTreeChildrenByChildren($parent_id, $param, $root, $sf) {
		global $base_url;
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_style' );

		$domain = $parent_id;
		$nodes = Node::loadMultiple ( $param );
		$result = [ ];
		$dcr = 0;
		$link = '';

		foreach ( $nodes as $n ) {
			$type = $n->getType ();
			$nid = $n->id ();
			$chld = '';
			$chld_elem = [ ];
			$status = false;
			$curnode = false;

			if ($type == 'style_folder') {
				$s_stl = $tempstore->get ( 's_style' );
				$chld = $n->get ( 'field_sf_style_folder' )->getValue ();

				$link = $base_url . '/platform/styleview/' . $domain . '/' . $s_stl . '/' . $nid;

				if ($sf == $nid) {
					$status = true;
					$curnode = true;
					$p_ids = $this->getParentSFByChild ( $nid, 'field_sf_style_folder' );
					$tempstore->set ( 'parent_ids', $p_ids );
				} elseif ($s_stl == $nid) {
					$status = true;
				}
			} else {
				$tempstore->set ( 's_style', $nid );
				$link = $base_url . '/platform/styleview/' . $domain . '/' . $nid . '/0';
				$field_name = $this->getNodeRelFieldName ( $type );
				if ($field_name != '') {
					$chld = $n->get ( $field_name )->getValue ();
				}

				if ($sf == 0) {
					if ($root == $nid) {
						$curnode = true;
					}
				}
				if ($root == $nid) {
					$status = true;
				}
				$tempstore->set ( 'parent_ids', '' );
			}

			if (! empty ( $chld )) {
				$chld_str = $this->getTargetIds ( $chld );
				$chld_nodes = Node::loadMultiple ( $chld_str );
				$chld_arr = [ ];
				foreach ( $chld_nodes as $key => $chld_node ) {
					$chld_type = $chld_node->getType ();
					if ($chld_type != 'style') {
						$chld_arr [] = $chld_node->id ();
					}
				}
				$chld_elem = $this->getStyleTreeChildrenByChildren ( $domain, $chld_arr, $root, $sf );
			}

			$result [] = array (
					'id' => $nid,
					'type' => $type,
					'title' => $n->title->value,
					'children' => $chld_elem,
					'link' => $link,
					'curnode' => $curnode,
					'status' => $status
			);
		}

		return $result;
	}
	public function getParentSFByChild($nid, $field) {
		$p_id = \Drupal::entityQuery ( 'node' )->condition ( $field, $nid )->execute ();

		$parent_ids = [ ];

		if ($p_id) {
			$parents = Node::loadMultiple ( $p_id );
			foreach ( $parents as $parent ) {
				$type = $parent->getType ();
				$pid = $parent->id ();

				if ($type == 'style_folder') {
					$parent_id = $this->getParentSFByChild ( $pid, $field );
					if ($parent_id) {
						foreach ( $parent_id as $p ) {
							$parent_ids [] = $p;
						}
					}
					$parent_ids [] = $pid;
				}
			}
		}
		return $parent_ids;
	}
	public function getParentCFByChild($nid, $field) {
		$p_id = \Drupal::entityQuery ( 'node' )->condition ( $field, $nid )->execute ();

		$parent_ids = [ ];

		if ($p_id) {
			$parents = Node::loadMultiple ( $p_id );

			foreach ( $parents as $parent ) {
				$type = $parent->getType (); // Check whether parent is content folder.
				$pid = $parent->id ();
				if ($type == 'content_folder') {
					$parent_id = $this->getParentCFByChild ( $pid, $field );
					if ($parent_id) {
						foreach ( $parent_id as $p ) {
							$parent_ids [] = $p;
						}
					}
					$parent_ids [] = $pid;
				}
			}
		}

		return $parent_ids;
	}

	/**
	 * *
	 * Manipulate Platform Elements
	 *
	 * Get Users list
	 */
	public function getUsers() {
		$uids = \Drupal::entityQuery ( 'user' )->execute ();
		$users = User::loadMultiple ( $uids );
		$result = [ ];
		foreach ( $users as $user ) {
			$username = $user->get ( 'name' )->getString ();
			if ($username) {
				$result [] = array (
						'id' => $user->id (),
						'username' => $username,
						'firstname' => $user->get ( 'field_firstname' )->getString (),
						'lastname' => $user->get ( 'field_lastname' )->getString (),
						'email' => $user->getEmail (),
						'profil' => $user->get ( 'roles' )->getString (),
						'customer' => $user->get ( 'field_customer' )->getString (),
						'status' => $user->get ( 'status' )->getString ()
				);
			}
		}
		return $result;
	}
	public function deleteChildren($subChildren) {
		$refField = $this->getNodeRelFieldName ( $subChildren->getType () );
		$grandChildrenIds = null;
		if ($refField) {
			$grandChildrenIds = $subChildren->get ( $refField )->getValue ();
		}
		$subChildren->delete ();
		if ($grandChildrenIds) {
			foreach ( $grandChildrenIds as $children ) {
				$child = Node::load ( $children ['target_id'] );
				if ($child) {
					$this->deleteChildren ( $child );
				}
			}
		}
	}
	public function deleteCourse(Request $request) {
		$crs_id = \Drupal::request ()->request->get ( 'crs_id' );

		if ($crs_id) {
			$mediaIds = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course', $crs_id )->execute ();

			$course = Node::load ( $crs_id );
			$courseChildren = $course->get ( 'field_crs_children' )->getValue ();
			if ($courseChildren) {
				foreach ( $courseChildren as $courseChild ) {
					$id = $courseChild ['target_id'];
					$subChildren = Node::load ( $id );
					if ($subChildren) {
						$this->deleteChildren ( $subChildren );
					}
				}
			}

			$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $crs_id )->execute ();

			$styles = Node::loadMultiple ( $style_ids );

			foreach ( $styles as $stl ) {
				$stl_crs = $stl->get ( 'field_s_courses' )->getValue ();
				$stl_crs_ids = array_column ( $stl_crs, 'target_id' );
				$key = array_search ( $crs_id, $stl_crs_ids );
				unset ( $stl_crs [$key] );
				$stl->set ( 'field_s_courses', $stl_crs );
				$stl->save ();
			}

			$parent_cf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'content_folder' )->condition ( 'field_cf_children', $crs_id )->execute ();

			if (! $parent_cf_ids || empty ( $parent_cf_ids )) {
				$parent_cf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_content_root' )->condition ( 'field_dcr_children', $crs_id )->execute ();
			}

			if (! empty ( $parent_cf_ids )) {
				$parent_cf_id = implode ( '', $parent_cf_ids );
				$parent_cf = Node::load ( $parent_cf_id );
				if ($parent_cf->gettype () == 'domain_content_root') {
					$crs_id_values = $parent_cf->get ( 'field_dcr_children' )->getValue ();
					$parent_arr = array_column ( $crs_id_values, 'target_id' );
					$crs_key = array_search ( $crs_id, $parent_arr );
					unset ( $crs_id_values [$crs_key] );
					$parent_cf->set ( 'field_dcr_children', $crs_id_values );
				} else {
					$crs_id_values = $parent_cf->get ( 'field_cf_children' )->getValue ();
					$parent_arr = array_column ( $crs_id_values, 'target_id' );
					$crs_key = array_search ( $crs_id, $parent_arr );
					unset ( $crs_id_values [$crs_key] );
					$parent_cf->set ( 'field_cf_children', $crs_id_values );
				}
				$parent_cf->save ();
			}

			$course->delete ();

			if ($mediaIds) {
				foreach ( $mediaIds as $mediaId ) {
					$media = Node::load ( $mediaId );
					$filePath = file_create_url ( $media->get ( 'field_cm_file_path' )->getString () );
                                      //bilim-555 fix
					$dir =$media->get('field_cm_file_path')->getString();     
					 $final_file_url1 = file_create_url($dir);
					 $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
					 $final_file_path11 = $_SERVER['DOCUMENT_ROOT'].$final_file_path1;
					$this->deleteAll($final_file_path11);
					$media->delete ();
				}
			}

			return new JsonResponse ( [ 
					'result' => 'OK'
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'Course id is invalid'
			] );
		}
	}

	/*
	 * Get domain id from course id
	 */
	public function getDomainFromCourse($nid, $ty) {
		$dm_id = 'NA';
		$ids = array ();
		$cf_ids = array ();
		if ($ty == 'course') {
			$cfs = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'content_folder' )->condition ( 'field_cf_children', $nid )->range ( 0, 1 )->execute ();
			$cf_id = current ( $cfs );
		} else if ($ty == 'content_folder') {
			$cf_id = $nid;
		}
		if ($cf_id) {
			$ids ['cf_children'] = $cf_id;
			$cf_ids [] = $cf_id;
			$cf = Node::load ( $cf_id );
			$type = $cf->getType ();
			while ( $type == 'content_folder' ) {
				$cfsc = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'content_folder' )->condition ( 'field_cf_content_folder', $cf_id )->range ( 0, 1 )->execute ();
				if ($cfsc) {
					$cf_id = current ( $cfsc );
					$ids ['cf_content_folder'] = $cf_id;
					$cf_ids [] = $cf_id;
					$cf = Node::load ( $cf_id );
					$type = $cf->getType ();
				} else {
					$type = null;
				}
			}
		}
		if (! empty ( $cf_id )) {
			$dcr = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_content_root' )->condition ( 'field_dcr_children', $cf_id )->range ( 0, 1 )->execute ();
			$dcr_id = current ( $dcr );
			$ids ['dcr_id'] = $dcr_id;
			if ($dcr_id) {
				$cf_ids [] = $dcr_id;
			}
		} else {
			$dcr = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_content_root' )->condition ( 'field_dcr_children', $nid )->range ( 0, 1 )->execute ();
			$dcr_id = current ( $dcr );
			$ids ['dcr_id'] = $dcr_id;
			if ($dcr_id) {
				$cf_ids [] = $dcr_id;
			} else {
				$dcr_id = $nid;
				$cf_ids [] = $nid;
			}
		}
		if (! empty ( $dcr_id )) {
			$domain = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->condition ( 'field_domain_children', $dcr_id )->execute ();
			$dm_id = current ( $domain );
			$ids ['d_id'] = $dm_id;
			if ($dm_id) {
				$cf_ids [] = $dm_id;
			}
		}

		return array (
				'ids' => $ids,
				'cf_ids' => $cf_ids
		);
	}
	/*
	 * Get ids from style folder
	 */
	public function getDomainFromStyle($nid) {
		$dm_id = 'NA';
		$ids = array ();
		$cf_ids = array ();

		$cf_ids [] = $nid;
		$cf_id = $nid;
		$cf = Node::load ( $nid );
		$type = $cf->getType ();
		while ( $type == 'style_folder' ) {
			$cfsc = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style_folder' )->condition ( 'field_sf_style_folder', $cf_id )->range ( 0, 1 )->execute ();
			if ($cfsc) {
				$cf_id = current ( $cfsc );
				$cf_ids [] = $cf_id;
				$cf = Node::load ( $cf_id );
				$type = $cf->getType ();
			} else {
				$type = null;
			}
		}

		if (! empty ( $cf_id )) {
			$dcr = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_styles_root' )->condition ( 'field_dsr_children', $cf_id )->range ( 0, 1 )->execute ();
			$dcr_id = current ( $dcr );
			$ids ['dcr_id'] = $dcr_id;
			if ($dcr_id) {
				$cf_ids [] = $dcr_id;
			}
		} else {
			$dcr = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_styles_root' )->condition ( 'field_dsr_children', $nid )->range ( 0, 1 )->execute ();
			$dcr_id = current ( $dcr );
			$ids ['dcr_id'] = $dcr_id;
			if ($dcr_id) {
				$cf_ids [] = $dcr_id;
			} else {
				$dcr_id = $nid;
				$cf_ids [] = $nid;
			}
		}
		if (! empty ( $dcr_id )) {
			$domain = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->condition ( 'field_domain_children', $dcr_id )->execute ();
			$dm_id = current ( $domain );
			$ids ['d_id'] = $dm_id;
			if ($dm_id) {
				$cf_ids [] = $dm_id;
			}
		}

		return array (
				'ids' => $ids,
				'cf_ids' => $cf_ids
		);
	}

	/*
	 * Get course from domain
	 */
	public function getCbyDomain($ids, $courseId) {
		$domainId = $ids ['d_id'];
		$qn = Node::load ( $domainId );
		$crs_children = $qn->get ( 'field_domain_children' )->getValue ();
		// get children
		$chlds = $this->getTargetIds ( $crs_children );
		$nodes = Node::loadMultiple ( $chlds );
		$children = [ ];

		foreach ( $nodes as $node ) {
			if ($node->bundle () == 'domain_content_root' && $node->id () == $ids ['dcr_id']) {
				$children [] = $node->id ();
			}
		}

		$res = $this->getBreadcrumbTree ( $ids, $children, $courseId );

		foreach ( $res as $r ) {
			$result = $r ['children'];
		}
		return $result;
	}

	/*
	 * Get nested course list
	 */
	public function getCourseTreeChildrenByChildren($ids, $param, $courseId) {
		global $base_url;
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_domain' );

		$domain = $ids ['d_id'];
		$nodes = Node::loadMultiple ( $param );
		$result = [ ];
		$link = '';
		foreach ( $nodes as $n ) {
			$type = $n->getType ();
			$nid = $n->id ();
			$chld = '';
			$chld_elem = [ ];
			if ($type == 'content_folder') :

				$s_dmn = $tempstore->get ( 's_domain' );
				$cs = $n->get ( 'field_cf_children' )->getValue ();
				if ($cs) {
					foreach ( $cs as $c ) {
						if ($c ['target_id'] != $courseId) {
							$chld = $n->get ( 'field_cf_content_folder' )->getValue ();
						} else {
							$chld = '';
							break;
						}
					}
				} else {
					$chld = $n->get ( 'field_cf_content_folder' )->getValue ();
				}

				$link = $base_url . '/platform/domainview/' . $domain . '/' . $s_dmn . '/' . $nid;

			else :

				$tempstore->set ( 's_domain', $nid );
				$link = $base_url . '/platform/domainview/' . $domain . '/' . $nid . '/0';
				$field_name = $this->getNodeRelFieldName ( $type );
				if ($field_name != '') :
					$chld = $n->get ( $field_name )->getValue ();
					foreach ( $chld as $key => $c ) {
						$arr = array_column ( $chld, 'target_id' );
						if (! in_array ( $ids ['cf_children'], $arr )) {
							if ($c ['target_id'] != $ids ['cf_content_folder']) {
								unset ( $chld [$key] );
							}
						} elseif ($c ['target_id'] != $ids ['cf_children']) {
							unset ( $chld [$key] );
						}
					}
    		endif;

			endif;

			if (! empty ( $chld )) :
				$chld_str = $this->getTargetIds ( $chld );
				$chld_elem = $this->getCourseTreeChildrenByChildren ( $ids, $chld_str, $courseId );
    		endif;

			$result [] = array (
					'id' => $nid,
					'title' => $n->title->value,
					'type' => $n->getType (),
					'link' => $link,
					'children' => $chld_elem
			);
		}

		return $result;
	}
	public function addStyleFolder() {
		$nid = \Drupal::request ()->request->get ( 'nid' );
		$type = \Drupal::request ()->request->get ( 'type' );
		$sf_name = \Drupal::request ()->request->get ( 'sf_name' );

		$sf_node = Node::create ( [ 
				'type' => 'style_folder',
				'title' => $sf_name
		] );
		$sf_node->save ();

		$curr_node = Node::load ( $nid );
		if ($type == 'domain') {

			$chlds = $this->getElemChildren ( $nid, 'field_domain_children' );
			$dsr_nodes = Node::loadMultiple ( $chlds );

			foreach ( $dsr_nodes as $dsr_node ) {
				if ($dsr_node->getType () == 'domain_styles_root') {
					$dsr_node->field_dsr_children [] = [ 
							'target_id' => $sf_node->id ()
					];
					$dsr_node->save ();
					$dsr_id = $dsr_node->id ();
				}
			}
			$new_uri = $nid . '/0/0';
		} elseif ($type == 'style_folder') {
			$curr_node->field_sf_style_folder [] = [ 
					'target_id' => $sf_node->id ()
			];
			$curr_node->save ();
		}

		return new JsonResponse ( [ 
				'result' => 'OK',
				'fid' => $sf_node->id (),
				'new_uri' => $new_uri
		] );
	}

	/**
	 * Get list of style for 'add course' form
	 *
	 * @param int $domainId
	 * @return array|NULL[]|NULL[][]|string[][]|number[][]
	 */
	/*
	 * function getStyleFromDomain($domainId) {
	 * $domain = Node::load($domainId);
	 * $referenceFieldName = $this->getNodeRelFieldName($domain->getType());
	 * $childrenIds = $domain->get($referenceFieldName)->getValue();
	 * $output = array();
	 * foreach($childrenIds as $childrenId) {
	 * $dsrId = $childrenId['target_id'];
	 * $dsr = Node::load($dsrId);
	 * if($dsr && $dsr->getType() == 'domain_styles_root') {
	 * $referenceField = $this->getNodeRelFieldName($dsr->getType());
	 * $childIds = $dsr->get($referenceField)->getValue();
	 * if($childIds) {
	 * $output = $this->getStylechildren($childIds);
	 * }
	 * }
	 * }
	 * return $output;
	 * }
	 */
	public function getStyleFromDomain($domainId) {
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_style' );
		$qn = Node::load ( $domainId );
		$style_children = $qn->get ( 'field_domain_children' )->getValue ();
		// get children
		$chlds = $this->getTargetIds ( $style_children );
		$nodes = Node::loadMultiple ( $chlds );
		$children = [ ];

		foreach ( $nodes as $node ) {
			if ($node->bundle () == 'domain_styles_root') {
				$children = array_column ( $node->get ( 'field_dsr_children' )->getValue (), 'target_id' );
			}
		}

		$result = $this->getStyleChildrenByChildren ( $domainId, $children );
		return $result;
	}

	/**
	 * Get nested style value
	 *
	 * @param array $childIds
	 * @return NULL[][]|string[][]|number[][]|NULL[][][]|string[][][]|number[][][]
	 */
	function getStylechildren($childIds) {
		$result = array ();
		foreach ( $childIds as $childId ) {
			$sfId = $childId ['target_id'];
			$sf = Node::load ( $sfId );
			if ($sf) {
				$sfName = $sf->getTitle ();
				$sfType = $sf->getType ();
				if ($sfType == 'style') {
					$result [] = array (
							'folderName' => '',
							'children' => $this->getChildren ( array (
									$childId
							) )
					);
				} else {
					$reference = $this->getNodeRelFieldName ( $sfType );
					$childs = $sf->get ( $reference )->getValue ();
					$result [] = array (
							'folderName' => $sfName,
							'children' => $this->getChildren ( $childs )
					);
					$childFolders = $sf->get ( 'field_sf_style_folder' )->getValue ();
					if ($childFolders) {
						$result [] = $this->getStylechildren ( $childFolders );
					}
				}
			}
		}
		return $result;
	}
	function getChildren($childs) {
		$result = array ();
		foreach ( $childs as $child ) {
			$sId = $child ['target_id'];
			$s = Node::load ( $sId );
			if ($s->getType () == 'style') {
				$fid = $s->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
				if ($fid) {
					$file = File::load ( $fid );
					$uri = $file->get ( 'uri' )->getString ();
				}
				$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
				$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
				$blmconfig = json_decode ( $blmconfig_data, true );
				$displayValue = $blmconfig ['display'];
				$navigation = $blmconfig ['navigation'] ['type'];
				$result [] = array (
						'id' => $s->id (),
						'title' => $s->getTitle (),
						'changed' => $s->getChangedTime (),
						'created' => $s->getCreatedTime (),
						'display' => $displayValue,
						'navigation' => $navigation
				);
			}
		}
		return $result;
	}
	public function renameCourse() {
		$nid = \Drupal::request ()->request->get ( 'nid' );
		$name = \Drupal::request ()->request->get ( 'name' );
		if ($nid) {
			$node = Node::load ( $nid );
			$node->setTitle ( $name );
			$node->save ();

			return new JsonResponse ( [ 
					'result' => 'OK'
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'Course id is invalid'
			] );
		}
	}
	public function addCourseContentFolder() {
		$nid = \Drupal::request ()->request->get ( 'nid' );
		$type = \Drupal::request ()->request->get ( 'type' );
		$name = \Drupal::request ()->request->get ( 'name' );

		$node = Node::create ( [ 
				'type' => 'content_folder',
				'title' => $name
		] );
		$node->save ();

		$curr_node = Node::load ( $nid );
		if ($type == 'domain') {
			$chlds = $this->getElemChildren ( $nid, 'field_domain_children' );
			$dcrs = Node::loadMultiple ( $chlds );

			foreach ( $dcrs as $dcr ) {
				if ($dcr->getType () == 'domain_content_root') {
					$dcr->field_dcr_children [] = [ 
							'target_id' => $node->id ()
					];
					$dcr->save ();
					$dcr_id = $dcr->id ();
				}
			}
			$new_uri = $nid . '/0/0';
		} elseif ($type == 'content_folder') {
			$curr_node->field_cf_content_folder [] = [ 
					'target_id' => $node->id ()
			];
			$curr_node->save ();
		}

		return new JsonResponse ( [ 
				'result' => 'OK',
				'fid' => $node->id (),
				'new_uri' => $new_uri
		] );
	}
	public function createCourse() {
		\Drupal::service ( 'page_cache_kill_switch' )->trigger ();
		$sid = \Drupal::request ()->request->get ( 'sid' );
		$display = \Drupal::request ()->request->get ( 'display' );
		$cname = \Drupal::request ()->request->get ( 'cname' );
		$curr_nid = \Drupal::request ()->request->get ( 'curr_nid' );
		$type = \Drupal::request ()->request->get ( 'type' );
		$lang = \Drupal::request ()->request->get ( 'lang' );
		$currentUserId = \Drupal::currentUser ()->id ();
		$strt_node = Node::create ( [ 
				'type' => 'starting',
				'title' => $cname . ' starting'
		] );
		$strt_node->save ();

		$stcr_node = Node::create ( [ 
				'type' => 'structure',
				'title' => $cname . ' structure',
				'field_struct_style_summary' => 'true',
				'field_struct_screen_on_summary' => 'false'
		] );
		$stcr_node->save ();

		$anx_node = Node::create ( [ 
				'type' => 'annexes',
				'title' => $cname . ' annexes'
		] );
		$anx_node->save ();

		$style = Node::load ( $sid );
		$fid = $style->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
		$stitle = $style->getTitle ();

		if ($fid) {
			$file = File::load ( $fid );
			$uri = $file->get ( 'uri' )->getString ();
			$file_name = $file->getFilename ();
			$course_style_path = current ( explode ( $file_name, $uri ) );
		}

		$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
		$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
		$blmconfig = json_decode ( $blmconfig_data, true );
		$externalTexts = json_encode ( $blmconfig ['externaltexts'] );
		$blmconfig ['navigation'] ['prerequisite'] = false;
		$navigation = json_encode ( $blmconfig ['navigation'] );
		$completion = '{"completion":"screen_displayed","actions":{"all_button_clicked":false,"video_complete":false,"sound_complete":false,"animation_complete":false,"interaction_complete":false,"timer":false,"timer_duration":5}}';

		$node = Node::create ( [ 
				'type' => 'course',
				'title' => $cname,
                'field_original_course_name' => $cname,
				'field_crs_display' => $display,
				'field_external_texts' => $externalTexts,
				'field_crs_nav_param' => $navigation,
				'field_crs_comp_param' => $completion,
				'field_crs_children' => [ 
						$strt_node->id (),
						$stcr_node->id (),
						$anx_node->id ()
				],
				'field_crs_lang' => $lang
		] );
		$node->save ();

		$style->field_s_courses [] = $node->id ();
		$style->save ();

		// Upload external files from style in course medias
		$abs_crs_style_path = \Drupal::service ( 'file_system' )->realpath ( $course_style_path . $node->id () );
		if (! file_exists ( $abs_crs_style_path )) {
			mkdir ( $abs_crs_style_path, 0777, true );
		}

		$style_zip = new \ZipArchive ();
		$style_zip->open ( $absolute_path );
		$style_zip->extractTo ( $abs_crs_style_path );
		$style_zip->close ();

		if ($stitle == 'BASE STYLE') {
			$sf_path = 'public://base-style-01';
		} else {
			$sf_path = $course_style_path . $node->id ();
		}

		$style_path = \Drupal::service ( 'file_system' )->realpath ( $sf_path );

		if (is_dir ( $style_path . '/external' )) {
			$this->uploadExternalFiles ( $node->id (), $sid, $style_path . '/external' );
		}

		$curr_node = Node::load ( $curr_nid );
		if ($type == 'domain') {
			$chlds = $this->getElemChildren ( $curr_nid, 'field_domain_children' );
			$dcrs = Node::loadMultiple ( $chlds );

			foreach ( $dcrs as $dcr ) {
				if ($dcr->getType () == 'domain_content_root') {
					$dcr->field_dcr_children [] = [ 
							'target_id' => $node->id ()
					];
					$dcr->save ();
				}
			}
		} elseif ($type == 'content_folder') {
			$curr_node->field_cf_children [] = [ 
					'target_id' => $node->id ()
			];
			$curr_node->save ();
		}

		return new JsonResponse ( [ 
				'result' => 'OK'
		] );
	}
	public function getBreadcrumbInfo($ids, $view) {
		global $base_url;
		$ids = array_reverse ( $ids );

		$nodes = Node::loadMultiple ( $ids );
		$result = array ();
		foreach ( $nodes as $n ) :
			$type = $n->getType ();
			$nid = $n->id ();
			if ($type == 'domain') {
				$link = $base_url . '/platform/' . $view . '/' . $nid . '/0/0';
			} elseif ($type == 'domain_content_root' || $type == 'domain_styles_root') {
				$link = $base_url . '/platform/' . $view . '/' . $ids [0] . '/' . $nid . '/0';
			} else {
				$link = $base_url . '/platform/' . $view . '/' . $ids [0] . '/' . $ids [1] . '/' . $nid;
			}
			$result [] = array (
					'id' => $n->id (),
					'type' => $type,
					'title' => $n->title->value,
					'link' => $link
			);
		endforeach
		;
		return $result;
	}
	public function updateCourse(Request $request) {
		$crs_id = \Drupal::request ()->request->get ( 'crs_id' );
		$currentUserId = \Drupal::currentUser ()->id ();
		if (! $crs_id) {
			$crs_id = json_decode ( \Drupal::request ()->getContent () )->crs_id;
		}
		if ($crs_id) {

			/*
			 * $course = Node::load($crs_id);
			 * $course->field_changedby[] = $currentUserId;
			 * $course->set('changed', time());
			 * $course->save();
			 */
			$crs = Node::load ( $crs_id );
			$crs->setRevisionUserId ( $currentUserId );
			$crs->save ();

			$user = user::load ( $currentUserId );
			$courseValues = $user->get ( 'field_crs' )->getValue ();
			$courses = array_column ( $courseValues, 'target_id' );
			$new = $crs_id;
			if ($courses) {
				array_unshift ( $courses, $crs_id );
				$new = array_unique ( $courses );
			}
			$user->set ( 'field_crs', $new );
			$user->save ();

			return new JsonResponse ( [ 
					'result' => 'OK'
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'Course id is invalid'
			] );
		}
	}
	public function getStyleChildrenByChildren($parent_id, $param) {
		date_default_timezone_set ( 'GMT' );
		$domain = $parent_id;
		$nodes = Node::loadMultiple ( $param );
		$result = [ ];
		$style_info = [ ];
		foreach ( $nodes as $n ) {
			$type = $n->getType ();
			$nid = $n->id ();
			$chld = '';
			$chld_elem = [ ];

			if ($type == 'style_folder') {
				$chld1 = $n->get ( 'field_sf_style_folder' )->getString ();
				$chld2 = $n->get ( 'field_sf_children' )->getString ();
				$chldStr = '';
				if ($chld1 && $chld2) {
					$chldStr = $chld1 . ',' . $chld2;
				} else if ($chld1 && ! $chld2) {
					$chldStr = $chld1;
				} else if ($chld2 && ! $chld1) {
					$chldStr = $chld2;
				}
				if ($chldStr) {
					$chld = explode ( ',', $chldStr );
				}
			}

			if (! empty ( $chld )) {
				$chld_elem = $this->getStyleChildrenByChildren ( $domain, $chld );
			}

			$displayValue = '';
			$navigation = '';
			if ($type == 'style') {
				$fid = $n->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
				if ($fid) {
					$file = File::load ( $fid );
					$uri = $file->get ( 'uri' )->getString ();
				}
				$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
				$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
				if ($blmconfig_data) {
					$blmconfig = json_decode ( $blmconfig_data, true );
					$displayValue = $blmconfig ['display'];
					$navigation = $blmconfig ['navigation'] ['type'];
				}
			}

			$changed = $n->getChangedTime ();
			$created = $n->getCreatedTime ();

			if ($type == 'style_folder') {
				$result [] = array (
						'id' => $nid,
						'type' => $type,
						'title' => $n->title->value,
						'children' => $chld_elem,
						'changedDate' => date ( 'D M j', $changed ),
						'changedTime' => date ( ' - G\\hi T - Y', $changed ),
						'createdDate' => date ( 'D M j', $created ),
						'createdTime' => date ( ' - G\\hi T - Y', $created ),
						'display' => $displayValue,
						'navigation' => $navigation
				);
			} else {
				$style_info [] = array (
						'id' => $nid,
						'type' => $type,
						'title' => $n->title->value,
						'framework' => $n->get ( 'field_s_framework' )->value,
						'children' => $chld_elem,
						'changedDate' => date ( 'D M j', $changed ),
						'changedTime' => date ( ' - G\\hi T - Y', $changed ),
						'createdDate' => date ( 'D M j', $created ),
						'createdTime' => date ( ' - G\\hi T - Y', $created ),
						'display' => $displayValue,
						'navigation' => $navigation
				);
			}
		}
		$result = array_merge ( $result, $style_info );
		return $result;
	}
	public function userFilters(Request $request) {
		$username = \Drupal::request ()->request->get ( 'username' );
		$firstname = \Drupal::request ()->request->get ( 'firstname' );
		$lastname = \Drupal::request ()->request->get ( 'lastname' );
		$profile = \Drupal::request ()->request->get ( 'profile' );
		$customer = \Drupal::request ()->request->get ( 'customer' );
		$users = \Drupal::entityQuery ( 'user' );

		if ($username) {
			$users->condition ( 'name', $username, 'CONTAINS' );
		}
		if ($firstname) {
			$users->condition ( 'field_firstname', $firstname, 'CONTAINS' );
		}
		if ($lastname) {
			$users->condition ( 'field_lastname', $lastname, 'CONTAINS' );
		}
		if ($profile && $profile != 'all') {
			$users->condition ( 'roles', $profile );
		}
		if ($customer && $customer != 'ALL') {
			$users->condition ( 'field_customer', $customer );
		}
		$user_ids = $users->execute ();
		if ($user_ids) {
			return new JsonResponse ( [ 
					'result' => 'OK',
					'user_ids' => $user_ids
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'No matching user found'
			] );
		}
	}

	/**
	 * *
	 *
	 * Add Users
	 */
	public function addUser() {
		$username = \Drupal::request ()->request->get ( 'username' );
		$firstname = \Drupal::request ()->request->get ( 'firstname' );
		$lastname = \Drupal::request ()->request->get ( 'lastname' );
		$email = \Drupal::request ()->request->get ( 'email' );
		$profile = \Drupal::request ()->request->get ( 'profile' );
		$customer_access = \Drupal::request ()->request->get ( 'customer_access' );
		$isActivated = \Drupal::request ()->request->get ( 'isActivated' );
		$currentUserId = \Drupal::currentUser ()->id ();

		$userIds = \Drupal::entityQuery ( 'user' )->condition ( 'mail', $email )->execute ();
		if ($userIds || count ( $userIds ) > 0) {
			return new JsonResponse ( [ 
					'result' => 'Error'
			] );
		}

		$user = User::create ( [ 
				'name' => $username,
				'mail' => $email,
				'field_firstname' => $firstname,
				'field_lastname' => $lastname,
				'roles' => $profile,
				'status' => $isActivated == 'true' ? 1 : 0,
				'field_customer' => $customer_access
		] );

		$user->save ();

		return new JsonResponse ( [ 
				'result' => 'OK'
		] );
	}

	/**
	 * *
	 *
	 * Edit Users
	 */
	public function editUser() {
		$uid = \Drupal::request ()->request->get ( 'uid' );
		$username = \Drupal::request ()->request->get ( 'username' );
		$firstname = \Drupal::request ()->request->get ( 'firstname' );
		$lastname = \Drupal::request ()->request->get ( 'lastname' );
		$email = \Drupal::request ()->request->get ( 'email' );
		$profile = \Drupal::request ()->request->get ( 'profile' );
		$customer_access = \Drupal::request ()->request->get ( 'customer_access' );
		$isActivated = \Drupal::request ()->request->get ( 'isActivated' );
		$currentUserId = \Drupal::currentUser ()->id ();

		$userIds = \Drupal::entityQuery ( 'user' )->condition ( 'mail', $email )->execute ();

		if (! in_array ( $uid, $userIds ) || count ( $userIds ) > 1) {
			return new JsonResponse ( [ 
					'result' => 'Error'
			] );
		}

		$user = User::load ( $uid );
		$parentId = $user->get ( 'field_parent' )->getString ();
		$user->set ( 'name', [ 
				[ 
						'value' => $username
				]
		] );
		$user->set ( 'mail', [ 
				[ 
						'value' => $email
				]
		] );
		$user->set ( 'field_firstname', [ 
				[ 
						'value' => $firstname
				]
		] );
		$user->set ( 'field_lastname', [ 
				[ 
						'value' => $lastname
				]
		] );
		$user->set ( 'field_customer', [ 
				[ 
						'value' => $customer_access
				]
		] );
		/*
		 * if(!$parentId) {
		 * $user->set('field_parent', [['target_id' => $currentUserId]]);
		 * }
		 */
		$user->set ( 'roles', [ 
				[ 
						'target_id' => $profile
				]
		] );
		$user->set ( 'status', $isActivated == 'true' ? [ 
				[ 
						'value' => 1
				]
		] : [ 
				[ 
						'value' => 0
				]
		] );
		$user->save ();

		return new JsonResponse ( [ 
				'result' => 'OK'
		] );
	}
	public function addDomain() {
		$domain_name = \Drupal::request ()->request->get ( 'd_name' );

		$node = Node::create ( [ 
				'type' => 'domain',
				'title' => $domain_name
		] );
		$node->save ();

		return new JsonResponse ( [ 
				'result' => 'OK'
		] );
	}
	public function updateDomain() {
		$domain_name = \Drupal::request ()->request->get ( 'd_name' );
		$domain_id = \Drupal::request ()->request->get ( 'did' );

		$domain = Node::load ( $domain_id );
		$domain->setTitle ( $domain_name );

		$domain->save ();

		return new JsonResponse ( [ 
				'result' => 'OK'
		] );
	}
	public function checkCourseOnDomain($arr) {
		$dcr_children = [ ];
		$children = [ ];
		foreach ( $arr as $id ) {

			$child = Node::load ( $id );
			if ($child && $child->getType () == 'domain_content_root') {
				$dcr_children = $child->get ( 'field_dcr_children' )->getValue ();
				$dcr_arr = $this->getTargetIds ( $dcr_children );

				foreach ( $dcr_arr as $dcr ) {
					$dcr_child = Node::load ( $dcr );

					if ($dcr_child) {
						if ($dcr_child->getType () == 'course') {
							$children [] = $dcr_child->id ();
						} else {
							$children [] = $this->checkCourseOnDomain ( [ 
									$dcr_child->id ()
							] );
						}
					}
				}
			} elseif ($child && $child->getType () == 'content_folder') {
				$cf_content_folder = $child->get ( 'field_cf_content_folder' )->getValue ();
				$content_folder = $this->getTargetIds ( $cf_content_folder );

				if (! empty ( $content_folder )) {
					$children [] = $this->checkCourseOnDomain ( $content_folder );
				}

				$cf_children = $child->get ( 'field_cf_children' )->getValue ();
				$cf_arr = $this->getTargetIds ( $cf_children );

				foreach ( $cf_arr as $cf ) {
					$cf_child = Node::load ( $cf );

					if ($cf_child) {
						if ($cf_child->getType () == 'course') {
							$children [] = $cf_child->id ();
						} else {
							$children [] = $this->checkCourseOnDomain ( [ 
									$cf_child->id ()
							] );
						}
					}
				}
			}
		}
		return $children;
	}
	public function checkDomain(Request $request) {
		$did = $request->getContent ();

		if ($did) {
			$d_id = json_decode ( $did, true ) ['d_id'];
			$domain = Node::load ( $d_id );
			$children = $domain->get ( 'field_domain_children' )->getValue ();
			$arr = array_column ( $children, 'target_id' );
			$dcr_children = $this->checkCourseOnDomain ( $arr );

			if (empty ( $dcr_children )) {

				return new JsonResponse ( [ 
						'result' => 'OK'
				] );
			} else {
				return new JsonResponse ( [ 
						'result' => 'Domain contains children'
				] );
			}
		} else {
			return new JsonResponse ( [ 
					'result' => 'domain id is invalid'
			] );
		}
	}
	public function deleteDomain() {
		$d_id = \Drupal::request ()->request->get ( 'nid' );

		$domain = Node::load ( $d_id );
		$domain->delete ();

		return new JsonResponse ( [ 
				'result' => 'OK'
		] );
	}
	public function deleteUser() {
		$u_id = \Drupal::request ()->request->get ( 'u_id' );
		if ($u_id) {
			$user = User::load ( $u_id );
			user_cancel ( array (), $u_id, 'user_cancel_reassign' );
			$batch = &batch_get ();
			$batch ['progressive'] = FALSE;
			batch_process ();
			// $user->delete();

			return new JsonResponse ( [ 
					'result' => 'OK'
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'user id is invalid'
			] );
		}
	}
	public function emailResetRequest() {
		$email = \Drupal::request ()->request->get ( 'email' );
		$userIds = \Drupal::entityQuery ( 'user' )->condition ( 'mail', $email )->range ( 0, 1 )->execute ();
		$user_id = current ( $userIds );
		if ($user_id) {
			$user = User::load ( $user_id );

			$mail = _user_mail_notify ( 'password_reset', $user );
			if (! empty ( $mail )) {
				$this->messenger ()->addStatus ( $this->t ( 'Further instructions have been sent to your email address.' ) );
			}

			return new JsonResponse ( [ 
					'result' => 'ok'
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'error'
			] );
		}
	}
	public function pwdReset() {
		$email = \Drupal::request ()->request->get ( 'email' );
		$pwd = \Drupal::request ()->request->get ( 'pwd' );
		$userIds = \Drupal::entityQuery ( 'user' )->condition ( 'mail', $email )->range ( 0, 1 )->execute ();
		$user_id = current ( $userIds );
		if ($user_id) {
			$user = User::load ( $user_id );

			$user->setPassword ( $pwd );
			$user->save ();

			$this->messenger ()->addStatus ( $this->t ( 'User password have been changed successfully.' ) );
			return new JsonResponse ( [ 
					'result' => 'ok'
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'error'
			] );
		}
	}
	public function getTemplatesByChildren($ids) {
		$n_elems = Node::loadMultiple ( $ids );
		$result = [ ];
		foreach ( $n_elems as $n_elem ) {
			$type = $n_elem->getType ();
			$nid = $n_elem->id ();

			$field = $this->getFieldNameByKey ( $type, 'children' );
			if (! empty ( $field )) {
				$chld_ids = $n_elem->get ( $field )->getValue ();
				if (! empty ( $chld_ids )) {
					$chld_arr = $this->getTargetIds ( $chld_ids );
					$chld_n = $this->getTemplatesByChildren ( $chld_arr );
					$result = array_merge ( $result, $chld_n );
				}
			}

			if ($type == 'chapter') {
				$ch_ids = $n_elem->get ( 'field_chap_chapter' )->getValue ();
				if (! empty ( $ch_ids )) {
					$ch_arr = $this->getTargetIds ( $ch_ids );
					$ch_n = $this->getTemplatesByChildren ( $ch_arr );
					$result = array_merge ( $result, $ch_n );
				}
			}
			if ($type == 'annexes_folder') {
				$ch_ids = $n_elem->get ( 'field_af_annexes_folder' )->getValue ();
				if (! empty ( $ch_ids )) {
					$ch_arr = $this->getTargetIds ( $ch_ids );
					$ch_n = $this->getTemplatesByChildren ( $ch_arr );
					$result = array_merge ( $result, $ch_n );
				}
			}
			if ($type == 'screen' || $type == 'partpage' || $type == 'simple_partpage' || $type == 'simple_content' || $type == 'question') {
				$result = array_merge ( $result, [ 
						$nid
				] );
			}
		}

		return $result;
	}
	public function getTemplatesByCourse($crs_id) {
		$course = Node::load ( $crs_id );
		$chlds = $course->get ( 'field_crs_children' );
		$chld_nids = [ ];
		// structure, starting and annexes
		foreach ( $chlds as $chld ) {
			$ch_id = $chld->getValue () ['target_id'];
			$children = Node::load ( $ch_id );
			$chld_type = $children->getType ();
			$field = $this->getNodeRelFieldName ( $chld_type );
			$chld_n = $this->getElemChildren ( $ch_id, $field );
			$chld_nids = array_merge ( $chld_nids, $chld_n );
		}

		$temp_ids = $this->getTemplatesByChildren ( $chld_nids );
		return $temp_ids;
	}
	public function htmlStringToArray($str) {
		$flags = PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY;
		$regex = '/(<[a-z0-9=\-:." ^\/]+\/>)|(<[^\/]+>[^<\/]+<\/[a-z0-9]+>)|(<[a-z0-9=\-:." ^\/]+>)/';
		$parts = preg_split ( $regex, $str, - 1, $flags );
		return $parts;
	}
	public function getAllFieldsByType($type) {
		$fields = array_filter ( \Drupal::service ( 'entity_field.manager' )->getFieldDefinitions ( 'node', $type ), function ($fieldDefinition) {
			return $fieldDefinition instanceof \Drupal\field\FieldConfigInterface;
		} );

		$result = [ ];
		foreach ( $fields as $key => $definition ) {
			$label = $definition->getLabel ();
			$result [$label] = $key;
		}
		return $result;
	}
	public function getFieldNameByKey($type, $str) {
		$fields = $this->getAllFieldsByType ( $type );
		$field_name = '';
		foreach ( $fields as $key => $field ) {
			if (stristr ( $key, $str )) {
				$field_name = $field;
				break;
			}
		}
		return $field_name;
	}
	public function getChildrenJsonByChildren($param, $ptype) {
		$nodes = Node::loadMultiple ( $param );
		$editor_url = file_url_transform_relative ( file_create_url ( 'public://editor' ) );
		$result = array ();
		$i = 0;
		foreach ( $nodes as $n ) {
			$i ++;
			$type = $n->getType ();
			$chld = '';
			$chld_elem = [ ];
			$default_media = '';
			$media_over = '';
			$is_evaluation = false;
			$is_summary = false;
			$has_completion = false;
			$referenced_title = '';
			$temp_id = '';
			$temp_id_starting = '';
			$referenced_title_starting = '';
			$linkaction = [];
			$field_name = $this->getNodeRelFieldName ( $type );
			if ($field_name != '') {
				$chld = $n->get ( $field_name )->getValue ();
			}

			if ($type == 'chapter') {
				$in_chld = $n->get ( 'field_chap_chapter' )->getString ();
				if (! empty ( $in_chld )) {
					$in_chld_str = $this->getTargetIds ( $in_chld );
					$chld_elem = $this->getChildrenJsonByChildren ( $in_chld_str, $ptype );
				}
			}

			if (! empty ( $chld )) {
				$chld_arr = $this->getTargetIds ( $chld );
				$chld_elem = $this->getChildrenJsonByChildren ( $chld_arr, $ptype );
			}

			$bg_param = '';

			$short_desc = $this->getFieldNameByKey ( $type, 'title2' );
			$full_desc = $this->getFieldNameByKey ( $type, 'description' );
			$duration = $this->getFieldNameByKey ( $type, 'duration' );
			$evaluation = $this->getFieldNameByKey ( $type, 'isevaluation' );
			$media = $this->getFieldNameByKey ( $type, 'media param' );
			$mediaover = $this->getFieldNameByKey ( $type, 'mediaover' );
			$soundover = $this->getFieldNameByKey ( $type, 'soundover' );
			$miscmedia = $this->getFieldNameByKey ( $type, 'navigation template' );
			$summary = $this->getFieldNameByKey ( $type, 'summary' );
			$completion = $this->getFieldNameByKey ( $type, 'completion' );
			$metadata = $this->getFieldNameByKey ( $type, 'metadata' );
			$comp_param = $this->getFieldNameByKey ( $type, 'completion parameter' );
			$eval_param = $this->getFieldNameByKey ( $type, 'evaluation parameter' );
			$bg_param_field = $this->getFieldNameByKey ( $type, 'background parameter' );
			$prereq_param_field = $this->getFieldNameByKey ( $type, 'custom prerequisite' );
			$connection_field = $this->getFieldNameByKey ( $type, 'connection' );
			$htmlParam = $this->getFieldNameByKey ( $type, 'html params' );

			$config = [ ];
			if ($comp_param) {
				$comp_string = $n->get ( $comp_param )->getString ();
				/*
				 * if($comp_string){
				 * $editor_url = file_url_transform_relative(file_create_url('public://editor'));
				 * $comp_string = str_replace($editor_url, 'medias',$comp_string);
				 * }
				 */

				$config ["completion"] = $comp_string;
			}
			if ($prereq_param_field) {
				$prereq_param = $n->get ( $prereq_param_field )->getString ();
				$config ["prerequisite"] = $prereq_param;
			}
			if ($connection_field) {
				$connection_param = $n->get ( $connection_field )->getString ();
			}
			if ($eval_param) {
				$comp_string = $n->get ( $eval_param )->getString ();
				/*
				 * if($comp_string){
				 * $editor_url = file_url_transform_relative(file_create_url('public://editor'));
				 * $comp_string = str_replace($editor_url, 'medias',$comp_string);
				 * }
				 */
				$config ["evaluation"] = $comp_string;
			}

			$media_params = $media ? $n->get ( $media )->getString () : '';
			if ($media_params) {
				$media_params = str_replace ( $editor_url, './medias', $media_params );
				$default_media = json_encode ( json_decode ( $media_params, true ) ['default'] );
				$media_over = json_encode ( json_decode ( $media_params, true ) ['over'] );
			}

			if ($evaluation) {
				$eval_str = $n->get ( $evaluation )->getString ();
				if ($eval_str) {
					$is_evaluation = ($eval_str == 'true' || $eval_str == '1') ? true : false;
					// $is_evaluation = json_encode((bool) $is_evaluation);
				}
			}
			if ($completion) {
				$comp_str = $n->get ( $completion )->getString ();
				if ($comp_str) {
					$has_completion = ($comp_str == 'true' || $comp_str == '1') ? true : false;
					// $has_completion = json_encode((bool) $has_completion);
				}
			}
			if ($summary) {
				$summary_str = $n->get ( $summary )->getString ();
				if ($summary_str) {
					$is_summary = ($summary_str == 'true' || $summary_str == '1') ? true : false;
					$is_summary = json_encode((bool) $is_summary);
				}
			}
			if ($bg_param_field) {
				$bg_param = $n->get ( $bg_param_field )->getString ();
				$bg_param = str_replace ( $editor_url, './medias', $bg_param );
			}

			if ($type == 'chapter') {
				$isStyleSummary = false;
				$isScrnSummary = false;
				$style_summary = $n->get ( 'field_style_summary' )->value;
				$isStyleSummary = ($style_summary == 'true' || $style_summary == '1') ? true : false;
				$isStyleSummary = json_encode ( ( bool ) $isStyleSummary );
				$screen_on_summary = $n->get ( 'field_screen_on_summary' )->value;
				$isScrnSummary = ($screen_on_summary == 'true' || $screen_on_summary == '1') ? true : false;
				$isScrnSummary = json_encode ( ( bool ) $isScrnSummary );

				$metadataarray = $n->get ( $metadata )->getValue () ;
					foreach($metadataarray as $metadatavs){
						$metadatavalue = $metadatavs['value'];
					}
					$miscmediaarray =  $n->get ( $miscmedia )->getValue ();
					foreach($miscmediaarray as $miscmedivs){
						
						$miscmedvalue = $miscmedivs['value'];
					}

				$result [] = array (
						'type' => $n->getType (),
						'name' => $n->title->value,
						'subname' => $short_desc ? $n->get ( $short_desc )->getString () : '',
						'description' => $full_desc ? $n->get ( $full_desc )->getString () : '',
						'uid' => 'ID' . $n->id (),
						'order' => $i,
						'duration' => $duration ? $n->get ( $duration )->getString () : '',
						'defaultmedia' => $default_media ? str_replace ( ' ', '', $default_media ) : '',
						'mediaover' => $media_over ? str_replace ( ' ', '', $media_over ) : '',
						'soundover' => $soundover ? str_replace ( [ 
								' ',
								$editor_url
						], [ 
								'',
								'./medias'
						], $n->get ( $soundover )->getString () ) : '',
						'is_evaluation' => json_encode ( ( bool ) $is_evaluation ),
						// 'summary' => $is_summary,
						'stylesummary' => $isStyleSummary,
						'screenonsummary' => $isScrnSummary,
						'has_completion' => $has_completion,
						'miscmedia' => $miscmedia ? str_replace ( [ 
								' ',
								$editor_url
						], [ 
								'',
								'./medias'
						], $miscmedvalue ) : '{}',
						'metadata' => $metadata ? str_replace ( ' ', '', $metadatavalue ) : '{}',
						'children' => $chld_elem,
						'config' => $config ? str_replace ( ' ', '', $config ) : '{}'
				);
			} elseif ($n->getType () == 'screen' || $n->getType () == 'page' || $n->getType () == 'partpage' || $n->getType () == 'simple_partpage') {

				if ($ptype == 'starting') {


					$referenced_node_starting = Node::load($n->id());
					$referenced_title1_starting = $referenced_node_starting->getTitle();
					$referenced_id_starting = $referenced_node_starting->get('nid')->value;
	
									
					if($n->getType () == 'partpage'){
					$temp_id_starting = $referenced_node_starting->get('field_pp_template')->target_id;
					}elseif($n->getType () == 'screen'){
						$temp_id_starting = $referenced_node_starting->get('field_scr_template')->target_id;
					}elseif($n->getType () == 'simple_content'){
						$temp_id_starting = $referenced_node_starting->get('field_sc_template')->target_id;
					}elseif($n->getType () === 'simple_partpage' && $referenced_id_starting == $n->id () ){
						$temp_id_starting = $referenced_node_starting->get('field_spp_template')->target_id;
					}
					$referenced_node1_starting = Node::load($temp_id_starting);
					if (! empty ( $referenced_node1_starting )) {
						$referenced_title_starting = $referenced_node1_starting->getTitle();
					}
					$metadataarray = $n->get ( $metadata )->getValue () ;
					foreach($metadataarray as $metadatavs){
						$metadatavalue = $metadatavs['value'];
					}

					$miscmediaarray =  $n->get ( $miscmedia )->getValue ();
					foreach($miscmediaarray as $miscmedivs){
						$miscmedvalue = $miscmedivs['value'];
					}
					$result [] = array (
							'type' => $n->getType (),
							'name' => $n->title->value,
							'template' => $referenced_title_starting ? $referenced_title_starting : '',
							'subname' => $short_desc ? $n->get ( $short_desc )->getString () : '',
							'description' => $full_desc ? $n->get ( $full_desc )->getString () : '',
							'uid' => 'ID' . $n->id (),
							'order' => $i,
							'connexion' => $connection_param,
							'duration' => $duration ? $n->get ( $duration )->getString () : '',
							'defaultmedia' => $default_media ? str_replace ( ' ', '', $default_media ) : '',
							'mediaover' => $media_over ? str_replace ( ' ', '', $media_over ) : '',
							'soundover' => $soundover ? str_replace ( [ 
									' ',
									$editor_url
							], [ 
									'',
									'./medias'
							], $n->get ( $soundover )->getString () ) : '',
							'is_evaluation' => json_encode ( ( bool ) $is_evaluation ),
							'background_params' => $bg_param ? str_replace ( ' ', '', $bg_param ) : '',
							'summary' => json_encode ( ( bool ) $new_is_summary ),
							'htmlParam' => $field_html_params,
							'has_completion' => json_encode ( ( bool ) $has_completion ),
							'miscmedia' => $miscmedia ? str_replace ( [ 
									' ',
									$editor_url
							], [ 
									'',
									'./medias'
							], $$miscmedvalue ) : '{}',
							'metadata' => $metadata ? str_replace ( ' ', '', $metadatavalue ) : '{}',
							'children' => $chld_elem,
							'config' => $config ? str_replace ( ' ', '', $config ) : '{}'
					);
				} else {
					
				
				
				
				$referenced_node = Node::load($n->id());
				$referenced_title1 = $referenced_node->getTitle();
				$referenced_id = $referenced_node->get('nid')->value;

								
				if($n->getType () == 'partpage'){
				$temp_id = $referenced_node->get('field_pp_template')->target_id;
				$new_is_summary = $n->get ( 'field_pp_summary' )->getString ();
				$field_html_params = $n->get ( 'field_pp_html_params' )->getString ();
				}elseif($n->getType () == 'screen'){
					$temp_id = $referenced_node->get('field_scr_template')->target_id;
					$new_is_summary =	$n->get ( 'field_scr_summary' )->getString ();	
					$field_html_params = $n->get ( 'field_scr_html_params' )->getString ();			
				}elseif($n->getType () == 'simple_content'){
					$temp_id = $referenced_node->get('field_sc_template')->target_id;
					$new_is_summary =	$n->get ( 'field_sc_summary' )->getString ();
					$field_html_params = $n->get ( 'field_sc_html_params' )->getString ();				
				}elseif($n->getType () === 'simple_partpage' && $referenced_id == $n->id () ){
					$temp_id = $referenced_node->get('field_spp_template')->target_id;
					$new_is_summary =	$n->get ( 'field_spp_summary' )->getString ();	
					$field_html_params = $n->get ( 'field_spp_html_params' )->getString ();				
				}elseif($n->getType () === 'question' && $referenced_id == $n->id () ){
					$temp_id = $referenced_node->get('field_ques_template')->target_id;
					$field_html_params = $n->get ( 'field_ques_html_params' )->getString ();
				}elseif($n->getType () === 'page'){
					$new_is_summary =	$n->get ( 'field_page_summary' )->getString ();
				}
				$referenced_node1 = Node::load($temp_id);
				if (! empty ( $referenced_node1 )) {
					$referenced_title = $referenced_node1->getTitle();
				}
			
				$metadataarray = $n->get ( $metadata )->getValue () ;
				foreach($metadataarray as $metadatavs){
					$metadatavalue = $metadatavs['value'];
				}

				$miscmediaarray =  $n->get ( $miscmedia )->getValue ();
				foreach($miscmediaarray as $miscmedivs){	
					$miscmedvalue = $miscmedivs['value'];
				}
				if($n->getType () == 'screen'){				
						$comp_str = $n->get ( 'field_scr_custom_completion' )->getString ();
						if ($comp_str) {
							$has_completion = ($comp_str == 'true' || $comp_str == '1') ? true : false;
						}					
			    }elseif($n->getType () == 'page'){				
					$comp_str = $n->get ( 'field_cust_comp' )->getString ();
					if ($comp_str) {
						$has_completion = ($comp_str == 'true' || $comp_str == '1') ? true : false;
					}			

				}elseif($n->getType () == 'partpage'){				
					$comp_str = $n->get ( 'field_page_cust_comp' )->getString ();
					if ($comp_str) {
						$has_completion = ($comp_str == 'true' || $comp_str == '1') ? true : false;
					}			

				}elseif($n->getType () == 'simple_partpage'){				
					$comp_str = $n->get ( 'field_sp_cust_comp' )->getString ();
					if ($comp_str) {
						$has_completion = ($comp_str == 'true' || $comp_str == '1') ? true : false;
					}			

				}

					$result [] = array (
							'type' => $n->getType (),
							'name' => $n->title->value,
							'subname' => $short_desc ? $n->get ( $short_desc )->getString () : '',
							'template' => $referenced_title ? $referenced_title : '',
							'description' => $full_desc ? $n->get ( $full_desc )->getString () : '',
							'uid' => 'ID' . $n->id (),
							'order' => $i,
							'duration' => $duration ? $n->get ( $duration )->getString () : '',
							'defaultmedia' => $default_media ? str_replace ( ' ', '', $default_media ) : '',
							'mediaover' => $media_over ? str_replace ( ' ', '', $media_over ) : '',
							'soundover' => $soundover ? str_replace ( [ 
									' ',
									$editor_url
							], [ 
									'',
									'./medias'
							], $n->get ( $soundover )->getString () ) : '',
							'is_evaluation' => json_encode ( ( bool ) $is_evaluation ),
							'background_params' => $bg_param ? str_replace ( ' ', '', $bg_param ) : '',
							'summary' => $new_is_summary,
							'htmlParam' => $field_html_params,
							'has_completion' =>  $has_completion ,
							'miscmedia' => $miscmedia ? str_replace ( [ 
									' ',
									$editor_url
							], [ 
									'',
									'./medias'
							], $miscmedvalue ) : '{}',
							'metadata' => $metadata ? str_replace ( ' ', '', $metadatavalue ) : '{}',
							'children' => $chld_elem,
							'config' => $config ? str_replace ( ' ', '', $config ) : '{}'
					);
				}
			} elseif ($n->getType () == 'custom') {
				
				if(!empty($n->get ( 'field_custom_files_param' )->getString ())){
					$files_param = $n->get ( 'field_custom_files_param' )->getString ();
					$files_param_arr = $files_param ? json_decode ( $files_param, true ) : '[]';
				    $custom_id = $files_param_arr ['id'];
				}
		
				$result [] = array (
						'type' => $n->getType (),
						'name' => $n->title->value,
						'subname' => $short_desc ? $n->get ( $short_desc )->getString () : '',
						'description' => $full_desc ? $n->get ( $full_desc )->getString () : '',
						'uid' => 'ID' . $n->id (),
						'order' => $i,
						'duration' => $duration ? $n->get ( $duration )->getString () : '',
						'defaultmedia' => $default_media ? str_replace ( ' ', '', $default_media ) : '',
						'mediaover' => $media_over ? str_replace ( ' ', '', $media_over ) : '',
						'soundover' => $soundover ? str_replace ( [ 
								' ',
								$editor_url
						], [ 
								'',
								'./medias'
						], $n->get ( $soundover )->getString () ) : '',
						'is_evaluation' => json_encode ( ( bool ) $is_evaluation ),
						'summary' => json_encode ( ( bool ) $is_summary ),
						'custom_path' => $custom_id ? './medias/' . $custom_id . '/index.html' : '',
						'has_completion' => json_encode ( ( bool ) $has_completion ),
						'miscmedia' => $miscmedia ? str_replace ( [ 
								' ',
								$editor_url
						], [ 
								'',
								'./medias'
						], $n->get ( $miscmedia )->getValue () ) : '{}',
						'metadata' => $metadata ? str_replace ( ' ', '', $n->get ( $metadata )->getValue () ) : '{}',
						'children' => $chld_elem,
						'config' => $config ? str_replace ( ' ', '', $config ) : '{}'
				);
			} else {
				
					$referenced_node = Node::load($n->id());
					$referenced_id = $referenced_node->get('nid')->value;
					// $referenced_type = $referenced_node->get('type')->value;
					$referenced_type = $referenced_node->gettype();

					//echo '<pre>';print_r($referenced_type);die;
					if ($n->getType () == 'question') {
					$temp_id = $referenced_node->get('field_ques_template')->target_id;
				    }elseif($n->getType () == 'simple_content'){
					//if($i == 1){
						$temp_id = $referenced_node->get('field_sc_template')->target_id;					//}
						
				    }
					
					$referenced_node1 = Node::load($temp_id);
					if (! empty ( $referenced_node1 )) {
						$referenced_title = $referenced_node1->getTitle();
					}
				
				

			if(!empty($metadata)){
			$metadataarray = $n->get ( $metadata )->getValue () ;
			}			
			//echo '<Pre>';print_r($metadataarray);die;
			foreach($metadataarray as $metadatavs){
				//echo '<pre>';print_r($datav);die;
				$metadatavalue = $metadatavs['value'];
			}


			$referenced_node = Node::load($n->id());
			$referenced_title1 = $referenced_node->getTitle();
			$referenced_id = $referenced_node->get('nid')->value;

			if($n->getType () === 'question' && $referenced_id == $n->id () ){
				$temp_id = $referenced_node->get('field_ques_template')->target_id;
			}
			$referenced_node1 = Node::load($temp_id);
			if (! empty ( $referenced_node1 )) {
				$referenced_title = $referenced_node1->getTitle();
			}

			if ($n->getType () == 'question'){
				if ($prereq_param) {
					$response_json = $prereq_param;
					$response_data = json_decode($response_json, true);

					if (isset($response_data['checked']) && $response_data['checked'] === true) {
						$has_completion = true;
					} else {
						$has_completion = false;
					}				
				}
		}
			

				$result [] = array (
						'type' => $n->getType (),
						'name' => $n->title->value,
						'template' => $referenced_title ? $referenced_title : '',
						'subname' => $short_desc ? $n->get ( $short_desc )->getString () : '',
						'description' => $full_desc ? $n->get ( $full_desc )->getString () : '',
						'uid' => 'ID' . $n->id (),
						'order' => $i,
						'duration' => $duration ? $n->get ( $duration )->getString () : '',
						'defaultmedia' => $default_media ? str_replace ( ' ', '', $default_media ) : '',
						'mediaover' => $media_over ? str_replace ( ' ', '', $media_over ) : '',
						'soundover' => $soundover ? str_replace ( [ 
								' ',
								$editor_url
						], [ 
								'',
								'./medias'
						], $n->get ( $soundover )->getString () ) : '',
						'is_evaluation' => json_encode ( ( bool ) $is_evaluation ),
						'summary' => json_encode ( ( bool ) $is_summary ),
						'has_completion' => json_encode ( ( bool ) $has_completion ),
						'miscmedia' => $miscmedia ? str_replace ( [ 
								' ',
								$editor_url
						], [ 
								'',
								'./medias'
						], $n->get ( $miscmedia )->getValue () ) : '{}',
						'background_params' => $bg_param ? str_replace ( ' ', '', $bg_param ) : '',
						// 'metadata' => $metadata ? str_replace ( ' ', '', $n->get ( $metadata )->getValue () ) : '{}',
						'metadata' => $metadata ? str_replace ( ' ', '', $metadatavalue ) : '{}',
						'children' => $chld_elem,
						'config' => $config ? str_replace ( ' ', '', $config ) : '{}'
				);
			}
		}

		return $result;
	}
	public function getCourseJson($id, $data = [ ], $style_id = '') {
		$node = Node::load ( $id );
		$node_type = $node->getType ();
		$title = $node->getTitle ();
		$prereq = $data ['prereq'];
		$orientation = $data ['orientation'];

		if ($node_type == 'course') {
			$short_desc = $this->getFieldNameByKey ( $node_type, 'short' );
			$full_desc = $this->getFieldNameByKey ( $node_type, 'full' );
			$duration = $this->getFieldNameByKey ( $node_type, 'duration' );
			$isEvaluation = $this->getFieldNameByKey ( $node_type, 'isevaluation' );
			$crs_chld_field = $this->getFieldNameByKey ( $node_type, 'children' );
			$objectives = $this->getFieldNameByKey ( $node_type, 'objective' );
			$keywords = $this->getFieldNameByKey ( $node_type, 'keyword' );
			$language = 'field_crs_lang';
			$version = $this->getFieldNameByKey ( $node_type, 'version' );
			$words = $this->getFieldNameByKey ( $node_type, 'number' );
		}

		$crs_chld = $node->get ( $crs_chld_field )->getValue ();
		$crs_chld = $this->getTargetIds ( $crs_chld );
		$crs_children = Node::loadMultiple ( $crs_chld );
		$str_elements = [ ];
		$stng_elements = [ ];
		$anx_elements = [ ];
		//$summary = false;
		$styleSummary = false;
		$screenOnSummary = false;
		foreach ( $crs_children as $chld ) {
			$chld_field = $this->getNodeRelFieldName ( $chld->getType () );
			$chld_field_arr = $chld->get ( $chld_field )->getValue ();
			$chld_field_arr = $this->getTargetIds ( $chld_field_arr );
			if ($chld->getType () == 'structure') {
				$style_summary = $chld->get ( 'field_struct_style_summary' )->value;
				$styleSummary = ($style_summary == 'true' || $style_summary == '1') ? true : false;
				$styleSummary = json_encode ( ( bool ) $styleSummary );
				$screen_on_summary = $chld->get ( 'field_struct_screen_on_summary' )->value;
				$screenOnSummary = ($screen_on_summary == 'true' || $screen_on_summary == '1') ? true : false;
				$screenOnSummary = json_encode ( ( bool ) $screenOnSummary );
				$str_elements = $this->getChildrenJsonByChildren ( $chld_field_arr, 'structure' );
				$str_elements = str_replace ( [ 
						'\\',
						$editor_url
				], [ 
						'',
						'medias'
				], (json_encode ( $str_elements, JSON_UNESCAPED_UNICODE )) );
				$str_elements = str_replace ( [ 
						'"true"',
						'"false"'
				], [ 
						'true',
						'false'
				], $str_elements );
			} elseif ($chld->getType () == 'starting') {
				$stng_elements = $this->getChildrenJsonByChildren ( $chld_field_arr, 'starting' );
				$stng_elements = str_replace ( [ 
						'\\',
						$editor_url
				], [ 
						'',
						'medias'
				], (json_encode ( $stng_elements, JSON_UNESCAPED_UNICODE )) );
				$stng_elements = str_replace ( [ 
						'"true"',
						'"false"'
				], [ 
						'true',
						'false'
				], $stng_elements );
			} elseif ($chld->getType () == 'annexes') {
				$anx_elements = $this->getChildrenJsonByChildren ( $chld_field_arr, 'annexes' );
				$anx_elements = str_replace ( [ 
						'\\',
						$editor_url
				], [ 
						'',
						'medias'
				], (json_encode ( $anx_elements, JSON_UNESCAPED_UNICODE )) );
				$anx_elements = str_replace ( [ 
						'"true"',
						'"false"'
				], [ 
						'true',
						'false'
				], $anx_elements );
			}
		}

		$lang = $node->get ( $language )->getString ();
		if (strlen ( $lang ) > 2) {
			$lang_code = $this->getLanguageCode ( $lang );
		} else {
			$lang_code = $lang;
		}

		if ($lang == 'English' || $lang == 'en') {
			$country_code = 'GB';
		} elseif ($lang == 'French' || $lang == 'fr') {
			$country_code = 'FR';
		} elseif ($lang == 'Japanese' || $lang == 'jp') {
			$country_code = 'JP';
		} elseif ($lang == 'Chinese' || $lang == 'cn') {
			$country_code = 'CN';
		} elseif ($lang == 'German' || $lang == 'de') {
			$country_code = 'DE';
		} elseif ($lang == 'Spanish' || $lang == 'es') {
			$country_code = 'ES';
		} elseif ($lang == 'Polish' || $lang == 'pl') {
			$country_code = 'PL';
		} elseif ($lang == 'Swedish' || $lang == 'sv') {
			$country_code = 'SV';
		} elseif ($lang == 'Finnish' || $lang == 'fi') {
			$country_code = 'FI';
		} elseif ($lang == 'Dutch' || $lang == 'nn') {
			$country_code = 'NN';
		}

		// $iso_code = $this->country_code_to_locale($country_code,$lang_code);
		$iso_code = $lang_code . '-' . $country_code;

		$no_of_words = $node->get ( $words )->getString ();
		$words = $no_of_words ? $no_of_words : 0;

		$is_evaluation = $node->get ( $isEvaluation )->getString ();
		$is_evaluation = ($is_evaluation == "true" or $is_evaluation == "1") ? true : false;

		$editor_url = file_url_transform_relative ( file_create_url ( 'public://editor' ) );

		$file_system = \Drupal::service ( 'file_system' );
		$crs_folder = 'public://editor/course/' . $id;
		$abs_crs_path = $file_system->realpath ( $crs_folder );
		$blm_json = file_get_contents ( $abs_crs_path . '/blmconfig.json', FILE_USE_INCLUDE_PATH );
		$blmJsonData = json_decode ( $blm_json, true );
		$navigation = $node->get ( 'field_crs_nav_param' )->value;
		if ($navigation) {
			$nav_arr = json_decode ( $navigation, true );
			if ($orientation && $blmJsonData ['display'] != 'desktop') {
				$ori_arr = [ 
						'mobileorientation' => $orientation
				];
				$nav_arr = array_merge ( $ori_arr, $nav_arr );
			}
			if ($prereq == 'no prerequisite') {
				$prereq_arr = [ 
						'forcenoprerequisite' => true
				];
				$nav_arr = array_merge ( $prereq_arr, $nav_arr );
			}elseif($prereq == 'default') {
				$prereq_arr = [ 
						'forcenoprerequisite' => false
				];
				$nav_arr = array_merge ( $prereq_arr, $nav_arr );
			}
			if ($data ['exit']) {
				$exit_arr = [ 
						'exit' => true
				];
				$nav_arr = array_merge ( $exit_arr, $nav_arr );
			}

			$navigation = json_encode ( $nav_arr );
		} elseif (! $navigation) {
			$nav_arr = json_decode ( $blm_json, true ) ['navigation'];
			if ($prereq == 'no prerequisite') {
				$prereq_arr = [ 
						'forcenoprerequisite' => true
				];
				$nav_arr = array_merge ( $prereq_arr, $nav_arr );
			}elseif($prereq == 'default') {
					$prereq_arr = [ 
							'forcenoprerequisite' => false
					];
					$nav_arr = array_merge ( $prereq_arr, $nav_arr );
				}
			
			if ($orientation && $blmJsonData ['display'] != 'desktop') {
				$ori_arr = [ 
						'mobileorientation' => $orientation
				];
				$nav_arr = array_merge ( $ori_arr, $nav_arr );
			}
			if ($data ['exit']) {
				$exit_arr = [ 
						'exit' => true
				];
				$nav_arr = array_merge ( $exit_arr, $nav_arr );
			}
			$navigation = $blm_json ? json_encode ( $nav_arr ) : '{}';
		}

		$completion = $node->get ( 'field_crs_comp_param' )->value;
		$completion = $completion ? $completion : '{}';

		$evaluation = $node->get ( 'field_crs_eval_param' )->value;
		$evaluation = $evaluation ? $evaluation : '{}';

		$crs_json = '{"type":"course",
				"name":"' . $title . '",
				"subname":"' . $node->get ( $short_desc )->getString () . '",
				"description":"' . $node->get ( $full_desc )->getString () . '",
				"uid":"ID' . $id . '",
				"style_id": "' . $style_id . '",
				"order":1,
				"duration":"' . $node->get ( $duration )->getString () . '",
				"defaultmedia":"",
				"mediaover":"",
				"soundover":"",
				"is_evaluation":' . json_encode ( $is_evaluation ) . ',
				"stylesummary": ' . $styleSummary . ',
				"screenonsummary": ' . $screenOnSummary . ',
				"has_completion":true,
				"children":' . $str_elements . ',
				"starting":' . $stng_elements . ',
				"annexes":' . $anx_elements . ',
				"properties":{
					"language":"' . $iso_code . '",
					"keyword":"' . $node->get ( $keywords )->getString () . '",
					"learning_objectives":"' . $node->get ( $objectives )->getString () . '",
					"number_of_words":' . $words . ',
					"version":"' . $node->get ( $version )->getString () . '"
				},
				"config":{
					"completion":' . $completion . ',
					"navigation":' . $navigation . ',
					"evaluation":' . $evaluation . '
				}
			}';
		return $crs_json;
	}

	/**
	 * Handle course export.
	 *
	 * @return \Symfony\Component\HttpFoundation\JsonResponse
	 */
	public function exportCourse() {
		\Drupal::service ( 'page_cache_kill_switch' )->trigger ();
		$content = json_decode ( \Drupal::request ()->getContent (), true );
		$crs_id = $content ['crs_id'];
		$prereq = $content ['prereq'];
		$orientation = $content ['orientation'] ?? '';

		if ($crs_id) {

			$file_system = \Drupal::service ( 'file_system' );

			$crs = Node::load ( $crs_id );

			//$abs_crs_path = $this->courseHtml ( $crs_id, $content );
			if($content ['ex_options'] == "EXPORT TRANSLATION")
			{
				$abs_crs_path = $this->courseHtmlTranslation ( $crs_id, $content );
			} else {
				$abs_crs_path = $this->courseHtml ( $crs_id, $content );
			}

			/*
			 * foreach ($index_file as $key => $value){
			 * if(stristr($value, 'window.courseDefinition = {}')){
			 * $index_file[$key] = 'window.courseDefinition = '.$crsJson;
			 * }
			 * elseif (stristr($value, 'id="data"')){
			 * $templates = implode('',$temp_htmls);
			 * $index_file[$key] = $value . $templates;
			 * }
			 * }
			 */

			// $index_file = array_map(
			// function ($index_file) {
			// return stristr($index_file, 'window.courseDefinition = {}') ? 'window.courseDefinition = '.$crs_json : $index_file;
			// },$index_file);

			// file_put_contents($abs_crs_path.'/index.html', implode('', $index_file), FILE_USE_INCLUDE_PATH);

			// $output = str_replace(array('{}','id="data"'), array('{'.$crs_json.'}','id="none"'), $file_str);
			// $output = html_entity_decode($output);
			// fwrite($index_file, $output);
			// fclose($index_file);
			// write the new file
			// $edited_html = file_put_contents($abs_crs_path.'/index.html', $output, FILE_USE_INCLUDE_PATH);

			$export_file_path = $file_system->realpath ( 'public://editor/course/' . $crs_id );
			$export_folder = $file_system->realpath ( 'public://editor/course/' );

			//$zip_name = $crs->getTitle () . '_web_' . date ( 'ymdHi' );
			if($content ['ex_options'] == "EXPORT TRANSLATION") { 
				$zip_name = $crs->getTitle () . '_translation_' . date ( 'ymdHi' );
			} else {
				$zip_name = $crs->getTitle () . '_web_' . date ( 'ymdHi' );
			}
			$export_file = $export_folder . '/' . $zip_name . '.zip';

			// Copy external files from course.
			$sid = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $crs_id )->execute ();

			$sid = implode ( '', $sid );

			$media_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course', $crs_id )->condition ( 'field_cm_course_style', $sid )->execute ();

			if (! empty ( $media_ids )) {
				$medias = Node::loadMultiple ( $media_ids );
				foreach ( $medias as $m ) {
					$ext_path = $m->get ( 'field_cm_file_path' )->getString ();
					$ext_file_name = end ( explode ( 'external/', $ext_path ) );
					if (file_exists ( $export_file_path . '/external/' . $ext_file_name )) {
						unlink ( $export_file_path . '/external/' . $ext_file_name );
					}

					$abs_ext_path = $file_system->realpath ( $ext_path );
					// $file_data = file_get_contents($ext_path, FILE_USE_INCLUDE_PATH);
					// $fileRepository = \Drupal::service('file.repository');
					// $filesaved = $fileRepository->copy($abs_ext_path, 'public://editor/course/'.$crs_id . '/external/', FileSystemInterface::EXISTS_REPLACE);

					$filesaved = $file_system->copy ( $abs_ext_path, $export_file_path . '/external/', FileSystemInterface::EXISTS_REPLACE );

					// $this->recurseCopy($abs_ext_path, $export_file_path . '/external/');
				}
			}

			if ($content ['ex_options'] == 'EXPORT WEB' || empty ( $content ['ex_options'] )) {
				$zip = new \ZipArchive ();
				$zip->open ( $export_file, \ZipArchive::CREATE | \ZipArchive::OVERWRITE );
				$files = new \RecursiveIteratorIterator ( new \RecursiveDirectoryIterator ( $export_file_path ), \RecursiveIteratorIterator::LEAVES_ONLY );
				foreach ( $files as $zipfile ) {
					if (! $zipfile->isDir ()) {
						$filePath = $zipfile->getRealPath ();
						$relativePath = substr ( $filePath, strlen ( $export_file_path ) + 1 );
						$zip->addFile ( $zipfile->getRealPath (), $relativePath );
					}
				}
				$zip->close ();
			} elseif ($content ['ex_options'] == 'EXPORT LMS') {
				if ($content ['version_select'] && $content ['version_select'] == 'default') {
					$zip_name = $crs->getTitle () . '_scorm_2004_' . date ( 'ymdHi' );
				} elseif ($content ['version_select'] && $content ['version_select'] == 'scorm-1.2') {
					$zip_name = $crs->getTitle () . '_scorm_1.2_' . date ( 'ymdHi' );
				}
				$export_file = $export_folder . '/' . $zip_name . '.zip';
				$scorm_path = ($content ['version_select'] == 'default') ? 'public://scorm/scorm_2004' : 'public://scorm/scorm_1.2';

				$scorm_real_path = $file_system->realpath ( $scorm_path );
				if (file_exists ( $scorm_real_path )) {
					$this->removeDirectory ( $scorm_real_path );
				}
				mkdir ( $scorm_path, 0777, true );

				$scorm_zip_path = ($content ['version_select'] == 'default') ? 'public://scorm/scorm2004_base_export.zip' : 'public://scorm/scorm12_base_export.zip';
				$scorm_zip_abs_path = $file_system->realpath ( $scorm_zip_path );
				$scorm_zip = new \ZipArchive ();
				$scorm_zip->open ( $scorm_zip_abs_path );
				$scorm_zip->extractTo ( $scorm_real_path );
				$scorm_zip->close ();

				$dest_data_path = $scorm_path . '/data';
				$this->recurseCopy ( $export_file_path, $dest_data_path );

				$lmsman_path = $scorm_path . '/imsmanifest.xml';
				$lmsman_abs_path = $scorm_real_path . '/imsmanifest.xml';

				$xml = htmlentities ( file_get_contents ( $lmsman_abs_path ) );

				$src_arr = [ 
						'MANIFEST-UNIQ_ID',
						'ORG-UNIQ_ID_1',
						'ORG-UNIQ_ID',
						'ORG-TITLE',
						'COURSE-TITLE',
						'ITEM-UNIQ_ID_1',
						'RES-UNIQ_ID_1'
				];
				$dest_arr = [ 
						'COURSE' . $crs_id,
						'ORG' . $crs_id,
						'ORG' . $crs_id,
						$crs->getTitle (),
						$crs->getTitle (),
						'ITEM' . $crs_id,
						'RES' . $crs_id
				];

				$new_xml = str_replace ( $src_arr, $dest_arr, $xml );

				if (file_exists ( $lmsman_abs_path )) {
					unlink ( $lmsman_abs_path );
				}

				$xml_str = simplexml_load_string ( html_entity_decode ( $new_xml ) );
				$files_list = $this->getFilesFromDir ( $export_file_path, $crs_id );
				foreach ( $files_list as $f ) {
					if ($f != 'index.html') {
						$file_ele = $xml_str->resources->resource [0]->addChild ( "file" );
						$file_ele->addAttribute ( "href", "data" . $f );
						$xml_str->asXML ( $lmsman_abs_path );
					}
				}

				/*
				 * $xml_file = fopen($lmsman_abs_path, 'w+');
				 * fwrite($xml_file, htmlentities($new_xml));
				 * fclose($xml_file);
				 */

				$zip = new \ZipArchive ();
				$zip->open ( $export_file, \ZipArchive::CREATE | \ZipArchive::OVERWRITE );
				$files = new \RecursiveIteratorIterator ( new \RecursiveDirectoryIterator ( $scorm_real_path ), \RecursiveIteratorIterator::LEAVES_ONLY );

				foreach ( $files as $zipfile ) {
					if (! $zipfile->isDir ()) {
						$filePath = $zipfile->getRealPath ();
						$relativePath = substr ( $filePath, strlen ( $scorm_real_path ) + 1 );
						$zip->addFile ( $zipfile->getRealPath (), $relativePath );
					}
				}
				$zip->close ();
			} elseif ($content ['ex_options'] == 'EXPORT TRANSLATION') {
				$zip = new \ZipArchive ();
				$zip->open ( $export_file, \ZipArchive::CREATE | \ZipArchive::OVERWRITE );
				$files = new \RecursiveIteratorIterator ( new \RecursiveDirectoryIterator ( $export_file_path ), \RecursiveIteratorIterator::LEAVES_ONLY );
				foreach ( $files as $zipfile ) {
					if (! $zipfile->isDir ()) {
						$filePath = $zipfile->getRealPath ();
						$relativePath = substr ( $filePath, strlen ( $export_file_path ) + 1 );
						$zip->addFile ( $zipfile->getRealPath (), $relativePath );
					}
				}
				$zip->close ();
			}

			$final_file_uri = file_create_url ( 'public://editor/course/' . $zip_name . '.zip' );

			return new JsonResponse ( [ 
					'result' => 'OK',
					'file_uri' => $final_file_uri
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'Course id is invalid'
			] );
		}
	}
	
	public function recurseCopy($src, $dst) {
		$file_system = \Drupal::service('file_system');
		$dir = opendir ( $src );
		if (! file_exists ( $dst )) {
			mkdir ( $dst );
		}
		while ( false !== ($file = readdir ( $dir )) ) {
			if (($file != '.') && ($file != '..')) {
				if (is_dir ( $src . '/' . $file )) {
					$this->recurseCopy ( $src . '/' . $file, $dst . '/' . $file );
				} else {
					//$fileData = file_get_contents($src . '/' . $file);
					//$file = file_save_data($fileData, $dst . '/' . $file, FileSystemInterface::EXISTS_REPLACE);
					$file_copy = $file_system->copy ( $src . '/' . $file, $dst . '/' . $file );
				}
			}
		}
		closedir ( $dir );
	}
	
	public function getFilesFromDir($dir_path, $crs_id) {
		$dir = opendir ( $dir_path );
		$arr = [ ];
		$sub_files = [ ];
		while ( false !== ($file = readdir ( $dir )) ) {
			if (($file != '.') && ($file != '..')) {
				if (is_dir ( $dir_path . '/' . $file )) {
					$sub_files = $this->getFilesFromDir ( $dir_path . '/' . $file, $crs_id );
					if (! empty ( $sub_files )) {
						$arr = array_unique ( array_merge ( $arr, $sub_files ), SORT_REGULAR );
					}
				} else {
					$file_path = end ( explode ( $crs_id, $dir_path ) );
					if (strpos ( $file, $crs_id ) !== FALSE) {
						$file = end ( explode ( $crs_id . '/', $file ) );
					}
					$arr [] = $file_path . '/' . $file;
				}
			}
		}
		closedir ( $dir );

		return $arr;
	}
	public function removeDirectory($dir) {
		$it = new \RecursiveDirectoryIterator ( $dir, \RecursiveDirectoryIterator::SKIP_DOTS );
		$files = new \RecursiveIteratorIterator ( $it, \RecursiveIteratorIterator::CHILD_FIRST );
		foreach ( $files as $file ) {
			if ($file->isDir ()) {
				rmdir ( $file->getRealPath () );
			} else {
				unlink ( $file->getRealPath () );
			}
		}
		rmdir ( $dir );
		return;
	}

	/**
	 * Get locale code
	 */
	public function getLocaleCode() {
		return [ 
				'aa' => 'Afar',
				'bs' => 'Bosnian',
				'ee_TG' => 'Ewe (Togo)',
				'ms' => 'Malay',
				'kam_KE' => 'Kamba (Kenya)',
				'mt' => 'Maltese',
				'ha' => 'Hausa',
				'es_HN' => 'Spanish (Honduras)',
				'ml_IN' => 'Malayalam (India)',
				'ro_MD' => 'Romanian (Moldova)',
				'kab_DZ' => 'Kabyle (Algeria)',
				'he' => 'Hebrew',
				'es_CO' => 'Spanish (Colombia)',
				'my' => 'Burmese',
				'es_PA' => 'Spanish (Panama)',
				'az_Latn' => 'Azerbaijani (Latin)',
				'mer' => 'Meru',
				'en_NZ' => 'English (New Zealand)',
				'xog_UG' => 'Soga (Uganda)',
				'sg' => 'Sango',
				'fr_GP' => 'French (Guadeloupe)',
				'sr_Cyrl_BA' => 'Serbian (Cyrillic, Bosnia and Herzegovina)',
				'hi' => 'Hindi',
				'fil_PH' => 'Filipino (Philippines)',
				'lt_LT' => 'Lithuanian (Lithuania)',
				'si' => 'Sinhala',
				'en_MT' => 'English (Malta)',
				'si_LK' => 'Sinhala (Sri Lanka)',
				'luo_KE' => 'Luo (Kenya)',
				'it_CH' => 'Italian (Switzerland)',
				'teo' => 'Teso',
				'mfe' => 'Morisyen',
				'sk' => 'Slovak',
				'uz_Cyrl_UZ' => 'Uzbek (Cyrillic, Uzbekistan)',
				'sl' => 'Slovenian',
				'rm_CH' => 'Romansh (Switzerland)',
				'az_Cyrl_AZ' => 'Azerbaijani (Cyrillic, Azerbaijan)',
				'fr_GQ' => 'French (Equatorial Guinea)',
				'kde' => 'Makonde',
				'sn' => 'Shona',
				'cgg_UG' => 'Chiga (Uganda)',
				'so' => 'Somali',
				'fr_RW' => 'French (Rwanda)',
				'es_SV' => 'Spanish (El Salvador)',
				'mas_TZ' => 'Masai (Tanzania)',
				'en_MU' => 'English (Mauritius)',
				'sq' => 'Albanian',
				'hr' => 'Croatian',
				'sr' => 'Serbian',
				'en_PH' => 'English (Philippines)',
				'ca' => 'Catalan',
				'hu' => 'Hungarian',
				'mk_MK' => 'Macedonian (Macedonia)',
				'fr_TD' => 'French (Chad)',
				'nb' => 'Norwegian Bokmål',
				'sv' => 'Swedish',
				'kln_KE' => 'Kalenjin (Kenya)',
				'sw' => 'Swahili',
				'nd' => 'North Ndebele',
				'sr_Latn' => 'Serbian (Latin)',
				'el_GR' => 'Greek (Greece)',
				'hy' => 'Armenian',
				'ne' => 'Nepali',
				'el_CY' => 'Greek (Cyprus)',
				'es_CR' => 'Spanish (Costa Rica)',
				'fo_FO' => 'Faroese (Faroe Islands)',
				'pa_Arab_PK' => 'Punjabi (Arabic, Pakistan)',
				'seh' => 'Sena',
				'ar_YE' => 'Arabic (Yemen)',
				'ja_JP' => 'Japanese (Japan)',
				'ur_PK' => 'Urdu (Pakistan)',
				'pa_Guru' => 'Punjabi (Gurmukhi)',
				'gl_ES' => 'Galician (Spain)',
				'zh_Hant_HK' => 'Chinese (Traditional Han, Hong Kong SAR China)',
				'ar_EG' => 'Arabic (Egypt)',
				'nl' => 'Dutch',
				'th_TH' => 'Thai (Thailand)',
				'es_PE' => 'Spanish (Peru)',
				'fr_KM' => 'French (Comoros)',
				'nn' => 'Norwegian Nynorsk',
				'kk_Cyrl_KZ' => 'Kazakh (Cyrillic, Kazakhstan)',
				'kea' => 'Kabuverdianu',
				'lv_LV' => 'Latvian (Latvia)',
				'kln' => 'Kalenjin',
				'tzm_Latn' => 'Central Morocco Tamazight (Latin)',
				'yo' => 'Yoruba',
				'gsw_CH' => 'Swiss German (Switzerland)',
				'ha_Latn_GH' => 'Hausa (Latin, Ghana)',
				'is_IS' => 'Icelandic (Iceland)',
				'pt_BR' => 'Portuguese (Brazil)',
				'cs' => 'Czech',
				'en_PK' => 'English (Pakistan)',
				'fa_IR' => 'Persian (Iran)',
				'zh_Hans_SG' => 'Chinese (Simplified Han, Singapore)',
				'luo' => 'Luo',
				'ta' => 'Tamil',
				'fr_TG' => 'French (Togo)',
				'kde_TZ' => 'Makonde (Tanzania)',
				'mr_IN' => 'Marathi (India)',
				'ar_SA' => 'Arabic (Saudi Arabia)',
				'ka_GE' => 'Georgian (Georgia)',
				'mfe_MU' => 'Morisyen (Mauritius)',
				'id' => 'Indonesian',
				'fr_LU' => 'French (Luxembourg)',
				'de_LU' => 'German (Luxembourg)',
				'ru_MD' => 'Russian (Moldova)',
				'cy' => 'Welsh',
				'zh_Hans_HK' => 'Chinese (Simplified Han, Hong Kong SAR China)',
				'te' => 'Telugu',
				'bg_BG' => 'Bulgarian (Bulgaria)',
				'shi_Latn' => 'Tachelhit (Latin)',
				'ig' => 'Igbo',
				'ses' => 'Koyraboro Senni',
				'ii' => 'Sichuan Yi',
				'es_BO' => 'Spanish (Bolivia)',
				'th' => 'Thai',
				'ko_KR' => 'Korean (South Korea)',
				'ti' => 'Tigrinya',
				'it_IT' => 'Italian (Italy)',
				'shi_Latn_MA' => 'Tachelhit (Latin, Morocco)',
				'pt_MZ' => 'Portuguese (Mozambique)',
				'ff_SN' => 'Fulah (Senegal)',
				'haw' => 'Hawaiian',
				'zh_Hans' => 'Chinese (Simplified Han)',
				'so_KE' => 'Somali (Kenya)',
				'bn_IN' => 'Bengali (India)',
				'en_UM' => 'English (U.S. Minor Outlying Islands)',
				'to' => 'Tonga',
				'id_ID' => 'Indonesian (Indonesia)',
				'uz_Cyrl' => 'Uzbek (Cyrillic)',
				'en_GU' => 'English (Guam)',
				'es_EC' => 'Spanish (Ecuador)',
				'en_US_POSIX' => 'English (United States, Computer)',
				'sr_Latn_BA' => 'Serbian (Latin, Bosnia and Herzegovina)',
				'is' => 'Icelandic',
				'luy' => 'Luyia',
				'tr' => 'Turkish',
				'en_NA' => 'English (Namibia)',
				'it' => 'Italian',
				'da' => 'Danish',
				'bo_IN' => 'Tibetan (India)',
				'vun_TZ' => 'Vunjo (Tanzania)',
				'ar_SD' => 'Arabic (Sudan)',
				'uz_Latn_UZ' => 'Uzbek (Latin, Uzbekistan)',
				'az_Latn_AZ' => 'Azerbaijani (Latin, Azerbaijan)',
				'de' => 'German',
				'es_GQ' => 'Spanish (Equatorial Guinea)',
				'ta_IN' => 'Tamil (India)',
				'de_DE' => 'German (Germany)',
				'fr_FR' => 'French (France)',
				'rof_TZ' => 'Rombo (Tanzania)',
				'ar_LY' => 'Arabic (Libya)',
				'en_BW' => 'English (Botswana)',
				'asa' => 'Asu',
				'zh' => 'Chinese',
				'ha_Latn' => 'Hausa (Latin)',
				'fr_NE' => 'French (Niger)',
				'es_MX' => 'Spanish (Mexico)',
				'bem_ZM' => 'Bemba (Zambia)',
				'zh_Hans_CN' => 'Chinese (Simplified Han, China)',
				'bn_BD' => 'Bengali (Bangladesh)',
				'pt_GW' => 'Portuguese (Guinea-Bissau)',
				'om' => 'Oromo',
				'jmc' => 'Machame',
				'de_AT' => 'German (Austria)',
				'kk_Cyrl' => 'Kazakh (Cyrillic)',
				'sw_TZ' => 'Swahili (Tanzania)',
				'ar_OM' => 'Arabic (Oman)',
				'et_EE' => 'Estonian (Estonia)',
				'or' => 'Oriya',
				'da_DK' => 'Danish (Denmark)',
				'ro_RO' => 'Romanian (Romania)',
				'zh_Hant' => 'Chinese (Traditional Han)',
				'bm_ML' => 'Bambara (Mali)',
				'ja' => 'Japanese',
				'fr_CA' => 'French (Canada)',
				'naq' => 'Nama',
				'zu' => 'Zulu',
				'en_IE' => 'English (Ireland)',
				'ar_MA' => 'Arabic (Morocco)',
				'es_GT' => 'Spanish (Guatemala)',
				'uz_Arab_AF' => 'Uzbek (Arabic, Afghanistan)',
				'en_AS' => 'English (American Samoa)',
				'bs_BA' => 'Bosnian (Bosnia and Herzegovina)',
				'am_ET' => 'Amharic (Ethiopia)',
				'ar_TN' => 'Arabic (Tunisia)',
				'haw_US' => 'Hawaiian (United States)',
				'ar_JO' => 'Arabic (Jordan)',
				'fa_AF' => 'Persian (Afghanistan)',
				'uz_Latn' => 'Uzbek (Latin)',
				'en_BZ' => 'English (Belize)',
				'nyn_UG' => 'Nyankole (Uganda)',
				'ebu_KE' => 'Embu (Kenya)',
				'te_IN' => 'Telugu (India)',
				'cy_GB' => 'Welsh (United Kingdom)',
				'uk' => 'Ukrainian',
				'nyn' => 'Nyankole',
				'en_JM' => 'English (Jamaica)',
				'en_US' => 'English (United States)',
				'fil' => 'Filipino',
				'ar_KW' => 'Arabic (Kuwait)',
				'af_ZA' => 'Afrikaans (South Africa)',
				'en_CA' => 'English (Canada)',
				'fr_DJ' => 'French (Djibouti)',
				'ti_ER' => 'Tigrinya (Eritrea)',
				'ig_NG' => 'Igbo (Nigeria)',
				'en_AU' => 'English (Australia)',
				'ur' => 'Urdu',
				'fr_MC' => 'French (Monaco)',
				'pt_PT' => 'Portuguese (Portugal)',
				'pa' => 'Punjabi',
				'es_419' => 'Spanish (Latin America)',
				'fr_CD' => 'French (Congo - Kinshasa)',
				'en_SG' => 'English (Singapore)',
				'bo_CN' => 'Tibetan (China)',
				'kn_IN' => 'Kannada (India)',
				'sr_Cyrl_RS' => 'Serbian (Cyrillic, Serbia)',
				'lg_UG' => 'Ganda (Uganda)',
				'gu_IN' => 'Gujarati (India)',
				'ee' => 'Ewe',
				'nd_ZW' => 'North Ndebele (Zimbabwe)',
				'bem' => 'Bemba',
				'uz' => 'Uzbek',
				'sw_KE' => 'Swahili (Kenya)',
				'sq_AL' => 'Albanian (Albania)',
				'hr_HR' => 'Croatian (Croatia)',
				'mas_KE' => 'Masai (Kenya)',
				'el' => 'Greek',
				'ti_ET' => 'Tigrinya (Ethiopia)',
				'es_AR' => 'Spanish (Argentina)',
				'pl' => 'Polish',
				'en' => 'English',
				'eo' => 'Esperanto',
				'shi' => 'Tachelhit',
				'kok' => 'Konkani',
				'fr_CF' => 'French (Central African Republic)',
				'fr_RE' => 'French (Réunion)',
				'mas' => 'Masai',
				'rof' => 'Rombo',
				'ru_UA' => 'Russian (Ukraine)',
				'yo_NG' => 'Yoruba (Nigeria)',
				'dav_KE' => 'Taita (Kenya)',
				'gv_GB' => 'Manx (United Kingdom)',
				'pa_Arab' => 'Punjabi (Arabic)',
				'es' => 'Spanish',
				'teo_UG' => 'Teso (Uganda)',
				'ps' => 'Pashto',
				'es_PR' => 'Spanish (Puerto Rico)',
				'fr_MF' => 'French (Saint Martin)',
				'et' => 'Estonian',
				'pt' => 'Portuguese',
				'eu' => 'Basque',
				'ka' => 'Georgian',
				'rwk_TZ' => 'Rwa (Tanzania)',
				'nb_NO' => 'Norwegian Bokmål (Norway)',
				'fr_CG' => 'French (Congo - Brazzaville)',
				'cgg' => 'Chiga',
				'zh_Hant_TW' => 'Chinese (Traditional Han, Taiwan)',
				'sr_Cyrl_ME' => 'Serbian (Cyrillic, Montenegro)',
				'lag' => 'Langi',
				'ses_ML' => 'Koyraboro Senni (Mali)',
				'en_ZW' => 'English (Zimbabwe)',
				'ak_GH' => 'Akan (Ghana)',
				'vi_VN' => 'Vietnamese (Vietnam)',
				'sv_FI' => 'Swedish (Finland)',
				'to_TO' => 'Tonga (Tonga)',
				'fr_MG' => 'French (Madagascar)',
				'fr_GA' => 'French (Gabon)',
				'fr_CH' => 'French (Switzerland)',
				'de_CH' => 'German (Switzerland)',
				'es_US' => 'Spanish (United States)',
				'ki' => 'Kikuyu',
				'my_MM' => 'Burmese (Myanmar [Burma])',
				'vi' => 'Vietnamese',
				'ar_QA' => 'Arabic (Qatar)',
				'ga_IE' => 'Irish (Ireland)',
				'rwk' => 'Rwa',
				'bez' => 'Bena',
				'ee_GH' => 'Ewe (Ghana)',
				'kk' => 'Kazakh',
				'as_IN' => 'Assamese (India)',
				'ca_ES' => 'Catalan (Spain)',
				'kl' => 'Kalaallisut',
				'fr_SN' => 'French (Senegal)',
				'ne_IN' => 'Nepali (India)',
				'km' => 'Khmer',
				'ms_BN' => 'Malay (Brunei)',
				'ar_LB' => 'Arabic (Lebanon)',
				'ta_LK' => 'Tamil (Sri Lanka)',
				'kn' => 'Kannada',
				'ur_IN' => 'Urdu (India)',
				'fr_CI' => 'French (Côte d’Ivoire)',
				'ko' => 'Korean',
				'ha_Latn_NG' => 'Hausa (Latin, Nigeria)',
				'sg_CF' => 'Sango (Central African Republic)',
				'om_ET' => 'Oromo (Ethiopia)',
				'zh_Hant_MO' => 'Chinese (Traditional Han, Macau SAR China)',
				'uk_UA' => 'Ukrainian (Ukraine)',
				'fa' => 'Persian',
				'mt_MT' => 'Maltese (Malta)',
				'ki_KE' => 'Kikuyu (Kenya)',
				'luy_KE' => 'Luyia (Kenya)',
				'kw' => 'Cornish',
				'pa_Guru_IN' => 'Punjabi (Gurmukhi, India)',
				'en_IN' => 'English (India)',
				'kab' => 'Kabyle',
				'ar_IQ' => 'Arabic (Iraq)',
				'ff' => 'Fulah',
				'en_TT' => 'English (Trinidad and Tobago)',
				'bez_TZ' => 'Bena (Tanzania)',
				'es_NI' => 'Spanish (Nicaragua)',
				'uz_Arab' => 'Uzbek (Arabic)',
				'ne_NP' => 'Nepali (Nepal)',
				'fi' => 'Finnish',
				'khq' => 'Koyra Chiini',
				'gsw' => 'Swiss German',
				'zh_Hans_MO' => 'Chinese (Simplified Han, Macau SAR China)',
				'en_MH' => 'English (Marshall Islands)',
				'hu_HU' => 'Hungarian (Hungary)',
				'en_GB' => 'English (United Kingdom)',
				'fr_BE' => 'French (Belgium)',
				'de_BE' => 'German (Belgium)',
				'saq' => 'Samburu',
				'be_BY' => 'Belarusian (Belarus)',
				'sl_SI' => 'Slovenian (Slovenia)',
				'sr_Latn_RS' => 'Serbian (Latin, Serbia)',
				'fo' => 'Faroese',
				'fr' => 'French',
				'xog' => 'Soga',
				'fr_BF' => 'French (Burkina Faso)',
				'tzm' => 'Central Morocco Tamazight',
				'sk_SK' => 'Slovak (Slovakia)',
				'fr_ML' => 'French (Mali)',
				'he_IL' => 'Hebrew (Israel)',
				'ha_Latn_NE' => 'Hausa (Latin, Niger)',
				'ru_RU' => 'Russian (Russia)',
				'fr_CM' => 'French (Cameroon)',
				'teo_KE' => 'Teso (Kenya)',
				'seh_MZ' => 'Sena (Mozambique)',
				'kl_GL' => 'Kalaallisut (Greenland)',
				'fi_FI' => 'Finnish (Finland)',
				'kam' => 'Kamba',
				'es_ES' => 'Spanish (Spain)',
				'af' => 'Afrikaans',
				'asa_TZ' => 'Asu (Tanzania)',
				'cs_CZ' => 'Czech (Czech Republic)',
				'tr_TR' => 'Turkish (Turkey)',
				'es_PY' => 'Spanish (Paraguay)',
				'tzm_Latn_MA' => 'Central Morocco Tamazight (Latin, Morocco)',
				'lg' => 'Ganda',
				'ebu' => 'Embu',
				'en_HK' => 'English (Hong Kong SAR China)',
				'nl_NL' => 'Dutch (Netherlands)',
				'en_BE' => 'English (Belgium)',
				'ms_MY' => 'Malay (Malaysia)',
				'es_UY' => 'Spanish (Uruguay)',
				'ar_BH' => 'Arabic (Bahrain)',
				'kw_GB' => 'Cornish (United Kingdom)',
				'ak' => 'Akan',
				'chr' => 'Cherokee',
				'dav' => 'Taita',
				'lag_TZ' => 'Langi (Tanzania)',
				'am' => 'Amharic',
				'so_DJ' => 'Somali (Djibouti)',
				'shi_Tfng_MA' => 'Tachelhit (Tifinagh, Morocco)',
				'sr_Latn_ME' => 'Serbian (Latin, Montenegro)',
				'sn_ZW' => 'Shona (Zimbabwe)',
				'or_IN' => 'Oriya (India)',
				'ar' => 'Arabic',
				'as' => 'Assamese',
				'fr_BI' => 'French (Burundi)',
				'jmc_TZ' => 'Machame (Tanzania)',
				'chr_US' => 'Cherokee (United States)',
				'eu_ES' => 'Basque (Spain)',
				'saq_KE' => 'Samburu (Kenya)',
				'vun' => 'Vunjo',
				'lt' => 'Lithuanian',
				'naq_NA' => 'Nama (Namibia)',
				'ga' => 'Irish',
				'af_NA' => 'Afrikaans (Namibia)',
				'kea_CV' => 'Kabuverdianu (Cape Verde)',
				'es_DO' => 'Spanish (Dominican Republic)',
				'lv' => 'Latvian',
				'kok_IN' => 'Konkani (India)',
				'de_LI' => 'German (Liechtenstein)',
				'fr_BJ' => 'French (Benin)',
				'az' => 'Azerbaijani',
				'guz_KE' => 'Gusii (Kenya)',
				'rw_RW' => 'Kinyarwanda (Rwanda)',
				'mg_MG' => 'Malagasy (Madagascar)',
				'km_KH' => 'Khmer (Cambodia)',
				'gl' => 'Galician',
				'shi_Tfng' => 'Tachelhit (Tifinagh)',
				'ar_AE' => 'Arabic (United Arab Emirates)',
				'fr_MQ' => 'French (Martinique)',
				'rm' => 'Romansh',
				'sv_SE' => 'Swedish (Sweden)',
				'az_Cyrl' => 'Azerbaijani (Cyrillic)',
				'ro' => 'Romanian',
				'so_ET' => 'Somali (Ethiopia)',
				'en_ZA' => 'English (South Africa)',
				'ii_CN' => 'Sichuan Yi (China)',
				'fr_BL' => 'French (Saint Barthélemy)',
				'hi_IN' => 'Hindi (India)',
				'gu' => 'Gujarati',
				'mer_KE' => 'Meru (Kenya)',
				'nn_NO' => 'Norwegian Nynorsk (Norway)',
				'gv' => 'Manx',
				'ru' => 'Russian',
				'ar_DZ' => 'Arabic (Algeria)',
				'ar_SY' => 'Arabic (Syria)',
				'en_MP' => 'English (Northern Mariana Islands)',
				'nl_BE' => 'Dutch (Belgium)',
				'rw' => 'Kinyarwanda',
				'be' => 'Belarusian',
				'en_VI' => 'English (U.S. Virgin Islands)',
				'es_CL' => 'Spanish (Chile)',
				'bg' => 'Bulgarian',
				'mg' => 'Malagasy',
				'hy_AM' => 'Armenian (Armenia)',
				'zu_ZA' => 'Zulu (South Africa)',
				'guz' => 'Gusii',
				'mk' => 'Macedonian',
				'es_VE' => 'Spanish (Venezuela)',
				'ml' => 'Malayalam',
				'bm' => 'Bambara',
				'khq_ML' => 'Koyra Chiini (Mali)',
				'bn' => 'Bengali',
				'ps_AF' => 'Pashto (Afghanistan)',
				'so_SO' => 'Somali (Somalia)',
				'sr_Cyrl' => 'Serbian (Cyrillic)',
				'pl_PL' => 'Polish (Poland)',
				'fr_GN' => 'French (Guinea)',
				'bo' => 'Tibetan',
				'om_KE' => 'Oromo (Kenya)'
		];
	}

	/**
	 * /* Returns a locale from a country code that is provided.
	 * /*
	 * /* @param $country_code ISO 3166-2-alpha 2 country code
	 * /* @param $language_code ISO 639-1-alpha 2 language code
	 * /* @returns a locale, formatted like en_US, or null if not found
	 * /*
	 */
	function country_code_to_locale($country_code, $language_code = '') {
		// Locale list taken from:
		// http://stackoverflow.com/questions/3191664/
		// list-of-all-locales-and-their-short-codes
		$locales = array (
				'af-ZA',
				'am-ET',
				'ar-AE',
				'ar-BH',
				'ar-DZ',
				'ar-EG',
				'ar-IQ',
				'ar-JO',
				'ar-KW',
				'ar-LB',
				'ar-LY',
				'ar-MA',
				'arn-CL',
				'ar-OM',
				'ar-QA',
				'ar-SA',
				'ar-SY',
				'ar-TN',
				'ar-YE',
				'as-IN',
				'az-Cyrl-AZ',
				'az-Latn-AZ',
				'ba-RU',
				'be-BY',
				'bg-BG',
				'bn-BD',
				'bn-IN',
				'bo-CN',
				'br-FR',
				'bs-Cyrl-BA',
				'bs-Latn-BA',
				'ca-ES',
				'co-FR',
				'cs-CZ',
				'cy-GB',
				'da-DK',
				'de-AT',
				'de-CH',
				'de-DE',
				'de-LI',
				'de-LU',
				'dsb-DE',
				'dv-MV',
				'el-GR',
				'en-029',
				'en-AU',
				'en-BZ',
				'en-CA',
				'en-GB',
				'en-IE',
				'en-IN',
				'en-JM',
				'en-MY',
				'en-NZ',
				'en-PH',
				'en-SG',
				'en-TT',
				'en-US',
				'en-ZA',
				'en-ZW',
				'es-AR',
				'es-BO',
				'es-CL',
				'es-CO',
				'es-CR',
				'es-DO',
				'es-EC',
				'es-ES',
				'es-GT',
				'es-HN',
				'es-MX',
				'es-NI',
				'es-PA',
				'es-PE',
				'es-PR',
				'es-PY',
				'es-SV',
				'es-US',
				'es-UY',
				'es-VE',
				'et-EE',
				'eu-ES',
				'fa-IR',
				'fi-FI',
				'fil-PH',
				'fo-FO',
				'fr-BE',
				'fr-CA',
				'fr-CH',
				'fr-FR',
				'fr-LU',
				'fr-MC',
				'fy-NL',
				'ga-IE',
				'gd-GB',
				'gl-ES',
				'gsw-FR',
				'gu-IN',
				'ha-Latn-NG',
				'he-IL',
				'hi-IN',
				'hr-BA',
				'hr-HR',
				'hsb-DE',
				'hu-HU',
				'hy-AM',
				'id-ID',
				'ig-NG',
				'ii-CN',
				'is-IS',
				'it-CH',
				'it-IT',
				'iu-Cans-CA',
				'iu-Latn-CA',
				'ja-JP',
				'ka-GE',
				'kk-KZ',
				'kl-GL',
				'km-KH',
				'kn-IN',
				'kok-IN',
				'ko-KR',
				'ky-KG',
				'lb-LU',
				'lo-LA',
				'lt-LT',
				'lv-LV',
				'mi-NZ',
				'mk-MK',
				'ml-IN',
				'mn-MN',
				'mn-Mong-CN',
				'moh-CA',
				'mr-IN',
				'ms-BN',
				'ms-MY',
				'mt-MT',
				'nb-NO',
				'ne-NP',
				'nl-BE',
				'nl-NL',
				'nn-NO',
				'nso-ZA',
				'oc-FR',
				'or-IN',
				'pa-IN',
				'pl-PL',
				'prs-AF',
				'ps-AF',
				'pt-BR',
				'pt-PT',
				'qut-GT',
				'quz-BO',
				'quz-EC',
				'quz-PE',
				'rm-CH',
				'ro-RO',
				'ru-RU',
				'rw-RW',
				'sah-RU',
				'sa-IN',
				'se-FI',
				'se-NO',
				'se-SE',
				'si-LK',
				'sk-SK',
				'sl-SI',
				'sma-NO',
				'sma-SE',
				'smj-NO',
				'smj-SE',
				'smn-FI',
				'sms-FI',
				'sq-AL',
				'sr-Cyrl-BA',
				'sr-Cyrl-CS',
				'sr-Cyrl-ME',
				'sr-Cyrl-RS',
				'sr-Latn-BA',
				'sr-Latn-CS',
				'sr-Latn-ME',
				'sr-Latn-RS',
				'sv-FI',
				'sv-SE',
				'sw-KE',
				'syr-SY',
				'ta-IN',
				'te-IN',
				'tg-Cyrl-TJ',
				'th-TH',
				'tk-TM',
				'tn-ZA',
				'tr-TR',
				'tt-RU',
				'tzm-Latn-DZ',
				'ug-CN',
				'uk-UA',
				'ur-PK',
				'uz-Cyrl-UZ',
				'uz-Latn-UZ',
				'vi-VN',
				'wo-SN',
				'xh-ZA',
				'yo-NG',
				'zh-CN',
				'zh-HK',
				'zh-MO',
				'zh-SG',
				'zh-TW',
				'zu-ZA'
		);

		foreach ( $locales as $locale ) {
			$locale_region = locale_get_region ( $locale );
			$locale_language = locale_get_primary_language ( $locale );
			$locale_array = array (
					'language' => $locale_language,
					'region' => $locale_region
			);

			if (strtoupper ( $country_code ) == $locale_region && $language_code == '') {
				return locale_compose ( $locale_array );
			} elseif (strtoupper ( $country_code ) == $locale_region && strtolower ( $language_code ) == $locale_language) {
				return locale_compose ( $locale_array );
			}
		}

		return null;
	}
	public function getLanguageCode($lang = '') {
		$codes = [ 
				'ab' => 'Abkhazian',
				'aa' => 'Afar',
				'af' => 'Afrikaans',
				'ak' => 'Akan',
				'sq' => 'Albanian',
				'am' => 'Amharic',
				'ar' => 'Arabic',
				'an' => 'Aragonese',
				'hy' => 'Armenian',
				'as' => 'Assamese',
				'av' => 'Avaric',
				'ae' => 'Avestan',
				'ay' => 'Aymara',
				'az' => 'Azerbaijani',
				'bm' => 'Bambara',
				'ba' => 'Bashkir',
				'eu' => 'Basque',
				'be' => 'Belarusian',
				'bn' => 'Bengali',
				'bh' => 'Bihari languages',
				'bi' => 'Bislama',
				'bs' => 'Bosnian',
				'br' => 'Breton',
				'bg' => 'Bulgarian',
				'my' => 'Burmese',
				'ca' => 'Catalan, Valencian',
				'km' => 'Central Khmer',
				'ch' => 'Chamorro',
				'ce' => 'Chechen',
				'ny' => 'Chichewa, Chewa, Nyanja',
				'zh' => 'Chinese',
				'cu' => 'Church Slavonic, Old Bulgarian, Old Church Slavonic',
				'cv' => 'Chuvash',
				'kw' => 'Cornish',
				'co' => 'Corsican',
				'cr' => 'Cree',
				'hr' => 'Croatian',
				'cs' => 'Czech',
				'da' => 'Danish',
				'dv' => 'Divehi, Dhivehi, Maldivian',
				'nl' => 'Dutch, Flemish',
				'dz' => 'Dzongkha',
				'en' => 'English',
				'eo' => 'Esperanto',
				'et' => 'Estonian',
				'ee' => 'Ewe',
				'fo' => 'Faroese',
				'fj' => 'Fijian',
				'fi' => 'Finnish',
				'fr' => 'French',
				'ff' => 'Fulah',
				'gd' => 'Gaelic, Scottish Gaelic',
				'gl' => 'Galician',
				'lg' => 'Ganda',
				'ka' => 'Georgian',
				'de' => 'German',
				'ki' => 'Gikuyu, Kikuyu',
				'el' => 'Greek (Modern)',
				'kl' => 'Greenlandic, Kalaallisut',
				'gn' => 'Guarani',
				'gu' => 'Gujarati',
				'ht' => 'Haitian, Haitian Creole',
				'ha' => 'Hausa',
				'he' => 'Hebrew',
				'hz' => 'Herero',
				'hi' => 'Hindi',
				'ho' => 'Hiri Motu',
				'hu' => 'Hungarian',
				'is' => 'Icelandic',
				'io' => 'Ido',
				'ig' => 'Igbo',
				'id' => 'Indonesian',
				'ia' => 'Interlingua (International Auxiliary Language Association)',
				'ie' => 'Interlingue',
				'iu' => 'Inuktitut',
				'ik' => 'Inupiaq',
				'ga' => 'Irish',
				'it' => 'Italian',
				'ja' => 'Japanese',
				'jv' => 'Javanese',
				'kn' => 'Kannada',
				'kr' => 'Kanuri',
				'ks' => 'Kashmiri',
				'kk' => 'Kazakh',
				'rw' => 'Kinyarwanda',
				'kv' => 'Komi',
				'kg' => 'Kongo',
				'ko' => 'Korean',
				'kj' => 'Kwanyama, Kuanyama',
				'ku' => 'Kurdish',
				'ky' => 'Kyrgyz',
				'lo' => 'Lao',
				'la' => 'Latin',
				'lv' => 'Latvian',
				'lb' => 'Letzeburgesch, Luxembourgish',
				'li' => 'Limburgish, Limburgan, Limburger',
				'ln' => 'Lingala',
				'lt' => 'Lithuanian',
				'lu' => 'Luba-Katanga',
				'mk' => 'Macedonian',
				'mg' => 'Malagasy',
				'ms' => 'Malay',
				'ml' => 'Malayalam',
				'mt' => 'Maltese',
				'gv' => 'Manx',
				'mi' => 'Maori',
				'mr' => 'Marathi',
				'mh' => 'Marshallese',
				'ro' => 'Moldovan, Moldavian, Romanian',
				'mn' => 'Mongolian',
				'na' => 'Nauru',
				'nv' => 'Navajo, Navaho',
				'nd' => 'Northern Ndebele',
				'ng' => 'Ndonga',
				'ne' => 'Nepali',
				'se' => 'Northern Sami',
				'no' => 'Norwegian',
				'nb' => 'Norwegian Bokmål',
				'nn' => 'Norwegian Nynorsk',
				'ii' => 'Nuosu, Sichuan Yi',
				'oc' => 'Occitan (post 1500)',
				'oj' => 'Ojibwa',
				'or' => 'Oriya',
				'om' => 'Oromo',
				'os' => 'Ossetian, Ossetic',
				'pi' => 'Pali',
				'pa' => 'Panjabi, Punjabi',
				'ps' => 'Pashto, Pushto',
				'fa' => 'Persian',
				'pl' => 'Polish',
				'pt' => 'Portuguese',
				'qu' => 'Quechua',
				'rm' => 'Romansh',
				'rn' => 'Rundi',
				'ru' => 'Russian',
				'sm' => 'Samoan',
				'sg' => 'Sango',
				'sa' => 'Sanskrit',
				'sc' => 'Sardinian',
				'sr' => 'Serbian',
				'sn' => 'Shona',
				'sd' => 'Sindhi',
				'si' => 'Sinhala, Sinhalese',
				'sk' => 'Slovak',
				'sl' => 'Slovenian',
				'so' => 'Somali',
				'st' => 'Sotho, Southern',
				'nr' => 'South Ndebele',
				'es' => 'Spanish, Castilian',
				'su' => 'Sundanese',
				'sw' => 'Swahili',
				'ss' => 'Swati',
				'sv' => 'Swedish',
				'tl' => 'Tagalog',
				'ty' => 'Tahitian',
				'tg' => 'Tajik',
				'ta' => 'Tamil',
				'tt' => 'Tatar',
				'te' => 'Telugu',
				'th' => 'Thai',
				'bo' => 'Tibetan',
				'ti' => 'Tigrinya',
				'to' => 'Tonga (Tonga Islands)',
				'ts' => 'Tsonga',
				'tn' => 'Tswana',
				'tr' => 'Turkish',
				'tk' => 'Turkmen',
				'tw' => 'Twi',
				'ug' => 'Uighur, Uyghur',
				'uk' => 'Ukrainian',
				'ur' => 'Urdu',
				'uz' => 'Uzbek',
				've' => 'Venda',
				'vi' => 'Vietnamese',
				'vo' => 'Volap_k',
				'wa' => 'Walloon',
				'cy' => 'Welsh',
				'fy' => 'Western Frisian',
				'wo' => 'Wolof',
				'xh' => 'Xhosa',
				'yi' => 'Yiddish',
				'yo' => 'Yoruba',
				'za' => 'Zhuang, Chuang',
				'zu' => 'Zulu'
		];
		if ($lang) {
			$lang_code = array_search ( $lang, $codes );
			return $lang_code;
		} else {
			return $codes;
		}
	}
	public function getLangCodeWithFlags() {
		global $base_url;

		return [ 
				[ 
						"code" => "en",
						"name" => "English",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/en.png"
				],
				[ 
						"code" => "fr",
						"name" => "French",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/fr.png"
				],
				[ 
						"code" => "de",
						"name" => "German",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/de.png"
				],
				[ 
						"code" => "it",
						"name" => "Italian",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/it.png"
				],
				[ 
						"code" => "es",
						"name" => "Spanish",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/es.png"
				],
				[ 
						"code" => "pt",
						"name" => "Portuguese",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/pt.png"
				],
				[ 
						"code" => "nl",
						"name" => "Dutch",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/nl.png"
				],
				[ 
						"code" => "fi",
						"name" => "Finnish",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/fi.png"
				],
				[ 
						"code" => "sv",
						"name" => "Swedish",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/sv.png"
				],
				[ 
						"code" => "nn",
						"name" => "Norwegian",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/nn.png"
				],
				[ 
						"code" => "uk",
						"name" => "Ukrainian",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/uk.png"
				],
				[ 
						"code" => "pl",
						"name" => "Polish",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/pl.png"
				],
				[ 
						"code" => "ru",
						"name" => "Russian",
						"url" => $base_url . "/modules/custom/bilimauth/images/flags/ru.png"
				]
		];
	}
	public function getCountryFlagsByLang($lang) {
		$langs = $this->getLangCodeWithFlags ();
		$flag_url = '';
		foreach ( $langs as $l ) {
			if ($l ['code'] == $lang || $l ['name'] == $lang) {
				$flag_url = $l ['url'];
				break;
			}
		}
		return $flag_url;
	}
	public function getOtherLangCodes() {
		$lang_codes = $this->getLanguageCode ();
		$languages = [ ];

		foreach ( $lang_codes as $x => $lng ) {
			if ($x != 'en' && $x != 'fr' && $x != 'de' && $x != 'it' && $x != 'es' && $x != 'pt' && $x != 'nl' && $x != 'fi' && $x != 'sv' && $x != 'nn' && $x != 'uk' && $x != 'pl' && $x != 'ru') {
				$languages [] = [ 
						'code' => $x,
						'name' => $lng
				];
			}
		}

		return $languages;
	}
	public function bulkUpdateCourse() {
		$nids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course' )->execute ();
		$count = 0;
		if ($nids) {
			foreach ( $nids as $nid ) {
				$course = Node::load ( $nid );
				$uid = $course->getOwnerId ();
				$course->set ( 'field_changedby', $uid );
				$course->save ();
				$count ++;
			}
		}
		return $count . ' course have been updated successfully.';
	}
	public function checkValidCustomMedia() {
		$file_uri = 'public://custom_media/anim_from_scratch_bilim.zip';
		$editor_folder = 'public://custom_media';
		$file_system = \Drupal::service ( 'file_system' );
		$cm_abs_path = $file_system->realpath ( $editor_folder );
		$file_path = $file_system->realpath ( $file_uri );

		$zip = new Zip ( $file_path );
		$zipList = $zip->listContents ();

		$response = '';

		if (in_array ( 'index.html', $zipList ) == true) {
			$response = 'valid';
		} else {
			$response = 'not valid';
		}
		return $response;
	}
	public function previewTextCustomMedia() {
		$file_uri = 'public://custom_media/anim_from_scratch_bilim.zip';
		$file_system = \Drupal::service ( 'file_system' );
		$file_path = $file_system->realpath ( $file_uri );

		$zip = new Zip ( $file_path );
		$zipList = $zip->listContents ();
		$zip->extract ( $cm_abs_path );

		$custom_media_folder = 'public://custom_media';
		$cm_abs_path = $file_system->realpath ( $custom_media_folder );
		$index_file = file_get_contents ( $cm_abs_path . '/index.html' );

		$dom = new \DomDocument ();
		$dom->loadHTML ( $index_file, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		$body = $dom->getElementsByTagName ( 'body' )->item ( 0 );
		$str = trim ( $body->textContent );
		// $str = trim(preg_replace( "/\s\s+/", "\n",$str));

		return $str;
	}
	public function translateTextCustomMedia() {
		$text = 'Capital changes per population
				Testing
				Testing 1
				Testing 2
				Testing 3
				Testing 4';
		$translated_text = explode ( PHP_EOL, $text );
		$file_system = \Drupal::service ( 'file_system' );
		$file_uri = 'public://editor/6087a31307f26-anim from scratch bilim.zip';
		$file_path = $file_system->realpath ( $file_uri );

		if (! file_exists ( 'public://custom_media' )) {
			mkdir ( 'public://custom_media/', 0777, true );
		}

		$custom_media_folder = 'public://custom_media';
		$cm_abs_path = $file_system->realpath ( $custom_media_folder );

		if (file_exists ( $custom_media_folder )) {
			$this->removeDirectory ( $cm_abs_path );
		}

		$zip = new \Drupal\Core\Archiver\Zip ( $file_path );
		$zipList = $zip->listContents ();
		$zip->extract ( $cm_abs_path );

		$zip_name = end ( explode ( '/', $file_uri ) );
		unlink ( $file_uri );

		$index_html = file_get_contents ( $cm_abs_path . '/index.html' );

		$dom = new \DomDocument ();
		$dom->loadHTML ( $index_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		$body = $dom->getElementsByTagName ( 'body' )->item ( 0 );
		$str = $body->textContent;
		$str = trim ( preg_replace ( "/\s\s+/", "\n", $str ) ); // Remove excess whitespaces and adding new line
		$old_arr = explode ( "\n", $str );
		$index_html = str_replace ( '<br />', '', $index_html );
		$replace = str_replace ( $old_arr, $translated_text, $index_html );

		if (file_exists ( $cm_abs_path . '/index.html' )) {
			rmdir ( $cm_abs_path . '/index.html' );
		}

		$index_file = fopen ( $cm_abs_path . '/index.html', 'w+' );
		fwrite ( $index_file, $replace );
		fclose ( $index_file );

		$zipArchive = new \ZipArchive ();

		$editor_folder = 'public://editor';
		$editor_path = $file_system->realpath ( $editor_folder );

		// $zip_name = 'custom_media_'.date('ymdHi');
		$cm_file = $editor_path . '/' . $zip_name;
		$zipArchive->open ( $cm_file, \ZipArchive::CREATE | \ZipArchive::OVERWRITE );
		$files = new \RecursiveIteratorIterator ( new \RecursiveDirectoryIterator ( $cm_abs_path ), \RecursiveIteratorIterator::LEAVES_ONLY );
		foreach ( $files as $zipfile ) {
			if (! $zipfile->isDir ()) {
				$filePath = $zipfile->getRealPath ();
				$relativePath = substr ( $filePath, strlen ( $cm_abs_path ) + 1 );
				$zipArchive->addFile ( $zipfile->getRealPath (), $relativePath );
			}
		}
		$zipArchive->close ();
		$zip_uri = file_create_url ( $cm_file );

		// adobe package js save
		$cm_dir = scandir ( $cm_abs_path );
		$matches = array_filter ( $cm_dir, function ($haystack) {
			return (strpos ( $haystack, '.js' ));
		} );

		$js = implode ( '', $matches );

		$js_file = file_get_contents ( $cm_abs_path . '/' . $js );
		preg_match_all ( '`Text\("([^"]*)"`', $js_file, $results );

		$options = [ ];
		foreach ( $data ['translations'] as $key => $val ) {
			$options [] = $val ['text'];
		}

		$replace = str_replace ( $results [1], $options, $js );

		if (file_exists ( $cm_abs_path . '/' . $js )) {
			rmdir ( $cm_abs_path . '/' . $js );
		}

		$new_js = fopen ( $cm_abs_path . '/' . $js, 'w+' );
		fwrite ( $new_js, $replace );
		fclose ( $new_js );

		return $zip_uri;
	}
	public function getStylePropertiesbyDomain($domainId, $root, $sf) {
		date_default_timezone_set ( 'GMT' );
		$result = [ ];
		if ($root > 0) {
			if ($sf > 0) {
				$qn = Node::load ( $sf );

				// sub content folders
				$sf_chld = $qn->get ( 'field_sf_style_folder' )->getValue ();
				$sf_chlds = $this->getTargetIds ( $sf_chld );

				// courses
				$stl_chld = $qn->get ( 'field_sf_children' )->getValue ();
				$stl_chlds = $this->getTargetIds ( $stl_chld );

				$chlds = array_merge ( $sf_chlds, $stl_chlds );
			} else {
				$qn = Node::load ( $root );
				$chld = $qn->get ( 'field_dsr_children' )->getValue ();
				$chlds = $this->getTargetIds ( $chld );
			}
		} else {
			$qn = Node::load ( $domainId );
			$chld = $qn->get ( 'field_domain_children' )->getValue ();
			$chlds = $this->getTargetIds ( $chld );
		}
		$nodes = Node::loadMultiple ( $chlds );
		foreach ( $nodes as $n ) {
			$type = $n->getType ();

			if ($type != 'course') {

				if ($type == 'domain_styles_root') {
					$dsr_chld = $n->get ( 'field_dsr_children' )->getValue ();
					$dsr_chlds = $this->getTargetIds ( $dsr_chld );
					$sf_nodes = Node::loadMultiple ( $dsr_chlds );

					foreach ( $sf_nodes as $sf_node ) {

						if ($sf_node->getType () == 'style') {
							$crs_values = $sf_node->get ( 'field_s_courses' )->getValue ();
							$crs_ids = $this->getTargetIds ( $crs_values );

							$courses = Node::loadMultiple ( $crs_ids );
							$crs_names = [ ];
							foreach ( $courses as $crs ) {
								$crs_title = $crs->getTitle ();
								$domain_name = \Drupal::routeMatch ()->getParameters ()->get ( 'domain' )->getTitle ();
								$root_id = \Drupal::routeMatch ()->getParameters ()->get ( 'root' );
								$sf_id = \Drupal::routeMatch ()->getParameters ()->get ( 'sf' );
								$crs_name = '';
								$cf = \Drupal::entityQuery ( 'node' )->condition ( 'field_cf_children', $crs->id () )->execute ();
								$cf = implode ( '', $cf );

								$dc_root = \Drupal::entityQuery ( 'node' )->condition ( 'field_dcr_children', $crs->id () )->execute ();
								$dc_root = implode ( '', $dc_root );
								if ($cf) {
									$cf_n = Node::load ( $cf );
									$ty = $cf_n->getType ();
									$ids = $this->getDomainFromCourse ( $cf, $ty );
									$results = $this->getBreadcrumbInfo ( $ids ['cf_ids'], 'domainview' );
									foreach ( $results as $i => $res ) {
										if (count ( $results ) == ++ $i) {
											$crs_name .= $res ['title'] . ' > ' . $crs_title;
										} else {
											$crs_name .= $res ['title'] . ' > ';
										}
									}

									$crs_names [$crs->id ()] = $crs_name;
								} else if ($dc_root) {
									$ids = $this->getDomainFromCourse ( $dc_root, 'domain_content_root' );
									$results = $this->getBreadcrumbInfo ( $ids ['cf_ids'], 'domainview' );
									foreach ( $results as $i => $res ) {
										if (count ( $results ) == ++ $i) {
											$crs_name .= $res ['title'] . ' > ' . $crs_title;
										} else {
											$crs_name .= $res ['title'] . ' > ';
										}
									}

									$crs_names [$crs->id ()] = $crs_name;
								} else {
									$ids = $this->getDomainFromCourse ( $domainId, 'domain' );
									$results = $this->getBreadcrumbInfo ( $ids ['cf_ids'], 'domainview' );
									foreach ( $results as $i => $res ) {
										if (count ( $results ) == ++ $i) {
											$crs_name .= $res ['title'] . ' > ' . $crs_title;
										} else {
											$crs_name .= $res ['title'] . ' > ';
										}
									}

									$crs_names [$crs->id ()] = $crs_name;
								}

								/*
								 * if($root_id != '0'){
								 * $root = Node::load($root_id);
								 * $root_name = $root->getTitle();
								 * $crs_name .= ' > ' . $root_name;
								 * }
								 * if($sf_id != '0'){
								 * $sf = Node::load($sf_id);
								 * $sf_name = $sf->getTitle();
								 * $crs_name .= ' > ' . $sf_name;
								 * }
								 * $crs_name .= ' > ' . $crs_title;
								 * $crs_names[$crs->id()] = $crs_name;
								 */
							}
							$created = $sf_node->getCreatedTime ();
							$changed = $sf_node->getChangedTime ();

							$owner = $sf_node->getOwner ()->getAccountName ();
							$modified_by = $sf_node->getRevisionUser ()->getAccountName ();

							$fid = $sf_node->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
							if ($fid) {
								$file = File::load ( $fid );
								$uri = $file->get ( 'uri' )->getString ();
							}
							$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
							$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
							if ($blmconfig_data) {
								$blmconfig = json_decode ( $blmconfig_data, true );
								$displayValue = $blmconfig ['display'];
								$navigation = $blmconfig ['navigation'] ['type'];
							}

							$result [] = array (
									'id' => $sf_node->id (),
									'type' => $sf_node->getType (),
									'title' => $sf_node->title->value,
									// 'display' => $sf_node->get('field_s_display')->getString(),
									'createdDate' => date ( 'D M j', $created ),
									'createdTime' => date ( ' - G\\Hi T - Y', $created ),
									'changedDate' => date ( 'D M j', $changed ),
									'changedTime' => date ( ' - G\\Hi T - Y', $changed ),
									'created_by' => $owner,
									'modified_by' => $modified_by ? $modified_by : $owner,
									'courses' => $crs_names,
									'display' => $displayValue,
									'navigation' => $navigation
							);
						}
					}
				} elseif ($type == 'style') {
					$crs_values = $n->get ( 'field_s_courses' )->getValue ();
					$crs_ids = $this->getTargetIds ( $crs_values );

					$courses = Node::loadMultiple ( $crs_ids );
					$crs_names = [ ];
					foreach ( $courses as $crs ) {
						$crs_title = $crs->getTitle ();
						$domain_name = \Drupal::routeMatch ()->getParameters ()->get ( 'domain' )->getTitle ();
						$root_id = \Drupal::routeMatch ()->getParameters ()->get ( 'root' );
						$sf_id = \Drupal::routeMatch ()->getParameters ()->get ( 'sf' );
						$crs_name = '';
						$cf = \Drupal::entityQuery ( 'node' )->condition ( 'field_cf_children', $crs->id () )->execute ();
						$cf = implode ( '', $cf );

						$dc_root = \Drupal::entityQuery ( 'node' )->condition ( 'field_dcr_children', $crs->id () )->execute ();
						$dc_root = implode ( '', $dc_root );
						if ($cf) {
							$cf_n = Node::load ( $cf );
							$ty = $cf_n->getType ();
							$ids = $this->getDomainFromCourse ( $cf, $ty );
							$results = $this->getBreadcrumbInfo ( $ids ['cf_ids'], 'domainview' );
							foreach ( $results as $i => $res ) {
								if (count ( $results ) == ++ $i) {
									$crs_name .= $res ['title'] . ' > ' . $crs_title;
								} else {
									$crs_name .= $res ['title'] . ' > ';
								}
							}

							$crs_names [$crs->id ()] = $crs_name;
						} else if ($dc_root) {
							$ids = $this->getDomainFromCourse ( $dc_root, 'domain_content_root' );
							$results = $this->getBreadcrumbInfo ( $ids ['cf_ids'], 'domainview' );
							foreach ( $results as $i => $res ) {
								if (count ( $results ) == ++ $i) {
									$crs_name .= $res ['title'] . ' > ' . $crs_title;
								} else {
									$crs_name .= $res ['title'] . ' > ';
								}
							}

							$crs_names [$crs->id ()] = $crs_name;
						} else {
							$ids = $this->getDomainFromCourse ( $domainId, 'domain' );
							$results = $this->getBreadcrumbInfo ( $ids ['cf_ids'], 'domainview' );
							foreach ( $results as $i => $res ) {
								if (count ( $results ) == ++ $i) {
									$crs_name .= $res ['title'] . ' > ' . $crs_title;
								} else {
									$crs_name .= $res ['title'] . ' > ';
								}
							}

							$crs_names [$crs->id ()] = $crs_name;
						}

						/*
						 * if($root_id != '0'){
						 * $root = Node::load($root_id);
						 * $root_name = $root->getTitle();
						 * $crs_name .= ' > ' . $root_name;
						 * }
						 * if($sf_id != '0'){
						 * $sf = Node::load($sf_id);
						 * $sf_name = $sf->getTitle();
						 * $crs_name .= ' > ' . $sf_name;
						 * }
						 * $crs_name .= ' > ' . $crs_title;
						 * $crs_names[$crs->id()] = $crs_name;
						 */
					}

					$created = $n->getCreatedTime ();
					$changed = $n->getChangedTime ();

					$owner = $n->getOwner ()->getAccountName ();
					$modified_by = $n->getRevisionUser ()->getAccountName ();

					$fid = $n->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
					if ($fid) {
						$file = File::load ( $fid );
						$uri = $file->get ( 'uri' )->getString ();
					}
					$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
					$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
					if ($blmconfig_data) {
						$blmconfig = json_decode ( $blmconfig_data, true );
						$displayValue = $blmconfig ['display'];
						$navigation = $blmconfig ['navigation'] ['type'];
					}

					$result [] = array (
							'id' => $n->id (),
							'type' => $type,
							'title' => $n->title->value,
							'createdDate' => date ( 'D M j', $created ),
							'createdTime' => date ( ' - G\\Hi T - Y', $created ),
							'changedDate' => date ( 'D M j', $changed ),
							'changedTime' => date ( ' - G\\Hi T - Y', $changed ),
							'created_by' => $owner,
							'modified_by' => $modified_by ? $modified_by : $owner,
							'courses' => $crs_names,
							'display' => $displayValue,
							'navigation' => $navigation
					);
				}
			}
		}
		return $result;
	}
	public function getCoursePropertiesbyDomain($domainId, $root, $cf) {
		date_default_timezone_set ( 'GMT' );
		$result = [ ];
		if ($root > 0) {
			if ($cf > 0) {
				$qn = Node::load ( $cf );

				// courses
				$crs_chld = $qn->get ( 'field_cf_children' )->getValue ();
				$crs_chlds = $this->getTargetIds ( $crs_chld );

				$chlds = $crs_chlds;
			} else {
				$qn = Node::load ( $root );
				$chld = $qn->get ( 'field_dcr_children' )->getValue ();
				$chlds = $this->getTargetIds ( $chld );
			}
		} else {
			$qn = Node::load ( $domainId );
			$chld = $qn->get ( 'field_domain_children' )->getValue ();
			$chlds = $this->getTargetIds ( $chld );
		}

		$nodes = Node::loadMultiple ( $chlds );
		foreach ( $nodes as $n ) {
			$type = $n->getType ();
			if ($type == 'course') {
				$result [] = $this->getPropertiesByCourse ( $n );
			} elseif ($type == 'domain_content_root') {
				$dcr_chld = $n->get ( 'field_dcr_children' )->getValue ();
				$dcr_chlds = $this->getTargetIds ( $dcr_chld );
				$chld_nodes = Node::loadMultiple ( $dcr_chlds );
				foreach ( $chld_nodes as $chld_node ) {
					if ($chld_node->getType () == 'course') {
						$result [] = $this->getPropertiesByCourse ( $chld_node );
					}
				}
			}
		}
		return $result;
	}
	public function getPropertiesByCourse($crs) {
		$crs_title = $crs->getTitle ();

		$created = $crs->getCreatedTime ();
		$changed = $crs->getChangedTime ();

		$owner = $crs->getOwner ()->getAccountName ();
		//$modified_by = $crs->getRevisionUser ()->getAccountName ();

		$stl_ids = \Drupal::entityQuery ( 'node' )->condition ( 'field_s_courses', $crs->id () )->execute ();
		$stl_id = implode ( '', $stl_ids );

		if ($stl_id) {
			$style = Node::load ( $stl_id );
			$fid = $style->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
			$style_name = $style->getTitle ();
			if ($fid) {
				$file = File::load ( $fid );
				$uri = $file->get ( 'uri' )->getString ();
			}
			$absolute_path = \Drupal::service ( 'file_system' )->realpath ( $uri );
			$blmconfig_data = file_get_contents ( 'zip://' . $absolute_path . '#blmconfig.json' );
			if ($blmconfig_data) {
				$blmconfig = json_decode ( $blmconfig_data, true );
				$displayValue = $blmconfig ['display'];
				$navigation = $blmconfig ['navigation'] ['type'];
			}
		}
		$lang_code = $crs->get ( 'field_crs_lang' )->getString ();

		if ($lang_code) {
			$language_arr = $this->getLangCodeWithFlags ();
			$lang_arr = array_column ( $language_arr, 'code' );
			$lang_key = array_search ( $lang_code, $lang_arr );
			$lang_flag = $language_arr [$lang_key] ['url'];
			$languagesList = $this->getLocaleCode ();
			$language = array_key_exists ( $lang_code, $languagesList ) ? $languagesList [$lang_code] : 'Global';
			if (! $lang_key && $lang_code != 'en') {
				$lang_code = 'global';
			}
		} else {
			$language = 'Global';
			// $lang_flag = $base_url . "/modules/custom/bilimauth/images/flags/global.png";
			$lang_code = 'global';
		}

		$result = array (
				'id' => $crs->id (),
				'type' => $crs->getType (),
				'title' => $crs->title->value,
				'style_name' => $style_name,
				'language' => $language,
				'lang_code' => $lang_code,
				'createdDate' => date ( 'D M j', $created ),
				'createdTime' => date ( ' - G\\Hi T - Y', $created ),
				'changedDate' => date ( 'D M j', $changed ),
				'changedTime' => date ( ' - G\\Hi T - Y', $changed ),
				'created_by' => $owner,
				'modified_by' => $modified_by ? $modified_by : $owner,
				'display' => $displayValue,
				'navigation' => $navigation
		);

		return $result;
	}
	public function deleteAllNodes() {
		$nids = \Drupal::entityQuery ( 'node' )->condition ( 'type', [ 
				'theme',
				'templates_root',
				'template',
				'templatevariant',
				'template_category'
		], 'NOT IN' )->execute ();

		$nodes = Node::loadMultiple ( $nids );

		foreach ( $nodes as $n ) {
			$n->delete ();
		}

		return new JsonResponse ( [ 
				'result' => 'Ok'
		] );
	}
	public function deleteStyle(Request $request) {
		$stl_id = \Drupal::request ()->request->get ( 'style_id' );

		if ($stl_id) {
			$style = Node::load ( $stl_id );
			$courses = $style->get ( 'field_s_courses' )->getValue ();
			$style->save ();
			$arr = array_column ( $courses, 'target_id' );

			if (! empty ( $arr )) {
				$crs_arr = [ ];
				foreach ( $arr as $crs ) {
					$node = Node::load ( $crs );
					if ($node) {
						$crs_arr [] = $node;
					}
				}
				if (empty ( $crs_arr )) {

					$parent_sf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style_folder' )->condition ( 'field_sf_children', $stl_id )->execute ();

					if (! $parent_sf_ids) {
						$parent_sf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_styles_root' )->condition ( 'field_dsr_children', $stl_id )->execute ();
					}

					if (! empty ( $parent_sf_ids )) {
						$parent_sf_id = implode ( '', $parent_sf_ids );
						$parent_sf = Node::load ( $parent_sf_id );
						if ($parent_sf->gettype () == 'domain_styles_root') {
							$stl_id_values = $parent_sf->get ( 'field_dsr_children' )->getValue ();
							$parent_arr = array_column ( $stl_id_values, 'target_id' );
							$stl_key = array_search ( $stl_id, $parent_arr );
							unset ( $stl_id_values [$stl_key] );
							$parent_sf->set ( 'field_dsr_children', $stl_id_values );
						} else {
							$stl_id_values = $parent_sf->get ( 'field_sf_children' )->getValue ();
							$parent_arr = array_column ( $stl_id_values, 'target_id' );
							$stl_key = array_search ( $stl_id, $parent_arr );
							unset ( $stl_id_values [$stl_key] );
							$parent_sf->set ( 'field_sf_children', $stl_id_values );
						}
						$parent_sf->save ();
					}

					$style->delete ();

					return new JsonResponse ( [ 
							'result' => 'OK'
					] );
				} else {
					return new JsonResponse ( [ 
							"result" => "You cannot delete this style as it's used by at least one course"
					] );
				}
			} else {
				$parent_sf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style_folder' )->condition ( 'field_sf_children', $stl_id )->execute ();

				if (! $parent_sf_ids) {
					$parent_sf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain_styles_root' )->condition ( 'field_dsr_children', $stl_id )->execute ();
				}

				if (! empty ( $parent_sf_ids )) {
					$parent_sf_id = implode ( '', $parent_sf_ids );
					$parent_sf = Node::load ( $parent_sf_id );
					if ($parent_sf->gettype () == 'domain_styles_root') {
						$stl_id_values = $parent_sf->get ( 'field_dsr_children' )->getValue ();
						$parent_arr = array_column ( $stl_id_values, 'target_id' );
						$stl_key = array_search ( $stl_id, $parent_arr );
						unset ( $stl_id_values [$stl_key] );
						$parent_sf->set ( 'field_dsr_children', $stl_id_values );
					} else {
						$stl_id_values = $parent_sf->get ( 'field_sf_children' )->getValue ();
						$parent_arr = array_column ( $stl_id_values, 'target_id' );
						$stl_key = array_search ( $stl_id, $parent_arr );
						unset ( $stl_id_values [$stl_key] );
						$parent_sf->set ( 'field_sf_children', $stl_id_values );
					}
					$parent_sf->save ();
				}

				$style->delete ();

				return new JsonResponse ( [ 
						'result' => 'OK'
				] );
			}
		} else {
			return new JsonResponse ( [ 
					'result' => 'Style id is invalid'
			] );
		}
	}
	public function courseHtml($crs_id, $data) {
		$file_system = \Drupal::service ( 'file_system' );

		$style_id = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $crs_id )->execute ();

		$style_id = implode ( '', $style_id );

		$style = Node::load ( $style_id );

		$file_id = $style->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
		$file = File::load ( $file_id );
		$file_uri = $file->getFileUri ();
		$file_path = $file_system->realpath ( $file_uri );

		if (file_exists ( 'public://editor/course' )) {
			$dir = $file_system->realpath ( 'public://editor/course/' );
			$this->removeDirectory ( $dir );
		}

		mkdir ( 'public://editor/course/' . $crs_id, 0777, true );
		mkdir ( 'public://editor/course/' . $crs_id . '/medias/', 0777, true );

		$crs_folder = 'public://editor/course/' . $crs_id;
		$abs_crs_path = $file_system->realpath ( $crs_folder );

		$style_zip = new \ZipArchive ();
		$style_zip->open ( $file_path );
		$style_zip->extractTo ( $abs_crs_path );
		$style_zip->close ();

		$media_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course', $crs_id )->condition ( 'field_cm_course_element', '', '<>' )->execute ();

		$medias = Node::loadMultiple ( $media_ids );

		$destination = 'public://editor/course/' . $crs_id . '/medias/';

		foreach ( $medias as $media ) {
			$source = $media->get ( 'field_cm_file_path' )->getString ();
			if ($source) {
				// $uri = Url::fromUserInput(file_url_transform_relative($source));
				$media_name = end ( explode ( '/', $source ) );
				$cm_type = $media->get ( 'field_cm_type' )->getString ();
				$src_file_path = $file_system->realpath ( $source );
				if (strpos ( $cm_type, 'zip' ) !== false) {
					$dst_path = $destination . $media->id ();
					if (! file_exists ( $dst_path )) {
						mkdir ( $dst_path, 0777, true );
					}
					$dst = $file_system->realpath ( $dst_path );
					$copy = self::recurseCopy ( $src_file_path, $dst );
				} else {
					$fileData = file_get_contents ( $src_file_path, FILE_USE_INCLUDE_PATH );
					$file_copied = file_save_data ( $fileData, $destination . $media_name, FileSystemInterface::EXISTS_REPLACE );
				}
			}
		}

		$crsJson = $this->getCourseJson ( $crs_id, $data, $style_id );
		// $crsJson = str_replace(['"{','}"'], ['{','}'], $crsJson);
		$crsJson = strtr ( $crsJson, [ 
				'"{' => '{',
				'}"' => '}'
		] );

		$crs = Node::load ( $crs_id );

		$pp_temps = $this->getTemplatesByCourse ( $crs_id );

		$temp_htmls = [ ];
		$temp_html_arr = [ ];
		//$new_val = ' ';
		foreach ( $pp_temps as $pp_temp ) {
			$temp = Node::load ( $pp_temp );
			$temp_html = '';
			if ($temp->getType () === 'partpage') {
				$temp_html = $temp->get ( 'field_pp_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'simple_partpage') {
				$temp_html = $temp->get ( 'field_spp_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'question') {
				$temp_html = $temp->get ( 'field_ques_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'simple_content') {
				$temp_html = $temp->get ( 'field_sc_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'screen') {
				$temp_html = $temp->get ( 'field_scr_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			}

			
			foreach ( $temp_html_arr as $i => $val ) {
				if (stristr ( $val, 'outercontainer' )) {
					$dom = new \DOMDocument ();
					$dom->loadHTML ( $val, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
					$dom_xpath = new \DOMXPath ( $dom );
					$div = $dom_xpath->query ( "//*[contains(concat(' ', normalize-space(@class), ' '), ' outercontainer ')]" );
					$className = $dom_xpath->evaluate ( "string(//@class)" );
					$oldDiv = 'class="' . $className . '"';
					$newDiv = 'id="ID' . $temp->id () . '" ' . $oldDiv;
					// $div[0]->setAttribute("id", "ID".$temp->id());
					// $temp_html_arr[$i] = $dom->saveHTML();
					if (stristr ( $val, '<div id="ID' ) === false) {
						$temp_html_arr [$i] = str_replace ( $oldDiv, $newDiv, $temp_html_arr [$i] );
					}
				}
				if (stristr ( $val, ' editor ' )) {
					$temp_html_arr [$i] = str_replace ( ' editor ', ' ', $temp_html_arr [$i] );
				}
				if (stristr ( $val, 'default/files/' )) {
					$doc = new \DOMDocument ();
					$doc->loadHTML ( $temp_html_arr [$i], LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
					$xpath = new \DOMXPath ( $doc );
					$blm_path = $xpath->evaluate ( "string(//@blm-custom)" );

					if ($blm_path) {
						$fileName = end ( explode ( '/', $blm_path ) );
						$editor_options = $xpath->evaluate ( "string(//@blm-editor-options)" );
						$decoded_options = json_decode ( $editor_options, true );
						$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
								$decoded_options
						];
						$m_id = array_column ( $decoded_options, 'id' ) [0];
						$cm_url = array_column ( $decoded_options, 'url' ) [0];
						$new_val = str_replace ( [ 
								$blm_path,
								$cm_url
						], [ 
								'./medias/' . $m_id . '/' . $fileName,
								'./medias/' . $m_id
						], $temp_html_arr [$i] );
						$temp_html_arr [$i] = $new_val;
					} 
					else {
						$editor_url = file_url_transform_relative ( file_create_url ( 'public://editor' ) );
							$new_val = str_replace ( $editor_url, './medias', $temp_html_arr [$i] );
							$temp_html_arr [$i] = $new_val;
					}
				}
				if (stristr ( $val, 'src=' )) {
					$temp_html_arr [$i] = str_replace ( 'src=', 'src2=',  $temp_html_arr [$i]);
				}
			}
			$tempHtmls = implode ( '', $temp_html_arr );
			if ($tempHtmls != '' || $tempHtmls != null) {
				$temp_htmls [] = $tempHtmls;
			}
		}

		// reads an array of lines
		$templates = implode ( '', $temp_htmls );

		$index_file = file_get_contents ( $abs_crs_path . '/index.html' );

		$html_arr = file ( $abs_crs_path . '/index.html' );
		foreach ( $html_arr as $x => $html_str ) {
			if (stristr ( $html_str, 'externaltexts' )) {
				$externalTexts = $crs->get ( 'field_external_texts' )->getString ();
				if ($externalTexts) {
					$findExT = 'externaltexts = {}';
					$externalHtml = 'externaltexts = ' . $externalTexts;
					$html_arr [$x] = str_replace ( $findExT, $externalHtml, $html_arr [$x] );
				}
			} elseif (stristr ( $html_str, 'courseDefinition' )) {
				$findCrsDef = 'courseDefinition = {}';
				$crsJsonHtml = 'courseDefinition = ' . $crsJson;
				$html_arr [$x] = str_replace ( $findCrsDef, $crsJsonHtml, $html_arr [$x] );
			} elseif (stristr ( $html_str, 'id="data' )) {
				$doc = new \DOMDocument ();
				$doc->loadHTML ( $html_arr [$x], LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
				$xpath = new \DOMXPath ( $doc );
				$divs = $xpath->query ( '//div[@id="data"]' );
				$divs->item ( 0 )->textContent = $templates;
				$html = $doc->saveHTML ();
				$html_arr [$x] = html_entity_decode ( $html );
			}
		}

		$newHtml = implode ( '', $html_arr );

		if (file_exists ( $abs_crs_path . '/index.html' )) {
			unlink ( $abs_crs_path . '/index.html' );
		}

		$index_file = fopen ( $abs_crs_path . '/index.html', 'w+' );
		fwrite ( $index_file, $newHtml );
		fclose ( $index_file );

		return $abs_crs_path;
	}

	/**
	 * Handle course preview.
	 *
	 * @return \Symfony\Component\HttpFoundation\JsonResponse
	 */
	public function previewCourse() {
		global $base_url;
		\Drupal::service ( 'page_cache_kill_switch' )->trigger ();
		$content = json_decode ( \Drupal::request ()->getContent (), true );
		$crs_id = $content ['crs_id'];
		$element_id = $content ['element_id'];

		if ($crs_id) {

			$file_system = \Drupal::service ( 'file_system' );

			$crs = Node::load ( $crs_id );

			$abs_crs_path = $this->courseHtml ( $crs_id, [ ] );

			// $dataDiv = '<div id="data" class="data" style="display: none;">';
			// $newDataDiv = $dataDiv.$templates;
			// $html = str_replace(['{}',$dataDiv],[$crsJson,$newDataDiv],$index_file);
			/*
			 * $externalTexts = $crs->get('field_external_texts')->getString();
			 * $html = $index_file;
			 * if($externalTexts){
			 * $findExT = 'window.externaltexts = {}';
			 * $externalHtml = 'window.externaltexts = ' . $externalTexts;
			 * $html = str_replace($findExT,$externalHtml,$html);
			 * }
			 *
			 * $findCrsDef = 'window.courseDefinition = {}';
			 * $crsJsonHtml = 'window.courseDefinition = ' . $crsJson;
			 * $html = str_replace($findCrsDef,$crsJsonHtml,$html);
			 *
			 * $doc = new \DOMDocument;
			 * $doc->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
			 * $xpath = new \DOMXPath($doc);
			 * $divs = $xpath->query('//div[@id="data"]');
			 * $divs->item(0)->nodeValue = $templates;
			 * $newHtml = html_entity_decode($doc->saveHTML());
			 */

			$preview_path = $file_system->realpath ( '' ) . '/preview/';
			if (! file_exists ( $preview_path )) {
				mkdir ( $preview_path, 0777, true );
			}

			$preview_crs_path = $preview_path . $crs_id;
			if (file_exists ( $preview_crs_path )) {
				// $dir = $file_system->realpath('public://editor/course/');
				$this->removeDirectory ( $preview_crs_path );
			}
			mkdir ( $preview_crs_path, 0777, true );

			$preview_copy = $this->recurseCopy ( $abs_crs_path, $preview_crs_path );

			if ($element_id) {
				$final_file_uri = $base_url . '/preview/' . $crs_id . '/index.html#ID' . $element_id;
			} else {
				$final_file_uri = $base_url . '/preview/' . $crs_id . '/index.html';
			}

			return new JsonResponse ( [ 
					'result' => 'OK',
					'file_uri' => $final_file_uri
			] );
		} else {
			return new JsonResponse ( [ 
					'result' => 'Course id is invalid'
			] );
		}
	}

	// Delete content category(folder)
	public function deleteFolder(Request $request) {
		\Drupal::service ( 'page_cache_kill_switch' )->trigger ();
		$cf_id = \Drupal::request ()->request->get ( 'cf_id' );

		if ($cf_id) {
			$cf = Node::load ( $cf_id );
			$crs_id = $cf->get ( 'field_cf_children' )->getString ();
			$cf->save ();
			$parent_cf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'content_folder' )->condition ( 'field_cf_content_folder', $cf_id )->execute ();

			$curr_url = \Drupal::request ()->server->get ( 'HTTP_REFERER' );
			$url_int = explode ( 'view/', $curr_url ) [1];
			$curr_id = end ( explode ( '/', $url_int ) );

			if (! empty ( $parent_cf_ids )) {
				if ($cf_id == $curr_id) {
					$redirect_url = explode ( '/', $url_int ) [0] . '/' . explode ( '/', $url_int ) [1] . '/' . implode ( '', $parent_cf_ids );
				} else {
					$redirect_url = explode ( '/', $url_int ) [0] . '/' . explode ( '/', $url_int ) [1] . '/' . $curr_id;
				}
			} else {
				$redirect_url = explode ( '/', $url_int ) [0] . '/0/0/';
			}

			if ($crs_id) {
				return new JsonResponse ( [ 
						'result' => 'This Folder is not empty'
				] );
			} else {
				$sub_cf_id_values = $cf->get ( 'field_cf_content_folder' )->getValue ();
				$sub_cf_ids = $this->getTargetIds ( $sub_cf_id_values );

				if (! empty ( $sub_cf_ids )) {
					$sub_crs_ids = '';
					foreach ( $sub_cf_ids as $sub_cf_id ) {
						$sub_crs_ids .= $this->checkFolderForCourse ( $sub_cf_id );
					}

					if (! empty ( $sub_crs_ids )) {

						return new JsonResponse ( [ 
								'result' => 'This Folder is not empty'
						] );
					} else {
						foreach ( $parent_cf_ids as $parent_cf_id ) {
							if ($parent_id) {
								$parent_cf = Node::load ( $parent_cf_id );
								$cf_target_ids = $parent_cf->get ( 'field_cf_content_folder' )->getValue ();
								$cf_chlds = array_column ( $cf_target_ids, 'target_id' );
								$cf_key = array_search ( $cf_id, $cf_chlds );
								unset ( $cf_target_ids [$cf_key] );
								$parent_cf->set ( 'field_cf_content_folder', $cf_target_ids );
								$parent_cf->save ();
							}
						}

						$isDeleted = $this->deleteRecursiveFolder ( $cf_id );
						if ($isDeleted) {
							return new JsonResponse ( [ 
									'result' => 'OK',
									'redirect_url' => $redirect_url
							] );
						}
					}
				} else {
					foreach ( $parent_cf_ids as $parent_cf_id ) {
						if ($parent_id) {
							$parent_cf = Node::load ( $parent_cf_id );
							$cf_target_ids = $parent_cf->get ( 'field_cf_content_folder' )->getValue ();
							$cf_chlds = array_column ( $cf_target_ids, 'target_id' );
							$cf_key = array_search ( $cf_id, $cf_chlds );
							unset ( $cf_target_ids [$cf_key] );
							$parent_cf->set ( 'field_cf_content_folder', $cf_target_ids );
							$parent_cf->save ();
						}
					}

					$cf->delete ();

					return new JsonResponse ( [ 
							'result' => 'OK',
							'redirect_url' => $redirect_url
					] );
				}
			}
		} else {
			return new JsonResponse ( [ 
					'result' => 'Folder id is invalid'
			] );
		}
	}
	public function checkFolderForCourse($folder_id) {
		$crs_ids = '';
		$crsIds = '';
		if ($folder_id) {
			$folder = Node::load ( $folder_id );
			if ($folder) {
				$crsIds = $folder->get ( 'field_cf_children' )->getString ();
			}
		}
		if ($crsIds) {
			$crs_ids .= $crsIds;
			return $crs_ids;
		} else {
			if ($folder) {
				$cf_id_values = $folder->get ( 'field_cf_content_folder' )->getValue ();
				$cf_ids = $this->getTargetIds ( $cf_id_values );
			}
			if (! empty ( $cf_ids )) {
				foreach ( $cf_ids as $cf_id ) {
					$crs_ids .= $this->checkFolderForCourse ( $cf_id );
				}
			}
			return $crs_ids;
		}
	}
	public function deleteRecursiveFolder($cf_id) {
		if ($cf_id) {
			$cf = Node::load ( $cf_id );
			if ($cf) {
				$sub_cf_id_values = $cf->get ( 'field_cf_content_folder' )->getValue ();
				$sub_cf_ids = $this->getTargetIds ( $sub_cf_id_values );
				if ($sub_cf_ids) {
					foreach ( $sub_cf_ids as $sub_cf_id ) {
						$this->deleteRecursiveFolder ( $sub_cf_id );
					}
				}
				$cf->delete ();
			}
		}
		return true;
	}

	// Delete content category(folder)
	public function deleteStyleFolder(Request $request) {
		\Drupal::service ( 'page_cache_kill_switch' )->trigger ();
		$sf_id = \Drupal::request ()->request->get ( 'sf_id' );

		if ($sf_id) {
			$sf = Node::load ( $sf_id );
			$sid = $sf->get ( 'field_sf_children' )->getString ();
			$sf->save ();

			$parent_sf_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style_folder' )->condition ( 'field_sf_style_folder', $sf_id )->execute ();

			$curr_url = \Drupal::request ()->server->get ( 'HTTP_REFERER' );
			$url_int = explode ( 'view/', $curr_url ) [1];
			$curr_id = end ( explode ( '/', $url_int ) );

			if (! empty ( $parent_sf_ids )) {
				if ($sf_id == $curr_id) {
					$redirect_url = explode ( '/', $url_int ) [0] . '/' . explode ( '/', $url_int ) [1] . '/' . implode ( '', $parent_sf_ids );
				} else {
					$redirect_url = explode ( '/', $url_int ) [0] . '/' . explode ( '/', $url_int ) [1] . '/' . $curr_id;
				}
			} else {
				$redirect_url = explode ( '/', $url_int ) [0] . '/0/0/';
			}

			if ($sid) {
				return new JsonResponse ( [ 
						'result' => 'This Style Folder is not empty'
				] );
			} else {
				$sub_sf_id_values = $sf->get ( 'field_sf_style_folder' )->getValue ();
				$sub_sf_ids = $this->getTargetIds ( $sub_sf_id_values );

				if (! empty ( $sub_sf_ids )) {
					$sub_sids = '';
					foreach ( $sub_sf_ids as $sub_sf_id ) {
						$sub_sids .= $this->checkFolderForStyle ( $sub_sf_id );
					}

					if (! empty ( $sub_sids )) {

						return new JsonResponse ( [ 
								'result' => 'This Style Folder is not empty'
						] );
					} else {
						foreach ( $parent_sf_ids as $parent_sf_id ) {
							if ($parent_id) {
								$parent_sf = Node::load ( $parent_sf_id );
								$sf_target_ids = $parent_sf->get ( 'field_sf_style_folder' )->getValue ();
								$sf_chlds = array_column ( $sf_target_ids, 'target_id' );
								$sf_key = array_search ( $sf_id, $sf_chlds );
								unset ( $sf_target_ids [$sf_key] );
								$parent_sf->set ( 'field_sf_style_folder', $sf_target_ids );
								$parent_sf->save ();
							}
						}

						$isDeleted = $this->deleteRecursiveStyleFolder ( $sf_id );
						if ($isDeleted) {
							return new JsonResponse ( [ 
									'result' => 'OK',
									'redirect_url' => $redirect_url
							] );
						}
					}
				} else {
					foreach ( $parent_sf_ids as $parent_sf_id ) {
						if ($parent_id) {
							$parent_sf = Node::load ( $parent_sf_id );
							$sf_target_ids = $parent_sf->get ( 'field_sf_style_folder' )->getValue ();
							$sf_chlds = array_column ( $sf_target_ids, 'target_id' );
							$sf_key = array_search ( $sf_id, $sf_chlds );
							unset ( $sf_target_ids [$sf_key] );
							$parent_sf->set ( 'field_sf_style_folder', $sf_target_ids );
							$parent_sf->save ();
						}
					}

					$sf->delete ();

					return new JsonResponse ( [ 
							'result' => 'OK',
							'redirect_url' => $redirect_url
					] );
				}
			}
		} else {
			return new JsonResponse ( [ 
					'result' => 'Style Folder id is invalid'
			] );
		}
	}
	public function checkFolderForStyle($folder_id) {
		$s_ids = '';
		$sIds = '';
		if ($folder_id) {
			$folder = Node::load ( $folder_id );
			if ($folder) {
				$sIds = $folder->get ( 'field_sf_children' )->getString ();
			}
		}
		if ($sIds) {
			$s_ids .= $sIds;
			return $s_ids;
		} else {
			if ($folder) {
				$sf_id_values = $folder->get ( 'field_sf_style_folder' )->getValue ();
				$sf_ids = $this->getTargetIds ( $sf_id_values );
			}
			if (! empty ( $sf_ids )) {
				foreach ( $sf_ids as $sf_id ) {
					$s_ids .= $this->checkFolderForStyle ( $sf_id );
				}
			}
			return $s_ids;
		}
	}
	public function deleteRecursiveStyleFolder($sf_id) {
		if ($sf_id) {
			$sf = Node::load ( $sf_id );
			if ($sf) {
				$sub_sf_id_values = $sf->get ( 'field_sf_style_folder' )->getValue ();
				$sub_sf_ids = $this->getTargetIds ( $sub_sf_id_values );
				if ($sub_sf_ids) {
					foreach ( $sub_sf_ids as $sub_sf_id ) {
						$this->deleteRecursiveStyleFolder ( $sub_sf_id );
					}
				}
				$sf->delete ();
			}
		}
		return true;
	}
	public function getChildrenByCourse($nid) {
		$n = Node::load ( $nid );
		$type = $n->getType ();
		$field = $this->getNodeRelFieldName ( $type );
		$children = $n->$field->getValue ();
		$ch_ids = [ ];
		if (! empty ( $children )) {
			foreach ( $children as $cc ) {
				$cn = Node::load ( $cc ['target_id'] );
				if (! empty ( $cn )) {
					$cid = $cn->id ();
					$ctype = $cn->getType ();
					$ch_ids [] = $cid;
					if ($ctype != 'simple_content') {
						$arr = [ ];
						$arr = $this->getChildrenByCourse ( $cid );
					}
				}
			}
		}
		return;
	}
	public function cloneNode($nid, $dup_crs_id) {
		$n = Node::load ( $nid );
		$last_pnode_id = $n->id ();
		// get children
		$type = $n->getType ();
		$field = $this->getNodeRelFieldName ( $type );
		$children = $n->$field->getValue ();
		$temp_ids = [ ];
		// clone all children
		if (! empty ( $children )) {
			foreach ( $children as $cc ) {
				$cn = Node::load ( $cc ['target_id'] );
				if (! empty ( $cn )) {
					$ctype = $cn->getType ();

					/**
					 * * Clone a Child Node
					 */
					$c_clone_node = $cn->createDuplicate ();
					if ($ctype == 'screen') {
						// $c_clone_node->set('field_scr_connections','repeat');
					} elseif ($ctype == 'page') {
						// $c_clone_node->set('field_page_connections','repeat');
					}
					$c_clone_node->save ();
					$last_cnode_id = $c_clone_node->id ();

					// get Course medias
					$cm_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course_element', $cc ['target_id'] )->execute ();

					if (! empty ( $cm_ids )) {
						$cm_ids = array_values ( $cm_ids );
						$course_medias = Node::loadMultiple ( $cm_ids );
						$file_system = \Drupal::service ( 'file_system' );
						$cloned_mids = [ ];
						$old_paths = [ ];
						$filePaths = [ ];
						foreach ( $course_medias as $cm ) {
							$cm_type = $cm->get ( 'field_cm_type' )->getString ();
							$dup_cm = $cm->createDuplicate ();
							$file_path = $dup_cm->get ( 'field_cm_file_path' )->getString ();
							$file_name = end ( explode ( '/', $file_path ) );
							$oldUniqueId = explode ( '_', $file_name ) [0];
							$newUniqueId = uniqid ();
							$dest_src = str_replace ( $oldUniqueId, $newUniqueId, $file_path );
							$full_path = $file_system->realpath ( $file_path );
							$dest_path = $file_system->realpath ( $dest_src );
							if (strpos ( $cm_type, 'zip' ) !== false) {
								$file_save = $this->recurseCopy ( $full_path, $dest_path );
							} elseif (strpos ( $cm_type, 'video' ) !== false || strpos ( $cm_type, 'audio' ) !== false || strpos ( $cm_type, 'octet' ) !== false || strpos ( $cm_type, 'stream' ) !== false) {
								$dup_cm->save ();
								$wav_json_path = $dup_cm->get ( 'field_cm_wav_json_path' )->getString ();
								if ($wav_json_path) {
									$dest_json_path = str_replace ( $cm->id (), $dup_cm->id (), $wav_json_path );
									$src_json_path = $file_system->realpath ( $wav_json_path );
									$dest_json_realpath = $file_system->realpath ( $dest_json_path );
									$wav_copy = $file_system->copy ( $src_json_path, $dest_json_realpath, FileSystemInterface::EXISTS_RENAME );
									$dup_cm->set ( 'field_cm_wav_json_path', $dest_json_path );
								}
								$mp3_path = $dup_cm->get ( 'field_cm_audio_path' )->getString ();
								if ($mp3_path) {
									$dest_mp3_path = str_replace ( $cm->id (), $dup_cm->id (), $mp3_path );
									$src_mp3_path = $file_system->realpath ( $mp3_path );
									$dest_mp3_realpath = $file_system->realpath ( $dest_mp3_path );
									$mp3_copy = $file_system->copy ( $src_mp3_path, $dest_mp3_realpath, FileSystemInterface::EXISTS_RENAME );
									$dup_cm->set ( 'field_cm_audio_path', $dest_mp3_path );
								}
								$file_save = $file_system->copy ( $full_path, $dest_path, FileSystemInterface::EXISTS_RENAME );
							} else {
								$file_save = $file_system->copy ( $full_path, $dest_path, FileSystemInterface::EXISTS_RENAME );
							}

							if (strpos ( $cm->getTitle (), $cc ['target_id'] ) !== false) {
								$old_title = $cm->getTitle ();
								$new_title = str_replace ( $cc ['target_id'], $last_cnode_id, $old_title );
								$dup_cm->setTitle ( $new_title );
								$dup_cm->set ( 'field_cm_subtitle', $new_title );
							}

							$dup_cm->set ( 'field_cm_course', $dup_crs_id );
							$dup_cm->set ( 'field_cm_course_element', $last_cnode_id );
							$dup_cm->set ( 'field_cm_file_path', $dest_src );
							$dup_cm->save ();

							// Update Templates HTML & Media Params
							$mdata = [ ];
							$mdata = [ 
									'cm_id' => $cm->id (),
									'cloned_id' => $dup_cm->id (),
									'old_path' => $oldUniqueId,
									'new_path' => $newUniqueId
							];
							$this->updateTempHtml ( $last_cnode_id, $mdata );
						}
					}

					$ch_ids [] = $last_cnode_id;
					if ($ctype == 'partpage' || $ctype == 'screen' || $ctype == 'question' || $ctype == 'chapter' || $ctype == 'custom' || $ctype == 'page' || $ctype == 'simple_content' || $ctype == 'simple_page') {
						$temp_ids [$cn->id ()] = $last_cnode_id;
					}

					if ($ctype != 'simple_content' || $ctype != 'simple_page') {
						$cfield = $this->getNodeRelFieldName ( $ctype );
						$arr = [ ];
						$arr = $this->cloneNode ( $last_cnode_id, $dup_crs_id );
						foreach ( $arr as $key => $val ) {
							$temp_ids [$key] = $val;
						}
					}
				}
			}
			if (! empty ( $ch_ids )) {
				// update relationship to parent
				$upd = Node::load ( $last_pnode_id );
				$upd->set ( $field, $ch_ids );
				$upd->save ();
			}
		}

		return $temp_ids;
	}
	public function updateTempHtml($pp_id, $mdata) {
		$pp = Node::load ( $pp_id );
		$search_id = $mdata ['cm_id'] ?? $mdata ['cm_id'];
		$replace_id = $mdata ['cloned_id'] ?? $mdata ['cloned_id'];
		$old_path = $mdata ['old_path'] ?? $mdata ['old_path'];
		$filePath = $mdata ['new_path'] ?? $mdata ['new_path'];
		
		$final_html = '';
		if ($pp->getType () == 'page') {
			$bgm_param_field = 'field_page_bgm_param';
			$media_param_field = 'field_page_media_params';
			$field_page_nav_temp = 'field_page_nav_temp';
		}
		if ($pp->getType () == 'screen') {
			$html_field = 'field_scr_html';
			$cnx_field = 'field_scr_connections';
			$media_param_field = 'field_scr_media_params';
			$field_scr_navigation_template = 'field_scr_navigation_template';
		} elseif ($pp->getType () == 'question') {
			$html_field = 'field_ques_html';
			$media_param_field = 'field_ques_media_params';
			$field_ques_nav_temp = 'field_ques_nav_temp';
			
		} elseif ($pp->getType () == 'partpage') {
			$html_field = 'field_pp_html';
			$html_param_field = 'field_pp_html_params';
			$media_param_field = 'field_pp_media_params';
		} elseif ($pp->getType () == 'simple_partpage') {
			$html_field = 'field_spp_html';
			$html_param_field = 'field_spp_html_params';
			$media_param_field = 'field_spp_media_params';
		} elseif ($pp->getType () == 'custom') {
			$media_param_field = 'field_custom_media_params';
			$files_param_field = 'field_custom_files_param';
			$field_custom_navigation_template = 'field_custom_navigation_template';			
		} elseif ($pp->getType () == 'chapter') {
			$media_param_field = 'field_chap_media_params';
			$field_chap_nav_temp = 'field_chap_nav_temp';
		} elseif ($pp->getType () == 'simple_content') {
			$html_field = 'field_sc_html';
			$media_param_field = 'field_sc_media_params';
		} elseif ($pp->getType () == 'simple_page') {
			$html_field = 'field_sp_html';
			$bgm_param_field = 'field_sp_background_parameters';
			$media_param_field = 'field_sp_media_params';
		}

		if ($html_field) {
			$pp_html_val = $pp->get ( $html_field )->getString ();
			$pp_html = str_replace ( $search_id, $replace_id, $pp_html_val );
			$final_html = str_replace ( $old_path, $filePath, $pp_html );

			$pp->set ( $html_field, $final_html );
		}

		if ($field_page_nav_temp) {
			$pp_html_val = $pp->get ( $field_page_nav_temp )->getString ();
			$pp_html = str_replace ( $search_id, $replace_id, $pp_html_val );
			$final_html = str_replace ( $old_path, $filePath, $pp_html );

			$pp->set ( $field_page_nav_temp, $final_html );
		}
		if ($field_custom_navigation_template) {
			$pp_html_val = $pp->get ( $field_custom_navigation_template )->getString ();
			$pp_html = str_replace ( $search_id, $replace_id, $pp_html_val );
			$final_html = str_replace ( $old_path, $filePath, $pp_html );

			$pp->set ( $field_custom_navigation_template, $final_html );
		}

		if ($field_chap_nav_temp) {
			$pp_html_val = $pp->get ( $field_chap_nav_temp )->getString ();
			$pp_html = str_replace ( $search_id, $replace_id, $pp_html_val );
			$final_html = str_replace ( $old_path, $filePath, $pp_html );

			$pp->set ( $field_chap_nav_temp, $final_html );
		}

		if ($field_scr_navigation_template) {
			$pp_html_val = $pp->get ( $field_scr_navigation_template )->getString ();
			$pp_html = str_replace ( $search_id, $replace_id, $pp_html_val );
			$final_html = str_replace ( $old_path, $filePath, $pp_html );

			$pp->set ( $field_scr_navigation_template, $final_html );
		}
		if ($field_ques_nav_temp) {
			$pp_html_val = $pp->get ( $field_ques_nav_temp )->getString ();
			$pp_html = str_replace ( $search_id, $replace_id, $pp_html_val );
			$final_html = str_replace ( $old_path, $filePath, $pp_html );

			$pp->set ( $field_ques_nav_temp, $final_html );
		}
		if ($html_param_field) {
			$pp_html_param_val = $pp->get ( $html_param_field )->getString ();
			$pp_html_param = str_replace ( $search_id, $replace_id, $pp_html_param_val );
			$final_html_param = str_replace ( $old_path, $filePath, $pp_html_param );

			$pp->set ( $html_param_field, $final_html_param );
		}

		if ($media_param_field) {
			$pp_media_param_val = $pp->get ( $media_param_field )->getString ();
			$pp_media_param = str_replace ( $search_id, $replace_id, $pp_media_param_val );
			$final_media_param = str_replace ( $old_path, $filePath, $pp_media_param );

			$pp->set ( $media_param_field, $final_media_param );
		}

		if ($files_param_field) {
			$pp_files_param_val = $pp->get ( $files_param_field )->getString ();
			$pp_files_param = str_replace ( $search_id, $replace_id, $pp_files_param_val );
			$final_files_param = str_replace ( $old_path, $filePath, $pp_files_param );

			$pp->set ( $files_param_field, $final_files_param );
		}

		if ($bgm_param_field) {
			$pp_media_param_val = $pp->get ( $bgm_param_field )->getString ();
			$page_bgm_param = str_replace ( $search_id, $replace_id, $pp_media_param_val );
			$final_bgm_param = str_replace ( $old_path, $filePath, $page_bgm_param );

			$pp->set ( $bgm_param_field, $final_bgm_param );
		}

		$pp->save ();

		return $final_html;
	}
	public function updateAction($nid, $cl_id, $cloned_ids) {
		$dup_pnode = Node::load ( $cl_id );
		$n = Node::load ( $nid );

		$keys = array_keys ( $cloned_ids );
		$values = array_values ( $cloned_ids );

		if ($dup_pnode->getType () == 'screen') {
			$scr_html = $dup_pnode->get ( 'field_scr_html' )->getString ();
			$scr_html = str_replace ( $keys, $values, $scr_html );
			$dup_pnode->set ( 'field_scr_html', $scr_html );

			$scr_prereq = $dup_pnode->get ( 'field_scr_cust_prereq_param' )->getString ();
			$scr_prereq = str_replace ( $keys, $values, $scr_prereq );
			$dup_pnode->set ( 'field_scr_cust_prereq_param', $scr_prereq );

			$scr_html_param = $dup_pnode->get ( 'field_scr_html_params' )->getString ();
			$scr_html_param = str_replace ( $keys, $values, $scr_html_param );
			$dup_pnode->set ( 'field_scr_html_params', $scr_html_param );
		} elseif ($dup_pnode->getType () == 'page') {
			$orig_page_targets = $n->get ( 'field_page_children' )->getValue ();
			$orig_page_pp_ids = array_column ( $orig_page_targets, 'target_id' );
			$orig_pp_nodes = Node::loadMultiple ( $orig_page_pp_ids );
			$orig_pp_nodes = array_values ( $orig_pp_nodes );

			$pp_node_ids = $dup_pnode->get ( 'field_page_children' )->getValue ();
			$pp_node_ids = array_column ( $pp_node_ids, 'target_id' );
			$pp_nodes = Node::loadMultiple ( $pp_node_ids );
			$pp_nodes = array_values ( $pp_nodes );

			foreach ( $pp_nodes as $key => $pp_node ) {
				if ($pp_node->getType () == 'partpage') {
					$pp_html = $pp_node->get ( 'field_pp_html' )->getString ();
					$pp_html = str_replace ( $keys, $values, $pp_html );
					$pp_node->set ( 'field_pp_html', $pp_html );

					$dup_pp_prereq = $pp_node->get ( 'field_pp_cust_prereq_params' )->getString ();
					$dup_pp_prereq = str_replace ( $keys, $values, $dup_pp_prereq );
					$pp_node->set ( 'field_pp_cust_prereq_params', $dup_pp_prereq );

					$dup_pp_html_param = $pp_node->get ( 'field_pp_html_params' )->getString ();
					$dup_pp_html_param = str_replace ( $keys, $values, $dup_pp_html_param );
					$pp_node->set ( 'field_pp_html_params', $dup_pp_html_param );

					$pp_node->save ();
				}
			}

			$dup_page_eval = $dup_pnode->get ( 'field_page_eval_param' )->getString ();
			$dup_page_eval = str_replace ( $keys, $values, $dup_page_eval );
			$dup_pnode->set ( 'field_page_eval_param', $dup_page_eval );

			$dup_page_prereq = $dup_pnode->get ( 'field_page_cust_prereq_params' )->getString ();
			$dup_page_prereq = str_replace ( $keys, $values, $dup_page_prereq );
			$dup_pnode->set ( 'field_page_cust_prereq_params', $dup_page_prereq );

			$dup_page_bgm = $dup_pnode->get ( 'field_page_bgm_param' )->getString ();
			$dup_page_bgm = str_replace ( $keys, $values, $dup_page_bgm );
			$dup_pnode->set ( 'field_page_bgm_param', $dup_page_bgm );

			$dup_page_props = $dup_pnode->get ( 'field_page_prop_params' )->getString ();
			$dup_page_props = str_replace ( $keys, $values, $dup_page_props );
			$dup_pnode->set ( 'field_page_prop_params', $dup_page_props );
		} elseif ($dup_pnode->getType () == 'partpage') {
			$pp_html = $dup_pnode->get ( 'field_pp_html' )->getString ();
			$pp_html = str_replace ( $keys, $values, $pp_html );
			$dup_pnode->set ( 'field_pp_html', $pp_html );

			$dup_pp_prereq = $dup_pnode->get ( 'field_pp_cust_prereq_params' )->getString ();
			$dup_pp_prereq = str_replace ( $keys, $values, $dup_pp_prereq );
			$dup_pnode->set ( 'field_pp_cust_prereq_params', $dup_pp_prereq );

			$dup_pp_html_param = $dup_pnode->get ( 'field_pp_html_params' )->getString ();
			$dup_pp_html_param = str_replace ( $keys, $values, $dup_pp_html_param );
			$dup_pnode->set ( 'field_pp_html_params', $dup_pp_html_param );
		} elseif ($dup_pnode->getType () == 'simple_partpage') {
			$spp_html = $dup_pnode->get ( 'field_spp_html' )->getString ();
			$spp_html = str_replace ( $keys, $values, $spp_html );
			$dup_pnode->set ( 'field_spp_html', $spp_html );

			$dup_spp_prereq = $dup_pnode->get ( 'field_spp_cust_prereq_params' )->getString ();
			$dup_spp_prereq = str_replace ( $keys, $values, $dup_spp_prereq );
			$dup_pnode->set ( 'field_spp_cust_prereq_params', $dup_spp_prereq );

			$dup_spp_html_param = $dup_pnode->get ( 'field_spp_html_params' )->getString ();
			$dup_spp_html_param = str_replace ( $keys, $values, $dup_spp_html_param );
			$dup_pnode->set ( 'field_spp_html_params', $dup_spp_html_param );
		} elseif ($dup_pnode->getType () == 'question') {
			$ques_html = $dup_pnode->get ( 'field_ques_html' )->getString ();
			$ques_html = str_replace ( $keys, $values, $ques_html );
			$dup_pnode->set ( 'field_ques_html', $ques_html );

			$dup_ques_prereq = $dup_pnode->get ( 'field_ques_cust_prereq_param' )->getString ();
			$dup_ques_prereq = str_replace ( $keys, $values, $dup_ques_prereq );
			$dup_pnode->set ( 'field_ques_cust_prereq_param', $dup_ques_prereq );

			$dup_ques_html_param = $dup_pnode->get ( 'field_ques_html_params' )->getString ();
			$dup_ques_html_param = str_replace ( $keys, $values, $dup_ques_html_param );
			$dup_pnode->set ( 'field_ques_html_params', $dup_ques_html_param );
		} elseif ($dup_pnode->getType () == 'chapter') {
			$chap_eval = $dup_pnode->get ( 'field_chap_eval_param' )->getString ();
			$chap_eval = str_replace ( $keys, $values, $chap_eval );
			$dup_pnode->set ( 'field_chap_eval_param', $chap_eval );

			$dup_chap_prereq = $dup_pnode->get ( 'field_chap_cust_prereq_param' )->getString ();
			$dup_chap_prereq = str_replace ( $keys, $values, $dup_chap_prereq );
			$dup_pnode->set ( 'field_chap_cust_prereq_param', $dup_chap_prereq );

			$dup_chap_html_param = $dup_pnode->get ( 'field_chap_prop_params' )->getString ();
			$dup_chap_html_param = str_replace ( $keys, $values, $dup_chap_html_param );
			$dup_pnode->set ( 'field_chap_prop_params', $dup_chap_html_param );
		} elseif ($dup_pnode->getType () == 'custom') {
			$dup_cust_prereq = $dup_pnode->get ( 'field_custom_prereq_params' )->getString ();
			$dup_cust_prereq = str_replace ( $keys, $values, $dup_cust_prereq );
			$dup_pnode->set ( 'field_custom_prereq_params', $dup_cust_prereq );
		} elseif ($dup_pnode->getType () == 'simple_content') {
			$dup_sc_html = $dup_pnode->get ( 'field_sc_html' )->getString ();
			$dup_sc_html = str_replace ( $keys, $values, $dup_sc_html );
			$dup_pnode->set ( 'field_sc_html', $dup_sc_html );

			$dup_sc_html_param = $dup_pnode->get ( 'field_sc_html_params' )->getString ();
			$dup_sc_html_param = str_replace ( $keys, $values, $dup_sc_html_param );
			$dup_pnode->set ( 'field_sc_html_params', $dup_sc_html_param );
		} elseif ($dup_pnode->getType () == 'simple_page') {
			$spp_node_ids = $dup_pnode->get ( 'field_sp_children' )->getValue ();
			$spp_node_ids = array_column ( $spp_node_ids, 'target_id' );
			$spp_nodes = Node::loadMultiple ( $spp_node_ids );
			$spp_nodes = array_values ( $spp_nodes );

			foreach ( $spp_nodes as $key => $spp_node ) {
				if ($spp_node->getType () == 'simple_partpage') {
					$spp_html = $spp_node->get ( 'field_spp_html' )->getString ();
					$spp_html = str_replace ( $keys, $values, $spp_html );
					$spp_node->set ( 'field_spp_html', $spp_html );

					$dup_spp_prereq = $spp_node->get ( 'field_spp_cust_prereq_params' )->getString ();
					$dup_spp_prereq = str_replace ( $keys, $values, $dup_spp_prereq );
					$spp_node->set ( 'field_spp_cust_prereq_params', $dup_spp_prereq );

					$dup_spp_html_param = $spp_node->get ( 'field_spp_html_params' )->getString ();
					$dup_spp_html_param = str_replace ( $keys, $values, $dup_spp_html_param );
					$spp_node->set ( 'field_spp_html_params', $dup_spp_html_param );

					$spp_node->save ();
				}
			}

			$dup_sp_bgm = $dup_pnode->get ( 'field_sp_background_parameters' )->getString ();
			$dup_sp_bgm = str_replace ( $keys, $values, $dup_sp_bgm );
			$dup_pnode->set ( 'field_sp_background_parameters', $dup_sp_bgm );
		}

		$dup_pnode->save ();

		return $cl_ids;
	}

	/*
	 * public function updateAction($nid, $cl_id, $cloned_ids){
	 *
	 * $dup_pnode = Node::load($cl_id);
	 * $n = Node::load($nid);
	 *
	 * if($dup_pnode->getType() == 'screen'){
	 * $chld_targets = $n->get('field_scr_children')->getValue();
	 * $chld = array_column($chld_targets,'target_id');
	 * $scr_html = $dup_pnode->get('field_scr_html')->getString();
	 * $scr_chld = $dup_pnode->get('field_scr_children')->getValue();
	 * $scr_chld = array_column($scr_chld,'target_id');
	 * $scr_html = str_replace($chld,$scr_chld,$scr_html);
	 * $dup_pnode->set('field_scr_html',$scr_html);
	 * $dup_pnode->save();
	 * }
	 * elseif($dup_pnode->getType() == 'page'){
	 * $orig_page_targets = $n->get('field_page_children')->getValue();
	 * $orig_page_pp_ids = array_column($orig_page_targets,'target_id');
	 * $orig_pp_nodes = Node::loadMultiple($orig_page_pp_ids);
	 * $orig_pp_nodes = array_values($orig_pp_nodes);
	 * $pp_node_ids = $dup_pnode->get('field_page_children')->getValue();
	 * $pp_node_ids = array_column($pp_node_ids,'target_id');
	 * $pp_nodes = Node::loadMultiple($pp_node_ids);
	 * $pp_nodes = array_values($pp_nodes);
	 * foreach($pp_nodes as $key => $pp_node){
	 * $orig_pp_chld = $orig_pp_nodes[$key]->get('field_pp_children')->getValue();
	 * $orig_pp_chld = array_column($orig_pp_chld,'target_id');
	 * $pp_html = $pp_node->get('field_pp_html')->getString();
	 * $pp_chld = $pp_node->get('field_pp_children')->getValue();
	 * $pp_chld = array_column($pp_chld,'target_id');
	 * $pp_html = str_replace($orig_pp_chld,$pp_chld,$pp_html);
	 * $pp_node->set('field_pp_html',$pp_html);
	 * $pp_node->save();
	 * }
	 * }
	 * elseif($dup_pnode->getType() == 'partpage'){
	 * $chld_targets = $n->get('field_pp_children')->getValue();
	 * $chld = array_column($chld_targets,'target_id');
	 * $pp_html = $dup_pnode->get('field_pp_html')->getString();
	 * $pp_chld = $dup_pnode->get('field_pp_children')->getValue();
	 * $pp_chld = array_column($pp_chld,'target_id');
	 * $pp_html = str_replace($chld,$pp_chld,$pp_html);
	 * $dup_pnode->set('field_pp_html',$pp_html);
	 * $dup_pnode->save();
	 * }
	 * elseif($dup_pnode->getType() == 'question'){
	 * $chld_targets = $n->get('field_ques_children')->getValue();
	 * $chld = array_column($chld_targets,'target_id');
	 * $ques_html = $dup_pnode->get('field_ques_html')->getString();
	 * $ques_chld = $dup_pnode->get('field_ques_children')->getValue();
	 * $ques_chld = array_column($ques_chld,'target_id');
	 * $ques_html = str_replace($chld,$ques_chld,$ques_html);
	 * $dup_pnode->set('field_ques_html',$ques_html);
	 * $dup_pnode->save();
	 * }
	 * elseif($dup_pnode->getType() == 'chapter'){
	 * $chld_targets = $n->get('field_chap_children')->getValue();
	 * $chld = array_column($chld_targets,'target_id');
	 * $dup_chld_targets = $dup_pnode->get('field_chap_children')->getValue();
	 * $dup_chld = array_column($dup_chld_targets,'target_id');
	 *
	 * if(!empty($chld)){
	 * $chap_chlds = Node::loadMultiple($chld);
	 * $chap_chlds = array_values($chap_chlds);
	 * $dup_chlds = Node::loadMultiple($dup_chld);
	 * $dup_chlds = array_values($dup_chlds);
	 *
	 * foreach($chap_chlds as $key => $chap_c){
	 * if($chap_chlds[$key]->getType() == 'feedback'){
	 * $orig_fb_cids = $chap_chlds[$key]->get('field_feedback_children')->getValue();
	 * $orig_fb_cids = array_column($orig_fb_cids, 'target_id');
	 * $dup_fb_cids = $dup_chlds[$key]->get('field_feedback_children')->getValue();
	 * $dup_fb_cids = array_column($dup_fb_cids,'target_id');
	 *
	 * $chap_eval = $dup_pnode->get('field_chap_eval_param')->getString();
	 * $chap_eval = str_replace($orig_fb_cids, $dup_fb_cids, $chap_eval);
	 * $dup_pnode->set('field_chap_eval_param',$chap_eval);
	 * $dup_pnode->save();
	 * }
	 * }
	 * }
	 * }
	 *
	 *
	 * return $cl_id;
	 * }
	 */
	public function duplicateCourse() {
		
		// Get the current URL.
		$currentUrl = \Drupal::request()->getRequestUri();

		// Create a RedirectResponse to the current URL.
		try {
			// Code that may generate an error or exception
	  
			$content = json_decode ( \Drupal::request ()->getContent (), true );
			$pid = $content ['parent_id'];
			$crs_id = $content ['crs_id'];
			
			$crs = Node::load ( $crs_id );
	
			// Duplicate Course
			$dup_crs = $crs->createDuplicate ();
			$crs_title = $dup_crs->getTitle ();
			$dup_crs->setTitle ( $crs_title . '-duplicated' );
			$dup_crs->set('field_duplicateincomplete', 1);
			$dup_crs->save ();
	
			$dup_crs_id = $dup_crs->id ();
			
			// update duplicated course in style
			$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $crs_id )->execute ();
	
			$stl_id = implode ( '', $style_ids );
	
			$style = Node::load ( $stl_id );
			$st_crs = $style->get ( 'field_s_courses' )->getValue ();
			$st_crs_arr = [ ];
			$st_crs_arr = array_column ( $st_crs, 'target_id' );
			$st_crs_arr [] = $dup_crs_id;
			$style->set ( 'field_s_courses', $st_crs_arr );
			$style->save ();
	
			// Update duplicated course in parent Cf/Dcr
			$parent = Node::load ( $pid );
			$ptype = $parent->getType ();
			if ($ptype == 'domain_content_root') {
				$ch_field = 'field_dcr_children';
			} elseif ($ptype == 'content_folder') {
				$ch_field = 'field_cf_children';
			}
	
			$chld = $parent->get ( $ch_field )->getValue ();
			$chld_arr = [ ];
			$chld_arr = array_column ( $chld, 'target_id' );
			$chld_arr [] = $dup_crs_id;
	
			$parent->set ( $ch_field, $chld_arr );
			$parent->save ();
	
			// Clone children of course
			$cloned_ids = $this->cloneNode ( $dup_crs_id, $dup_crs_id );

			// Clone external files of course.
			$this->cloneExternalFiles ( $crs_id, $dup_crs_id, $stl_id );
	
			// Update feedback evaluation params
			$keys = array_keys ( $cloned_ids );
			$values = array_values ( $cloned_ids );
			
			$dup_crs_n = Node::load ( $dup_crs_id );
			$crs_eval_param = $dup_crs_n->get ( 'field_crs_eval_param' )->getString ();
			$crs_eval_param = str_replace ( $keys, $values, $crs_eval_param );
			$dup_crs_n->set ( 'field_crs_eval_param', $crs_eval_param );
			$dup_crs_n->set('field_duplicateincomplete', 0);
			$dup_crs_n->save ();
	
			// Update action items for children
			foreach ( $cloned_ids as $key => $cl_id ) {
				$this->updateAction ( $key, $cl_id, $cloned_ids );
			}
			
			
			//$dup_crs->save ();
			// If the code above throws an error or exception,
			// the control will jump to the catch block below.
	  
			// Handle successful execution and return a JSON response
			// $response = new JsonResponse([
			//   'success' => true,
			//   'message' => 'Operation successful',
			// ]);
	  
			// return $response;
			return new JsonResponse ( [ 
				'result' => 'OK',
				'message' => 'Operation successful',
				
		] );
		  } catch (\Exception $e) {
			$content = json_decode ( \Drupal::request ()->getContent (), true );
		
	
			// Load the node entity by its ID.
			$dup_crs_id = $dup_crs->id (); // Replace with the ID of the node you want to delete.
			$node = Node::load($dup_crs_id);

			// Check if the node exists.
			if ($node) {
			// Delete the node.
			$node->delete();

			// Optionally, perform additional actions after deleting the node.
			// ...
			}		
		
			// Log the error using Drupal's logger
			\Drupal::logger('bilim')->error($e->getMessage());
	  
			// Build the error response
			$errorResponse = [
			  'success' => false,
			  'message' => 'An error occurred',
			//   'field_duplicateincomplete' => $dup_in_complete,
			];
	  
			// Optionally, include additional error information
			if (\Drupal::config('system.logging')->get('error_level') == 'verbose') {
			  $errorResponse['error_details'] = $e->getMessage();
			}
	  
			// Return the error JSON response
			return new JsonResponse($errorResponse, 500);
		  }
		/*
		 * $dup_crs_chld = $dup_crs->get('field_crs_children')->getValue();
		 * $chld_ids = array_column($dup_crs_chld,'target_id');
		 *
		 * $cloned_ids = [];
		 *
		 * foreach($chld_ids as $cid){
		 * $ch_node = Node::load($cid);
		 * $ch_type = $ch_Node->getType();
		 * $ch_field = $this->getNodeRelFieldName($ch_type);
		 *
		 * $sub_n = $ch_node->get($ch_field)->getValue();
		 * $sub_nids = array_column($sub_n,'target_id');
		 *
		 * foreach($sub_nids as $sub_nid){
		 * $cloned_ids[] = $this->cloneNode($sub_nid);
		 * }
		 * }
		 */

		// get Course medias
		/*
		 * $cm_ids = \Drupal::entityQuery('node')
		 * ->condition('type', 'course_medias')
		 * ->condition('field_cm_course_element',$crs_id)
		 * ->execute();
		 *
		 * //Add elements to course medias
		 * if(!empty($cm_ids)){
		 * $course_medias = Node::loadMultiple($cm_ids);
		 * foreach($course_medias as $cm){
		 * $cm_elements = $cm->get('field_cm_course_element')->getValue();
		 * $elem_arr = array_column($cm_elements,'target_id');
		 * if(!empty($elem_arr)){
		 * $elem_arr[] = $dup_crs->id();
		 * $cm->set('field_cm_course_element',$elem_arr);
		 * $cm->save();
		 * }
		 * }
		 * }
		 */

		// return new JsonResponse ( [ 
		// 		'result' => 'OK'
		// ] );
	}
	public function getAllDomainsTree() {
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_domain' );
		$uid = \Drupal::currentUser ()->id ();
		$user = User::load ( $uid );
		$user_roles = $user->getRoles ();
		$customer = $user->get ( 'field_customer' )->getString ();

		if (in_array ( 'supervisor', $user_roles )) {
			$domainIds = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->
			// ->condition('title',['tests','modeles'],'NOT IN')
			execute ();
		} elseif (in_array ( 'domain_admin', $user_roles )) {
			$domainIds = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'domain' )->condition ( 'title', $customer )->execute ();
		}

		$result = [ ];
		$domain_trees = [ ];
		foreach ( $domainIds as $domainId ) {
			$domain_trees [] = $this->getDomainTree ( $domainId );
		}

		$p_ids = $tempstore->get ( 'parent_ids' );
		$result [] = $domain_trees;
		$result ['parent_ids'] = $p_ids;

		return $result;
	}
	public function getDomainTree($domainId, $root = null, $cf = null) {
		global $base_url;
		$tempstore = \Drupal::service ( 'tempstore.private' )->get ( 'sess_domain' );
		$qn = Node::load ( $domainId );
		$domain_name = $qn->getTitle ();
		$result = [ ];
		$s_dmn = $tempstore->get ( 's_domain' );
		$status = false;
		$curnode = false;

		$crs_children = $qn->get ( 'field_domain_children' )->getValue ();
		// get children
		$chlds = $this->getTargetIds ( $crs_children );
		$nodes = Node::loadMultiple ( $chlds );
		$children = [ ];

		foreach ( $nodes as $node ) {
			if ($node->bundle () == 'domain_content_root') {
				$children [] = $node->id ();
			}
		}

		$domain_children = $this->getDomainTreeChildrenByChildren ( $domainId, $children, $root, $cf );

		if ($s_dmn == $domainId) {
			$status = true;
		}

		$link = $base_url . '/platform/domainview/' . $domainId . '/0/0';

		$result = [ 
				'id' => $domainId,
				'domain_root' => $domain_children [0] ['id'],
				'title' => strtoupper ( $domain_name ),
				'type' => $qn->getType (),
				'status' => $status,
				'curnode' => $curnode,
				'link' => $link,
				'children' => $domain_children [0] ['children']
		];
		return $result;
	}
	public function moveCourse(Request $request) {
		global $base_url;
		$rawData = $request->getContent ();

		if (! empty ( $rawData )) {
			$data = json_decode ( $rawData, true );
		}

		$parent_id = $data ['pid'];
		$crs_id = $data ['crs_id'];
		$type = $data ['type'];
		if ($type == 'domain') {
			$dest_id = $data ['root'];
		} elseif ($type == 'content_folder') {
			$dest_id = $data ['dest_id'];
		}

		// Update the course to the destination folder
		$dest_chld_arr = [ ];
		$dest_n = Node::load ( $dest_id );
		if ($type == 'content_folder') {
			$dest_chld_val = $dest_n->get ( 'field_cf_children' )->getValue ();
			$dest_chld_arr = array_column ( $dest_chld_val, 'target_id' );
			$dest_chld_arr [] = $crs_id;
			$dest_n->set ( 'field_cf_children', $dest_chld_arr );
			$dest_n->save ();
		} elseif ($type == 'domain') {
			$dcr_chld_val = $dest_n->get ( 'field_dcr_children' )->getValue ();
			$dcr_chld_arr = array_column ( $dcr_chld_val, 'target_id' );
			$dcr_chld_arr [] = $crs_id;
			$dest_n->set ( 'field_dcr_children', $dcr_chld_arr );
			$dest_n->save ();
		}

		// Remove the course from parent folder
		$parent = Node::load ( $parent_id );
		if ($parent->getType () == 'content_folder') {
			$p_chld_val = $parent->get ( 'field_cf_children' )->getValue ();
			$p_chld_arr = array_column ( $p_chld_val, 'target_id' );
			$key = array_search ( $crs_id, $p_chld_arr );
			unset ( $p_chld_val [$key] );
			$parent->set ( 'field_cf_children', $p_chld_val );
			$parent->save ();
		} elseif ($parent->getType () == 'domain_content_root') {
			$p_chld_val = $parent->get ( 'field_dcr_children' )->getValue ();
			$p_chld_arr = array_column ( $p_chld_val, 'target_id' );
			$key = array_search ( $crs_id, $p_chld_arr );
			unset ( $p_chld_val [$key] );
			$parent->set ( 'field_dcr_children', $p_chld_val );
			$parent->save ();
		}

		return new JsonResponse ( [ 
				'result' => 'OK',
				'dest_id' => $dest_id
		] );
	}
	public function duplicateMoveCourse(Request $request) {
		global $base_url;
		$rawData = $request->getContent ();

		if (! empty ( $rawData )) {
			$data = json_decode ( $rawData, true );
		}

		$dest_id = $data ['dest_id'];
		$crs_id = $data ['crs_id'];
		$type = $data ['type'];
		if ($type == 'domain') {
			$dest_id = $data ['root'];
		}
		$crs = Node::load ( $crs_id );

		// Duplicate Course
		$dup_crs = $crs->createDuplicate ();
		$crs_title = $dup_crs->getTitle ();
		$dup_crs->setTitle ( $crs_title . '-duplicated' );
		$dup_crs->save ();

		$dup_crs_id = $dup_crs->id ();

		// update duplicated course in style
		$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $crs_id )->execute ();

		$stl_id = implode ( '', $style_ids );

		$style = Node::load ( $stl_id );
		$st_crs = $style->get ( 'field_s_courses' )->getValue ();
		$st_crs_arr = [ ];
		$st_crs_arr = array_column ( $st_crs, 'target_id' );
		$st_crs_arr [] = $dup_crs_id;
		$style->set ( 'field_s_courses', $st_crs_arr );
		$style->save ();

		// Update duplicated course in destination Cf/Dcr
		$dest_n = Node::load ( $dest_id );
		if ($type == 'domain') {
			$ch_field = 'field_dcr_children';
		} elseif ($type == 'content_folder') {
			$ch_field = 'field_cf_children';
		}

		$chld = $dest_n->get ( $ch_field )->getValue ();
		$chld_arr = [ ];
		$chld_arr = array_column ( $chld, 'target_id' );
		$chld_arr [] = $dup_crs_id;

		$dest_n->set ( $ch_field, $chld_arr );
		$dest_n->save ();

		// Clone children of course
		$cloned_ids = $this->cloneNode ( $dup_crs_id, $dup_crs_id );

		// Clone external files of course.
		$this->cloneExternalFiles ( $crs_id, $dup_crs_id, $stl_id );

		foreach ( $cloned_ids as $key => $cl_id ) {
			$this->updateAction ( $key, $cl_id, $cloned_ids );
		}

		return new JsonResponse ( [ 
				'result' => 'OK'
		] );
	}

	/*
	 * Get breadcrumb list
	 */
	public function getBreadcrumbTree($ids,$param,$courseId) {
		global $base_url;
		$crs_parent = $this->getParentCFByChild($ids['cf_children'], 'field_cf_content_folder');
		$crs_parent = array_merge($crs_parent, [$ids['cf_children']]);
		$tempstore = \Drupal::service('tempstore.private')->get('sess_domain');
		$domain = $ids['d_id'];
		$nodes = Node::loadMultiple($param);
		$result  = [];
		$link = '';
		foreach ($nodes as $n) {
			$type = $n->getType();
			$nid = $n->id();
			$chld = '';
			$chld_elem = [];
			if($type == 'content_folder'):
				$s_dmn = $tempstore->get('s_domain');
				$cs = $n->get('field_cf_children')->getValue();
				if($cs){
					foreach($cs as $c) {
						if($c['target_id'] != $courseId) {
							$chld = $n->get('field_cf_content_folder')->getValue();
							foreach($chld as $key => $ch){
								if(!in_array($ch['target_id'], $crs_parent)){ 
									unset($chld[$key]);
								}
							}
						}
						else {
							$chld = '';
							break;
						}
					}
				}
				else{
					$chld = $n->get('field_cf_content_folder')->getValue();
					foreach($chld as $key => $ch){
						if(!in_array($ch['target_id'], $crs_parent)){ 
							unset($chld[$key]);
						}
					}
				}
				$link = $base_url . '/platform/domainview/'.$domain.'/'.$s_dmn.'/'.$nid;
			else:
				$tempstore->set('s_domain', $nid);
				$link = $base_url . '/platform/domainview/'.$domain.'/'.$nid.'/0';
				$field_name = $this->getNodeRelFieldName($type);
				if($field_name != ''):
					$chld = $n->get($field_name)->getValue();
					foreach($chld as $key => $c) {
						$arr = array_column($chld,'target_id');
						if(!in_array($ids['cf_children'],$arr)) {
							if($c['target_id'] != $ids['cf_content_folder']) {
								unset($chld[$key]);
							}
						}
						elseif($c['target_id'] != $ids['cf_children']) {
							unset($chld[$key]);
						}
					}
				endif;
			endif;
			
			if(!empty($chld)):
				$chld_str = $this->getTargetIds($chld);
				$chld_elem = $this->getBreadcrumbTree($ids,$chld_str,$courseId);
			endif;
			
			$result[] = array(
				'id' => $nid,
				'title' => $n->title->value,
				'type' => $n->getType(),
				'link' => $link,
				'children' => $chld_elem,
			);
		}
		return $result;
	}

	public function uploadExternalFiles($cid, $sid, $dir) {
		$fs = $this->get_files_in_dir ( $dir );
		$files = array ();
		foreach ( $fs as $k => $f ) {
			$s_path = $this->str_finish ( $dir, '/' );
			if (! is_dir ( $s_path . $f )) {
				$filespath = \Drupal::service ( 'file_system' )->realpath ( 'public://' );
				$f_dir = str_replace ( $filespath, '', $dir );
				$file_path = 'public://' . $f_dir . '/' . $f;

				$da = array (
						'type' => 'course_medias',
						'title' => $f,
						'field_cm_course' => $cid,
						'field_cm_course_element' => '',
						'field_cm_course_style' => $sid,
						'field_cm_subtitle' => $f,
						'field_cm_size' => '',
						'field_cm_file_path' => $file_path
				);

				$cm = Node::create ( $da );
				$cm->save ();

				$files [] = $cm->id ();
			}
		}
		return $files;
	}
	public function get_files_in_dir(string $dir, $regex = null) {
		$dir = is_dir ( $dir ) ? $dir : dirname ( $dir );
		// A RegEx to check whether a RegEx is a valid RegEx :D
		$pass = preg_match ( "/^([^\\\\a-z ]).+([^\\\\a-z ])[a-z]*$/i", $regex, $matches );

		// Any non-regex string will be caught here.
		if (isset ( $regex ) && ! $pass) {
			// $regex = '/'.addslashes($regex).'/i';
			$regex = "/$regex/i";
		}

		// A valid regex delimiter with different delimiters will be caught here.
		if (! empty ( $matches ) && $matches [1] !== $matches [2]) {
			$regex .= $matches [1] . 'i'; // Append first delimiter and i flag
		}

		try {
			$files = scandir ( $dir );
		} catch ( Exception $ex ) {
			$files = [ 
					'.',
					'..'
			];
		}
		$files = array_slice ( $files, 2 ); // Remove '.' and '..'
		$files = array_reduce ( $files, function ($carry, $item) use ($regex) {
			if ((! empty ( $regex ) && preg_match ( $regex, $item )) || empty ( $regex )) {
				array_push ( $carry, $item );
			}

			return $carry;
		}, [ ] );

		return $files;
	}
	public function str_finish($value, $cap) {
		$quoted = preg_quote ( $cap, '/' );

		return preg_replace ( '/(?:' . $quoted . ')+$/u', '', $value ) . $cap;
	}

	/**
	 * Clone external files on course duplication.
	 */
	public function cloneExternalFiles($nid, $dup_crs_id, $sid) {
		$file_system = \Drupal::service ( 'file_system' );
		$cm_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course', $nid )->condition ( 'field_cm_course_style', $sid )->execute ();

		if (! empty ( $cm_ids )) {
			$cm_ids = array_values ( $cm_ids );
			$course_medias = Node::loadMultiple ( $cm_ids );

			foreach ( $course_medias as $cm ) {
				$cm_type = $cm->get ( 'field_cm_type' )->getString ();
				$dup_cm = $cm->createDuplicate ();
				$file_path = $dup_cm->get ( 'field_cm_file_path' )->getString ();
				$course_style_path = current ( explode ( $nid, $file_path ) );
				$abs_crs_style_path = $file_system->realpath ( $course_style_path );
				$dest_src = str_replace ( $nid, $dup_crs_id, $file_path );
				$full_path = $file_system->realpath ( $file_path );
				$dest_path = $course_style_path . $dup_crs_id . '/external';

				if (! file_exists ( $course_style_path . $dup_crs_id )) {
					mkdir ( $course_style_path . $dup_crs_id, 0777, true );
				}

				if (! file_exists ( $course_style_path . $dup_crs_id . '/external' )) {
					mkdir ( $course_style_path . $dup_crs_id . '/external', 0777, true );
				}

				$file_save = $file_system->copy ( $full_path, $dest_path, FileSystemInterface::EXISTS_RENAME );

				$dup_cm->set ( 'field_cm_course', $dup_crs_id );
				$dup_cm->set ( 'field_cm_file_path', $dest_src );
				$dup_cm->save ();
			}
		}

		return 'External files are successfully cloned';
	}

	/**
	 * Handle course import.
	 *
	 * @return \Symfony\Component\HttpFoundation\JsonResponse
	 */
	/*
	 * public function importCourse(){
	 * \Drupal::service( 'page_cache_kill_switch' )->trigger();
	 * $file = \Drupal::request()->files->get('file');
	 * $sid = \Drupal::request()->request->get('sid');
	 * $pid = \Drupal::request()->request->get('pid');
	 * $path = $file->getPathName();
	 *
	 * $zipArchiver = new \ZipArchive();
	 * //$zipList = $zipArchiver->listContents();
	 *
	 * if ($zipArchiver->open($path)) {
	 * $string = $zipArchiver->getFromName("index.html");
	 * }
	 * $dom = new \DomDocument();
	 * $dom->loadHTML($string);
	 * $script_str = $dom->getElementsByTagName('script')->item(0)->nodeValue;
	 * $courseDefinition = explode('window.courseDefinition', $script_str)[1];
	 * $crs_def_str = str_replace('=', '', $courseDefinition);
	 * $crs_def_str = rtrim(trim($crs_def_str), ';');
	 * $crs_def_arr = json_decode($crs_def_str, true);
	 * $crs_id = str_replace('ID', '', $crs_def_arr['uid']);
	 *
	 *
	 * $crs = Node::load($crs_id);
	 *
	 * //Duplicate Course
	 * $dup_crs = $crs->createDuplicate();
	 * $crs_title = $dup_crs->getTitle();
	 * $dup_crs->save();
	 *
	 * $dup_crs_id = $dup_crs->id();
	 *
	 * //update duplicated course in style
	 * if($sid == 'undefined'){
	 * $style_ids = \Drupal::entityQuery('node')
	 * ->condition('type','style')
	 * ->condition('field_s_courses',$crs_id)
	 * ->execute();
	 * $sid = implode('',$style_ids);
	 * }
	 *
	 *
	 * $style = Node::load($sid);
	 * $st_crs = $style->get('field_s_courses')->getValue();
	 * $st_crs_arr = [];
	 * $st_crs_arr = array_column($st_crs,'target_id');
	 * $st_crs_arr[] = $dup_crs_id;
	 * $style->set('field_s_courses',$st_crs_arr);
	 * $style->save();
	 *
	 *
	 * //Update duplicated course in parent Cf/Dcr
	 * $parent = Node::load($pid);
	 * $ptype = $parent->getType();
	 * if($ptype == 'domain_content_root'){
	 * $ch_field = 'field_dcr_children';
	 * }
	 * elseif($ptype == 'content_folder'){
	 * $ch_field = 'field_cf_children';
	 * }
	 *
	 * $chld = $parent->get($ch_field)->getValue();
	 * $chld_arr = [];
	 * $chld_arr = array_column($chld,'target_id');
	 * $chld_arr[] = $dup_crs_id;
	 *
	 * $parent->set($ch_field,$chld_arr);
	 * $parent->save();
	 *
	 * //Clone children of course
	 * $cloned_ids = $this->cloneNode($dup_crs_id,$dup_crs_id);
	 *
	 * //Clone external files of course.
	 * $this->cloneExternalFiles($crs_id, $dup_crs_id, $sid);
	 *
	 * //Update feedback evaluation params
	 * $keys = array_keys($cloned_ids);
	 * $values = array_values($cloned_ids);
	 *
	 * $dup_crs_n = Node::load($dup_crs_id);
	 * $crs_eval_param = $dup_crs_n->get('field_crs_eval_param')->getString();
	 * $crs_eval_param = str_replace($keys,$values,$crs_eval_param);
	 * $dup_crs_n->set('field_crs_eval_param',$crs_eval_param);
	 * $dup_crs_n->save();
	 *
	 * //Update action items for children
	 * foreach($cloned_ids as $key => $cl_id){
	 * $this->updateAction($key, $cl_id, $cloned_ids);
	 * }
	 *
	 *
	 * return new JsonResponse([
	 * 'result' => 'OK',
	 * 'new_crs_id' => $dup_crs->id(),
	 * ]);
	 * }
	 */

	/**
	 * Handle course import.
	 *
	 * @return \Symfony\Component\HttpFoundation\JsonResponse
	 */
	public function importCourse() {
		\Drupal::service ( 'page_cache_kill_switch' )->trigger ();
		$file = \Drupal::request ()->files->get ( 'file' );
		$sid = \Drupal::request ()->request->get ( 'sid' );
		$pid = \Drupal::request ()->request->get ( 'pid' );
		$p_type = \Drupal::request ()->request->get ( 'type' );
		$path = $file->getPathName ();
		$file_system = \Drupal::service ( 'file_system' );
		$file_url_generator = \Drupal::service ( 'file_url_generator' );
		$ids = [ ];

		$zipArchiver = new \ZipArchive ();
		// $zipList = $zipArchiver->listContents();

		if ($zipArchiver->open ( $path )) {
			$string = $zipArchiver->getFromName ( "index.html" );
		}

		// Parse index.html from Zip file and get required values.
		$content = mb_convert_encoding ( $string, 'HTML-ENTITIES', "UTF-8" );
		$dom = new \DOMDocument ();
		libxml_use_internal_errors ( true );
		$dom->loadHTML ( utf8_decode ( $content ) );
		$script_str = $dom->getElementsByTagName ( 'script' )->item ( 0 )->nodeValue;
		
		// Parse courseDefinition from index.html.
		$courseDefinition = explode ( 'window.courseDefinition', $script_str ) [1];
		$crs_def_str = str_replace ( '=', '', $courseDefinition );
		$crs_def_str = rtrim ( trim ( $crs_def_str ), ';' );
		$crs_def_arr = json_decode ( $crs_def_str, true );
		
		// $crs_id = str_replace('ID', '', $crs_def_arr['uid']);
		$crs_name = $crs_def_arr ['name'];
		$is_eval = $crs_def_arr ['is_evaluation'] ? 'true' : 'false';
		$has_comp = $crs_def_arr ['has_completion'] ? 'true' : 'false';

		// Get Children from courseDefinition.
		$stcr_children = $crs_def_arr ['children'];

		// Get Starting from courseDefinition.
		$strt_children = $crs_def_arr ['starting'];

		// Get Children from courseDefinition.
		$anx_children = $crs_def_arr ['annexes'];

		// Parse externalTexts from index.html.
		$externalTexts = explode ( 'window.externaltexts', $script_str ) [1];
		$externalTexts = explode ( 'window.courseDefinition', $externalTexts ) [0];
		$ext_text_str = str_replace ( '=', '', $externalTexts );
		$ext_text_str = rtrim ( trim ( $ext_text_str ), ';' );

		// Parse blmconfig.json from zip file and get values.
		$blmconfig_data = file_get_contents ( 'zip://' . $path . '#blmconfig.json' );
		$blmconfig = json_decode ( $blmconfig_data, true );
		$display = json_encode ( $blmconfig ['display'] );

		// Parse data id from index.html.
		$xpath = new \DOMXPath ( $dom );
		$data_div = $xpath->query ( '//div[@id="data"]' );
		$templates = $data_div->item ( 0 );
		$temp_html = $dom->saveHTML ( $templates );
		
		$attr = [ ];
		$blm_options = [ ];
		$ids_arr = [ ];
		$entries = $xpath->query ( "//div[@blm-editor-options]" );
		foreach ( $entries as $div ) {
			$attribute = $div->getAttribute ( 'blm-editor-options' );
			$attr [] = $attribute;
			preg_match_all ( '/\"id\":\"(\d+)\"/m', $attribute, $ids_m, PREG_SET_ORDER );

			foreach ( $ids_m as $id_m ) {
				$ids_arr [] = $id_m [1];
			}
		}

		/*
		 * $ids_arr = array_map(function($v){
		 * $decoded = json_decode($v, true);
		 * $ids = [];
		 * $ids[] = array_column($decoded, 'id');
		 * if(empty(array_filter($ids))){
		 * foreach($decoded as $decode) {
		 * $id = array_column($decode, 'id');
		 * if (!empty($id)){
		 * $ids[] = $id;
		 * }
		 * }
		 * }
		 * return array_filter($ids);
		 * }, $attr);
		 */

		// Create Course children - Starting, Structure and Annexes.
		$strt_node = Node::create ( [ 
				'type' => 'starting',
				'title' => $crs_name . ' starting'
		] );
		$strt_node->save ();

		if (! empty ( $strt_children )) {
			$strt_res_arr = $this->createCrsChildren ( $strt_children, $strt_node->id () );
			$ids = array_merge ( $ids, $strt_res_arr );
		}
		
		$struct_styleSummary = $crs_def_arr['stylesummary'];
		$struct_styleSummary = ($struct_styleSummary == 'true' || $struct_styleSummary == '1') ? true : false;
		$struct_styleSummary = json_encode ( ( bool ) $struct_styleSummary );
				

		$stcr_node = Node::create ( [ 
				'type' => 'structure',
				'title' => $crs_name . ' structure',
				'field_struct_style_summary' => $struct_styleSummary,
				'field_struct_screen_on_summary' => $crs_def_arr['screenonsummary']  ? 'true' : 'false',
		] );
		$stcr_node->save ();
		$linkmapping_id_array = array();
		if (! empty ( $stcr_children )) {
			$stcr_res_arr = $this->createCrsChildren ( $stcr_children, $stcr_node->id () );
			$ids = array_merge ( $ids, $stcr_res_arr );
		}

		$anx_node = Node::create ( [ 
				'type' => 'annexes',
				'title' => $crs_name . ' annexes'
		] );
		$anx_node->save ();

		if (! empty ( $anx_children )) {
			$anx_res_arr = $this->createCrsChildren ( $anx_children, $anx_node->id () );
			$ids = array_merge ( $ids, $anx_res_arr );
		}
		
			// Get the Drupal database connection.
			$database = \Drupal::database();
			// Select query to fetch data from a Drupal table.
			$query = $database->select('html_params_links', 't')
			->fields('t', ['id', 'old_id','new_id','import_id','linkedElements']); // Replace 'id' and 'name' with your actual column names.

			// Execute the query and fetch results.
			$result = $query->execute();

			$demo_ids = array();
			//$data = array();

			//data array
			foreach ($result as $row) {
				$id = $row->id;				
				$demo_ids[$row->new_id] = $row->old_id;					
				$data[] = 
					[ 'old_id' => $row->old_id , 'new_id' => $row->new_id, 'import_id' => 1, 'linkedElements' => $row->linkedElements];			
			}
		
			// Execute the query and fetch results.
			$result1 = $query->execute();
		
			// Mapping of old IDs to new IDs
			$demo = array();
			$resultArray_test = array();
			//Mapping array
			foreach ($result1 as $item) {
				
				if ($item->linkedElements !== 'null' && $item->linkedElements !== '""') {
					$load_new_id = $item->new_id;
					$linkedElements = json_decode($item->linkedElements, true);
					
					if (isset($linkedElements['linkedElements']['components'])) {
						$components = $linkedElements['linkedElements']['components'];
						
						 // Map old IDs to new IDs within 'components'
						foreach ($components as &$component) {								
						 $key = array_search($component, $demo_ids);						
							if ($key !== false) {							
							$idMapping[$component] = $key;						
							}	

						}
					}
					if((isset($linkedElements['linkedElements']['actions']))) {
						$actions = $linkedElements['linkedElements']['actions'];
					
						// Map old IDs to new IDs within 'actions'
						foreach ($actions as &$action) {								
						$key = array_search($action, $demo_ids);	
					
										
							if ($key !== false) {							
							$idMappingaction[$action] = $key;						
							}	

					}
				
					}
					
				}
				
			}	

			//Mapping data
			foreach ($data as &$item) {
				if ($item['linkedElements'] !== 'null' && $item['linkedElements'] !== '""') {
					$linkedElements = json_decode($item['linkedElements'], true);
					
					// Check if the structure matches the expected format
					if (isset($linkedElements['linkedElements']['components'])) {
						$components = $linkedElements['linkedElements']['components'];
						// Map old IDs to new IDs within 'components'
						foreach ($components as &$component) {
							if (isset($idMapping[$component])) {							
								$component = $idMapping[$component];								
							}
							// Add more conditions if needed for different ID mappings
						}

						// Update the 'linkedElements' structure with modified components
						$linkedElements['linkedElements']['components'] = $components;
						$item['linkedElements'] = json_encode($linkedElements);
					}
				
				}

				if ($item['linkedElements'] !== 'null' && $item['linkedElements'] !== '""') {
					$linkedElements = json_decode($item['linkedElements'], true);
					if(isset($linkedElements['linkedElements']['actions'])) {
						$actions = $linkedElements['linkedElements']['actions'];
						// Map old IDs to new IDs within 'actions'
						foreach ($actions as &$action) {
							if (isset($idMappingaction[$action])) {							
								$action = $idMappingaction[$action];								
							}
							// Add more conditions if needed for different ID mappings
						}
						//die;

						// Update the 'linkedElements' structure with modified actions
						$linkedElements['linkedElements']['actions'] = $actions;
						$item['linkedElements'] = json_encode($linkedElements);

					}
				}
			}
		
			//data set
			foreach($data as $k => $val){
				if ($val['linkedElements'] !== 'null' && $val['linkedElements'] !== '""') {
					$linkedElements = json_decode($val['linkedElements'], true);
					
				
					// Check if the structure matches the expected format
					if (isset($linkedElements['linkedElements']['components']) || isset($linkedElements['linkedElements']['actions'])) {
					
						// Load the node by its ID.
						$node = Node::load($val['new_id']);

						if ($node) {
							// Access node fields and properties.
							$title = $node->getTitle();
							// Get the bundle type (node type) of the loaded node.
							$nodeType = $node->getType();
							if ($nodeType == 'partpage') {						
								$temp_html_params = 'field_pp_html_params';	

								if (isset($linkedElements['linkedElements']['components'])) {
									$linkedElementscomponents = $linkedElements['linkedElements']['components'];
									
		     					// Convert each element in the array to a string with double quotes
									$outputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementscomponents);							
								
									// Construct the JSON structure with the provided array values in the "components" array
									$outputdataJSON = json_encode(["linkedElements" => ["components" => $outputArray]]);
			
									// Output the JSON string					
									$jsonString = stripslashes($outputdataJSON);	
									// Replace double double quotes with a single double quote
									// $updatedJsonInJsonFormat = str_replace('""', '"', $jsonString);
									$partpagejson1 = str_replace('""', '"', $jsonString);
									
								
								  }
								  if(isset($linkedElements['linkedElements']['actions'])) {
									$linkedElementsactions = $linkedElements['linkedElements']['actions'];
									
		
									// Convert each element in the array to a string with double quotes
									$partpageoutputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementsactions);							
								
									// Construct the JSON structure with the provided array values in the "components" array
									$partpageoutputdataJSON = json_encode(["linkedElements" => ["actions" => $partpageoutputArray]]);
			
									// Output the JSON string					
									$partpagejsonString = stripslashes($partpageoutputdataJSON);	
									// Replace double double quotes with a single double quote
									$partpagejson2 = str_replace('""', '"', $partpagejsonString);
									
							  }
						    
							     // Check if both decoded values are arrays
									if (!empty($partpagejson1) && !empty($partpagejson2)) {
									// Decode both JSON strings into associative arrays
									$partpagearray1 = json_decode($partpagejson1, true);
									$partpagearray2 = json_decode($partpagejson2, true);
									$partpageresultArray = array_merge_recursive($partpagearray1, $partpagearray2);
									// Encode the merged array back into JSON
									$partpagemergedJSON = json_encode($partpageresultArray);
									}
									elseif(!empty($partpagejson1)){
										$partpagemergedJSON = $partpagejson1;
									}
									elseif(!empty($partpagejson2)){
										$partpagemergedJSON = $partpagejson2;
									}
								
								// Output the merged JSON string
								//print_r($partpagemergedJSON.'partpage'); //die;
								$node->set ( 'field_pp_html_params', $partpagemergedJSON );
								$node->save ();						
						    }

							if ($nodeType == 'screen') {							
								$temp_html_params = 'field_scr_html_params';

								if (isset($linkedElements['linkedElements']['components'])) {
									$linkedElementscomponents = $linkedElements['linkedElements']['components'];
											
									// Convert each element in the array to a string with double quotes
									$outputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementscomponents);							
								
		
									// Construct the JSON structure with the provided array values in the "components" array
									$componentsoutputdataJSON = json_encode(["linkedElements" => ["components" => $outputArray]]);
		
									// Output the JSON string					
									$componentsjsonString = stripslashes($componentsoutputdataJSON);	
									$componentsjson1 = str_replace('""', '"', $componentsjsonString);
												
									
									}
									if(isset($linkedElements['linkedElements']['actions'])) {
										$linkedElementsactions = $linkedElements['linkedElements']['actions'];
												
										// Convert each element in the array to a string with double quotes
										$actionoutputArray = array_map(function($element) {
											return '"' . $element . '"';
										}, $linkedElementsactions);							
												
										// Construct the JSON structure with the provided array values in the "components" array
										$actionoutputdataJSON = json_encode(["linkedElements" => ["actions" => $actionoutputArray]]);
			
										// Output the JSON string					
										$actionjsonString = stripslashes($actionoutputdataJSON);	
										$actionjson2 = str_replace('""', '"', $actionjsonString);
														
										
								}
								  // Check if both decoded values are arrays
								  if (!empty($componentsjson1) && !empty($actionjson2)) {
								//	echo '<pre>';print_r($componentsjson1.'gangu'.$actionjson2);
									// Decode both JSON strings into associative arrays
									$screenarray1 = json_decode($componentsjson1, true);
									$screenarray2 = json_decode($actionjson2, true);
									$screenresultArray = array_merge_recursive($screenarray1, $screenarray2);
									// Encode the merged array back into JSON
									$screenmergedJSON = json_encode($screenresultArray);
									}
									elseif(!empty($componentsjson1)){
										$screenmergedJSON = $componentsjson1;
									}
									elseif(!empty($actionjson2)){
										$screenmergedJSON = $actionjson2;
									}
									//print_r($screenmergedJSON .'screen');
									$node->set ( 'field_scr_html_params', $screenmergedJSON );
									$node->save ();	
									// unset($screenmergedJSON);
									// unset($componentsjson1);
									// unset($actionjson2);
							}
							if ($nodeType == 'simple_content') {						
								$temp_html_params = 'field_sc_html_params';

								if (isset($linkedElements['linkedElements']['components'])) {
									$linkedElementscomponents = $linkedElements['linkedElements']['components'];
											
									// Convert each element in the array to a string with double quotes
									$outputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementscomponents);							
								
		
									// Construct the JSON structure with the provided array values in the "components" array
									$outputdataJSON = json_encode(["linkedElements" => ["components" => $outputArray]]);
		
									// Output the JSON string					
									$jsonString = stripslashes($outputdataJSON);	
									$simple_contentjson1 = str_replace('""', '"', $jsonString);
									// $node->set ( 'field_sc_html_params', $updatedJsonInJsonFormat );
									// $node->save ();					
									
								}
								if(isset($linkedElements['linkedElements']['actions'])) {
									$linkedElementsactions = $linkedElements['linkedElements']['actions'];
											
									// Convert each element in the array to a string with double quotes
									$simple_contentoutputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementsactions);							
								
		
									// Construct the JSON structure with the provided array values in the "actions" array
									$simple_contentoutputdataJSON = json_encode(["linkedElements" => ["actions" => $simple_contentoutputArray]]);
		
									// Output the JSON string					
									$simple_contentjsonString = stripslashes($simple_contentoutputdataJSON);	
									$simple_contentjson2 = str_replace('""', '"', $simple_contentjsonString);
									// $node->set ( 'field_sc_html_params', $updatedJsonInJsonFormat );
									// $node->save ();					
									
								}
								  // Check if both decoded values are arrays
								  if (!empty($simple_contentjson1) && !empty($simple_contentjson2)) {
									// Decode both JSON strings into associative arrays
									$simple_contentarray1 = json_decode($simple_contentjson1, true);
									$simple_contentarray2 = json_decode($simple_contentjson2, true);
									$simple_contentresultArray = array_merge_recursive($simple_contentarray1, $simple_contentarray2);
									// Encode the merged array back into JSON
									$simple_contentmergedJSON = json_encode($simple_contentresultArray);
									}
									elseif(!empty($simple_contentjson1)){
										$simple_contentmergedJSON = $simple_contentjson1;
									}
									elseif(!empty($simple_contentjson2)){
										$simple_contentmergedJSON = $simple_contentjson2;
									}
								//	print_r($simple_contentmergedJSON .'simple_content');
									$node->set ( 'field_sc_html_params', $simple_contentmergedJSON );
									$node->save ();	
									// unset($simple_contentmergedJSON);
									// unset($simple_contentjson1);
									// unset($simple_contentjson2);
								
							
							}
							if ($nodeType == 'simple_partpage') {							
								$temp_html_params = 'field_spp_html_params';
								if (isset($linkedElements['linkedElements']['components'])) {
									$linkedElementscomponents = $linkedElements['linkedElements']['components'];
											
									// Convert each element in the array to a string with double quotes
									$outputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementscomponents);							
								
		
									// Construct the JSON structure with the provided array values in the "components" array
									$outputdataJSON = json_encode(["linkedElements" => ["components" => $outputArray]]);
		
									// Output the JSON string					
									$jsonString = stripslashes($outputdataJSON);	
									$simple_partpagejson1 = str_replace('""', '"', $jsonString);					
									// $node->set ( 'field_spp_html_params', $updatedJsonInJsonFormat );
									// $node->save ();
									}
									if(isset($linkedElements['linkedElements']['actions'])) {
										$linkedElementsactions = $linkedElements['linkedElements']['actions'];
												
										// Convert each element in the array to a string with double quotes
										$simple_partpageoutputArray = array_map(function($element) {
											return '"' . $element . '"';
										}, $linkedElementsactions);							
									
			
										// Construct the JSON structure with the provided array values in the "actions" array
										$simple_partpageoutputdataJSON = json_encode(["linkedElements" => ["actions" => $simple_partpageoutputArray]]);
			
										// Output the JSON string					
										$simple_partpagejsonString = stripslashes($simple_partpageoutputdataJSON);	
										$simple_partpagejson2 = str_replace('""', '"', $simple_partpagejsonString);					
										// $node->set ( 'field_spp_html_params', $updatedJsonInJsonFormat );
										// $node->save ();
									}
									// Check if both decoded values are arrays
									if (!empty($simple_partpagejson1) && !empty($simple_partpagejson2)) {
										// Decode both JSON strings into associative arrays
										$simple_partpagearray1 = json_decode($simple_partpagejson1, true);
										$simple_partpagearray2 = json_decode($simple_partpagejson2, true);
										$simple_partpageresultArray = array_merge_recursive($simple_partpagearray1, $simple_partpagearray2);
										// Encode the merged array back into JSON
										$simple_partpagemergedJSON = json_encode($simple_partpageresultArray);
										}
										elseif(!empty($simple_partpagejson1)){
											$simple_partpagemergedJSON = $simple_partpagejson1;
										}
										elseif(!empty($simple_partpagejson2)){
											$simple_partpagemergedJSON = $simple_partpagejson2;
										}
									//print_r($simple_partpagemergedJSON .'simple_partpage');
									$node->set ( 'field_spp_html_params', $simple_partpagemergedJSON );
									$node->save ();
									// unset($simple_partpagemergedJSON);
									// unset($simple_partpagejson1);
									// unset($simple_partpagejson2);
							}
							if ($nodeType == 'question') {						
								$temp_html_params = 'field_ques_html_params';
								if (isset($linkedElements['linkedElements']['components'])) {
									$linkedElementscomponents = $linkedElements['linkedElements']['components'];
											
									// Convert each element in the array to a string with double quotes
									$outputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementscomponents);							
								
		
									// Construct the JSON structure with the provided array values in the "components" array
									$outputdataJSON = json_encode(["linkedElements" => ["components" => $outputArray]]);
		
									// Output the JSON string					
									$jsonString = stripslashes($outputdataJSON);	
									$questionjson1 = str_replace('""', '"', $jsonString);		
									// $node->set ( 'field_ques_html_params', $updatedJsonInJsonFormat );
									// $node->save ();				
								 	
								  }
								  if(isset($linkedElements['linkedElements']['actions'])) {
									$linkedElementsactions = $linkedElements['linkedElements']['actions'];
											
									// Convert each element in the array to a string with double quotes
									$outputArray = array_map(function($element) {
										return '"' . $element . '"';
									}, $linkedElementsactions);							
								
		
									// Construct the JSON structure with the provided array values in the "actions" array
									$questionoutputdataJSON = json_encode(["linkedElements" => ["actions" => $outputArray]]);
		
									// Output the JSON string					
									$questionjsonString = stripslashes($questionoutputdataJSON);	
									$questionjson2 = str_replace('""', '"', $questionjsonString);		
									// $node->set ( 'field_ques_html_params', $updatedJsonInJsonFormat );
									// $node->save ();				
									
								  }

									// Check if both decoded values are arrays
									if (!empty($questionjson1) && !empty($questionjson2)) {
										// Decode both JSON strings into associative arrays
										$questionarray1 = json_decode($questionjson1, true);
										$questionarray2 = json_decode($questionjson2, true);
										$questionresultArray = array_merge_recursive($questionarray1, $questionarray2);
										// Encode the merged array back into JSON
										$questionmergedJSON = json_encode($questionresultArray);
										}
										elseif(!empty($questionjson1)){
											$questionmergedJSON = $questionjson1;
										}
										elseif(!empty($questionjson2)){
											$questionmergedJSON = $questionjson2;
										}
								//	print_r($questionmergedJSON .'question');
									$node->set ( 'field_ques_html_params', $questionmergedJSON );
									$node->save ();					
									// unset($questionmergedJSON);
									// unset($questionjson1);
									// unset($questionjson2);
							 }



					 }// node condition

				 }// isset condition
					
				} //if condtion
				
			unset($partpagejson1);
			unset($partpagejson2);
			unset($partpagemergedJSON);
			
			unset($componentsjson1);
			unset($actionjson2);
			unset($screenmergedJSON);
									
			unset($simple_contentmergedJSON);
			unset($simple_contentjson1);
			unset($simple_contentjson2);

			unset($simple_partpagemergedJSON);
			unset($simple_partpagejson1);
			unset($simple_partpagejson2);

			
			unset($questionmergedJSON);
			unset($questionjson1);
			unset($questionjson2);
			
			} // foreach loop end	
			

		// Create course.
		$crs = Node::create ( [ 
				'title' => $crs_name,
				'type' => 'course',
				'field_crs_isevaluation' => $is_eval,
				'field_crs_children' => [ 
						$strt_node->id (),
						$stcr_node->id (),
						$anx_node->id ()
				]
		] );
		$crs->save ();

		$crs_id = $crs->id ();

		if (! file_exists ( 'public://editor/' . $crs_id )) {
			mkdir ( 'public://editor/' . $crs_id, 0777, true );
		}
		$zipArchiver->extractTo ( 'public://editor/' . $crs_id );
		$src_path = $file_system->realpath ( 'public://editor/' . $crs_id );

		/*
		 * $editor_option_values = [];
		 * foreach($attr as $editor_option){
		 * $decoded_options = (!empty($editor_option)
		 * && is_string($editor_option)
		 * && $editor_option != 'null')
		 * ? json_decode($editor_option, true)
		 * : $editor_option;
		 *
		 * if(!empty($decoded_options) && is_array($decoded_options)){
		 * $decoded_options = $this->is_multidimensional($decoded_options)
		 * ? $decoded_options
		 * : [$decoded_options];
		 *
		 * $editor_option_values[]['editor_options']['old_cm_id'] = array_column($decoded_options, 'id')[0];
		 * $editor_option_valuesold_cm_url = array_column($decoded_options, 'url')[0];
		 * $file_name = array_column($decoded_options, 'name')[0];
		 *
		 * if($old_cm_url){
		 * $new_cm_id = $this->createCourseMedia($crs_id, $val, $file_name, 'public://editor/' . $crs_id);
		 * $new_cm_url = $file_url_generator->generateString($save_file);
		 * $temp_content = str_replace([$old_cm_id, $cm_url, 'src2'], [$new_cm_id, $new_cm_url, 'src'], $temp_content);
		 * }
		 * }
		 * }
		 */
		 
		$tmp_ids_arr = []; 
		$t_values = array_values(array_column($ids, 'temp_ids'));
		foreach($t_values as $t){
			$key = key($t);
			$tmp_ids_arr[$key] = $t[$key];
		} 
		
		$el_values = array_values(array_column($ids, 'elem_ids'));
		foreach($el_values as $el){
			$key = key($el);
			$tmp_ids_arr[$key] = $el[$key];
		}

		// Update templates using parsed html.
		$custom_media_ids = [];
		if (! empty ( $ids )) {
			$temp_ids = array_column ( $ids, 'temp_ids' );
			if (! empty ( $temp_ids )) {
				foreach ( $temp_ids as $k => $temp_arr ) {
					$editor_options = '';
					foreach ( $temp_arr as $tid => $val ) {
						$temp_div = $xpath->query ( '//div[@id="ID' . $tid . '"]' );
						if ($temp_div->length > 0) {
							$temp_data = $temp_div->item ( 0 );
							// add editor to the class
							$class = $temp_data->getAttribute ( 'class' );
							$temp_data->setAttribute ( 'class', $class. " editor " );
							
							$temp_content = $dom->saveHTML ( $temp_data );

						
							// Extracting the blm-options attribute's value
							preg_match('/blm-options=\'(.+?)\'/', $temp_content, $matches);
							if (isset($matches[1])) {
								// Decoding the JSON content
								$options = json_decode(html_entity_decode($matches[1]), true);

								// Replacing the IDs under "onload" and "oncomplete"

								if (isset($options['onload']['opensimplecontent']['id'])) {
									$old_array_val = $options['onload']['opensimplecontent']['id'];
									$replace_val = array_search($old_array_val,$demo_ids);
									// Output the JSON string								
									$onloadjson2 = str_replace('', '&quot;', $replace_val);

									$options['onload']['opensimplecontent']['id'] = $onloadjson2 ;	
								}

								// $options['oncomplete']['opensimplecontent']['id'] = '5678';
								if (isset($options['oncomplete']['opensimplecontent']['id'])) {

									$oncompleteold_array_val = $options['oncomplete']['opensimplecontent']['id'];
									$oncompletereplace_val = array_search($oncompleteold_array_val,$demo_ids);
									// Output the JSON string									
									$oncompletejson2 = str_replace('', '&quot;', $oncompletereplace_val);
									$options['oncomplete']['opensimplecontent']['id'] =$oncompletejson2 ;		
								}

								// Encoding the modified content
								$newOptions = htmlentities(json_encode($options, JSON_UNESCAPED_UNICODE));
								$newjsonString = stripslashes($newOptions);								
								// Replacing the old blm-options content with the modified one
								$temp_content = preg_replace('/blm-options=\'(.+?)\'/', 'blm-options=\'' . $newjsonString . '\'', $temp_content);
							}

						  // echo $temp_content; // Output the updated HTML


							/*
							 * $t_dom = new \DomDocument();
							 * $t_dom->loadHTML($temp_content);
							 *
							 * $t_xpath = new \DOMXPath($t_dom);
							 *
							 * // Copying Medias.
							 * $editor_options = $t_xpath->evaluate("string(//@blm-editor-options)");
							 * //$editor_options = $attr[$k];
							 * //$decoded_options = (is_string($editor_options) && $editor_options != 'null') ? json_decode($editor_options, true) : $editor_options;
							 *
							 * if(!empty($decoded_options) && is_array($decoded_options)){
							 * $decoded_options = $this->is_multidimensional($decoded_options)
							 * ? $decoded_options
							 * : [$decoded_options];
							 *
							 * $old_cm_id = array_column($decoded_options, 'id')[0];
							 * $cm_url = array_column($decoded_options, 'url')[0];
							 * $file_name = array_column($decoded_options, 'name')[0];
							 * }
							 * if($cm_url){
							 * $old_cm_url = $cm_url;
							 * if(strpos($cm_url, '/medias') === FAlSE){
							 * $old_cm_url = './medias/' . end(explode('/', $cm_url));
							 * }
							 * $save_file = $file_system->copy($src_path . ltrim($old_cm_url, '.'), 'public://', FileSystemInterface::EXISTS_RENAME);
							 * }
							 * if ($save_file) {
							 * $new_cm_id = $this->createCourseMedia($crs_id, $val, $file_name, $save_file);
							 * $new_cm_url = $file_url_generator->generateString($save_file);
							 * $temp_content = str_replace([$old_cm_id, $cm_url, 'src2'], [$new_cm_id, $new_cm_url, 'src'], $temp_content);
							 * }
							 */
							// Load template entity.
							$t_node = Node::load ( $val );
							$temp_type = $t_node->getType ();

							// Get Template name from class.
							$class = $temp_data->getAttribute ( 'class' );
							$part_class = substr ( $class, strpos ( $class, "outercontainer" ) + strlen ( 'outercontainer ' ) );
							$temp_name = explode ( ' ', $part_class ) [2];
							if (substr ( $temp_name, - 1 ) == 'a') {
								$temp_name = rtrim ( $temp_name, 'a' );
								$temp_id = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'template' )->condition ( 'title', $temp_name )->execute ();
							} else {
								$temp_id = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'templatevariant' )->condition ( 'title', $temp_name )->execute ();
							}
							

							/*
							 * $classList = $temp_data->getAttribute('class');
							 * $class_list_1 = trim(explode($temp_type, $classList)[0]);
							 * $class_name = end(explode(' ', $class_list_1));
							 * $last_char = substr($class_name, -1);
							 * $temp_name = $last_char == 'a'
							 * ? substr($class_name, 0, -1)
							 * : $class_name;
							 */

							// Getting Template fields for all template parents.
							if ($temp_type == 'partpage') {
								$html_field = 'field_pp_html';
								$temp_field = 'field_pp_template';
								$t_type = 'field_pp_template_type';
							} elseif ($temp_type == 'screen') {
								$html_field = 'field_scr_html';
								$temp_field = 'field_scr_template';
								$t_type = 'field_scr_template_type';
							} elseif ($temp_type == 'simple_content') {
								$html_field = 'field_sc_html';
								$temp_field = 'field_sc_template';
								$t_type = 'field_sc_template_type';
							} elseif ($temp_type == 'simple_partpage') {
								$html_field = 'field_spp_html';
								$temp_field = 'field_spp_template';
								$t_type = 'field_spp_template_type';
							} elseif ($temp_type == 'question') {
								$html_field = 'field_ques_html';
								$temp_field = 'field_ques_template';
								$t_type = 'field_ques_template_type';
							}
							
							// Add template html in all template elements.
							$t_node->set($html_field, $temp_content);
							$t_node->save();

							/*
							 * $temp_id = \Drupal::entityQuery('node')
							 * ->condition('type', 'template')
							 * ->condition('title', $temp_name)
							 * ->execute();
							 */

							// Update course media ids and paths in template htmls in template elements.
							preg_match_all ( '/\"id\":\"(\d+)\"/m', $temp_content, $ids_m, PREG_SET_ORDER );
							preg_match_all ( '/\"url\":"([^"]*)"/', $temp_content, $url_matches, PREG_SET_ORDER );
							preg_match_all ( '/\"name\":"([^"]*)"/', $temp_content, $name_matches, PREG_SET_ORDER );
							preg_match_all ( '/\"type\":"([^"]*)"/', $temp_content, $type_matches, PREG_SET_ORDER );
							preg_match_all ( '/\"rootFile\":"([^"]*)"/', $temp_content, $custom_file_matches, PREG_SET_ORDER );

							foreach ( $url_matches as $i => $url_m ) {
								$file_name = $name_matches [$i] [1];
								$zipextension = pathinfo($file_name, PATHINFO_EXTENSION);
								$cm_url = $url_m [1];
							
								foreach($type_matches as $typename){
									$typeoffile = $typename[1];									
								}
								
								
								$file_system = \Drupal::service ( 'file_system' );
								$file_path = end(explode('/', $cm_url));

								
								/**************** */
								$cm_url = $url_m [1];
								$dup_file_path = $cm_url;
								$file_name = end(explode('/',$cm_url));
								$extension = pathinfo($file_name, PATHINFO_EXTENSION); // .jpg
								$oldUniqueId = current(explode('_',$file_name));
								$newUniqueId = uniqid(); 
								$dest_src = str_replace($oldUniqueId, $newUniqueId, $dup_file_path); 
								$dest_src_url =  end ( explode ( '/', $dest_src ) ); 
								$n_cm_url = './medias/' . end ( explode ( '/', $dest_src ) ); //./medias/653e5dfdce25b_file.jpg

								$full_path = $file_system->realpath($dup_file_path);
	    					                $dest_path = $file_system->realpath($dest_src);
								/******************* */		
							
								$old_cm_url = $cm_url;
								$old_cm_url = './medias/' . end ( explode ( '/', $cm_url ) );
								$oldUniqueId = $old_cm_url;					
								$old_cm_id = $ids_m [$i] [1];

								
								// Get the file system service
								$fileSystem = \Drupal::service('file_system');
								$supported_extensions = array('gif', 'jpeg', 'jpg', 'png', 'svg','ppt', 'doc', 'docx', 'xls', 'xlsx', 'pdf');
								$supported_extensions_videos = array( 'mp3', 'mp4', 'mpeg', 'mpv', 'm4v', 'ogg', 'webm', 'avi', 'wmv', 'mov', 'mp2', 'vtt');
								$supported_extensions_doc_zip = array('zip');
          						$file_extension = strtolower($extension);
		  
          						if (in_array($file_extension, $supported_extensions)) {
									//echo '<pre> INSIDE IMEGAS';
									// Source and destination paths
									$sourcePath = 'public://editor/' . $crs_id . ltrim ( $cm_url, '.' ) ;
									$destinationPath = 'public://editor/' .$dest_src_url;

									$fileSystem = \Drupal::service('file_system');
									// File has been successfully copied
									// Perform additional operations if needed
									// Copy the file to the destination folder
									$result = $fileSystem->copy($sourcePath, $destinationPath, FileSystemInterface::EXISTS_REPLACE);
							
								} elseif(in_array($file_extension, $supported_extensions_videos)){
									// Source and destination paths
									//echo '<pre> INSIDE VIDEO';
									$sourcePath = 'public://editor/' . $crs_id . ltrim ( $cm_url, '.' ) ;
									$destinationPath = 'public://editor/' .$dest_src_url;
									$fileSystem = \Drupal::service('file_system');
									$result = $fileSystem->copy($sourcePath, $destinationPath, FileSystemInterface::EXISTS_RENAME);
								}elseif( $zipextension=='zip'){								
									// Source and destination paths
									//echo '<pre> INSIDE APPZIP';
									$zipsourcePath = 'public://editor/' . $crs_id . ltrim ( $old_cm_url, '.' ) ;
									$zipdestinationPath = 'public://editor/custom_media/' . $dest_src_url  ;
									// Get the file system service
									$fileSystem = \Drupal::service('file_system');
									// Handle the error if the file couldn't be copied
									$result = $this->recurseCopy($zipsourcePath, $zipdestinationPath);
								}
								
								
								if((in_array($file_extension, $supported_extensions) ||(in_array($file_extension, $supported_extensions_videos)) )){
									// if(empty($custom_file_matches) || (!empty($custom_file_matches) && empty($custom_file_matches[$i]))) {	
									$sourcePath = $file_system->realpath ( 'public://' );

									$save_file = $destinationPath;																


									// $save_file = $dest_src;
									if (($save_file) && $file_path!="") {
										$new_cm_id = $this->createCourseMedia ( $crs_id, $val, $file_name, $save_file );
										$new_cm_url = $file_url_generator->generateString ( $save_file );
										$new_cm_path = current(explode($file_path, $new_cm_url));
										

										$temp_content = str_replace ( [
											'id="ID' . $tid . '"',
											$old_cm_id,
											// './medias/',
											$cm_url,
											'src2',
											], [
													'',
													$new_cm_id,
													$new_cm_path,
													'src',
											], $temp_content );
										
									}
									//echo '<pre>';print_r($destinationPath);
								// } 
									
								}
								else {
									if($zipextension=='zip'){
									//if( ($typeoffile == 'application/zip') || ($typeoffile == 'application/x-zip-compressed')){								
										//if(!empty($zipdestinationPath)){

											// echo '<pre 0>';print_r('"url":"./medias/'.$old_cm_id.'"');
											// echo '<pre 1>';print_r($temp_content);


											$custom_file = $zipdestinationPath;
											//	$custom_file = 'public://editor/' . $crs_id . ltrim ( $old_cm_url, '.' );;
											// $custom_file = 'public://editor/' . $crs_id . ltrim ( $n_cm_url, '.' );
												$abs_path = $file_system->realpath($custom_file);
												
												$new_cm_id = $this->createCourseMedia ( $crs_id, $val, $file_name, $custom_file, 'application/zip');
												$new_cm_url = $file_url_generator->generateString ( $custom_file );
												$new_rename_path = 'public://editor/' . $crs_id . '/medias/' . $new_cm_id;
												// $new_rename_path = 'public://editor/' . $crs_id . '/medias/' . $new_cm_id;
												$new_abs_path = $file_system->realpath($new_rename_path);						
												
												$custom_media_ids[$old_cm_id] = $new_cm_id;
												
												$new_cm_url = str_replace($old_cm_id, $new_cm_id, $new_cm_url);
												

												
												// find the full original path of the custom
												$pattern='/blm-custom=".\/medias\/'.$old_cm_id.'\/(.*)"/i';
												preg_match($pattern, $temp_content, $matches, PREG_OFFSET_CAPTURE);

												// name of the index html of the custom
												$indexName=$matches[1][0];

												// new drupal path : $new_cm_url

												// replace blm-custom
												$temp_content= str_replace ( 'blm-custom="./medias/'.  $old_cm_id.'/'.  $indexName.'"' , 'blm-custom="'. $new_cm_url.'/'.  $indexName.'"' ,  $temp_content);

												// update json path
												$temp_content= str_replace ( '"url":"./medias/'.$old_cm_id.'"' ,  '"url":"'.  $new_cm_url.'"' ,  $temp_content);
												$temp_content= str_replace ( '&quot;url&quot;:&quot;./medias/'.$old_cm_id.'&quot;' ,  '&quot;url&quot;:&quot;'.  $new_cm_url.'&quot;' ,  $temp_content);

												// update json media ID
												$temp_content = str_replace ( $old_cm_id, $new_cm_id, $temp_content );


												//echo '<pre 2>';print_r($temp_content);
										//}
										//echo '<pre>';print_r($zipdestinationPath);
									//}

											}
								}

								preg_match_all('/\{.*?\}/', $temp_content, $blm_editor_matches, PREG_SET_ORDER );

								$blm_arr = [];
								if(!empty($blm_editor_matches)){
									foreach ($blm_editor_matches as $blm_editor){
										$blm_arr[]['old_blm'] = trim($blm_editor[0], '"');
										$blm_arr[]['new_blm'] = str_replace('"', '&quot;', trim($blm_editor[0], '"'));
									}
								}
								$old_blm = array_column($blm_arr, 'old_blm');
								$new_blm = array_column($blm_arr, 'new_blm');

								$temp_content = str_replace($old_blm, $new_blm, $temp_content);
								$t_node->set($html_field, $temp_content);
								$t_node->save();
								
							}
							
							$temp_content = str_replace(array_keys($tmp_ids_arr), array_values($tmp_ids_arr), $temp_content);
							$t_node->set($html_field, $temp_content);
							$t_node->save();

							// preg_match_all('/blm-editor-options="([^"]*)"/', $t_html, $matches );

							if (count ( $temp_id ) == 1) {
								$temp_id_arr = $t_node->get ( $temp_field )->getValue ();
								$old_temp_ids = array_column ( $temp_id_arr, 'target_id' );
								$temp_ids = array_merge ( $old_temp_ids, $temp_id );
								$t_node->set ( $temp_field, $temp_ids );
								$t_node->set ( $t_type, $temp_type );
							}
							$updated_content = $t_node->get($html_field)->value;
							$updated_content = str_replace('src2', 'src', $updated_content);
							$t_node->set($html_field, $updated_content);
							// $t_node->set($t_type, $temp_type);
							$t_node->save ();
						}
					}
				}
			}
		}
		
		// Update evaluation parameter in elements.
		$evaluation_params_arr = array_column ( $ids, 'evaluation_params' );
		if (isset ( $evaluation_params_arr ) && ! empty ( $evaluation_params_arr )) {
			foreach ( $evaluation_params_arr as $eval_nid ) {
				$eval_node = Node::load($eval_nid[0]);
				$eval_node_type = $eval_node->getType();
				$eval_param_field = $this->getFieldNameByKey ( $eval_node_type, 'evaluation parameter' );
				$feedback_field = $this->getFieldNameByKey ( $eval_node_type, 'hasfeedback' );
				if($eval_param_field){
					$eval_params = $eval_node->get($eval_param_field)->value;
					$eval_params = str_replace(array_keys($tmp_ids_arr), array_values($tmp_ids_arr), $eval_params);
					$eval_node->set($eval_param_field, $eval_params);
					$eval_node->save();
				}
			}
		}
		
		// Update actions in html parameters.
		$html_params_arr = array_column ( $ids, 'html_params' );
		if (isset ( $html_params_arr ) && ! empty ( $html_params_arr )) {
			foreach ( $html_params_arr as $html_param_nid ) {
				$html_param_node = Node::load($html_param_nid[0]);
				$html_param_node_type = $html_param_node->getType();
				$html_param_field = $this->getFieldNameByKey ( $html_param_node_type, 'Html param' );
				if($html_param_field){
					$html_params = $html_param_node->get($html_param_field)->value;
					$html_params = str_replace(array_keys($tmp_ids_arr), array_values($tmp_ids_arr), $html_params);
					$html_param_node->set($eval_param_field, $html_params);
					$html_param_node->save();
				}
			}
		}
		

		// Copying Background params medias.
		$bg_nid = $this->copyParams($crs_id, $ids, 'bg_params', 'background parameter');
		/*$bg_params_arr = array_column ( $ids, 'bg_params' );
		if (isset ( $bg_params_arr ) && ! empty ( $bg_params_arr )) {
			foreach ( $bg_params_arr as $bg_params ) {
				$new_nid = key ( $bg_params );
				$cm_url = $bg_params [$new_nid] ['cm_url'];
				$old_cm_id = $bg_params [$new_nid] ['old_cm_id'];
				$file_name = $bg_params [$new_nid] ['file_name'];
				$new_node = Node::load ( $new_nid );
				$new_type = $new_node->getType ();
				$bg_param_field = $this->getFieldNameByKey ( $new_type, 'background parameter' );
				$node_bg_params = $new_node->get ( $bg_param_field )->value;

				if ($cm_url) {
					$old_cm_url = $cm_url;
					if (strpos ( $cm_url, '/medias' ) === FAlSE) {
						$old_cm_url = './medias/' . end ( explode ( '/', $cm_url ) );
					}
					$save_file = $file_system->copy ( $src_path . ltrim ( $old_cm_url, '.' ), 'public://', FileSystemInterface::EXISTS_RENAME );
				}

				if ($save_file) {
					$file_name = ! empty ( $file_name ) ? $file_name : 'course media file';
					$new_cm_id = $this->createCourseMedia ( $crs_id, $new_nid, $file_name, $save_file );
					$new_cm_url = $file_url_generator->generateString ( $save_file );
					$node_bg_params = str_replace ( '\\', '', $node_bg_params );
					$node_bg_params = str_replace ( [ 
							$old_cm_id,
							$cm_url,
							'src2'
					], [ 
							$new_cm_id,
							$new_cm_url,
							'src'
					], $node_bg_params );
					$new_node->set ( $bg_param_field, $node_bg_params );
					$new_node->save ();
				}
			}
		}*/

		// Copying Default Media params medias.
		$md_nid = $this->copyParams($crs_id, $ids, 'media_params', 'media param');
		/*$media_params_arr = array_column ( $ids, 'media_params' );
		if (isset ( $media_params_arr ) && ! empty ( $media_params_arr )) {
			foreach ( $media_params_arr as $media_params ) {
				$new_nid = key ( $media_params );
				$cm_url = $media_params [$new_nid] ['cm_url'];
				$old_cm_id = $media_params [$new_nid] ['old_cm_id'];
				$file_name = $media_params [$new_nid] ['file_name'];
				$new_node = Node::load ( $new_nid );
				$new_type = $new_node->getType ();
				$media_param_field = $this->getFieldNameByKey ( $new_type, 'media param' );
				if ($media_param_field) {
					$node_media_params = $new_node->get ( $media_param_field )->value;
				}
				if ($cm_url) {
					$old_cm_url = $cm_url;
					if (strpos ( $cm_url, '/medias' ) === FAlSE) {
						$old_cm_url = './medias/' . end ( explode ( '/', $cm_url ) );
					}
					$save_file = $file_system->copy ( $src_path . ltrim ( $old_cm_url, '.' ), 'public://', FileSystemInterface::EXISTS_REPLACE );
				}

				if ($save_file) {
					$file_name = ! empty ( $file_name ) ? $file_name : 'course media file';
					$new_cm_id = $this->createCourseMedia ( $crs_id, $new_nid, $file_name, $save_file );
					$new_cm_url = $file_url_generator->generateString ( $save_file );
					$node_media_params = str_replace ( '\\', '', $node_media_params );
					$node_media_params = str_replace ( [ 
							$old_cm_id,
							$cm_url,
							'src2'
					], [ 
							$new_cm_id,
							$new_cm_url,
							'src'
					], $node_media_params );
					if (is_string ( $node_media_params ) && $node_media_params != 'null') {
						$new_med_param ['default'] = json_decode ( $node_media_params, true );
						$new_node->set ( $media_param_field, json_encode ( $new_med_param ) );
						$new_node->save ();
					}
				}
			}
		}*/

		// Copying Misc Media params medias.
		$mc_nid = $this->copyParams($crs_id, $ids, 'misc_params', 'navigation template');
		/*$misc_params_arr = array_column ( $ids, 'misc_params' );
		if (isset ( $misc_params_arr ) && ! empty ( $misc_params_arr )) {
			foreach ( $misc_params_arr as $misc_params ) {
				$new_nid = key ( $misc_params );
				$cm_url = $misc_params [$new_nid] ['cm_url'];
				$old_cm_id = $misc_params [$new_nid] ['old_cm_id'];
				$file_name = $misc_params [$new_nid] ['file_name'];
				$new_node = Node::load ( $new_nid );
				$new_type = $new_node->getType ();
				$misc_param_field = $this->getFieldNameByKey ( $new_type, 'navigation template' );
				$node_misc_params = $new_node->get ( $misc_param_field )->value;

				if ($cm_url) {
					$old_cm_url = $cm_url;
					if (strpos ( $cm_url, '/medias' ) === FAlSE) {
						$old_cm_url = './medias/' . end ( explode ( '/', $cm_url ) );
					}
					$save_file = $file_system->copy ( $src_path . ltrim ( $old_cm_url, '.' ), 'public://', FileSystemInterface::EXISTS_REPLACE );
				}

				if ($save_file) {
					$file_name = ! empty ( $file_name ) ? $file_name : 'course media file';
					$new_cm_id = $this->createCourseMedia ( $crs_id, $new_nid, $file_name, $save_file );
					$new_cm_url = $file_url_generator->generateString ( $save_file );
					$node_misc_params = str_replace ( '\\', '', $node_misc_params );
					$node_misc_params = str_replace ( [ 
							$old_cm_id,
							$cm_url,
							'src2'
					], [ 
							$new_cm_id,
							$new_cm_url,
							'src'
					], $node_misc_params );

					if (is_string ( $node_misc_params ) && $node_misc_params != 'null') {
						$misc_param = json_decode ( $node_misc_params, true );
						$misc_param = array_column ( $misc_param, 'value' );
						$new_node->set ( $misc_param_field, json_encode ( $misc_param ) );
						$new_node->save ();
					}
				}
			}
		}*/

		// Copying Media over params medias.
		$mo_nid = $this->copyParams($crs_id, $ids, 'media_over_params', 'mediaover');
		/*$media_over_params_arr = array_column ( $ids, 'media_over_params' );
		if (isset ( $media_over_params_arr ) && ! empty ( $media_over_params_arr )) {
			foreach ( $media_over_params_arr as $media_over_params ) {
				$new_nid = key ( $media_over_params );
				$cm_url = $media_over_params [$new_nid] ['cm_url'];
				$old_cm_id = $media_over_params [$new_nid] ['old_cm_id'];
				$file_name = $media_over_params [$new_nid] ['file_name'];
				$new_node = Node::load ( $new_nid );
				$new_type = $new_node->getType ();
				$media_over_param_field = $this->getFieldNameByKey ( $new_type, 'mediaover' );
				$node_media_over_params = $new_node->get ( $media_over_param_field )->value;

				if ($cm_url) {
					$old_cm_url = $cm_url;
					if (strpos ( $cm_url, '/medias' ) === FAlSE) {
						$old_cm_url = './medias/' . end ( explode ( '/', $cm_url ) );
					}
					$save_file = $file_system->copy ( $src_path . ltrim ( $old_cm_url, '.' ), 'public://', FileSystemInterface::EXISTS_REPLACE );
				}

				if ($save_file) {
					$file_name = ! empty ( $file_name ) ? $file_name : 'course media file';
					$new_cm_id = $this->createCourseMedia ( $crs_id, $new_nid, $file_name, $save_file );
					$new_cm_url = $file_url_generator->generateString ( $save_file );
					$node_media_over_params = str_replace ( '\\', '', $node_media_over_params );
					$node_media_over_params = str_replace ( [ 
							$old_cm_id,
							$cm_url,
							'src2'
					], [ 
							$new_cm_id,
							$new_cm_url,
							'src'
					], $node_media_over_params );

					$new_med_params = [ ];
					$media_param_field = $this->getFieldNameByKey ( $new_type, 'media param' );
					if ($media_param_field) {
						$node_media_params = $new_node->get ( $media_param_field )->value;
						$new_med_params = (is_string ( $node_media_params ) && $node_media_params != 'null') ? Json::decode ( $node_media_params ) : $node_media_params;
					}
					$new_med_params ['over'] = (is_string ( $node_media_over_params ) && $node_media_over_params != 'null') ? Json::decode ( $node_media_over_params ) : $node_media_over_params;

					$new_node->set ( $media_param_field, json_encode ( $new_med_params ) );
					$new_node->save ();
				}
			}
		}*/

		// Copying sound over params medias.
		$so_nid = $this->copyParams($crs_id, $ids, 'sound_over_params', 'soundover');
		/*$sound_over_params_arr = array_column ( $ids, 'sound_over_params' );
		if (isset ( $sound_over_params_arr ) && ! empty ( $sound_over_params_arr )) {
			foreach ( $sound_over_params_arr as $sound_over_params ) {
				$new_nid = key ( $sound_over_params );
				$cm_url = $sound_over_params [$new_nid] ['cm_url'];
				$old_cm_id = $sound_over_params [$new_nid] ['old_cm_id'];
				$file_name = $sound_over_params [$new_nid] ['file_name'];
				$new_node = Node::load ( $new_nid );
				$new_type = $new_node->getType ();
				$sound_over_param_field = $this->getFieldNameByKey ( $new_type, 'soundover' );
				$node_sound_over_params = $new_node->get ( $sound_over_param_field )->value;

				if ($cm_url) {
					$old_cm_url = $cm_url;
					if (strpos ( $cm_url, '/medias' ) === FAlSE) {
						$old_cm_url = './medias/' . end ( explode ( '/', $cm_url ) );
					}
					$save_file = $file_system->copy ( $src_path . ltrim ( $old_cm_url, '.' ), 'public://', FileSystemInterface::EXISTS_REPLACE );
				}

				if ($save_file) {
					$file_name = ! empty ( $file_name ) ? $file_name : 'course media file';
					$new_cm_id = $this->createCourseMedia ( $crs_id, $new_nid, $file_name, $save_file );
					$new_cm_url = $file_url_generator->generateString ( $save_file );
					$node_sound_over_params = str_replace ( '\\', '', $node_sound_over_params );
					$node_sound_over_params = str_replace ( [ 
							$old_cm_id,
							$cm_url,
							'src2'
					], [ 
							$new_cm_id,
							$new_cm_url,
							'src'
					], $node_sound_over_params );
					$new_node->set ( $sound_over_param_field, $node_sound_over_params );
					$new_node->save ();
				}
			}
		}*/
		
		// Copying custom file params medias.
		$custom_path_params_arr = array_column ( $ids, 'custom_path_params' );
		if (isset ( $custom_path_params_arr ) && ! empty ( $custom_path_params_arr )) {
			foreach ( $custom_path_params_arr as $custom_path_params ) {
				$new_nid = key ( $custom_path_params );
				$cm_url = $custom_path_params [$new_nid] ['cm_url'];
				$old_cm_id = $custom_path_params [$new_nid] ['old_cm_id'];
				$file_name = $custom_path_params [$new_nid] ['file_name'];
				$new_node = Node::load ( $new_nid );
				$new_type = $new_node->getType ();
				if($new_type == 'custom') {
					$custom_path_param_field = 'field_custom_files_param';
					$custom_file_path = 'public://editor/' . $crs_id . '/medias/' . $old_cm_id;
					
					$file_name = ! empty ( $file_name ) ? $file_name : 'custom media file';
					$new_cm_id = $this->createCourseMedia ( $crs_id, $new_nid, $file_name, $custom_file_path, 'application/zip');
					$new_cm_url = file_url_transform_relative(file_create_url($custom_file_path));
					$node_custom_path_params = '{"id":"' . $new_cm_id . '","name":"' . $file_name . '","type":"application/zip","url":"' . $new_cm_url .'","rootFile":"index.html"}';
					
					$new_node->set($custom_path_param_field, $node_custom_path_params);
					$new_node->set('field_custom_prop_params', '{"hasFiles":true}');
					$new_node->save();
				}
			}
		}

		// Update course fields from index.html values.
		$crs->set ( 'field_crs_display', $display );
		$crs->set ( 'field_external_texts', $ext_text_str );
		$crs->set ( 'field_crs_full_desc', $crs_def_arr ['description'] );
		$crs->set ( 'field_crs_duration', $crs_def_arr ['duration'] );
		$crs->set ( 'field_crs_isevaluation', $crs_def_arr ['is_evaluation'] );
		$lang_code = current ( explode ( '-', $crs_def_arr ['properties'] ['language'] ) );
		$crs->set ( 'field_crs_lang', $lang_code );
		$crs->set ( 'field_crs_keywords', $crs_def_arr ['properties'] ['keyword'] );
		$crs->set ( 'field_crs_objectives', $crs_def_arr ['properties'] ['learning_objectives'] );
		$crs->set ( 'field_crs_no_of_words', $crs_def_arr ['properties'] ['number_of_words'] );
		$crs->set ( 'field_crs_version', $crs_def_arr ['properties'] ['version'] );
		if (! empty ( $crs_def_arr ['config'] ['completion'] )) {
			$crs->set ( 'field_crs_comp_param', json_encode ( $crs_def_arr ['config'] ['completion'] ) );
		}
		if (! empty ( $crs_def_arr ['config'] ['navigation'] )) {
			$crs->set ( 'field_crs_nav_param', json_encode ( $crs_def_arr ['config'] ['navigation'] ) );
		}
		if (! empty ( $crs_def_arr ['config'] ['evaluation'] )) {
			$crs->set ( 'field_crs_eval_param', json_encode ( $crs_def_arr ['config'] ['evaluation'] ) );
			
			
			if($crs_def_arr['config']['evaluation']['feedback']['checked'] == 'true'){
				$crs->set('field_crs_hasfeedback', 'true');
			}
		}
		$crs->save ();

		// Check for style id if not exist create new style.
		if ($sid == 'undefined') {
			// Clean up Style package.
				$dom->getElementsByTagName ( 'script' )->item ( 0 )->nodeValue = '
				window.externaltexts = {};
					window.courseDefinition = {};
				';
				$data_div->item ( 0 )->nodeValue = '';
				$newContent = $dom->saveHTML($dom->getElementsByTagName('*')->item(0));
				$zipArchiver->open($path);
				$zipArchiver->deleteName('index.html');
				$zipArchiver->addFromString('index.html', $newContent);
			//		$zipArchiver->deleteName('medias/');
				for($i=0;$i<$zipArchiver->numFiles;$i++){
					$entry_info = $zipArchiver->statIndex($i);
//					if(substr($entry_info["name"],0,strlen('medias/'))== 'medias/'){
//						$zipArchiver->deleteIndex($i);
//					}
						if(!empty($custom_media_ids)){
							foreach($custom_media_ids as $old_id => $new_id){
								if(substr($entry_info["name"],0,strlen('medias/' . $old_id))== 'medias/' . $old_id){
									$new_index = str_replace('medias/' . $old_id, 'medias/' . $new_id, $entry_info['name']);
									$zipArchiver->renameIndex($i, $new_index);
								}
							}
						}
					}
					$zipArchiver->close();
			
			$upcr = new UploadController ();
			$styleJsonResponse = $upcr->styleImport ( $file );
			$styleContent = $styleJsonResponse->getContent ();
			$styleResArr = json_decode ( $styleContent, true );
			$sid = $styleResArr ['id'];
			$style_path = $styleResArr ['file_path'] ['file'] [0] ['folder_path'];
		}

		// Update course in style.
		if ($sid) {
			$style = Node::load ( $sid );
			$stitle = $style->getTitle ();
			$fid = $style->get( 'field_s_style_file' )->getValue();
			if ($fid) {
				$st_file = File::load( $fid [0] ['target_id'] );
				$style_uri = $st_file->getFileUri();
				$style_name = $st_file->getFilename();
				$style_path = current(explode($style_name, $style_uri));
				$style_path = 'public://course-styles/' . end(explode('course-styles/', $style_path));
			}
			$st_crs = $style->get ( 'field_s_courses' )->getValue ();
			$st_crs_arr = [];
			$st_crs_arr = array_column ( $st_crs, 'target_id' );
			$st_crs_arr [] = $crs_id;
			$style->set ( 'field_s_courses', $st_crs_arr );
			$style->save ();
		}

		// Update course in parent Cf/Dcr.
		$parent = Node::load ( $pid );
		$ptype = $parent->getType ();
		if ($ptype == 'domain_content_root') {
			$ch_field = 'field_dcr_children';
		} elseif ($ptype == 'content_folder') {
			$ch_field = 'field_cf_children';
		}

		$chld = $parent->get ( $ch_field )->getValue ();
		$chld_arr = [ ];
		$chld_arr = array_column ( $chld, 'target_id' );
		$chld_arr [] = $crs_id;

		$parent->set ( $ch_field, $chld_arr );
		$parent->save ();

		// Upload external files and map it to course.
		$abs_crs_style_path = \Drupal::service ( 'file_system' )->realpath ( $style_path . '/' . $crs_id );
		if (! file_exists ( $abs_crs_style_path )) {
			mkdir ( $abs_crs_style_path, 0777, true );
		}

		$zipArchiver->open ( $path );
		$zipArchiver->extractTo ( $abs_crs_style_path );
		$zipArchiver->close ();

		if ($stitle == 'BASE STYLE') {
			$sf_path = 'public://base-style-01';
		} else {
			$sf_path = $style_path . '/' . $crs_id;
		}

		$sf_real_path = \Drupal::service ( 'file_system' )->realpath ( $sf_path );

		if (is_dir ( $sf_real_path . '/external' )) {
			$this->uploadExternalFiles ( $crs_id, $sid, $sf_real_path . '/external' );
		}

		/*
		 * if(file_exists($src_path)){
		 * $this->removeDirectory($src_path);
		 * }
		 */

		return new JsonResponse ( [ 
				'result' => 'OK',
				'new_crs_id' => $crs->id ()
		] );
	}
	public function getStyles() {
		$style_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->execute ();

		$styles = Node::loadMultiple ( $style_ids );
		$result = [ ];
		foreach ( $styles as $style ) {
			$result [] = [ 
					'id' => $style->id (),
					'title' => $style->getTitle (),
					'framework' => $style->get ( 'field_s_framework' )->value
			];
		}

		return $result;
	}
	public function createCrsChildren($children, $pid, $crs_id = '') {
		$ids = [ ];
		$file_system = \Drupal::service ( 'file_system' );
		$mapping_id_array = array();
		foreach ( $children as $data ) {
			$field_array = [ 
					'subname' => $this->getFieldNameByKey ( $data ['type'], 'title2' ),
					'description' => $this->getFieldNameByKey ( $data ['type'], 'description' ),
					'duration' => $this->getFieldNameByKey ( $data ['type'], 'duration' ),
					'defaultmedia' => $this->getFieldNameByKey ( $data ['type'], 'media param' ),
					'mediaover' => $this->getFieldNameByKey ( $data ['type'], 'mediaover' ),
					'soundover' => $this->getFieldNameByKey ( $data ['type'], 'soundover' ),
					'is_evaluation' => $this->getFieldNameByKey ( $data ['type'], 'isevaluation' ),
					'summary' => $this->getFieldNameByKey ( $data ['type'], 'summary' ),
					'miscmedia' => $this->getFieldNameByKey ( $data ['type'], 'navigation template' ),
					'metadata' => $this->getFieldNameByKey ( $data ['type'], 'metadata' ),
					'background_params' => $this->getFieldNameByKey ( $data ['type'], 'background parameter' ),
					'stylesummary' => $this->getFieldNameByKey ( $data ['type'], 'style summary' ),
					'screenonsummary' => $this->getFieldNameByKey ( $data ['type'], 'screen on summary' ),
					'custom_path' => $this->getFieldNameByKey ( $data ['type'], 'files param' ),
					'htmlParam' => $this->getFieldNameByKey ( $data ['type'], 'htmlParam' ),
					'field_chap_cust_comp' => $this->getFieldNameByKey ( $data ['type'], 'Custom Completion' ),
					'config' => [ 
							'completion' => $this->getFieldNameByKey ( $data ['type'], 'completion parameter' ),
							'prerequisite' => $this->getFieldNameByKey ( $data ['type'], 'custom prerequisite' ),
							'evaluation' => $this->getFieldNameByKey ( $data ['type'], 'evaluation parameter' )
					],
					'connexion' => $this->getFieldNameByKey ( $data ['type'], 'connection' )
			];
			if(!empty( $data ['name'] )){
			// Assuming $title contains a string with HTML entities, like "&eacute;"
			$decodedTitle = html_entity_decode($data ['name'], ENT_QUOTES | ENT_HTML5, 'UTF-8');

			// Now $decodedTitle will contain the decoded string, e.g., "é"
			}

			$da = [ 
					'type' => $data ['type'],
					'title' => !empty( $decodedTitle ) ? $decodedTitle : 'Element'
			];
			$node = Node::create ( $da );
			$node->save ();

			$nid = $node->id ();
			$originalString = $data ['uid'];
			$prefix = 'ID';
			$numericPart = substr($originalString, strlen($prefix)); // Remove the prefix
			$link_old_id = substr($originalString, strlen($prefix)); // Remove the prefix
			$link_new_id = $nid;
			$mapping_id_array[$nid] = $numericPart;
			$linkmapping_id_array[$nid] = $numericPart;

			

			$linkresult = \Drupal::database()->select('html_params_links', 'ct')
				->fields('ct')
				->condition('ct.old_id', $link_old_id)
				->execute()
				->fetchAssoc();
			if($linkresult['old_id'] == $link_old_id ){
				\Drupal::database()->update('html_params_links')
				->fields([
					'old_id' => $link_old_id,
					'new_id' => $link_new_id,
					'import_id' => 1,
					'linkedElements'=>json_encode($data ['htmlParam']),
				])
				->condition('old_id', $link_old_id)
				->execute();
			}else{
				\Drupal::database()->insert('html_params_links')
				->fields([
					'old_id' => $link_old_id,
					'new_id' => $link_new_id,
					'import_id' => 1,
					'linkedElements'=> json_encode($data ['htmlParam']),
				])
				->execute();
			}
			


			$bg_params = [ ];
			$media_params = [ ];
			$misc_params = [ ];
			$media_over_params = [ ];
			$sound_over_params = [ ];
			$custom_path_params = [];
			$decoded_options = [ ];
			$custom_completion = [ ];
			$ccisStyleSummary = ' ';
			$str_child_myArray = array();
			foreach ( $data as $k => $val ) {
				if (! empty ( $val ) && array_key_exists ( $k, $field_array )) {
					$html_param = false;
					if ($k == 'config') {
						foreach ( $val as $i => $v ) {
							if (! empty ( $v ) && array_key_exists ( $i, $field_array [$k] )) {
								if ($field_array [$k] [$i]) {
									$item = is_string ( $data [$k] [$i] ) ? $data [$k] [$i] : json_encode ( $data [$k] [$i] );
									$node->set ( $field_array [$k] [$i], $item );
									if(strpos($i, 'completion') !== FALSE && $item){
										$comp_param = $this->getFieldNameByKey ( $data ['type'], 'completion parameter' );
										if ($comp_param) {
											$node->set ( $comp_param, $item );
											$node->save();
										}

									}
									if(strpos($i, 'prerequisite') !== FALSE && $item){
										//if($val['prerequisite']['checked'] == 'true'){								
										$prereq_param_field = $this->getFieldNameByKey ( $data ['type'], 'custom prerequisite' );
										if ($prereq_param_field) {
											$decoded_options = (is_string ( $item ) && $item != 'null' && ! is_null ( $item )) ? Json::decode ( $item ) : $item;
											$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
												$decoded_options
										];			
												$resultArray = array();
												// Use a foreach loop to combine the arrays
													foreach (array($decoded_options) as $array) {
														foreach ($array as $key => $value) {
															// Iterate through the array and print key-value pairs
																								
															if($key != 'siblings'){
																$resultArray[$key] = $value;
															}else{
																foreach ($value as $searchValue) {																		
																		$key = array_search($searchValue, $mapping_id_array);
																			if ($key !== false) {
																				$inputString = $key; // Your input string

																			// Remove backslashes using stripslashes
																			$modifiedString = stripslashes($inputString);
																				$matchingKeys[] = $modifiedString;
																			}
																		$resultArray['siblings'] = $matchingKeys;
																	
																}														
															}														
														}
													}												
											$updatedJsonInJsonFormat = json_encode($resultArray);
											
											unset($matchingKeys);
											
											$node->set ( $prereq_param_field, $updatedJsonInJsonFormat );
											$node->save();
										}

									}
									
									if(strpos($i, 'evaluation') !== FALSE && $item){
										if($val['evaluation']['feedback']['checked'] == 'true'){
											$feedback_field = $this->getFieldNameByKey($data ['type'], 'hasfeedback' );
											$node->set($feedback_field, 'true');
											$node->save();
											$evaluation_params = true;
										}
									}
								}
							}
						}
					} else {
						if ($field_array [$k]) {
							$item = is_string ( $data [$k] ) ? $data [$k] : json_encode ( $data [$k] );

			
							$node->set ( $field_array [$k], $item );
							
							$html_param_field = $this->getFieldNameByKey ( $data ['type'], 'Html param' );
							if($html_param_field){
								$html_param = true;
							}
							
							
							// Getting Medias.
							if (strpos ( $k, 'background' ) !== FALSE && $item) {
								$decoded_options = (is_string ( $item ) && $item != 'null' && ! is_null ( $item )) ? Json::decode ( $item ) : $item;
								if (! empty ( $decoded_options ) && is_array ( $decoded_options )) {
									$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
											$decoded_options
									];

									$bg_params ['old_cm_id'] = array_column ( $decoded_options, 'id' ) [0];
									$bg_params ['cm_url'] = array_column ( $decoded_options, 'url' ) [0];
									$bg_params ['file_name'] = array_column ( $decoded_options, 'name' ) [0];
								}
							}
							if (strpos ( $k, 'defaultmedia' ) !== FALSE && $item) {
								$decoded_options = (is_string ( $item ) && $item != 'null' && ! is_null ( $item )) ? Json::decode ( $item ) : $item;
								if (! empty ( $decoded_options ) && is_array ( $decoded_options )) {
									$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
											$decoded_options
									];

									$media_params ['old_cm_id'] = array_column ( $decoded_options, 'id' ) [0];
									$media_params ['cm_url'] = array_column ( $decoded_options, 'url' ) [0];
									$media_params ['file_name'] = array_column ( $decoded_options, 'name' ) [0];
								}
							}
							if (strpos ( $k, 'miscmedia' ) !== FALSE && $item) {
								$decoded_options = (is_string ( $item ) && $item != 'null' && ! is_null ( $item )) ? Json::decode ( $item ) : $item;
								if (! empty ( $decoded_options ) && is_array ( $decoded_options )) {
									$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
											$decoded_options
									];

									
								$misc_data = [
									'old_cm_id' =>  array_column ( $decoded_options, 'id' ),
									'cm_url' => array_column ( $decoded_options, 'url' ),
									'file_name' =>  array_column ( $decoded_options, 'name' )
								];
								
								$misc_params = [];
								
								foreach ($misc_data['old_cm_id'] as $index => $old_cm_id) {
									$misc_params[] = [
										'old_cm_id' => $old_cm_id,
										'cm_url' => $misc_data['cm_url'][$index],
										'file_name' => $misc_data['file_name'][$index]
									];
								}
							}						
							}
							if (strpos ( $k, 'mediaover' ) !== FALSE && $item) {
								$decoded_options = (is_string ( $item ) && $item != 'null' && ! is_null ( $item )) ? Json::decode ( $item ) : $item;
								if (! empty ( $decoded_options ) && is_array ( $decoded_options )) {
									$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
											$decoded_options
									];

									$media_over_params ['old_cm_id'] = array_column ( $decoded_options, 'id' ) [0];
									$media_over_params ['cm_url'] = array_column ( $decoded_options, 'url' ) [0];
									$media_over_params ['file_name'] = array_column ( $decoded_options, 'name' ) [0];
								}
							}
							if (strpos ( $k, 'soundover' ) !== FALSE && $item) {
								$decoded_options = (is_string ( $item ) && $item != 'null' && ! is_null ( $item )) ? Json::decode ( $item ) : $item;
								if (! empty ( $decoded_options ) && is_array ( $decoded_options )) {
									$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
											$decoded_options
									];

									$sound_over_params ['old_cm_id'] = array_column ( $decoded_options, 'id' ) [0];
									$sound_over_params ['cm_url'] = array_column ( $decoded_options, 'url' ) [0];
									$sound_over_params ['file_name'] = array_column ( $decoded_options, 'name' ) [0];
								}
							}
							if (strpos ( $k, 'custom_path' ) !== FALSE && $item) {
								$custom_path_params['old_cm_id'] = str_replace(['./medias/', '/index.html'], ['',''], $item);
								$custom_path_params['cm_url'] = $item;
								$custom_path_params['file_name'] = 'custom_animation_file';
							}
						}
					}

					
				}
				if($data ['type'] == 'chapter'){
							
					$isStyleSummary = false;
					$isScrnSummary = false;
					// $style_summary = $n->get ( 'field_style_summary' )->value;
					$style_summary = $data ['stylesummary'];
					$isStyleSummary = ($style_summary == 'true' || $style_summary == '1') ? true : false;
					$isStyleSummary = json_encode ( ( bool ) $isStyleSummary );
					$node->set ('field_style_summary', $isStyleSummary);
					//echo '<pre>';print_r($data ['name'] .'>>'.$isStyleSummary);
					// $screen_on_summary = $n->get ( 'field_screen_on_summary' )->value;
					$screen_on_summary = $data ['screenonsummary'];
					$isScrnSummary = ($screen_on_summary == 'true' || $screen_on_summary == '1') ? true : false;
					$isScrnSummary = json_encode ( ( bool ) $isScrnSummary );
					$node->set ('field_screen_on_summary', $isScrnSummary);
						
					
					$has_completion = $data ['has_completion'] ;				
					$node->set ( 'field_chap_cust_comp', $has_completion );
											
				}else{
					//if ( $data ['type'] == 'screen' || $data ['type'] == 'partpage' || $data ['type'] == 'simple_partpage' || $data ['type'] == 'simple_content' || $data ['type'] == 'question' || $data ['type'] == 'chapter' || $data ['type'] == 'page' ){
						$has_completion = $data ['has_completion'] ;
						
						if( $data ['type'] == 'page'){				
						$node->set ('field_cust_comp', $has_completion);
						$node->save;	
						}elseif( $data ['type'] == 'screen'){				
							$node->set ('field_scr_custom_completion', $has_completion);
							$node->save;								
						}elseif( $data ['type'] == 'partpage'){				
							$node->set ('field_page_cust_comp', $has_completion);
							$node->save;								
						}elseif( $data ['type'] == 'simple_partpage'){				
							$node->set ('field_sp_cust_comp', $has_completion);
							$node->save;								
						}
						$node->save;				
					//}
				}
				$node->save ();
			}

			$parent = Node::load ( $pid );
			$chld_field = $this->getNodeRelFieldName ( $parent->getType () );
			$chld_arr = $this->getElemChildren ( $pid, $chld_field );
			$new_chld_arr = array_merge ( $chld_arr, [ 
					$nid
			] );
			$parent->set ( $chld_field, $new_chld_arr );
			$parent->save ();

			if ($data ['type'] == 'partpage') {
				$temp_field = 'field_pp_template';
				$temp_type = 'field_pp_template_type';
			}
			if ($data ['type'] == 'screen') {
				$temp_field = 'field_scr_template';
				$temp_type = 'field_scr_template_type';
			}
			if ($data ['type'] == 'simple_content') {
				$temp_field = 'field_sc_template';
				$temp_type = 'field_sc_template_type';
			}
			if ($data ['type'] == 'simple_partpage') {
				$temp_field = 'field_spp_template';
				$temp_type = 'field_spp_template_type';
			}
			if ($data ['type'] == 'question') {
				$temp_field = 'field_ques_template';
				$temp_type = 'field_ques_template_type';
			}

			$old_nid = str_replace ( 'ID', '', $data ['uid'] );

			if ($data ['type'] == 'screen' || $data ['type'] == 'partpage' || $data ['type'] == 'simple_partpage' || $data ['type'] == 'simple_content' || $data ['type'] == 'question') {
				$temp_id = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'template' )->condition ( 'title', $data ['template'] )->execute (); 
	
				if (count ( $temp_id ) == 1) {
					$temp_id_arr = $node->get ( $temp_field )->getValue ();
					$old_temp_ids = array_column ( $temp_id_arr, 'target_id' );
					$temp_ids = array_merge ( $old_temp_ids, $temp_id );

					$node->set ( $temp_field, $temp_ids );
					$node->set ( $temp_type, $data ['type'] );
					$node->save ();
				}

				$ids [] ['temp_ids'] = [ 
						$old_nid => $nid
				];
			} else {
				$ids [] ['elem_ids'] = [ 
						$old_nid => $nid
				];
			
				
			}

			if (! empty ( $bg_params )) {
				$ids [] ['bg_params'] [$nid] = $bg_params;
			}
			if (! empty ( $media_params )) {
				$ids [] ['media_params'] [$nid] = $media_params;
			}
			if (! empty ( $misc_params )) {
				$ids [] ['misc_params'] [$nid] = $misc_params;
			}
			if (! empty ( $media_over_params )) {
				$ids [] ['media_over_params'] [$nid] = $media_over_params;
			}
			if (! empty ( $sound_over_params )) {
				$ids [] ['sound_over_params'] [$nid] = $sound_over_params;
			}
			if (! empty ( $custom_path_params )) {
				$ids [] ['custom_path_params'] [$nid] = $custom_path_params;
			}
			if ($evaluation_params){
				$ids [] ['evaluation_params'][] = $nid;
			}
			if($html_param){
				$ids [] ['html_params'][] = $nid;
			}

			if (! empty ( $data ['children'] )) {
				$chld_nids = $this->createCrsChildren ( $data ['children'], $nid, $crs_id );
				$ids = array_merge ( $ids, $chld_nids );
			}
		}
		return $ids;
	}
	
	public function createCourseMedia($crs_id, $el_id, $file_name, $file_path, $file_type = '') {
		$da = array (
				'type' => 'course_medias',
				'title' => ! empty ( $file_name ) ? $file_name : 'Course Media',
				'field_cm_course' => $crs_id,
				'field_cm_course_element' => $el_id,
				'field_cm_course_style' => '',
				'field_cm_subtitle' => $file_name,
				'field_cm_size' => '',
				'field_cm_file_path' => $file_path,
				'field_cm_type' => $file_type
		);

		$cm = Node::create ( $da );
		$cm->save ();

		return $cm->id ();
	}
	
	public function copyParams($crs_id, $ids, $param_key, $param_str){
		$nid = '';
		$file_system = \Drupal::service ( 'file_system' );
		$src_path = $file_system->realpath ( 'public://editor/' . $crs_id );
		$file_url_generator = \Drupal::service ( 'file_url_generator' );
		$params_arr = array_column ( $ids, $param_key );
		if (isset ( $params_arr ) && ! empty ( $params_arr )) {
			foreach ( $params_arr as $params ) {
				$new_nid = key ( $params );
				
				foreach($params [$new_nid] as $misc_media_val){
					if (is_array($misc_media_val)) {
						$cm_url = $misc_media_val ['cm_url'];						
						$old_cm_id = $misc_media_val ['old_cm_id'];
						$file_name = $misc_media_val ['file_name'];
					} else {
						$cm_url = $params [$new_nid]['cm_url'];
						$old_cm_id = $params [$new_nid]['old_cm_id'];
						$file_name = $params [$new_nid]['file_name'];
					}

				$new_node = Node::load ( $new_nid );
				$new_type = $new_node->getType ();
				$param_field = $this->getFieldNameByKey ( $new_type, $param_str );
				$node_params = $new_node->get ( $param_field )->value;
				if ($cm_url) {
					$old_cm_url = $cm_url;
					if (strpos ( $cm_url, '/medias' ) === FALSE) {
						$old_cm_url = './medias/' . end ( explode ( '/', $cm_url ) );
					}
					
					if(is_dir($src_path . ltrim ( $old_cm_url, '.' ))){
						$save_file = $this->recurseCopy($src_path . ltrim ( $old_cm_url, '.' ), 'public://');
					}
					else {
						$save_file = $file_system->copy ( $src_path . ltrim ( $old_cm_url, '.' ), 'public://', FileSystemInterface::EXISTS_RENAME );
					}
				}
				if ($save_file) {
					$file_name = ! empty ( $file_name ) ? $file_name : 'course media file';
					$new_cm_id = $this->createCourseMedia ( $crs_id, $new_nid, $file_name, $save_file );
					$new_cm_url = $file_url_generator->generateString ( $save_file );
					$node_params = str_replace ( '\\', '', $node_params );
					$node_params = str_replace ( [ 
						$old_cm_id,
						$cm_url,
						'src2'
					], [ 
						$new_cm_id,
						$new_cm_url,
						'src'
					], $node_params );
					$new_node->set ( $param_field, $node_params );
					$new_node->save ();
					$nid = $new_node->id();
				}
    			}				
			}
		}
		return $nid;
	}
	
	public function is_multidimensional(array $array) {
		return count ( $array ) !== count ( $array, COUNT_RECURSIVE );
	}
	public function isJson($string) {
		json_decode ( $string );
		return json_last_error () === JSON_ERROR_NONE;
	}

	//BILIM-555
	public function deleteAll($str) {
      
		// Check for files
		if (is_file($str)) {
			  
			// If it is file then remove by
			// using unlink function
			return unlink($str);
		}
		  
		// If it is a directory.
		elseif (is_dir($str)) {
			  
			// Get the list of the files in this
			// directory
			$scan = glob(rtrim($str, '/').'/*');
			  
			// Loop through the list of files
			foreach($scan as $index=>$path) {
				  
				// Call recursive function
			   $this->deleteAll($path);
			}
			  
			// Remove the directory itself
			return @rmdir($str);
		}
	}	
	
	/**
	 * *
	 * Get clone node and its children for CourseTree
	 *
	 * Retruns a array of children for nodes (course)
	 */

	 public function cloneElemChildrenCourseTree($nid, $ncourseId = null) {
		$n = Node::load ( $nid );
		$last_pnode_id = $n->id ();
		// get children
		$type = $n->getType ();
		$field = $this->getNodeRelFieldName ( $type );
		$crs_children = $n->$field->getValue ();
		$chIds = [ ];
		// clone all children
		if (! empty ( $crs_children )) :
			foreach ( $crs_children as $cc ) :
				$cn = Node::load ( $cc ['target_id'] );
				if (! empty ( $cn )) :
					$ctype = $cn->getType ();
					/**
					 * * Clone a Child Node
					 */
					$c_clone_node = $cn->createDuplicate ();
					if ($ctype == 'screen') :
						$c_clone_node->set ( 'field_scr_connections', 'repeat' );
					 elseif ($ctype == 'page') :
						$c_clone_node->set ( 'field_page_connections', 'repeat' );
					endif;
					$c_clone_node->save ();
					$last_cnode_id = $c_clone_node->id ();

					// get Course medias
					$cm_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course_element', $cc ['target_id'] )->execute ();

					// Add elements to course medias
					if (! empty ( $cm_ids )) {
						$course_medias = Node::loadMultiple ( $cm_ids );
						$file_system = \Drupal::service ( 'file_system' );
						foreach ( $course_medias as $cm ) {
							$cm_type = $cm->get ( 'field_cm_type' )->getString ();
							/*
							 * if(strpos($cm_type,'image') !== false){
							 * $cm_elements = $cm->get('field_cm_course_element')->getValue();
							 * $elem_arr = array_column($cm_elements,'target_id');
							 * if(!empty($elem_arr)){
							 * $elem_arr[] = $last_cnode_id;
							 * $cm->set('field_cm_course_element',$elem_arr);
							 * $cm->save();
							 * }
							 * }
							 */

							$dup_cm = $cm->createDuplicate ();
							$dup_file_path = $dup_cm->get ( 'field_cm_file_path' )->getString ();
							$file_name = end ( explode ( '/', $dup_file_path ) );
							$oldUniqueId = current ( explode ( '_', $file_name ) );
							$newUniqueId = uniqid ();
							$dest_src = str_replace ( $oldUniqueId, $newUniqueId, $dup_file_path );
							$full_path = $file_system->realpath ( $dup_file_path );
							$dest_path = $file_system->realpath ( $dest_src );
							if (strpos ( $cm_type, 'zip' ) !== false) {
								$file_save = $this->recurseCopy ( $full_path, $dest_path );
							} elseif (strpos ( $cm_type, 'video' ) !== false || strpos ( $cm_type, 'audio' ) !== false || strpos ( $cm_type, 'octet' ) !== false || strpos ( $cm_type, 'stream' ) !== false) {
								$dup_cm->save ();
								$wav_json_path = $dup_cm->get ( 'field_cm_wav_json_path' )->getString ();
								if ($wav_json_path) {
									$dest_json_path = str_replace ( $cm->id (), $dup_cm->id (), $wav_json_path );
									$src_json_path = $file_system->realpath ( $wav_json_path );
									$dest_json_realpath = $file_system->realpath ( $dest_json_path );
									$file_copy = $file_system->copy ( $src_json_path, $dest_json_realpath, FileSystemInterface::EXISTS_RENAME );
									$dup_cm->set ( 'field_cm_wav_json_path', $dest_json_path );
								}
								$mp3_path = $dup_cm->get ( 'field_cm_audio_path' )->getString ();
								if ($mp3_path) {
									$dest_mp3_path = str_replace ( $cm->id (), $dup_cm->id (), $mp3_path );
									$src_mp3_path = $file_system->realpath ( $mp3_path );
									$dest_mp3_realpath = $file_system->realpath ( $dest_mp3_path );
									$file_copy = $file_system->copy ( $src_mp3_path, $dest_mp3_realpath, FileSystemInterface::EXISTS_RENAME );
									$dup_cm->set ( 'field_cm_audio_path', $dest_mp3_path );
								}
								$file_save = $file_system->copy ( $full_path, $dest_path, FileSystemInterface::EXISTS_RENAME );
							} else {
								$file_save = $file_system->copy ( $full_path, $dest_path, FileSystemInterface::EXISTS_RENAME );
							}

							if (strpos ( $cm->getTitle (), $cc ['target_id'] ) !== false) {
								$old_title = $cm->getTitle ();
								$new_title = str_replace ( $cc ['target_id'], $last_cnode_id, $old_title );
								$dup_cm->setTitle ( $new_title );
								$dup_cm->set ( 'field_cm_subtitle', $new_title );
							}

							$dup_cm->set ( 'field_cm_file_path', $dest_src );
							$dup_cm->set ( 'field_cm_course_element', $c_clone_node->id () );
							if($ncourseId != null)
							{
								$dup_cm->set ( 'field_cm_course', $ncourseId );
							}
							$dup_cm->save ();

							// Update Templates HTML & Media Params
							$mdata = [ ];
							$mdata = [ 
									'cm_id' => $cm->id (),
									'cloned_id' => $dup_cm->id (),
									'old_path' => $oldUniqueId,
									'new_path' => $newUniqueId
							];
							$this->updateTempHtml ( $last_cnode_id, $mdata );
						}
					}

					$chIds [$cn->id ()] = $last_cnode_id;

					$ch_ids [] = array (
							'target_id' => $last_cnode_id
					);
					if ($ctype != 'simple_content') :
						$cfield = $this->getNodeRelFieldName ( $ctype );
						$arr = [ ];
						//$arr = $this->cloneElemChildren ( $last_cnode_id );
						if($ncourseId == null){
							$arr = $this->cloneElemChildrenCourseTree ( $last_cnode_id );
						}
						else {
							$arr = $this->cloneElemChildrenCourseTree ( $last_cnode_id, $ncourseId );
						}
						foreach ( $arr as $key => $val ) {
							$chIds [$key] = $val;
						}
            
          endif;
        endif;


			endforeach
			;
			if (! empty ( $ch_ids )) :
				// update relationship to parent
				$upd = Node::load ( $last_pnode_id );
				$upd->set ( $field, $ch_ids );
				$upd->save ();
      endif;
    endif;


		return $chIds;
	}

	
	///////////// STARTING of courseHTML function for Export Translation ///////////
	public function courseHtmlTranslation($crs_id, $data) {
		$file_system = \Drupal::service ( 'file_system' );

		$style_id = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'style' )->condition ( 'field_s_courses', $crs_id )->execute ();

		$style_id = implode ( '', $style_id );

		$style = Node::load ( $style_id );

		$file_id = $style->get ( 'field_s_style_file' )->getValue () [0] ['target_id'];
		$file = File::load ( $file_id );
		$file_uri = $file->getFileUri ();
		$file_path = $file_system->realpath ( $file_uri );

		if (file_exists ( 'public://editor/course' )) {
			$dir = $file_system->realpath ( 'public://editor/course/' );
			$this->removeDirectory ( $dir );
		}

		mkdir ( 'public://editor/course/' . $crs_id, 0777, true );
		mkdir ( 'public://editor/course/' . $crs_id . '/medias/', 0777, true );

		$crs_folder = 'public://editor/course/' . $crs_id;
		$abs_crs_path = $file_system->realpath ( $crs_folder );

		$abs_crs_path2 = str_replace("course/".$crs_id, "", $abs_crs_path);

		$style_zip = new \ZipArchive ();
		$style_zip->open ( $file_path );
		$style_zip->extractTo ( $abs_crs_path );
		$style_zip->close ();

		$media_ids = \Drupal::entityQuery ( 'node' )->condition ( 'type', 'course_medias' )->condition ( 'field_cm_course', $crs_id )->condition ( 'field_cm_course_element', '', '<>' )->execute ();

		$medias = Node::loadMultiple ( $media_ids );

		$destination = 'public://editor/course/' . $crs_id . '/medias/';

		foreach ( $medias as $media ) {
			$source = $media->get ( 'field_cm_file_path' )->getString ();
			if ($source) {
				// $uri = Url::fromUserInput(file_url_transform_relative($source));
				$media_name = end ( explode ( '/', $source ) );
				$cm_type = $media->get ( 'field_cm_type' )->getString ();
				$src_file_path = $file_system->realpath ( $source );
				if (strpos ( $cm_type, 'zip' ) !== false) {
					$dst_path = $destination . $media->id ();
					if (! file_exists ( $dst_path )) {
						mkdir ( $dst_path, 0777, true );
					}
					$dst = $file_system->realpath ( $dst_path );
					$copy = self::recurseCopy ( $src_file_path, $dst );
				} else {
					$fileData = file_get_contents ( $src_file_path, FILE_USE_INCLUDE_PATH );
					$file_copied = file_save_data ( $fileData, $destination . $media_name, FileSystemInterface::EXISTS_REPLACE );
				}
			}
		}

		$crsJson = $this->getCourseJson ( $crs_id, $data, $style_id );
		// $crsJson = str_replace(['"{','}"'], ['{','}'], $crsJson);
		$crsJson = strtr ( $crsJson, [ 
				'"{' => '{',
				'}"' => '}'
		] );

		$crs = Node::load ( $crs_id );

		$pp_temps = $this->getTemplatesByCourse ( $crs_id );

		$temp_htmls = [ ];
		$temp_html_arr = [ ];
		//$new_val = ' ';
		foreach ( $pp_temps as $pp_temp ) {
			$temp = Node::load ( $pp_temp );
			$temp_html = '';
			if ($temp->getType () === 'partpage') {
				$temp_html = $temp->get ( 'field_pp_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'simple_partpage') {
				$temp_html = $temp->get ( 'field_spp_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'question') {
				$temp_html = $temp->get ( 'field_ques_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'simple_content') {
				$temp_html = $temp->get ( 'field_sc_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			} elseif ($temp->getType () === 'screen') {
				$temp_html = $temp->get ( 'field_scr_html' )->getString ();
				$temp_html_arr = $this->htmlStringToArray ( $temp_html );
			}

			$div_custom_text = "\n<div class='customtext'>\n";

			foreach ( $temp_html_arr as $i => $val ) {
				if (stristr ( $val, 'outercontainer' )) {
					$dom = new \DOMDocument ();
					$dom->loadHTML ( $val, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
					$dom_xpath = new \DOMXPath ( $dom );
					$div = $dom_xpath->query ( "//*[contains(concat(' ', normalize-space(@class), ' '), ' outercontainer ')]" );
					$className = $dom_xpath->evaluate ( "string(//@class)" );
					$oldDiv = 'class="' . $className . '"';
					$newDiv = 'id="ID' . $temp->id () . '" ' . $oldDiv;
					// $div[0]->setAttribute("id", "ID".$temp->id());
					// $temp_html_arr[$i] = $dom->saveHTML();
					if (stristr ( $val, '<div id="ID' ) === false) {
						$temp_html_arr [$i] = str_replace ( $oldDiv, $newDiv, $temp_html_arr [$i] );
					}
				}
				if (stristr ( $val, ' editor ' )) {
					$temp_html_arr [$i] = str_replace ( ' editor ', ' ', $temp_html_arr [$i] );
				}
				if (stristr ( $val, 'default/files/' )) {
					$doc = new \DOMDocument ();
					$doc->loadHTML ( $temp_html_arr [$i], LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
					$xpath = new \DOMXPath ( $doc );
					$blm_path = $xpath->evaluate ( "string(//@blm-custom)" );

					if ($blm_path) {
						$fileName = end ( explode ( '/', $blm_path ) );
						$editor_options = $xpath->evaluate ( "string(//@blm-editor-options)" );
						$decoded_options = json_decode ( $editor_options, true );
						$decoded_options = $this->is_multidimensional ( $decoded_options ) ? $decoded_options : [ 
								$decoded_options
						];
						$m_id = array_column ( $decoded_options, 'id' ) [0];
						$cm_url = array_column ( $decoded_options, 'url' ) [0];

						$custom_media_translate_path = $abs_crs_path. '/medias/'.$m_id. '/index.html';
						$custom_media_translate_content = file_get_contents($custom_media_translate_path);	
						// Create a new DOMDocument.
						$dom = new \DOMDocument ();
						// Load HTML content into the DOMDocument.
						$dom->loadHTML($custom_media_translate_content);
						// Use DOMXPath to query elements.
						$x_path = new \DOMXPath($dom);
						$element = $x_path->query('//div[@class="menuTitle"]')->item(0);
						// Extract and print the text content of the element.
						$textContent = $element->textContent;
						$div_custom_text .= "<div>".trim($textContent)."</div>\n";
						$elements = $x_path->query('//div[@class="filters"]')->item(0);
						$textContent2 = $elements->textContent;

						$textContent2_arr = explode("\n",$textContent2);
						//print_r ($textContent2_arr);
						foreach($textContent2_arr as $txt2)
						{													
							//print_r ($txt2); 
							if(trim($txt2)!="")
							{
								//echo "123456=="; echo $txt2."\n";
								$div_custom_text .= "<div>".trim($txt2)."</div>\n";
							}													
						}
						$div_custom_text .= "</div>\n";
						//print_r($div_custom_text); 


						$new_val = str_replace ( [ 
								$blm_path,
								$cm_url
						], [ 
								'./medias/' . $m_id . '/' . $fileName,
								'./medias/' . $m_id
						], $temp_html_arr [$i] );
						//$temp_html_arr [$i] = $new_val;
						$temp_html_arr [$i] = $new_val.$div_custom_text;
					} 
					else {
						$editor_url = file_url_transform_relative ( file_create_url ( 'public://editor' ) );

						//echo 'abs_crs_path : '; print_r($abs_crs_path); echo "\n";
						//echo 'editor_url : '; print_r($editor_url); echo "\n";
						//echo 'temp_html_arr vid 2 : '; echo $temp_html_arr[$i]; echo "\n";

						//////////////// Start - for Subtitles /////////////////////////////

							//if (stristr ( $val, 'kind="subtitles"' ))
							if (stripos($val, 'kind="subtitles"') !== false) {
								//echo "subtitles present 1\n";

								$subtitles_filename = $this->getSpecificString ( $temp_html_arr[$i], 'subtitles" srclang="en" src="'.$editor_url.'/', '" default');
								$subtitles_path = $abs_crs_path2.$subtitles_filename;

								//echo 'subtitles_filename vid 11: '; echo $subtitles_filename; echo "\n";
								//echo 'subtitles_path vid : '; echo $subtitles_path; echo "\n";

								//$subtitles = "<div class='subtitles'>\n";
								$subtitles = "";
								$subtitles_lines = file($subtitles_path);
								$subtitles_lines2 = str_replace("WEBVTT","",$subtitles_lines);
								foreach ($subtitles_lines2 as $line) {
									//echo $line."\n";
									if(trim($line)!=""){
										
										if (stripos($line, '-->') !== false){
											$subtitles .= "<div ";
											$line_arr = explode("-->",$line);
											$subtitle_timer = "start='".$line_arr[0]."' stop='".$line_arr[1]."'>";
											$subtitles .= trim($subtitle_timer);
										}
										else {
											$subtitle_name = trim($line);
											$subtitles .= trim($subtitle_name)."</div>\n";
										}
									}
									
								}
								//$subtitles .= "</div>";
								//print_r($subtitles); 
							}	

							//////////////// End - for Subtitles /////////////////////////////

							//////////////// Start - for Chapters/Markers /////////////////////////////
							
							if (strripos($val, 'kind="chapters"') !== false) {
								//echo "chapters present\n";
								$chapters_filename = $this->getSpecificString ( $temp_html_arr[$i], 'chapters" srclang="en" src="'.$editor_url.'/', '"');
								$chapters_path = $abs_crs_path2.$chapters_filename;

								//$chapters = "<div class='markers'>\n";
								$chapters = "";
								$chapters_lines = file($chapters_path);
								$chapters_lines2 = str_replace("WEBVTT","",$chapters_lines);
								foreach ($chapters_lines2 as $line2) {
									if(trim($line2)!=""){
										
										if (stripos($line2, '-->') !== false){
											$chapters .= "<div ";
											$line_arr_2 = explode("-->",$line2);
											$chapters_timer = "start='".$line_arr_2[0]."' stop='".$line_arr_2[1]."'>";
											$chapters .= trim($chapters_timer);
										}
										else {
											$chapters_name = trim($line2);
											$chapters .= trim($chapters_name)."</div>\n";
										}
									}
									
								}

								//$chapters .= "</div>";
								//print_r($chapters); 
							}  

							//////////////// End - for Chapters/Markers /////////////////////////////

							$new_val = str_replace ( $editor_url, './medias', $temp_html_arr [$i] );
							$temp_html_arr [$i] = $new_val;
					}
				}
				if (stristr ( $val, 'src=' )) {
					$temp_html_arr [$i] = str_replace ( 'src=', 'src2=',  $temp_html_arr [$i]);
				}
			} //die();
			$tempHtmls = implode ( '', $temp_html_arr );

			//echo 'tempHtmls vid : '; print_r($tempHtmls); echo "\n"; die();

			//////////// START - insert chapters/markers div after div captionwrapper ////////////////////
			if($chapters != "")
			{   //echo $subtitles;
				$dom3 = new \DOMDocument();
				$dom3->loadHTML($tempHtmls, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

				// Create a DOMXPath object
				$xpath3 = new \DOMXPath($dom3);

				// Specify the class name you want to find
				$targetClass2 = 'captionwrapper';

				// Use XPath query to find the target div by class
				$targetDivs2 = $xpath3->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $targetClass2 ')]");
				//$subtitles_encodedHTML = htmlspecialchars($subtitles, ENT_NOQUOTES);
				// Check if any target divs were found
				if ($targetDivs2->length > 0) {
					// Loop through the found target divs
					foreach ($targetDivs2 as $targetDiv2) {
						// Create a new div element
						$newDiv2 = $dom3->createElement('div');
						$newDiv2->setAttribute('class', 'markers');
						$newDiv2->nodeValue = $chapters;
						//echo "hi : ".$subtitles;
						// Insert the new div after the target div
						$targetDiv2->parentNode->insertBefore($newDiv2, $targetDiv2->nextSibling);
					}

					// Get the updated HTML content
					$updatedHTML2 = $dom3->saveHTML();
					$updatedHTML2 = str_replace(['&lt;', '&gt;'], ['<', '>'], $updatedHTML2);
					// Output the updated HTML content
					//$encodedHTML = htmlspecialchars($updatedHTML, ENT_NOQUOTES);
					//echo $updatedHTML;
				}
				$tempHtmls = $updatedHTML2 ;
			}
			
			///////////////////////// END - insert chapters/markers div after div captionwrapper //////////////////////

			//////////// START - insert subtitles div after div captionwrapper ////////////////////
			if($subtitles != "")
			{   //echo $subtitles;
				$dom2 = new \DOMDocument();
				$dom2->loadHTML($tempHtmls, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

				// Create a DOMXPath object
				$xpath2 = new \DOMXPath($dom2);

				// Specify the class name you want to find
				$targetClass = 'captionwrapper';

				// Use XPath query to find the target div by class
				$targetDivs = $xpath2->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $targetClass ')]");
				//$subtitles_encodedHTML = htmlspecialchars($subtitles, ENT_NOQUOTES);
				// Check if any target divs were found
				if ($targetDivs->length > 0) {
					// Loop through the found target divs
					foreach ($targetDivs as $targetDiv) {
						// Create a new div element
						$newDiv = $dom2->createElement('div');
						$newDiv->setAttribute('class', 'subtitles');
						$newDiv->nodeValue = $subtitles;
						//echo "hi : ".$subtitles;
						// Insert the new div after the target div
						$targetDiv->parentNode->insertBefore($newDiv, $targetDiv->nextSibling);
					}

					// Get the updated HTML content
					$updatedHTML = $dom2->saveHTML();
					$updatedHTML = str_replace(['&lt;', '&gt;'], ['<', '>'], $updatedHTML);
					// Output the updated HTML content
					//$encodedHTML = htmlspecialchars($updatedHTML, ENT_NOQUOTES);
					//echo $updatedHTML;
				}
				$tempHtmls = $updatedHTML;
			}
			
			///////////////////////// END - insert subtitles div after div captionwrapper //////////////////////
			
			if ($tempHtmls != '' || $tempHtmls != null) {
				$temp_htmls [] = $tempHtmls;
			}
		}

		// reads an array of lines
		$templates = implode ( '', $temp_htmls );

		$index_file = file_get_contents ( $abs_crs_path . '/index.html' );
        $data_file = file_get_contents ( $abs_crs_path . '/data.html' );

		$html_arr = file ( $abs_crs_path . '/index.html' );
		//$data_html_arr = file ( $abs_crs_path . '/data.html' );
		
		$data_html_arr = array();

		foreach ( $html_arr as $x => $data_html_str ) {
			if (stristr ( $data_html_str, 'id="data' )) {
				$doc = new \DOMDocument ();
				$doc->loadHTML ( $html_arr [$x], LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
				$xpath = new \DOMXPath ( $doc );
				$divs = $xpath->query ( '//div[@id="data"]' );
				$divs->item ( 0 )->textContent = $templates;
				$html = $doc->saveHTML ();
				$data_html_arr [$x] = html_entity_decode ( $html );
			}
		}

		
		$externalTexts = $crs->get ( 'field_external_texts' )->getString ();
		$newStructureJson = $crsJson.",\n".$externalTexts;

		$newDataHtml = implode ( '', $data_html_arr );

		if (file_exists ( $abs_crs_path . '/index.html' )) {
			unlink ( $abs_crs_path . '/index.html' );
		}

		//////////////////
		if (file_exists ( $abs_crs_path . '/blmconfig.json' )) {
			unlink ( $abs_crs_path . '/blmconfig.json' );
		}

		if (file_exists ( $abs_crs_path . '/thumbnail.png' )) {
			unlink ( $abs_crs_path . '/thumbnail.png' );
		}

		if (file_exists ( $abs_crs_path . '/fmk/bilim.umd.min.js' )) {
			//unlink ( $abs_crs_path . '/fmk/*.*' );
			//array_map('unlink', glob($abs_crs_path."/fmk/*.*"));
			array_map('unlink', array_filter((array) glob($abs_crs_path."/fmk/*")));
			rmdir($dirname."/fmk");
		}

		if (file_exists ( $abs_crs_path . '/css/navigation.css' )) {
			//unlink ( $abs_crs_path . '/css/*.*' );
			$this->recursiveRemove ( $abs_crs_path . '/css/' );
		}

		if (file_exists ( $abs_crs_path . '/js/navigation.js' )) {
			//unlink ( $abs_crs_path . '/js/*.*' );
			$this->recursiveRemove ( $abs_crs_path . '/js/' );
		}
		//////////////////

		if (file_exists ( $abs_crs_path . '/data.html' )) {
			unlink ( $abs_crs_path . '/data.html' );
		}

		if (file_exists ( $abs_crs_path . '/structure.json' )) {
			unlink ( $abs_crs_path . '/structure.json' );
		}

		$data_file = fopen ( $abs_crs_path . '/data.html', 'w+' );
		fwrite ( $data_file, $newDataHtml );
		fclose ( $data_file );
		
		$structure_json_file = fopen ( $abs_crs_path . '/structure.json', 'w+' );
		fwrite ( $structure_json_file, $newStructureJson );
		fclose ( $structure_json_file );

		return $abs_crs_path;
	}
	///////// END of courseHTML function for Export Translation /////////////
	
	////////// Remove all files, folders and their subfolders
	public function recursiveRemove($dir) {
	    $structure = glob(rtrim($dir, "/").'/*');
	    if (is_array($structure)) {
	        foreach($structure as $file) {
	            if (is_dir($file)) $this->recursiveRemove($file);
	            elseif (is_file($file)) unlink($file);
	        }
	    }
	    rmdir($dir);
	}

	////////////////////////

	//////////Start - get specific part of a string
	public function getSpecificString($originalString,$startDelimiter,$endDelimiter) {
	    $startPosition = strpos($originalString, $startDelimiter) + strlen($startDelimiter);
		$endPosition = strpos($originalString, $endDelimiter, $startPosition);
		$specificPart = substr($originalString, $startPosition, $endPosition - $startPosition);

		return $specificPart; 
	}
	/////////End - get specific part of a string
}
