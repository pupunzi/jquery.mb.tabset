/*
 * ******************************************************************************
 *  jquery.mb.components
 *  file: mbTabset.js
 *
 *  Copyright (c) 2001-2013. Matteo Bicocchi (Pupunzi);
 *  Open lab srl, Firenze - Italy
 *  email: matteo@open-lab.com
 *  site: 	http://pupunzi.com
 *  blog:	http://pupunzi.open-lab.com
 * 	http://open-lab.com
 *
 *  Licences: MIT, GPL
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 *  last modified: 25/04/13 13.20
 *  *****************************************************************************
 */

/*
 * Name:jquery.mb.tabset
 * Version: 1.9.2
*/

(function($) {

  $.mbTabset={
    mbTabsetArray:[],
    options:{
      container:"",
      item:"a",
      axis:"x",
      sortable:true,
      position:"left",
      start:function(){},
      stop:function(){}
    },
    build: function(opt){
      this.each(function(){
        $(this).addClass("mbTabset");
        var mbTabsetOptions = {};
        $.extend (mbTabsetOptions, $.mbTabset.options);
        var el={el: $(this)};
        $.extend (mbTabsetOptions, el);
        $.extend (mbTabsetOptions, opt);
        $(this).addClass(mbTabsetOptions.position);
        var tabsetContainerID=$(this).attr("id")+"_container";

        $(this).after("<div class='mbTabsetContainer' id='"+tabsetContainerID+"'></div>");
        var tabsetContainer=$("#"+tabsetContainerID);
        var tabs= $(this).find(mbTabsetOptions.item);
        this.opt=mbTabsetOptions;
        this.opt.tabsetContainer=tabsetContainer;
        this.opt.tabs=tabs;
        var hasSel= $(tabs).is(".sel");
        if (!hasSel) $(this).find(mbTabsetOptions.item+":first").addClass("sel");
        if ($.metadata) $.metadata.setType("class");
        $(tabs).each(function(){
          $(this).setAsMbTab(mbTabsetOptions);

        });
        if (mbTabsetOptions.sortable){
          $(this).setSortableMbTabset(mbTabsetOptions);
        }
      });
    },
    setAsTab:function(opt){

      if ($.metadata){
        $.metadata.setType("class");
        if ($(this).metadata().content) $(this).attr("content",$(this).metadata().content);
        if ($(this).metadata().ajaxContent) $(this).attr("ajaxContent",$(this).metadata().ajaxContent);
        if ($(this).metadata().ajaxData) $(this).attr("ajaxData",$(this).metadata().ajaxData);
        if ($(this).metadata().onSel) $(this).attr("onSel",$(this).metadata().onSel);
      }
      if ($(this).hasClass("sel"))
	      $(this).mb_drawAjaxContent(opt.tabsetContainer);
      $(this).addClass("tab");
      $(this).addClass("mbTab");
      $(this).wrapInner("<span></span>");
      var myContainer=$("#"+$(this).attr("content"));
      myContainer.addClass("tabContent");
      opt.tabsetContainer.append(myContainer);
      myContainer.hide();
      if ($(this).hasClass("sel")) myContainer.fadeIn();

      $(this).bind("click",function(){
        if ($(this).is(".disabled , .sel")) return;
        $(this).mb_drawAjaxContent(opt.tabsetContainer);
        var choosenTab=$(this);
        var actualCont="";
        $(opt.tabs).each(function(){
          if ($(this).is(".sel")){
            actualCont=$(this).attr("content");
            $(this).removeClass("sel");
          }
        });
        $("#"+actualCont).fadeOut("fast",function(){
          choosenTab.addClass("sel");
          var clbk= choosenTab.attr("onSel");
          $("#"+choosenTab.attr("content")).addClass("tabContent");
          $("#"+choosenTab.attr("content")).slideDown("fast", function(){eval(clbk)});
        });
      });
    },
    addTab:function(taboptions){
      var opt = $(this)[0].opt;
      var tabOpt={
        id:"tab_"+$(this).find(opt.item).length+1,
        title:"newTab",
        ajaxContent:"newAjaxContent",
        ajaxData:""
      };
      $.extend (tabOpt, taboptions);

      $(this).append("<a id='"+tabOpt.id+"'>"+tabOpt.title+"</a>");
      var tab=$(this).find("#"+tabOpt.id);
      tab.attr("ajaxContent", tabOpt.ajaxContent);
      tab.attr("content", "cont_"+tabOpt.id);
      tab.attr("ajaxData", tabOpt.ajaxData);
      opt.tabs= $(this).find(opt.item);
      tab.setAsMbTab(opt);
      if (opt.sortable)
        $(this).setSortableMbTabset(opt);
    },
	
    mb_drawAjaxContent:function(tabsetContainer){
      if ($(this).attr("ajaxContent")){
        if ($("#"+$(this).attr("content")).html()==null) {
          tabsetContainer.append("<div id='"+$(this).attr("content")+"'> </div>");
        }
        var where=$("#"+$(this).attr("content"));
        if (tabsetContainer) where.hide();
        $.ajax({
          type: "POST",
          url: $(this).attr("ajaxContent"),
          async: true,
          data: (!$(this).attr("ajaxData"))?"":$(this).attr("ajaxData"),
					dataType:"html",
          success: function(html){
            where.html(html);
          }
        });
	      $(this).removeAttr("ajaxContent");
      }
    },
    mb_changeContent:function(contentUrl, contentData){
      $(this).attr({ajaxContent:contentUrl, ajaxData:contentData});
      return this;
    },
    toArray:function(el){
      return $(el).sortable("toArray");
    },
    select: function(){
    },
    setSortable:function(opt){
      if (!opt) opt = $(this)[0].opt;
      var tabs= $(this).find(opt.item).not(".block");
      $(tabs).each(function(){
        if($(this).find("i").size()==0){
          $(this).find("span").prepend("<i>&nbsp;</i>").addClass("sortable");
          $(this).find("i").bind("click",function(e){e.preventDefault();return false;});
        }
      });
      $(this).sortable({
        item:opt.item,
        handle:"i",
        cursor:"move",
        revert:false,
        axis:opt.axis,
        opacity:.7,
        forcePlaceholderSize:true,
        start: function(){
          $(this).find(".tab").addClass("floatEl");
          if (opt.start) opt.start();
        },
        stop: function(){
          $(this).find(".tab").removeClass("floatEl");
          $.mbTabset.mbTabsetArray= $.mbTabset.toArray($(this));
          if (opt.stop) opt.stop();
        }
      });
    },
    clearSortable:function(opt){
      if (!opt) opt = $(this)[0].opt;
      var tabs= $(this).find(opt.item);
      $(tabs).each(function(){
        $(this).find("span").removeClass("sortable");
        $(this).find("i").remove();
      });
      $(this).sortable("destroy");
    },
    selectMbTab:function(){
      $(this).click();
    }
  };
  $.fn.setAsMbTab = $.mbTabset.setAsTab;
  $.fn.addMbTab = $.mbTabset.addTab;
  $.fn.setSortableMbTabset = $.mbTabset.setSortable;
  $.fn.mb_drawAjaxContent = $.mbTabset.mb_drawAjaxContent;
  $.fn.mb_changeContent = $.mbTabset.mb_changeContent;
  $.fn.clearSortableMbTabset = $.mbTabset.clearSortable;
  $.fn.buildMbTabset = $.mbTabset.build;
  $.fn.serializeMbTabset = $.mbTabset.serialize;
  $.fn.selectMbTab = $.mbTabset.selectMbTab;
})(jQuery);
