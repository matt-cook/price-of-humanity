window.fbAsyncInit = function() {
    //FB is ready
    FB.init({
      appId      : '428729383937921',
      status     : true,
      xfbml      : true
    });

$( document ).ready(function() {
    //FB and jQuery are ready
    
    var friends = [];
    var costs, locations;
    var costImages;
    var dataLoaded = false;
    var friendsLoaded = false;
    var $window = $(window);
    var MENU_TIMEOUT = 2000;
    var MENU_ANIM_TIME = 1000;
    var minCost;
    var maxCost;
    
    var menuTimeout = setTimeout(hideMenu,MENU_TIMEOUT);
    //busted for now, since we're also allowing click to select
   /* $(window).scroll(function(e){
        e.preventDefault();
        showMenu();
        var h = $window.height();
        var i = Math.round($window.scrollTop()/h);
        selectCost($($('#cost li').get(i)).attr('id'));
    });*/
    $(window).scroll($.debounce(500,snapToContent));
    
    $(window).resize(function() {
        snapToContent();
        if(dataLoaded){
          $('#cost li').each(function(i,$c){
            var value =  parseInt($c.attr('data-value'));
            $c.css({
              top:(Math.round((value-minCost)/(maxCost-minCost)*$(window).height()))+'px'
            });
          });
        }
    });
    
    function snapToContent(){
            var h = $window.height();
            $("body").animate({ scrollTop: (Math.round($window.scrollTop()/h)*h)+"px" });
    }
    
    var animatingMenu = false;
    var menuAnimTimeout;
    function hideMenu(){
        clearTimeout(menuAnimTimeout);
       /* if(!animatingMenu){
            animatingMenu = true;
            $('#location').transition({
                right:-$('#location').width(),
                duration: MENU_ANIM_TIME
            });
            $('#cost').transition({
                left:-$('#cost').width(),
                duration: MENU_ANIM_TIME
            });
        }*/
        menuAnimTimeout = setTimeout(function(){animatingMenu = false;},MENU_ANIM_TIME);
    }
    
    function showMenu(){
        clearTimeout(menuTimeout);
        clearTimeout(menuAnimTimeout);
        if(!animatingMenu){
            animatingMenu = true;
            $('#location').transition({
                right:0,
                duration: MENU_ANIM_TIME
            });
            $('#cost').transition({
                left:0,
                duration: MENU_ANIM_TIME
            });
        }
        menuAnimTimeout = setTimeout(function(){
            animatingMenu = false;
            menuTimeout = setTimeout(hideMenu,MENU_TIMEOUT);
        },MENU_ANIM_TIME);
    }
    
    function selectLocation(countryID){
      $('#cost .active').css({ background:''});
      $('.active').removeClass('active');

      var color = $('#'+countryID).addClass('active').find('a').css('background-color');
      var $costs = $('#cost li[data-country="'+countryID+'"]');
      $costs.addClass('active').css({
        background:color
      });
      if(!$costs.filter('.selected').length) selectCost($($costs.get(0)).attr('id'));
    }
    
    function selectCost(costID){
      $('.selected').removeClass('selected');
      var $c = $('#'+costID);
      $c.addClass('selected');
      var countryID = $c.attr('data-country');
      if(!$('#'+countryID+'.active').length) selectLocation(countryID);
      var h = $window.height();
      $("body").animate({ scrollTop: ($c.index()*h)+"px" });
    }
    
    function setLocationHeight(){
     var height = Math.floor(($('#location').height()-locations.length*2)/locations.length);
        $('#location li').css({
            "height":height+'px',
            "line-height":height+'px'
        });
    }
    
    $.get('./data/cost.csv',function(data){
        costs = $.csv.toObjects(data);
        
        $.get('./data/locations.csv',function(data){
         locations = $.csv.toObjects(data);
         var height = Math.floor(($('#location').height()-locations.length*2)/locations.length);
        $.each(locations,function(i,l){
            var countryID = l.title.trim().toLowerCase().replace(' ','-');
           $('<li id="'+countryID+'"><a href="#">'+l.label+'</a></li>').css({
                "height":height+'px',
                "line-height":height+'px'
            }).hide().appendTo('#location ul').find('a').css({
                "background-color":'#'+l.color
            }).click(function(){
               selectLocation(countryID);
            });
        });
        
        $.get('./data/cost-images.csv',function(data){
        costImages = $.csv.toObjects(data);
        minCost = costs[0].cost;
        maxCost = costs[costs.length-1].cost;
        $('#cost .min').text('$'+minCost).attr('data-value',minCost.replace(/,/g, ""));
        $('#cost .max').text('$'+maxCost).attr('data-value',maxCost.replace(/,/g, ""));
        minCost = parseInt(minCost.replace(/,/g, ""));
        maxCost = parseInt(maxCost.replace(/,/g, ""));
        var currentCountryIndex = 0;
        $.eachCallback(costs,function(){
          var c = this;
          var countryID = c.location.trim().toLowerCase().replace(' ','-');
          var costID = 'cost'+c.ID;
          var country = c.location.trim();
          $('.status').text(Math.round(currentCountryIndex/costs.length*100)+"%: Loading "+country+"...");
          $('#'+countryID).show();
          var value = parseInt(c.cost.replace(/,/g, ""));
          var top = Math.round((value-minCost)/(maxCost-minCost)*$('#cost ul').height());
          $('<li id="'+costID+'" data-value="'+value+'" data-country="'+countryID+'"><a href="#">$'+c.cost.trim()+'</a></li>').css({
            top:top+'px'
          }).appendTo('#cost ul').find('a').click(function(){
            selectCost(costID);
          });
          var img;
          var name;
          var maxImg = 9;
          if(c.gender == 'f'){
            //grete
            img = "img/friends/grete/"+Math.ceil(Math.random()*maxImg)+'-grete.jpg';
            name = "Grete";
          }else if(c.gender = 'm'){
            var who = Math.floor(Math.random()*2);
            if(who ==0){
                //kyle
                img = "img/friends/kyle/"+Math.ceil(Math.random()*maxImg)+'-kyle.jpg';
                name = "Kyle";
            }else{
                //matt
                img = "img/friends/matt/"+Math.ceil(Math.random()*maxImg)+'-matt.jpg';
                name = "Matt";
            }
          }else{
            //no gender specified
            var who = Math.floor(Math.random()*3);
            if(who == 0){
                //grete
                img = "img/friends/grete/"+Math.ceil(Math.random()*maxImg)+'-grete.jpg';
                name = "Grete";
            }else if(who == 1){
                //kyle
                img = "img/friends/kyle/"+Math.ceil(Math.random()*maxImg)+'-kyle.jpg';
                name = "Kyle";
            }else{
                //matt
                img = "img/friends/matt/"+Math.ceil(Math.random()*maxImg)+'-matt.jpg';
                name = "Matt";
            }
          }
          var html = '<li data-cost="'+costID+'"><img src="'+img+'" alt="" /><canvas></canvas><div class="info"><h2><span class="name">'+name+'</span>&#39;s life is worth $'+c.cost+'</h2><br><h3>as '+c.as+' in '+c.location;
          if(c.when) html += ', '+c.when;
          html += '.</h3></div></li>';
          $c = $(html).appendTo($('#content ul'));
          var canvas = $c.find('canvas').get(0);
          var image = new Image();
          var ctx = canvas.getContext('2d');
          image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(image, 0, 0);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(parseInt(0.27*canvas.width),0);
            ctx.lineTo(0,canvas.height);
            ctx.closePath();
            ctx.fill();
        };
        var matches = [];
        $.each(costImages,function(i,img){
            var costs = img.costs.split(',');
            $.each(costs,function(i,imgC){
                if(imgC == c.ID) matches.push(img.filename);
            });
        });
        image.src = matches.length? './img/cost/'+matches[Math.floor(Math.random()*matches.length)] : './img/cost/'+costImages[Math.floor(Math.random()*costImages.length)].filename;
        },function(i){
            //cost loading progress updated
            currentCountryIndex = i;
            if(i == costs.length-1){
                $('.message').removeClass("loading");
                dataLoaded = true;
                loadComplete();
            }
        });
        });
        });
    });
    
    function loadComplete(){
        if(friendsLoaded && dataLoaded){
            //ready to go
            
            $.eachCallback(costs,function(){
                var c = this;
            	if(typeof c.gender === 'undefined' || c.gender.length == 0) c.gender = 'b';
            	for ( var j = 0; j < friends.length; j++){
            		if( typeof friends[j].gender != 'undefined' &&
            		    (c.gender == 'b' || c.gender == friends[j].gender[0]) && 
            		    !friends[j].used ){
            			
            			friends[j].used = true;
            			var content = $('#content li[data-cost="cost'+c.ID+'"]');
            			$(content).find("img").attr("src", friends[j].photo);
            			$(content).find(".name").text(friends[j].name);
            			break;
            		}
            	}
            },function(i){
                //friend loading progress updated
                var content = $('#content li[data-cost="cost'+costs[i].ID+'"]');
                var name = $(content).find(".name").text();
                $('.status').text('Loading '+name+'...');
                if(i == costs.length - 1){
                    $('.overlay').hide();
                }
            });
        }
    }
    
    $('.facebook.button').click(function(e){
        $('.message').addClass('loading');
        $('.status').text('Loading friends...');
        FB.login(getFriends, {scope: 'basic_info,user_birthday,friends_birthday'});
    });
    $('.message .close').click(function(){
      $('.overlay').hide();
    });
        
        function getFriends() {
            FB.api('/me/friends?fields=id,name,first_name,gender,birthday', function(a) {
                if(a.data) {
                    $.each(a.data,function(i,friend) {
                    
                        FB.api('/'+friend.id+'/picture?width=9999&height=9999',
                        function(b) {
                            if(!b.is_silhouette) {
                                friends[i] = {};
                                friends[i].name = friend.first_name;
                                friends[i].gender = friend.gender;
                                friends[i].photo = b.data.url;
                                friends[i].age = '';
                                friends[i].used = false;
                                if(friend.birthday){
                                    var c = friend.birthday.split('/');
                                    if(c.length == 3){
                                        friends[i].age =  new Date().getFullYear() - parseInt(c[2]);
                                    }
                                }
                            }
                            if(i == a.data.length-1){
                                friendsLoaded = true;
                                loadComplete();
                            }
                        });
                    });
                   
                } else {
                    alert("Error!");
                }
            });
        }

});

};

//non-blocking loop: http://www.kryogenix.org/days/2009/07/03/not-blocking-the-ui-in-tight-javascript-loops/
jQuery.eachCallback = function(arr, process, callback) { var cnt = 0; function work() { var item = arr[cnt]; process.apply(item); callback.apply(item, [cnt]); cnt += 1; if (cnt < arr.length) { setTimeout(work, 1); } } setTimeout(work, 1); }; jQuery.fn.eachCallback = function(process, callback) { var cnt = 0; var jq = this; function work() { var item = jq.get(cnt); process.apply(item); callback.apply(item, [cnt]); cnt += 1; if (cnt < jq.length) { setTimeout(work, 1); } } setTimeout(work, 1); };

