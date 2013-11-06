(function($, f) {
	if(!$) return f;
	
	var div_slider = function() {
		this.el = f;
		this.items = f;
		this.old_screen_index = 0;
		this.current_screen_index = 0;
		this.interval = f;
		this.opts = {
			speed: 500,
			delay: 3000, // f for no autoplay
			complete: f, // when a slide's finished
			keys: !f, // keyboard shortcuts - disable if it breaks things
			dots: f, // display ••••o• pagination
			fluid: f // is it a percentage width?,
		};
	
		var _ = this;

		this.init = function(el, opts) {
			this.el = el;
			this.opts = $.extend(this.opts, opts);
	
			this.max = [el.outerWidth(), el.outerHeight()];			
			this.items = this.el.children();
			
			this.content_div = $("<div class='slider_content_div'></div>");
			this.el.append(this.content_div );
			 
			// load screens
			for(var i=0; i < this.items.length; i++){	
				this.LoadScreen(i, this.items[i]);
			}
					
			
			this.SetButtons();
			
			return this;
		};
		
		
		this.LoadScreen = function(int, item){
			// add content container
			var content_container = $("<div id='div_slider_item_container_" + int + "' class='div_slider_item_container_'></div>");
			content_container.data("index", int);
			
			this.content_div.append(content_container);

			var temp_url = $(item).attr("href");			
			$(item).remove();
			
			content_container.load(temp_url, function(){	
				imagesLoaded($(this), function( instance ) {
					_.Resize();
				});
			});
		}
		
		
		this.SetButtons = function(){
			this.buttons_div = $("<div class='slider_buttons_div'></div>");
			this.buttons_div.css("z-index", 99999);
			
			this.el.append(this.buttons_div);
			
			this.left_button = $("<div style='display:inline-block; cursor: pointer; width: 17px; height: 29px; margin-right: 15px; background:url(jquery/slider/btn_left.png)' />");
			this.left_button.click(function(){
				_.LeftButtonClicked($(this));				
			});			
			this.buttons_div.append(this.left_button);
			
			this.screen_btns = [];
			for(var i=0; i < this.items.length; i++){	
				var temp_btn;
				if(i == 0){
					temp_btn = $("<div style='display:inline-block; cursor: pointer; width: 17px; height: 29px; margin-right: 5px; background:url(jquery/slider/btn_on.png)' />");
				}else{
					temp_btn = $("<div style='display:inline-block; cursor: pointer; width: 17px; height: 29px; margin-right: 5px; background:url(jquery/slider/btn_off.png)' />");
				}
				temp_btn.data("index", i);
				
				temp_btn.click(function(){
					_.ButtonClicked($(this));				
				});
				
				this.buttons_div.append(temp_btn);
				this.screen_btns.push(temp_btn);
			}
			
			this.right_button = $("<div style='display:inline-block; cursor: pointer; width: 17px; height: 29px; margin-left: 16px; background:url(jquery/slider/btn_right.png)' />");
			this.right_button.click(function(){
				_.RightButtonClicked($(this));				
			});				
			this.buttons_div.append(this.right_button);
		}
		
		
		this.ButtonClicked = function(btn){
			this.old_screen_index = this.current_screen_index;
			this.current_screen_index = btn.data("index");
			
			this.UpdateButtons();
		}
		
		
		this.LeftButtonClicked = function(){
			this.old_screen_index = this.current_screen_index;
			this.current_screen_index = (this.current_screen_index == 0) ? this.screen_btns.length - 1 : this.current_screen_index - 1;
		
			this.UpdateButtons();
		}
		
		
		this.RightButtonClicked = function(){
			this.old_screen_index = this.current_screen_index;
			this.current_screen_index = (this.current_screen_index == this.screen_btns.length - 1) ? 0 : this.current_screen_index + 1;
			
			this.UpdateButtons();
		}
		
		
		this.UpdateButtons = function(){
			for(var i=0; i < this.screen_btns.length; i++){	
				if(i == this.current_screen_index){
					this.screen_btns[i].css("background-image", "url(jquery/slider/btn_on.png)");
				}else{
					this.screen_btns[i].css("background-image", "url(jquery/slider/btn_off.png)");
				}
			}
			
			this.NextScreen();
		}
		
		
		this.NextScreen = function(){	
			var scroll_amount = (this.old_screen_index - this.current_screen_index) * this.content_div.width();
		
			_.el.find(".slider_buttons_div *").prop('disabled', true);
		
			for(var i=0; i < this.items.length; i++){
				_.el.find("#div_slider_item_container_" + i).find(".slider_screen").animate({
					opacity: 1,
					left: px_int(_.el.find("#div_slider_item_container_" + i).find(".slider_screen").css("left")) + (scroll_amount)
				}, 1100, "swing", function(){ 	
					_.el.find(".slider_buttons_div *").prop('disabled', false);
				});	
				
			}
			   
		}
			
		
			
		this.Resize = function(){
			//debug(_.el.parent().width() + " " + _.el.parent().height());
			_.el.width(_.el.parent().width());
			_.el.height(_.el.parent().height() - 20);
		
			this.content_div.width(_.el.width() - 100);
			this.content_div.height(_.el.height() - 100);

			this.ResizePages();
			this.RepositionElements();
		
		}
		
		
		
		this.ResizePages = function(){
			for(var i=0; i < this.items.length; i++){
				_.el.find("#div_slider_item_container_" + i).find(".slider_screen").css("left", px(this.content_div.width() * (i-this.current_screen_index))  );
					
				_.el.find("#div_slider_item_container_" + i).find(".slider_screen").width(this.content_div.width());
				_.el.find("#div_slider_item_container_" + i).find(".slider_screen").height(this.content_div.height());			
				
				_.el.find("#div_slider_item_container_" + i).find(".background_img").each(function(){
					var bg_image = $(this);
					bg_image.width(this.content_div.width());
					
					var y_ratio = bg_image.height() / $("#div_slider_item_container_" + i).find(".screen").height();
					
					if(y_ratio < 1){
						bg_image.width(bg_image.width() / y_ratio);
					}
			
					bg_image.center_horizontally();
				});
			}
		}


		this.RepositionElements = function(){
			_.el.center_within_parent();
		
			this.content_div.center_within_parent();
			//	ScaleDIVToMinSize(this.content_div, $(window).width() - 20, $(window).height() - 200);	

			_.el.find(".slider_screen").each(function(){
				$(this).center_within_parent();
				//ScaleDIVToMinSize($(this), $(window).width() - 20, $(window).height() - 200);	
			});

			_.el.find(".slider_div_content_table").each(function(){
				$(this).center_within_parent();
				//$(this).css("top", px(px_int($(this).css("top")) - 30));
				ScaleDIVToMinSize($(this), $(this).parent().width() - 20, $(this).parent().height() - 40);	
				// debug($(this).outerHeight() + " " + $(this).parent().height());
			});
				
			_.el.find(".div_content_table_bottom").each(function(){
				$(this).center_bottom_parent();
				ScaleDIVToMinSize($(this), $(this).parent().width() - 20, $(this).parent().height() - 20);	
			});
		
			_.el.find(".background_bottom_div").each(function(){
				ScaleDIVToMinSize($(this), $(window).width() - 20, 3000);
				$(this).center_bottom_parent();
			});
				
			_.el.find(".background_right_div").each(function(){
				ScaleDIVToMinSize($(this), $(window).width() - 480, $(window).height() - 200);
				$(this).center_right_parent();
			});	
		
			this.buttons_div.center_bottom_parent();
			
			var buttons_y = Math.min(px_int(this.buttons_div.css("top")) - 20, px_int($(".slider_div_content_table").css("top")) + $(".slider_div_content_table").height() + 100);
			this.buttons_div.css("top",  px(buttons_y));
		}
	
	
	
	}
	
	$.fn.div_slider = function(o) {
		var len = this.length;
		
		//  Enable multiple-div_slider support
		return this.each(function(index) {
			//  Cache a copy of $(this), so it 
			var me = $(this);
			var instance = (new div_slider).init(me, o);
			
			//  Invoke an DivSlider instance
			me.data('div_slider' + (len > 1 ? '-' + (index + 1) : ''), instance);
		});
	};
	
	
})(window.jQuery, false);