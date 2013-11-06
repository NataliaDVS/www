	
	var a_intervals = [];

    function msgbox(str) {
    	str = str.split("\\n").join("\n");
    	alert(str);
    }
	
	function debug(str) {
		$("#debug_div").remove();
		var debug_div = $("<div id='debug_div'>" + str + "</div>");
		debug_div.css("position", "absolute");
		debug_div.css("z-index", 999999);
		$("body").append(debug_div );
	}
    
    function ForIn(obj){
		var str;
		for (var propName in obj) {
	         var propValue = obj[propName];
	         str += ("    " + propName + ": " + propValue + "    ");
	    }	
		
		return str;
	}
	
	function XMLToString(oXML) {
	  if(window.DOMParser) {
	  	return new XMLSerializer().serializeToString(oXML);
	  } else {
	    return oXML.xml;
	  }
	}
	
	
	
	function GetImageSize(img){
		var hiddenImg = img.clone().css('visibility', 'hidden').removeAttr('height').removeAttr('width').appendTo('body');
		var temp_obj = {};
		temp_obj.height = hiddenImg.height();
		temp_obj.width = hiddenImg.width();
		hiddenImg.remove();  
				
		return temp_obj;
	}
	
	function ScaleDIVToMinSize(div, max_width, max_height){
		var x_ratio = max_width / div.width();
		var y_ratio = max_height / div.height();
		
		var scale_ratio = Math.min(x_ratio, y_ratio);
		if(scale_ratio < 1){
			div.css("transform", "scale(" + scale_ratio + ")");
			div.css("-webkit-transform", "scale(" + scale_ratio + ")");
			div.css("-moz-transform", "scale(" + scale_ratio + ")");
			div.css("-o-transform", "scale(" + scale_ratio + ")");
			div.css("-ms-transform", "scale(" + scale_ratio + ")");
		}else{
			div.css("transform", "scale(1)");
			div.css("-webkit-transform", "scale(1)")
			div.css("-moz-transform", "scale(1)")
			div.css("-o-transform", "scale(1)")
			div.css("-ms-transform", "scale(1)")
		}
	}
	
	
 	var user_xml = null;
	var login_callback = null;
	function LoginModule(call_back){
		login_callback = call_back;
		
		var str = "<socketmessage code='101' app=''>";
		str += "<user_id>" + user_id + "</user_id>";
		str += "</socketmessage>";
	
		SocketSendXML(str, this, LoggedInModule);
	}

	function LoggedInModule(message_xml){
		if(CheckError(message_xml)){
         	return;
        }
		
		$(message_xml).find("Users").each(function(){
			user_xml = $(this).clone(true);
		});
		
		login_callback();
	}

	function GetUserVars(temp_var){
		return $(user_xml).attr(temp_var);
	}
	

	SocketMessage = function(str, referrer, callback, callbackarg1, callbackarg2){
		this.str = str;
		this.xml = null;
		this.referrer = referrer;
		this.callback = callback;
		this.callbackarg1 = callbackarg1;
		this.callbackarg2 = callbackarg2;	
	}

	var socket_queue = [];
	var socket_reply_queue = [];
	var socket_already_sending = false;
	var socket_interval;
	
	
    function SocketSendXML(str, referrer, callback, callbackarg1, callbackarg2) {
  		socket_queue.push(new SocketMessage(str, referrer, callback, callbackarg1, callbackarg2));
  		
  		socket_interval = setInterval(function(){
			clearInterval(socket_interval);	
			
			var socket_message = socket_queue.shift();
		
			try{
				if(typeof(socket_message.str) == "undefined"){
					clearInterval(socket_interval);	
					socket_already_sending = false;
					return;	
				}
			}catch(e){
				clearInterval(socket_interval);	
				socket_already_sending = false;
				return;	
			}
			
			if(socket_message.callback != null){
				var bool_unique = true;
				do{
					socket_message.id = Math.floor(Math.random() * 1000000);
					for(var i=0; i < socket_reply_queue.length; i++){
						if(socket_message.id == socket_reply_queue[i].id){
							bool_unique = false;
						}
					}
				}while(bool_unique == false);
				
				var temp_xml = $.parseXML(socket_message.str);
				$(temp_xml).find(":first").attr("id", socket_message.id);
				
				if(typeof(ss) != "undefined"){
					$(temp_xml).find(":first").attr("ss", ss[0]);
					$(temp_xml).find(":first").attr("ssu", ss[1]);
				}
				
				var temp_text = XMLToString(temp_xml)

				socket_reply_queue.push(socket_message);
			}

            $.ajax({ type: "POST", url: "http://localhost/www.secondworldstudios.com/solar/net/wip_wcf_service.svc/xml/socket_message", contentType: "text/plain", data: temp_text, processData: false, success: SocketSendXML_Loaded, error: SocketSendXML_Failed });

			if(socket_queue.length < 1){
				clearInterval(socket_interval);
				socket_already_sending = false;
			}	
		}, 10); 
	}
    
    function SocketSendXML_Loaded(message_xml) {
		var message_id = $(message_xml).find("socketmessage").attr("id");
	
		for(var i=0; i < socket_reply_queue.length; i++){
			if(message_id == socket_reply_queue[i].id){
				var socket_message = socket_reply_queue[i];
				socket_reply_queue.splice(i, 1)
				
				socket_message.callback.call(socket_message.referrer, message_xml, socket_message.callbackarg1, socket_message.callbackarg2);
			}
		}
    }
    
    function SocketSendXML_Failed(jqXHR, textStatus, errorThrown) {
        alert(textStatus + " " + errorThrown);
    }
    
    function CheckError(message_xml){	
        $(message_xml).find("error").each(function () {
        	alert("An error has occurred..." + "\n\n" + "Error message: " + $(this).attr("message") + "\n\n" + $(this).attr("stacktrace"));
            return true;
        });
    }
    

    function LoadSystemVariables() {
        $.ajax({ type: "GET", url: "xml/module_login.xml", success: LoadedSystemVariables, error: SocketSendXML_Failed });
    };

    function LoadedSystemVariables(xml) {
        xmlSystemVariables = $(xml);
    };

    function GetSys(x_path_str) {
        x_path_str = x_path_str.split("/").join(" ");

        return xmlSystemVariables.find(x_path_str).text();
        // return XPathAPI.selectSingleNode(this.xmlSystemVariables.firstChild, x_path_str).firstChild.nodeValue;	
    };

    function LoadClientLogo() {
        var str = "<socketmessage code='152' />"

        SocketSendXML(str, this, LoadedClientLogo);
    };

    function LoadedClientLogo(message_xml) {
        logo.html("<img src='" + $(message_xml).text() + "'/>");
    };


    jQuery.fn.center = function () {
        this.css("position", "absolute");
        this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
        this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
        return this;
    }

	jQuery.fn.center_within_parent = function () {
		if($(this).parent().height() != 0 && $(this).parent().height() != null && $(this).parent().height() != this.outerHeight()){
			this.css("position", "absolute");

			this.css("top", (($(this).parent().height() - this.outerHeight()) / 2) + "px");
			this.css("left", (($(this).parent().width() - this.outerWidth()) / 2) + "px");
		}
		
		return this;
	}	
	
	jQuery.fn.center_within_parent_fancybox = function () {
		this.parent().css("position", "absolute");

		this.parent().css("top", (($(this).parent().parent().height() - this.outerHeight()) / 2) + "px");
		this.parent().css("left", (($(this).parent().parent().width() - this.outerWidth()) / 2) + "px");
		
		return this;
	}		
	

	jQuery.fn.center_horizontally = function () {
        this.css("position", "absolute");
        this.css("top", "0px");
        this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
        return this;
    }
    
    jQuery.fn.center_horizontally_within_parent = function () {
        this.css("position", "absolute");
        this.css("left", (($(this).parent().width() - $(this).width()) / 2) + "px");
        
        return this;
    }
    
    jQuery.fn.center_vertically = function () {
        this.css("position", "absolute");
        this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
       
        return this;
    }
    
    jQuery.fn.center_vertically_above_footer = function () {
        this.css("position", "absolute");
        this.css("top", ((($(window).height() - $("#footer").outerHeight()) - this.height()) / 2) + $(window).scrollTop() + "px");
       
        return this;
    }
    
	        
    jQuery.fn.center_bottom_parent = function () {
        this.css("position", "absolute");
		this.css("left", px(($(this).parent().width() - $(this).width() ) / 2));
        this.css("top", px($(this).parent().height() - $(this).outerHeight()  ));   // $(this).parent().position().top + 
       
        return this;
    }
	
	jQuery.fn.center_right_parent = function () {
        this.css("position", "absolute");
		this.css("top", px(($(this).parent().height() - $(this).height() ) / 2));
        this.css("left", px($(this).parent().width() - $(this).outerWidth()  ));   // $(this).parent().position().top + 
       
        return this;
    }
	
    jQuery.fn.fill_window = function () {
        this.css("position", "absolute");
        this.css("top", "0px");
		this.css("left", "0px");
		this.css("width", px($(window).width()));
		this.css("height", px($(window).height()));
		
        return this;
    }	
	
    jQuery.fn.fill_window_above_footer = function () {
        this.css("position", "absolute");
        this.css("top", "0px");
		this.css("left", "0px");
		this.css("width", px($(window).width()));
		this.css("height", px($(window).height() - $("#footer").outerHeight() - 0));
		
        return this;
    }	
    
    jQuery.fn.position_bottom = function () {
        this.css("position", "absolute");
        this.css("top", ($(window).height() - this.outerHeight()) + $(window).scrollTop() + "px");
  
  
        return this;
    }
   
       
    jQuery.fn.position_right = function (margin_right) {
		if(!(margin_right)) margin_right = 0;

        this.css("position", "absolute");
        this.css("left", ($(window).width() - (this.outerWidth() + margin_right)) + $(window).scrollLeft() + "px");
  
        return this;
    }

	String.prototype.HTMLEncode = function(){
		var temp_str = this;
		temp_str = temp_str.replace(String.fromCharCode(13), "<br/>");
		
		return temp_str;
	}
	
	String.prototype.HTMLDecode = function(){
		var temp_str = this;
		temp_str = temp_str.replace("<br />", '\n');
		temp_str = temp_str.replace("<br/>", '\n');
		temp_str = temp_str.replace("<br>", "\n");		
		temp_str = temp_str.replace("+", " ");
		
		return temp_str;
	}
	
	
	
	function XMLToDate(xmldate){
		if(xmldate == "null"){
			return "";	
		}else{
			var aDatetime = xmldate.split("T");
			var aDate = aDatetime[0].split("-");
			var aTime = aDatetime[1].split(":");
			
			return new Date(aDate[0], aDate[1]-1, aDate[2], aTime[0], aTime[1].substr(0,2));
		}
	}
	
	
	function XMLToSlashDate(xmldate){
		if(xmldate == null || xmldate == ""){
			return "";	
		}else{
			var aDate = xmldate.split("-");
			return aDate[2].substr(0,2)	+ "/" + aDate[1] + "/" + aDate[0];
		}
	}
	
	function DateCopy(flashdate, justdate){
		if(justdate){
			return new Date(flashdate.getFullYear(), flashdate.getMonth(), flashdate.getDate());		
		}else{
			return new Date(flashdate.getFullYear(), flashdate.getMonth(), flashdate.getDate(), flashdate.getHours(), flashdate.getMinutes(), flashdate.getSeconds());	
		}
	}

	function GetFirstMondayOfMonth(theDate){
		var tempDate = DateCopy(theDate)
		
		tempDate.setDate(1);
		
		while(tempDate.getDay() != 1){
	        tempDate.setDate(tempDate.getDate() + 1);
		}
		
	    return tempDate;
	}
	
	function GetLastFridayOfMonth(theDate){
		var tempDate = DateCopy(theDate)
		
		tempDate.setDate(1);
		tempDate.setMonth(tempDate.getMonth() + 1);
		
		while(tempDate.getDay() != 1){
	        tempDate.setDate(tempDate.getDate() - 1);
		}
		
		tempDate.setDate(tempDate.getDate() + 4);
		
	    return tempDate;
	}
	
	function GetMondayOfCurrentWeek(theDate){
		var tempDate = DateCopy(theDate)
		
		while(tempDate.getDay() != 1){
	        	tempDate.setDate(tempDate.getDate() - 1);
		}
		
	    return tempDate;
	}
	
	Date.prototype.DateDiff = function(compare_date, format){
		var tempDate1 = DateCopy(this);
		var tempDate2 = DateCopy(compare_date);	
		var datediff = tempDate2.getTime() - tempDate1.getTime();

		switch(format){
			case "ms":
				return datediff;
			case "s":
				return datediff / 1000;			
			case "m":
				return (datediff / 1000) / 60;						
			case "h":
				return ((datediff / 1000) / 60) / 60;
			case "d":
				datediff = tempDate2.SetMidnight() - tempDate1.SetMidnight();
				
				return (((datediff / 1000) / 60) / 60) / 24;	

			case "wd":
				var weekday_dif = 0;
				compareDate1 = tempDate1.SetMidnight();
				compareDate2 = tempDate2.SetMidnight();
				while(compareDate1 > compareDate2){
					compareDate1.SubtractWeekDays(1);
					weekday_dif++;
				}
				
				compareDate1 = tempDate1.SetMidnight();
				compareDate2 = tempDate2.SetMidnight();
				while(compareDate2 > compareDate1){
					compareDate2.SubtractWeekDays(1);
					weekday_dif--;
				}			

				return weekday_dif;						
				
			case "mo":
				var yearDiff = tempDate1.DateDiff(tempDate2, "y");
				var monthDiff = tempDate2.getMonth() - tempDate1.getMonth();
	
				return (12 * yearDiff) + monthDiff;
				
			case "y":		
				datediff = tempDate2.SetMidnight() - tempDate1.SetMidnight();
				
				return tempDate2.getYear() - tempDate1.getYear();
		}
	}	
	
	
	function FlashToSlashDate(flashdate, doubledigits, daymonthonly, TwoDigitYear){
		if(doubledigits){
			var theDate = (flashdate.getDate().toString().length == 1) ? "0" + flashdate.getDate().toString() : flashdate.getDate();
			var theMonth = ((flashdate.getMonth()+1).toString().length == 1) ? "0" + String((flashdate.getMonth()+1)) : flashdate.getMonth()+1;
			var theYear = flashdate.getFullYear();
			if(TwoDigitYear){
				theYear = String(theYear).substr(2);
			}
			return theDate + "/" + theMonth + "/" + theYear;
		}else{
			if(!daymonthonly){
				var theYear = flashdate.getFullYear();
				if(TwoDigitYear){
					theYear = String(theYear).substr(2);
				}
				return flashdate.getDate() + "/" + (flashdate.getMonth()+1) + "/" + theYear;
			}else{
				return flashdate.getDate() + "/" + (flashdate.getMonth()+1);
			}
		}
	}

	function GetWeekDayName(theDay, abbrev){
		var theDay = theDay - (Math.floor(theDay/7)*7);
		switch(theDay){
			case(0):
				return (!abbrev) ? "Sunday" : "Sun";
			case(1):
				return (!abbrev) ? "Monday" : "Mon";
			case(2):
				return (!abbrev) ? "Tuesday" : "Tue";
			case(3):
				return (!abbrev) ? "Wednesday" : "Wed";
			case(4):
				return (!abbrev) ? "Thursday" : "Thu";
			case(5):
				return (!abbrev) ? "Friday" : "Fri";
			case(6):
				return (!abbrev) ? "Saturday" : "Sat";
		}
	}

	function FlashToWeekdaySlashDate(flashdate, doubledigits, daymonthonly, TwoDigitYear){
		return GetWeekDayName(flashdate.getDay(), true) + " " + FlashToSlashDate(flashdate, doubledigits, daymonthonly, TwoDigitYear);
	}
	
	GetSQLDateOnly = FlashToSQLDateOnly = function(theDate){
		return (theDate.getFullYear()) + "-" + (theDate.getMonth()+1) + "-" + theDate.getDate() + "T00:00:00";
	}
	
	GetSQLDateTime = FlashToSQLDate = function(theDate){
		return (theDate.getFullYear()) + "-" + (theDate.getMonth()+1) + "-" + theDate.getDate() + " " + theDate.getHours() + ":" + theDate.getMinutes() + ":" + theDate.getSeconds();
	}
	
	function GetXMLDate(flash_date){
		var year = flash_date.getFullYear();
		
		var month = String(flash_date.getMonth() + 1);
		if(month.length == 1){
			month = "0" + month;
		}
		
		var date = String(flash_date.getDate());
		if(date.length == 1){
			date = "0" + date;
		}	
		
		return  year + "-" + month + "-" + date + "T00:00:00";
	}
	
	function GetXMLDateTime(flash_date){
		var year = flash_date.getFullYear();
		
		var month = String(flash_date.getMonth() + 1);
		if(month.length == 1){
			month = "0" + month;
		}
		
		var date = String(flash_date.getDate());
		if(date.length == 1){
			date = "0" + date;
		}	
		
		var hours = String(flash_date.getHours());
		if(hours.length == 1){
			hours = "0" + hours;
		}	
		
		var minutes = String(flash_date.getMinutes());
		if(minutes.length == 1){
			minutes = "0" + minutes;
		}	
		
		var seconds = String(flash_date.getSeconds());
		if(seconds.length == 1){
			seconds = "0" + seconds;
		}	
		
		return  year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds;
	}
	
	function SlashToSQLDate(slashdate){
		if(slashdate == null){
			return "";	
		}else{
			var aDate = slashdate.split("/");
			return aDate[2]	+ "-" + aDate[1] + "-" + aDate[0] + "T00:00:00";
		}
	}

	Date.prototype.AddDays = function(days){
		this.setDate(this.getDate() + days);
		
		return this;
	}
	
	Date.prototype.SubtractDays = function(days){
		this.setDate(this.getDate() - days);
		return this;
	}
	
	Date.prototype.AddWeekDays = function(weekdays){
		var weekdaysLeft = weekdays;
		
		while(weekdaysLeft > 0){
			this.setDate(this.getDate() + 1);
			while(this.getDay() == 0 || this.getDay() == 6){
				this.setDate(this.getDate() + 1);
			}
			weekdaysLeft--;
		}
	}
	
	Date.prototype.SubtractWeekDays = function(weekdays){
		var weekdaysLeft = weekdays;
		
		while(weekdaysLeft > 0){
			this.setDate(this.getDate() - 1);
			while(this.getDay() == 0 || this.getDay() == 6){
				this.setDate(this.getDate() - 1);
			}
			weekdaysLeft--;
		}
	}
	
	
	Date.prototype.SetMidnight = function(){
		this.setHours(0);
		this.setMinutes(0);
		this.setSeconds(0);
		this.setMilliseconds(0);
		
		return this;
	}
	
	Date.prototype.Set1900 = function(){
		this.setDate(1);
		this.setMonth(0);
		this.setYear(0);
		
		return this;
	}
	
	XMLEncode = function(str){
		if(!str){
			return "";
		}
		
		str = str.replace(/&/g, "&amp;");	
		str = str.replace(/£/g, "&pound;");	
		str = str.replace("$", "&dollar;");	
		str = str.replace(/"/g, "&quot;");
		str = str.replace(/'/g, "&apos;");
		str = str.replace(/‘/g, "&apos;");
		str = str.replace(/’/g, "&apos;");	
		str = str.replace(/</g, "&lt;");
		str = str.replace(/>/g, "&gt;");
	
		return str;
	}

	XMLDecode = function(str){
		str = str.replace(/&quot;/g, '"');
		str = str.replace(/&apos;/g, "'");
		str = str.replace(/&lt;/g, "<");
		str = str.replace(/&gt;/g, ">");
		str = str.replace(/&amp;/g, "&");
		str = str.replace(/&pound;/g, "£");	
		str = str.replace(/&dollar;/g, "$");	
		
		return str;
	}
		

	$.fn.textWidth = function(text){ 
		  var org = $(this) 
		  var html = $('<span style="postion:absolute;width:auto;left:-9999px">' + (text || org.html()) + '</span>'); 
		  if (!text) { 
		    html.css("font-family", org.css("font-family")); 
		    html.css("font-size", org.css("font-size")); 
		  } 
		  $('body').append(html); 
		  var width = html.width(); 
		  html.remove(); 
		  return width; 
		} 


	$.fn.redraw = function() { 
    	$(this).width($(this).width() + 3); 
		$(this).width($(this).width() + 5); 
	}  


	$.fn.sortOptions = function(sortDesc) 
	{ 
	    return this.each(function()
	    { 
	        var me   = jQuery(this); 
	        if(me.val() != null )
	        {
	            me.html(me.children("option").get().sort(sortFuncAsc));
	        }
	        if(sortDesc != null && sortDesc == true)
	        {
	            me.html(me.children("option").get().reverse());
	        }
	    }); 
	};
	
	function sortFuncAsc(record1, record2) 
	{
	    var value1 = record1.getAttribute("opText");
	    var value2 = record2.getAttribute("opText");
	    if(parseInt(value1)> -1 && parseInt(value2)> -1 )
	    {
	        if (parseInt(value1) > parseInt(value2)) { return(1); }
	        if (parseInt(value1) < parseInt(value2)) { return(-1); }
	    }
	    else
	    {
	        if (value1 > value2) { return(1) };
	        if (value1 < value2) { return(-1) };
	    }
	    return(0);
	}







	$.globalToLocal = function( context, globalX, globalY ){
	
		var position = context.offset();
	 
		return({
			x: Math.floor( globalX - position.left ),
			y: Math.floor( globalY - position.top )
		});
	};
	 
	
	 

	$.fn.localToGlobal = function(context, localX, localY ){
		
		if(context == null){
			context = $(window); 
		}
		
		if(localX == null){
			localX = 0;
		}
		
		if(localY == null){
			localY = 0;
		}
	
		// Get the position of the context element.
		var position = context.offset();
	 
		//alert(position.left + " " + position.top);
		// Return the X/Y in the local context.
		return({
			x: Math.floor( localX + position.left),
			y: Math.floor( localY + position.top )
		});
	};
	 
	 
	
	// I am the FN version of the global to local function.
	//$.fn.globalToLocal = function( globalX, globalY ){
	//return(
	//$.globalToLocal(
	//this.first(),
	//globalX,
	//globalY
//	)
//	);
//	};
	 
	
	// I am the FN version of the local to global function.
	//$.fn.localToGlobal = function( localX, local, this.first(),Y ){
	//return(
	//$.localToGlobal(
	//localX,
	//localY
	//)
	//);
	//};
	
	
	
	
	PixelsToInt = px_int = function(px_str){
		if(px_str != null){
			return Number(px_str.substring(0, px_str.length - 2));
		}else{
			return 0;	
		}
	}
	
	function px(px_int){
		return px_int + "px";
	}
	

	function QueryString(name) 
	{ 
	  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); 
	  var regexS = "[\\?&]" + name + "=([^&#]*)"; 
	  var regex = new RegExp(regexS); 
	  var results = regex.exec(window.location.search); 
	  if(results == null) 
	    return ""; 
	  else 
	    return decodeURIComponent(results[1].replace(/\+/g, " ")); 
	} 


function StripBranch(node){
	var branch = null;
	var temp_node = node;

 	var i=0
	while(temp_node != null && i < 5){
		alert(temp_node.nodeName);
		
		$(temp_node).append(branch);
		
		branch = temp_node;
		 
		temp_node = $(temp_node).parent();
		i++;
	}
	
	return branch;
}



Array.prototype.contains = function(data){
    var i = this.length;
    while (i--) {
        if (this[i] == data) {
            return true;
        }
    }
    return false;
}



 // adds .naturalWidth() and .naturalHeight() methods to jQuery
  // for retreaving a normalized naturalWidth and naturalHeight.
  (function($){
    var
    props = ['Width', 'Height'],
    prop;

    while (prop = props.pop()) {
    (function (natural, prop) {
      $.fn[natural] = (natural in new Image()) ? 
      function () {
      return this[0][natural];
      } : 
      function () {
      var 
      node = this[0],
      img,
      value;

      if (node.tagName.toLowerCase() === 'img') {
        img = new Image();
        img.src = node.src,
        value = img[prop];
      }
      return value;
      };
    }('natural' + prop, prop.toLowerCase()));
    }
  }(jQuery));
