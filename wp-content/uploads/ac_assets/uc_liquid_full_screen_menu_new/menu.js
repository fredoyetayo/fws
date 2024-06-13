
function UCAccordionMenu(menuID){
  
  var g_menu, g_closeMenuBtn, g_menuWrapper, g_isCloseOnOpen = false;
  
  
  /**
  * collapse inner section
  */
  function collapseInnerSection(element){
    
    var sectionHeight = element.scrollHeight;
    
    var elementTransition = element.style.transition;
    element.style.transition = '';
    
    
    requestAnimationFrame(function() {
      element.style.height = sectionHeight + 'px';
      element.style.transition = elementTransition;
      
      
      requestAnimationFrame(function() {	
        element.style.height = 0 + 'px';
        
      });
    });
    
    element.setAttribute('data-collapsed', 'true');
  }
  
  /**
  * expand the inner of the section
  */
  function expandSectionInner(element){
    var sectionHeight = element.scrollHeight;
    
    element.style.height = sectionHeight + 'px';
    
    element.addEventListener('transitionend', function(e) {
      element.removeEventListener('transitionend', arguments.callee);
      element.style.height = null;
    });
    
    element.setAttribute('data-collapsed', 'false');
    
  }
  
  /**
  * expand section
  */
  function expandSection(section, objLink){
    
    expandSectionInner(section);
    
    section.setAttribute('data-collapsed', 'false')
    objLink.removeClass("collapsed");
    objLink.addClass("expanded");
    
  }
  
  /**
  * collapse the section
  */
  function collapseSection(section, objLink){
    
    collapseInnerSection(section);
    
    objLink.addClass("collapsed");
    objLink.removeClass("expanded");
  }
  
  /**
  * collapse all expanded sections
  */
  function collapseAllExpanded(){
    
    var objAllExpanded = g_menuWrapper.find(".expanded");
    
    if(objAllExpanded.length == false)
    return(false);
    
    jQuery.each(objAllExpanded, function(index, link){
      var objLink = jQuery(link);
      var section = link.nextElementSibling;
      
      collapseSection(section, objLink);
      
    });
  }
  
  /**
  * close or open link
  */
  function toggleSection(objLink){
    
    var link = objLink[0];
    var section = link.nextElementSibling;
    
    var isCollapsed = section.getAttribute('data-collapsed') === 'true';
    
    if (isCollapsed) {		//expend current
      
      if(g_isCloseOnOpen == true)
      collapseAllExpanded();
      
      expandSection(section, objLink);
      
    } else {		//collapse current
      
      collapseSection(section,objLink);
    }
    
  }
  
  /**
  * open or close some item
  */
  function openCloseItem(link, event){
    
    var section = link.nextElementSibling;
    
    if(!section)
    return(true);
    
    var objSection = jQuery(section);
    if(objSection.hasClass("sub-menu") == false)
    return(true);
    
    if(event)
    event.preventDefault();
    
    var objLink = jQuery(link);
    
    var isCollapsed = section.getAttribute('data-collapsed') === 'true';
    
    if (isCollapsed) {		//expend current
      
      if(g_isCloseOnOpen == true)
      collapseAllExpanded();
      
      expandSection(section, objLink);
      
    } else {		//collapse current
      
      collapseSection(section,objLink);
    }
    
  }
  
  
  /**
  * on menu item click, if sub menu, open or close
  */
  function onMenuItemClick(event){
    
    openCloseItem(this, event);
    
  }
  
  /*
  * close all subs when menu closes
  */
  function onCloseMenuBtnClick(){
    
    collapseAllExpanded();

  }
  
  /**
  * console log shorcut
  */
  function trace(str){
    
    console.log(str);
  }
  
  
  /**
  * init from popups
  */
  function checkInitFromPopups(){
    
    jQuery( document ).on( 'elementor/popup/show', (event) => {			
      runMenu();
    });
    
  }
  
  
  /**
  * expand current item tree
  */
  function expandCurrentItemTree(){
    
    //disable transition
    
    var objCurrentItem = g_menuWrapper.find(".uc-list-menu ul .current-menu-item");
    
    if(objCurrentItem.length == 0)
    return(false);
    
    g_menuWrapper.addClass("uc-no-transition");
    
    setTimeout(function(){
      g_menuWrapper.removeClass("uc-no-transition");
    },300);
    
    var objParents = objCurrentItem.parents("li");
    
    if(objParents.length == 0)
    return(false);
    
    jQuery.each(objParents, function(index, parent){
      
      var objParent = jQuery(parent);
      var objLink = objParent.children("a");
      
      var link = objLink[0];
      
      openCloseItem(link);
      
    });
    
  }
  
  /**
  * run the menu, init
  */
  function runMenu(){
    
    //init globals
    g_menu = jQuery("#"+menuID);
    g_menuWrapper = g_menu.find('.global-menu');
    
    g_isCloseOnOpen = g_menuWrapper.data("closeothers");
    g_isCloseOnOpen = (g_isCloseOnOpen == "yes");
    
    g_closeMenuBtn = g_menu.find('.uc_liquid_hamburger');
    
    var isClickable = g_menuWrapper.data("clickable");
    
    if(g_menuWrapper.length == 0){
      console.log("menu with ID: "+menuID+" not found!");
      
      checkInitFromPopups();
      
      return(false);
    }
    
    //collapse all except the current
    
    g_menuWrapper.find("ul.uc-list-menu li a").each((i, item) => {
      
      if(item.nextElementSibling){
        
        var objItem = jQuery(item);
        objItem.append("<span class='uc-menu-item-pointer'></span>");
        
        collapseInnerSection(item.nextElementSibling);
        
        item.nextElementSibling.style.display = "block";
        
        jQuery(item).addClass("collapsed");
        jQuery(item).removeClass("expanded");
      }
      
    });
    
    //init events
    
    if(isClickable == false){
      
      g_menuWrapper.find("ul.uc-list-menu li a").on("click", onMenuItemClick);
      
    }else{
      
      //pointer click - toggle section
      
      g_menuWrapper.find("ul.uc-list-menu li .uc-menu-item-pointer").on("click", function(event){
        
        event.preventDefault();
        var objLink = jQuery(this).parent();
        toggleSection(objLink);
        
      });
      
    }

    g_closeMenuBtn.on('click', onCloseMenuBtnClick);
    
    
    //open the section with current item
    
    setTimeout(expandCurrentItemTree,100);
    
  }
  
  runMenu();
  
}

