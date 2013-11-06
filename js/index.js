$(document).ready(function() {

	var content;
	var screen_count = 4;
	var start_screen_index = 0;
	var current_screen_index = 0;
	
	function init(){
		$("#content").scroll(function() {
			Resize();
		});

		SetFancyBox();
		Resize();

		// load screens
		for(var i=start_screen_index; i < screen_count; i++){	
			LoadScreen(i);
		}
		
		// cycle to start screen for debug
		if(start_screen_index > 0){
			current_screen_index = start_screen_index - 1;
		}
			
		// display start screen	
		// NextScreen();
	}
	
	function SetFancyBox(){
		// 
		$('.fb_ajax_horizontal').each(function(){
			$(this).fancybox({
				arrows: false,
				type: "ajax",
				minWidth: $(window).width() - 0,
				minHeight: $(window).height() - 0,
				autoDimensions: false,
				autoScale: false,
				scrolling: 'no',
				openEffect : 'fade',
				closeEffect : 'fade',
				openSpeed: 250,
				closeSpeed: 250,
				ajax: {
					complete: function(jqXHR, textStatus){
						$(".fancybox-skin").css("background", "#e3ded3");
						$(".fancybox-inner").css("opacity", 0);
						
						// visibility: hidden; 
						imagesLoaded($(".fancybox-skin"), function(instance){
							Resize();
							
							$(".fancybox-inner").animate({
								opacity: 1,
							}, 200, "swing");
							
			
						});
					}
				}
			});
		});
		
		// 
		$('.fb_ajax_vertical').each(function(){
			$(this).fancybox({
				arrows: false, 
				type: "ajax", 
				minWidth: $(window).width() - 0, 
				minHeight: $(window).height() - 0,
				autoDimensions: false,
				autoScale: false,
				scrolling: 'no', 
				 ajax: {
					complete: function(jqXHR, textStatus){
						$(".fancybox-skin").css("background", "#e3ded3");
						imagesLoaded($(".fancybox-skin"), function(instance){
							Resize();
						});
					}
				}
			});
		});

		$('.fb_iframe').each(function(){
			$(this).fancybox({
				arrows: false, 
				type: "iframe", 
				minWidth: $(window).width() - 0, 
				minHeight: $(window).height() - 0,
				autoDimensions: false,
				autoScale: false,
				scrolling: 'no'
			});
		});		
		
		
		$('.fb_vimeo').each(function(){
			$(this).fancybox({
				arrows: false, 
				type: "iframe", 
				minWidth: $(window).width() - 0, 
				minHeight: $(window).height() - 0,
				autoDimensions: false,
				autoScale: false,
				scrolling: 'no', 
				helpers: {
					  media : {}
				  }

			});
		});		
	
		$.fancybox.hideLoading();
	}
	

	
	function SetButtons(){
		// add hover spans
		$(".hover_button").each(function(){
			if($(this).html() == ""){
				$(".hover_button").append("<span class='hover_off'></span><span class='hover_on'></span>");
			
				// set hover fades
				$(".hover_button").hover(function(){ 
					$(this).find(".hover_on").stop().fadeTo(200, 1);
					$(this).find(".hover_off").stop().fadeTo(100, 0); 					 
				}, function () {  
			
					$(this).find(".hover_off").stop().fadeTo(100, 1); 
					$(this).find(".hover_on").stop().fadeTo(200, 0); 
				}); 
			}
		});
	}
	
	function LoadScreen(int){
		// add content container
	    var content_container = $("<div id='content_container_" + int + "' class='content_container'></div>");
	    content_container.data("index", int);
	    
	    $("#content").append(content_container);

		content_container.load('content/screen_' + int + '.html', function(){			
			$(this).find(".screen").width($(window).width());
			$(this).find(".screen").height($(window).height());


			$(this).find('.slider').div_slider();

			imagesLoaded($(this), function( instance ) {
				Resize();
			});
		});
		
	}
	
	function NextScreen(){
		current_screen_index++;
		
		for(var i=0; i < screen_count; i++){
			$("#content_container_" + i).find(".screen").animate({
		    	opacity: 1,
	            top: px_int($("#content_container_" + i).find(".screen").css("top")) + (-$(window).height())
	        }, 1100, "swing", function(){ 	
    			
	        });	
	        
    	}
	}


	function ResizePages(){
		for(var i=0; i < screen_count; i++){
			if(i == 0){
				$("#content_container_" + i).find(".screen").css("top", "0px");
			
				$("#content_container_" + i).find(".screen").width($(window).width());
				$("#content_container_" + i).find(".screen").height($(window).height());
			}else{
				$("#content_container_" + i).find(".screen").css("top", px($(window).height() + ($("#content").height() * (i -1)))  );
				
				$("#content_container_" + i).find(".screen").width($("#content").width());
				$("#content_container_" + i).find(".screen").height($("#content").height());			
			}
			
			$("#content_container_" + i).find(".background_img").each(function(){
				var bg_image = $(this);
				bg_image.width($(window).width());
				
				var y_ratio = bg_image.height() / $("#content_container_" + i).find(".screen").height();
				
				if(y_ratio < 1){
					bg_image.width(bg_image.width() / y_ratio);
				}
		
				bg_image.center_horizontally();
			});
			
		}
	}
	
	
	function ResetScroll(){
		$("#content").off("scroll");
		scroll_int = setTimeout(function(){ 
			$("#content").scroll(function() {
				Resize();
			});
			clearTimeout(scroll_int);
		}, 1000);  
	}
	
	var scroll_int;
	function RepositionElements(){
		if($("#content").scrollTop() < 70){//$(window).height() / 4){
			$("#content").fill_window();
		
			if($("#footer").css("display") == "block"){
				// ResetScroll();
				$("#footer").css("display", "none");
			}
				
		}else{
			$("#footer").width($(window).width());
				
			$("#footer").position_bottom();
			$("#content").fill_window_above_footer();
	
			if($("#footer").css("display") == "none"){
				//ResetScroll();
								
				$("#footer").css("display", "block");
			}
		}

		ResizePages();
		
		$(".div_content").each(function(){
			$(this).center_within_parent();
			ScaleDIVToMinSize($(this), $(window).width() - 200, $(window).height() - 200);	
		});

		$(".div_content_table").each(function(){
			$(this).center_within_parent();
			$(this).css("top", px(px_int($(this).css("top")) - 30));
			ScaleDIVToMinSize($(this), $(this).parent().width() - 60, $(this).parent().height() - 100);	
		});
		
		
		$(".div_content_table_bottom").each(function(){
			$(this).center_bottom_parent();
			ScaleDIVToMinSize($(this), $(this).parent().width() - 60, $(this).parent().height() - 100);	
		});
	
		
		$(".div_content_table_fancybox").each(function(){
			$(this).center_within_parent_fancybox();
			ScaleDIVToMinSize($(this), $(this).parent().parent().width() - 20,  $(this).parent().parent().height() - 20);	
		});		
		
		$(".div_kickstarter").each(function(){
			ScaleDIVToMinSize($(this), $(window).width() - 280, 3000);	
		});
		
		$(".div_kickstarter").each(function(){
			ScaleDIVToMinSize($(this), $(window).width() - 280, 3000);
		});
		
		$(".div_top_menu").each(function(){
			ScaleDIVToMinSize($(this), $(window).width() - 200, 3000);
		});
		
		$(".div_top_menu").position_right(30);

		$(".background_bottom_div").each(function(){
			ScaleDIVToMinSize($(this), $(window).width() - 20, 3000);
			$(this).center_bottom_parent();
		});
			
		$(".background_right_div").each(function(){
			ScaleDIVToMinSize($(this), $(window).width() - 739, $(window).height() - 200);
			$(this).center_right_parent();
		});	
		
		$('.slider').each(function(){
			$(this).data("div_slider").Resize();
		});
		
		
	}

	function Resize(){
		SetFancyBox();
		RepositionElements();
		SetButtons();
	}
	
	
	$(window).resize(function() {
		Resize();
	})


	init();
});