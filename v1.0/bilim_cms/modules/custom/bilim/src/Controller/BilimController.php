<?php

namespace Drupal\bilim\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\flag\Entity\Flag;
use Drupal\flag\Event\FlagEvents;
use Drupal\flag\Event\FlaggingEvent;
use Drupal\flag\Event\UnflaggingEvent;
use Drupal\flag\FlagInterface;
use Drupal\flag\FlagService;
use Drupal\flag\FlagLinkBuilderInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\Core\Session\SessionManager;


/**
 * Class BilimController.
 */
class BilimController extends ControllerBase {

  public $bcr;

  public function __construct() {
      global $bcr;
  }

  /**
   * 
   * Array values to merge and remove duplicates
   * 2 params (existing value, new input)
   * 
   */
  public function arrayMnp($org_val,$inp_val){
    //$bcr = new BilimController();
    $input_val = array(
      "target_id" => $inp_val
    );
    $merged_val = array_merge($org_val,$input_val);
    //$res = $this->rm_unique($merged_val,"target_id");
    return $merged_val;
  }

  /***
   * 
   * function to flatten multidimension array
   */
  
  function flatten_array($array){
    $return = array();
    array_walk_recursive($array, function($a) use (&$return) { $return[] = $a; });
    return $return;  
  }

  /***
   * function for date comparision
   */

  function date_compare($element1, $element2) { 
    $datetime1 = strtotime($element1['datetime']); 
    $datetime2 = strtotime($element2['datetime']); 
    return $datetime1 - $datetime2; 
  }  


  /***
  *
  * function to remove duplicates 
  *
  */

