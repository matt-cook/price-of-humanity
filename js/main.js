if(!window.chrome) {
  alert("This application requires Google Chrome");
  window.location = "http://www.google.com/chrome";
}

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
    var costs, locations, regions, costImages; //these will be arrays of all the .csv data
    var dataLoaded = false;
    var friendsLoaded = false;
    var $window = $(window);
    var MENU_TIMEOUT = 1500; //hide menu after inactivity
    var MENU_ANIM_TIME = 1000;
    var minCost;
    var maxCost;
    var menuTimeout;
    $(window).scroll($.debounce(800,snapToContent));
    $(window).on('scroll click',function(){
      //$('.photo-story a').fadeOut();
      //$('.story').fadeOut();
      $('#about').fadeOut();
    });
    $(window).scroll(function(){
        var h = $window.height();
        var i = Math.round($window.scrollTop()/h);
        var costID = $($('#content li').get(i)).attr('data-cost');
        $('.selected').removeClass('selected');
        var $c = $('#'+costID);
        $c.addClass('selected');
        var countryID = $c.attr('data-country');
        $('#cost .active').css({ background:''});
        $('.active').removeClass('active');
        var color = $('#'+countryID).addClass('active').find('a').css('background-color');
        var $costs = $('#cost li[data-country="'+countryID+'"]');
        $costs.addClass('active').css({
          background:color
        });

    });
    
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
        //if(!$('.photo-story a').is(':visible') && !$('.photo-story a').is(':animated')) $('.photo-story a').fadeIn();
           }
    
    function hideMenu(){
        if($('#interface').hasClass('open')){
            $('#location').transition({
                right:-$('#location').width(),
                duration: MENU_ANIM_TIME
            });
            $('#cost').transition({
                left:-$('#cost').width(),
                duration: MENU_ANIM_TIME
            },function(){
              $('#interface').removeClass('open');
            });
        }
    }
    
    function showMenu(){
        clearTimeout(menuTimeout);
        if(!$('#interface').hasClass('open')){
            $('#interface').addClass('open');
            $('#location').transition({
                right:0,
                duration: MENU_ANIM_TIME
            });
            $('#cost').transition({
                left:0,
                duration: MENU_ANIM_TIME
            });
            menuTimeout = setTimeout(hideMenu,(MENU_ANIM_TIME+MENU_TIMEOUT));
        }else{
          menuTimeout = setTimeout(hideMenu,MENU_TIMEOUT);
        }
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
        
        $.get('./data/regions.csv',function(data){
        regions = $.csv.toObjects(data);
        
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
            $.each(locations,function(i,loc){
                if(c.location == loc.title){
                    c.region = loc.region;
                    return;
                }
            });

            $.each(costImages,function(i,img){
                if(c.cost == img.costs){
                    c.imgCaption = img.caption;
                    c.imgSrc = img.url;
                    return;
                }
            });
            var whyPrice = (typeof c.detail === 'undefined' || c.detail.length == 0) ? '' : c.detail+' ';
            var whyPriceSrc = (typeof c.link_1 === 'undefined' || c.link_1.length == 0) ? '' : 'Check out the <a href="'+c.link_1+'">Source</a>';
            whyPrice += whyPriceSrc;
            whyPrice  = (whyPrice.length != 0) ? '<h4>why this price?</h4>'+whyPrice :'';
            
            
            var whatPhoto = (typeof c.imgCaption === 'undefined' || c.imgCaption.length == 0) ? '' : c.imgCaption+' ';
            var whatPhotoSrc = (typeof c.imgSrc === 'undefined' || c.imgSrc.length == 0) ? '' : 'See the photo&#39;s <a href="'+c.imgSrc+'">Source</a>';
            whatPhoto += whatPhotoSrc;
            whatPhoto = (whatPhoto.length != 0) ? '<h5>What is in the photo?</h5>'+whatPhoto : '';
            
            var details = (whyPrice.length != 0 ||  whatPhoto.length != 0) ? '<div class="story-details">'+whyPrice+whatPhoto+'</div>' : '';
            
            var region = '<div class="region"><h4><span>this price is from </span>'+c.region+'.</h4><h4>'+c.region+' stats:</h4></div>'
            var html = '<li data-cost="'+costID+'"><canvas></canvas><div class="story hidden">'+details+region+'</div><div class="info"><h2><span class="name">'+name+'</span>&#39;s life is worth $'+c.cost+'</h2><br><h3>as '+c.as+' in '+c.location;

            if(c.when) html += ', '+c.when;
            html += '.</h3></div></li>';
            $c = $(html).appendTo($('#content ul'));
            var $img = $('<img src="'+img+'" alt="" />').one('load', function() {
              if(this.width >= this.height) $(this).addClass('horizontal');
              else $(this).addClass('vertical');
            }).each(function() {
              if(this.complete) $(this).load();
            });
            $c.prepend($img);
            
            var canvas = $c.find('canvas').get(0);
            var image = new Image();
            var ctx = canvas.getContext('2d');
            var w = $('#content')
            image.onload = function() {
              if(this.width >= this.height) $(canvas).addClass('horizontal');
              else $(canvas).addClass('vertical');
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
          if(matches.length){
            //use random matching image
            image.src = './img/cost/'+matches[Math.floor(Math.random()*matches.length)];
          }else{
            //no matching images, use completely random photo
            console.error('No matching image for #'+c.ID+' "'+c.as+'"');
            image.src = './img/cost/'+costImages[Math.floor(Math.random()*costImages.length)].filename;
          }
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
            			$(content).find("img").attr("src", friends[j].photo).one('load', function() {
                    if(this.width >= this.height) $(this).addClass('horizontal');
                    else $(this).addClass('vertical');
                  }).each(function() {
                    if(this.complete) $(this).load();
                  });
                  
            			$(content).find(".name").text(friends[j].name);
            			break;
            		}
            	}
            },function(i){
                //friend loading progress updated
                var content = $('#content li[data-cost="cost'+costs[i].ID+'"]');
                var name = $(content).find(".name").text();
                $('.status').text('Loading '+name+'...');
                if(i == costs.length - 1) start();
            });
        }
    }
    

    
    $('.facebook.button').click(function(e){
        $('.message').addClass('loading');
        $('.status').text('Loading friends...');
        FB.login(getFriends, {scope: 'basic_info,user_birthday,friends_birthday'});
    });
    $('.message .close').click(start);
    /*$('.photo-story').click(function(e){
        e.preventDefault();
        if($('.story').is(':visible')) $('.story').fadeOut();
        else $('.story').fadeIn();
        return false;
    });*/
    $('.about a').click(function(e){
        e.preventDefault();
        if($('#about').is(':visible')) $('#about').fadeOut();
        else $('#about').fadeIn();
        return false;
    });
    
    function start(){
      $('.overlay').hide();
     // $('.story').hide().removeClass('hidden');
     // $('.photo-story a').hide().removeClass('hidden');
      $('#about').hide().removeClass('hidden');
      var i = Math.round(Math.random()*costs.length);
      selectCost("cost"+costs[i].ID);
      $(window).mousemove(showMenu);
    }
        
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
                    start();
                }
            });
        }

});

};

//non-blocking loop: http://www.kryogenix.org/days/2009/07/03/not-blocking-the-ui-in-tight-javascript-loops/
jQuery.eachCallback = function(arr, process, callback) { var cnt = 0; function work() { var item = arr[cnt]; process.apply(item); callback.apply(item, [cnt]); cnt += 1; if (cnt < arr.length) { setTimeout(work, 1); } } setTimeout(work, 1); }; jQuery.fn.eachCallback = function(process, callback) { var cnt = 0; var jq = this; function work() { var item = jq.get(cnt); process.apply(item); callback.apply(item, [cnt]); cnt += 1; if (cnt < jq.length) { setTimeout(work, 1); } } setTimeout(work, 1); };