  function rm_unique($array,$key)
  {
      $temp_array = [];
      foreach ($array as &$v) {
          if (!isset($temp_array[$v[$key]]))
          $temp_array[$v[$key]] =& $v;
      }
      $array = array_values($temp_array);
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

  public function swapElem(&$array,$new_pos,$tid) {
    $sarray = $array;
    $ckey_val = array_keys($array,array('target_id' => $tid));
    $cur_pos = $ckey_val[0];
    $out = array_splice($sarray, $cur_pos, 1);
    array_splice($sarray, $new_pos, 0, $out);
    return $sarray;
  }

  /**
   * New Item into an Existing List
   *
   * @param array      $array
   * @param int|string $position
   * @param mixed      $insert
   * 
   */
  public function array_insert(&$array, $position, $insert)
  {
      if (is_int($position)) {
          array_splice($array, $position, 0, $insert);
      } else {
          $pos   = array_search($position, array_keys($array));
          $pos = $pos - 1;
          $array = array_merge(
              array_slice($array, 0, $pos),
              $insert,
              array_slice($array, $pos)
          );
      }
      return $array;
  }

  /**
   * Get Id Elements from Array
   */
  public function getIdValues($array) { 
    $result = array_column($array, 'id');
    return $result; 
  } 


  /***
   * Node Operations
   */

  /*****
  * Get field name of the Node relation
  * Annexes	Contains - Annexes folder | Page | Screen
  * Annexes Folder	contains - Annexes folder | Page | Screen
  * Chapter	Contains - Chapter | Page | Screen | Question | Custom | Feedback
  * Feedback	Contains -Simple Page | Simple Content
  * Page	Contains - Partpage | Feedback
  * Partpage	contains - Simple Page | Simple Content
  * Question	Contains - Simple Page | Simple Content
  * Screen	Contains - Simple Page | Simple Content
  * Simple Page	Contains - Part page
  * Starting	Starting page - Contains Screen Page
  * Structure	contains - Chapter | Page | Screen | Question | Custom | Feedback 
  */
  function getNodeRelFieldName($type){
      $field = '';

      if($type == 'course'):
        $field = 'field_crs_children';
      elseif($type == 'starting'):
        $field = 'field_str_children';
      elseif($type == 'structure'):
        $field = 'field_struct_children';
      elseif($type == 'annexes'):
        $field = 'field_anx_children';
      elseif($type == 'page'):
        $field = 'field_page_children';
      elseif($type == 'custom'):
        $field = 'field_custom_children';
      elseif($type == 'feedback'):
        $field = 'field_feedback_children';
      elseif($type == 'question'):
        $field = 'field_ques_children';
      elseif($type == 'chapter'):
        $field = 'field_chap_children';
      elseif($type == 'question'):
        $field = 'field_ques_children';
      elseif($type == 'screen'):
        $field = 'field_scr_children';
      elseif($type == 'partpage'):
        $field = 'field_pp_children';
      elseif($type == 'simple_page'):
        $field = 'field_sp_children';
      elseif($type == 'annexes_folder'):
        $field = 'field_anx_fdr_children';
      elseif($type == 'domain_content_root'):
        $field = 'field_dcr_children';
      elseif($type == 'content_folder'):
        $field = 'field_cf_children';
      endif;

      return $field;
  }

  /***
   * Conc all array to comma seperated string
   */

  public function getTargetIds($array = array()) {
    $child_ids = array();
    foreach($array as $a):
      $child_ids[] = $a['target_id'];
    endforeach;
    return $child_ids;
  }


  /***
  * Remove Single Child from node relation.
  * node - current parent node 
  * field - field name based on the type
  * tid - target child id to remove
  */

  public function removeChildFromNode($node, $field, $tid) {
    if(null != $node) {
      if ($node->hasField($field)) {
        $items = $node->get($field);
        for ($i = 0; $i < $items->count(); $i++) {
          if ($items->get($i)->target_id == $tid) {
            $items->removeItem($i);
            // Caution: decrement the counter as removeItem() also does a rekey().
            $i--;
          }
        }
        //$items->rekey();
        $node->save();
      }
    }

  }

  /***
   * Get Children with type
   * 
   * Retruns a array of children for nodes (course)
   */

  public function getChildrenByType($nids,$type) {
    $nodes = Node::loadMultiple($nids);
    $id = '';
    if(!empty($nodes)):
      foreach($nodes as $ns):
        $gtype = $ns->getType();
        if($gtype == $type):
            $id = $ns->id();
        endif;
      endforeach;
    endif;
    return $id;
  }

  /***
   * Get Children from the node id
   * 
   * Retruns a array of children for nodes (course)
   */

  public function getElemChildren($nid,$field) {
      $n = Node::load($nid);
      $crs_children = $n->$field->getValue();
      $result = $this->getTargetIds($crs_children);
      return $result;
  }

  /***
   * Get Children from the node id with children & key
   * 
   * Retruns a array of children for nodes (course)
   */

  public function getElemChildrenWithKey($nid,$field) {
    $n = Node::load($nid);
    $crs_children = $n->$field->getValue();
    $nodes = Node::loadMultiple($crs_children);
    if(!empty($nodes)):
      foreach($nodes as $ns):
        $gtype = $ns->getType();
        $val = $ns->field_chap_display_order->getValue();
        $res_nodes[] = array(
          'id' => $ns->id(),
          'val' => $val
        );
      endforeach;
    endif;
    return $res_nodes;
  }

  /***
   * Add New child and update id to its parent.
   * $pid = Parent id
   */
  public function addChildElem($pid,$chlds,$ftype,$ftitle,$pch_fld){
    $da = array(
      'type' => $ftype,
      'title' => $ftitle
    ); 
    $node = Node::create($da);
    $node->save(); 
    
    if($node > 0):
      $fid = $node->id();  
      $new_chld = '';
      if($pid > 0):
        $pn = Node::load($pid);
        if(!empty($chlds)):
          $input_val = array($fid);
          $new_chld = array_merge($chlds,$input_val);
          //$new_chld = $this->arrayMnp($chlds,$fid);
        else:
          $new_chld = array(
            "target_id" => $fid
          );
        endif;
        $pn->set($pch_fld, $new_chld);
        $pn->save();
      endif;
    endif;
  }

  /***
   * Unpublish parent and its children nodes.
   * 
   * Retruns a array of children for nodes (course)
   */
  
  public function getElemDeleteChildren($nid,$field) {
    $n = Node::load($nid);
    $crs_children = $n->$field->getValue();
    $ptype = $n->getType();

    if($ptype != 'simple_content'):
      if(!empty($crs_children)):
        foreach($crs_children as $cc):
          $cn = Node::load($cc['target_id']);
          if(!empty($cn)):
            $nids[] = array(
              'id' => $cn->id()
            );
            $ctype = $cn->getType();
            if($ctype != 'simple_content'):
              $cfield = $this->getNodeRelFieldName($ctype);
              $nids[] = $this->getElemDeleteChildren($cc['target_id'],$cfield);
            endif;
            $cn->delete();
          endif;
        endforeach;
      endif;
    endif;
    return $nids;
  }

  /***
   * Get clone node and its children
   * 
   * Retruns a array of children for nodes (course)
   */

  public function cloneElemChildren($nid) {
    $n = Node::load($nid);
    $last_pnode_id = $n->id();
    //get children
    $type = $n->getType();
    $field = $this->getNodeRelFieldName($type);
    $crs_children = $n->$field->getValue();
    //clone all children
    if(!empty($crs_children)):
      foreach($crs_children as $cc):
        $cn = Node::load($cc['target_id']);
        if(!empty($cn)):
          $ctype = $cn->getType();
          /*** Clone a Child Node */
          $c_clone_node = $cn->createDuplicate();
          if($ctype == 'screen'):
            $c_clone_node->set('field_scr_connection','repeat');
          elseif($ctype == 'page'):
            $c_clone_node->set('field_page_connection','repeat');
          endif;
          $c_clone_node->save();
          $last_cnode_id = $c_clone_node->id();

          $ch_ids[] = array(
            'target_id' => $last_cnode_id
          );
          if($ctype != 'simple_content'):
            $cfield = $this->getNodeRelFieldName($ctype);
            $this->cloneElemChildren($last_cnode_id,$cfield);
          endif;
        endif;
      endforeach;
      if(!empty($ch_ids)):
        // update relationship to parent
        $upd = Node::load($last_pnode_id);
        $upd->set($field, $ch_ids);
        $upd->save();
      endif;
    endif;

    return $nids;
  }

  /**
    * 
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
      $nodes = Node::loadMultiple($param);
      $result = array();
      foreach ($nodes as $n) {
        $type = $n->getType();
        $chld = '';
        $chld_elem = [];

        $field_name = $this->getNodeRelFieldName($type);
        if($field_name != ''):
          $chld = $n->get($field_name)->getValue();
        endif;

        if($type == 'chapter'):
          $in_chld = $n->get('field_chap_chapter')->getValue();
          if(!empty($in_chld)):
            $in_chld_str = $this->getTargetIds($in_chld);
            $chld_elem = $this->getCourseChildrenByChildren($in_chld_str);
          endif;
        endif;
  
        if(!empty($chld)):
          $chld_str = $this->getTargetIds($chld);
          $chld_elem = $this->getCourseChildrenByChildren($chld_str);
        endif;

        if($type == 'screen'):
          $result[] = array(
            'id' => $n->id(),
            'type' => $n->getType(),
            'name' => $n->title->value,
            'connections' => $n->get('field_scr_connection')->getValue(),
            'children' => $chld_elem
          );
        elseif($type == 'page'):
          $result[] = array(
            'id' => $n->id(),
            'type' => $n->getType(),
            'name' => $n->title->value,
            'connections' => $n->get('field_page_connection')->getValue(),
            'children' => $chld_elem
          );
        elseif($type == 'chapter'):
          $result[] = array(
            'id' => $n->id(),
            'type' => $n->getType(),
            'name' => $n->title->value,
            'isevaluation' => $n->get('field_chap_isevaluation')->value,
            'hasfeedback' => $n->get('field_chap_hasfeedback')->value,
            'theme_ref' => $n->get('field_theme_ref')->value,
            'eval_param' => $n->get('field_chap_eval_param')->value,
            'children' => $chld_elem
          );
          elseif($type == 'custom'):
            $result[] = array(
              'id' => $n->id(),
              'type' => $n->getType(),
              'name' => $n->title->value,
              'isevaluation' => $n->get('field_custom_isevaluation')->value,
              'children' => $chld_elem
            );
        else:
          $result[] = array(
            'id' => $n->id(),
            'type' => $n->getType(),
            'name' => $n->title->value,
            'children' => $chld_elem
          );
        endif;
      }
      return $result;
    }

    /**
    * 
    * Get Domain Tree of platform components
    */
    public function getDomainTreeChildrenByChildren($parent_id,$param,$root,$cf) {

      $tempstore = \Drupal::service('tempstore.private')->get('sess_domain');
      

      $domain = $parent_id;
      $nodes = Node::loadMultiple($param);
      $result  = [];
      $dcr = 0;
      $link = '';

      foreach ($nodes as $n) {
        $type = $n->getType();
        $nid = $n->id();
        $chld = '';
        $chld_elem = [];
        $status = false;
        $curnode = false;
        if($type == 'content_folder'):

          $s_dmn = $tempstore->get('s_domain');
          $chld = $n->get('field_cf_content_folder')->getValue();
          $link = '/bilim/v1.0/bilim_cms/platform/domainview/'.$domain.'/'.$s_dmn.'/'.$nid;

          if($cf == $nid): 
            $status = true;
            $curnode = true;
          elseif($s_dmn == $root):
            $status = true;
          endif;

        else:

          $tempstore->set('s_domain', $nid);
          $link = '/bilim/v1.0/bilim_cms/platform/domainview/'.$domain.'/'.$nid.'/0';
          $field_name = $this->getNodeRelFieldName($type);
          if($field_name != ''):
            $chld = $n->get($field_name)->getValue();
          endif;

          if($cf == 0):
            if($root == $nid): 
              $curnode = true;
            endif;
          endif;
          if($root == $nid): 
            $status = true;
          endif;

        endif;

        if(!empty($chld)):
          $chld_str = $this->getTargetIds($chld);
          $chld_elem = $this->getDomainTreeChildrenByChildren($domain,$chld_str,$root,$cf);
        endif;
        
        $result[] = array(
                        'id' => $nid,
                        'title' => $n->title->value,
                        'children' => $chld_elem,
                        'link' => $link,
                        'curnode' => $curnode,
                        'status' => $status
                      );

      }

      return $result;
    }

     /***
     * Manipulate Platform Elements
     * 
     * Get Domian Content Roots & Content Types by Domain
     */
    
    
     public function getCFbyDomain($domainId,$root,$cf) {
      $qn = Node::load($domainId);
      $crs_children = $qn->get('field_domain_children')->getValue();
      //get children
      $chlds = $this->getTargetIds($crs_children);
      $result = $this->getDomainTreeChildrenByChildren($domainId,$chlds,$root,$cf);
      
      return $result;

    }


     /***
     * Manipulate Platform Elements
     * 
     * Get domain root folders
     */
    
    public function getContentbyDomain($domainId,$root,$cf) {
      $flag_id = 'bookmark';
      $flag = \Drupal::service('flag')->getFlagById('bookmark');
      $flag_link_service = \Drupal::service('flag.link_builder');

      $result = [];
      if($root > 0):
        if($cf > 0):
          $qn = Node::load($cf);

          //sub content folders
          $cf_chld = $qn->get('field_cf_content_folder')->getValue();
          $cf_chlds = $this->getTargetIds($cf_chld);

          //courses
          $crs_chld = $qn->get('field_cf_children')->getValue();
          $crs_chlds = $this->getTargetIds($crs_chld);

          $chlds = array_merge($cf_chlds,$crs_chlds);
        else:
          $qn = Node::load($root);
          $chld = $qn->get('field_dcr_children')->getValue();
          $chlds = $this->getTargetIds($chld);
        endif;
      else:
        $qn = Node::load($domainId);
        $chld = $qn->get('field_domain_children')->getValue();
        $chlds = $this->getTargetIds($chld);
      endif;

      $nodes = Node::loadMultiple($chlds);
      foreach ($nodes as $n):
        $type = $n->getType();
        if($type == 'course'):
          $flag_link = $flag_link_service->build($n->getEntityTypeId(), $n->id(), $flag_id);
          $result[] = array(
            'id' => $n->id(),
            'type' => $type,
            'title' => $n->title->value,
            'desc' => $n->get('field_crs_short_description')->value, 
            'date' => date('d-m-Y', $n->getCreatedTime()),
            'time' => date('H:i', $n->getCreatedTime()),
            'changed' => $n->getChangedTime(),
            'flag_link' => $flag_link
          );
        else:
          $result[] = array(
            'id' => $n->id(),
            'type' => $type,
            'title' => $n->title->value,
            'desc' => '',
            'date' => date('d-m-Y', $n->getCreatedTime()),
            'time' => date('H:i', $n->getCreatedTime()),
            'changed' => $n->getChangedTime(),
            'flag_link' => ''
          );
        endif;
      endforeach;

      return $result;
    }

    /***
     * Manipulate Platform Elements
     * 
     * Get domain view details
     */
    
    public function getDomainViewInfo($domainId,$root,$cf) {
        $qn = Node::load($domainId);
        $result['domain'] = $qn->title->value;
        if($root > 0):
          if($cf > 0):
            $array = array($domainId,$root,$cf);
            $nodes = Node::loadMultiple($array);
          else: 
            $array = array($domainId,$root);
            $nodes = Node::loadMultiple($array);
          endif;

          foreach ($nodes as $n):
            $type = $n->getType();
            $result['breadcrumb'][] = array(
              'id' => $n->id(),
              'type' => $type,
              'title' => $n->title->value
            );
          endforeach;
        else:
          $result['breadcrumb'][] = array(
            'id' => $qn->id(),
            'type' => $qn->getType(),
            'title' => $qn->title->value
          );
        endif;

        $arr_brd = end($result['breadcrumb']);
        $result['page_title'] = $arr_brd['title'];
        return $result;
    }

    /***
     * Manipulate Platform Elements
     * 
     * Get Domians
     */
    
    public function getDomains() {
      $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
      $uid = $user->get('uid')->value;

      $nids = \Drupal::entityQuery('node')->condition('type','domain')->condition('uid',$uid)->execute();
      $nodes = Node::loadMultiple($nids); 
      foreach($nodes as $n):
        $result[] = array(
          'id' => $n->id(),
          'name' => $n->getTitle()
        );
      endforeach;
      return $result;
    }

    /***
     * Manipulate Platform Elements
     * 
     * Get domain name 
     */
    
    public function getDomainName($nid) {
      $domain_name = 'NA';
      $cfs = \Drupal::entityQuery('node')
              ->condition('type','content_folder')
              ->condition('field_cf_children',$nid)
              ->range(0,1)
              ->execute();
      $cf_id = current($cfs);
      if(!empty($cf_id)):
        $dcr = \Drupal::entityQuery('node')
                ->condition('type','domain_content_root')
                ->condition('field_dcr_children',$cf_id)
                ->range(0,1)
                ->execute();
        $dcr_id = current($dcr);
      endif;
      if(!empty($dcr_id)):
        $domain = \Drupal::entityQuery('node')
                ->condition('type','domain')
                ->condition('field_domain_children',$dcr_id)
                ->execute();
        $dm_id = current($domain);
      endif;
      if(!empty($dm_id)):
        $n = Node::load($dm_id);
        $domain_name = $n->getTitle();
      endif;
      return $domain_name;
    }

    /***
     * Manipulate Platform Elements
     * 
     * Get Latest Courses
     */
    
    public function getLatestCourses() {
      $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
      $uid = $user->get('uid')->value;

      $nids = \Drupal::entityQuery('node')
                ->condition('type','course')
                ->condition('uid',$uid)
                ->sort('created', 'DESC')
                ->range(0,4)
                ->execute();

      $flag_id = 'bookmark';
      $flag = \Drupal::service('flag')->getFlagById('bookmark');
      $flag_link_service = \Drupal::service('flag.link_builder');
      $result = [];

      if(!empty($nids)):
        $courses = Node::loadMultiple($nids); 
        foreach($courses as $crs):
          $domain_name = $this->getDomainName($crs->id());
          $flag_link = $flag_link_service->build($crs->getEntityTypeId(), $crs->id(), $flag_id);
          $result[] = array(
            'id' => $crs->id(),
            'domain' => $domain_name,
            'name' => $crs->getTitle(),
            'date' => date('d-m-Y', $crs->getCreatedTime()),
            'time' => date('H:i', $crs->getCreatedTime()),
            'flag_link' => $flag_link
          );
        endforeach;
      endif;
      
      return $result;
    }

    /***
     * Manipulate Platform Elements
     * 
     * Get Favourite Courses
     */
    
    public function getFavCourses() {
      $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
      $uid = $user->get('uid')->value;

      $flag = \Drupal::service('flag')->getFlagById('flag_id');
      $fuser = \Drupal::currentUser();
      $session_id = \Drupal::service('session_manager')->getId();

      // Use a query.
      $query = \Drupal::database()
              ->select('flagging', 'f')
              ->fields('f', array())
              ->condition('uid', $fuser->id())
              ->range(0, 4);

      if ($fuser->isAnonymous()) {
          $query->condition('session_id', $session_id);
      }
            
      $fresult = $query->execute()
              ->fetchAll();

      $flag_result = array();
      if(!empty($fresult)):
        foreach($fresult as $fr):
          $flag_result[] = $fr->entity_id;
        endforeach;
      endif;

      $flag_id = 'bookmark';
      $flag = \Drupal::service('flag')->getFlagById('bookmark');
      $flag_link_service = \Drupal::service('flag.link_builder');
      $result = [];
      if(!empty($flag_result)):
        $nodes = Node::loadMultiple($flag_result); 
        foreach($nodes as $n):
          $domain_name = $this->getDomainName($n->id());
          $nid = $n->id();
          $flag_link = $flag_link_service->build($n->getEntityTypeId(), $n->id(), $flag_id);
          $result[] = array(
            'id' => $n->id(),
            'domain' => $domain_name,
            'name' => $n->getTitle(),
            'desc' => $n->get('field_crs_short_description')->value, 
            'date' => date('d-m-Y', $n->getCreatedTime()),
            'time' => date('H:i', $n->getCreatedTime()),
            'flag_link' => $flag_link
          );
        endforeach;
      endif;
      return $result;
    }

}
