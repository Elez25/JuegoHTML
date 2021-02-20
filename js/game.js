//Preparar requestAnimationFrame y cancelAnimationFrame
(function() {
    var lastTime=0;
    var vendors = ['ms','moz','webkit','o'];
    for (var x=0;x<vendors.length && !window.requestAnimationFrame; ++x){
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
        window[vendors[x]+'CancelAnimationFrame'] ||  window[vendors[x]+'CancelRequestAnimationFrame'];
         
    }

    if(!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element){
            var currTime= newDate().getTime();
            var timeToCall = Math.max(0, 16- (currTime - lastTime));
            var id = window.setTimeout(function(){ callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id){
            clearTimeout(id);
        };
    
}());

$(window).load(function(){
    game.init();/*necesario para evitar
    comportamientos inesperados, tales como errores
    JavaScript*/
    
});

/*****************
***OBJETO JUEGO***
******************/
var game={
    /*comenzar inicialización de objetos, precarga de elementos
    y pantalla de inicio*/
    init:function (){
        /*Ocultar todas las capas del juego y
        mostrar la pantalla de incio */
        levels.init();
        loader.init();
        mouse.init();

        //oculta todas las capas del juego y muestra la pantalla de incio
        $('.gamelayer').hide();
        $('#gamestartscreen').show();

        /*Obtener manejador para el canvas del juego y el contexto */
        game.canvas = $('#gamecanvas')[0];
        game.context= game.canvas.getContext('2d');  
    },

    showLevelScreen:function(){
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },

    // Modo Juego 
	mode:"intro", 
	// Coordenadas X & Y de la honda
	slingshotX:140,
	slingshotY:280,

	start:function(){
		$('.gamelayer').hide();
		// Display the game canvas and score 
		$('#gamecanvas').show();
		$('#scorescreen').show();
	
		game.mode = "intro";	
		game.offsetLeft = 0;
		game.ended = false;
		game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
	},
    
    // Velocidad máxima de panoramización por fotograma en píxeles
	maxSpeed:3,
	// Mínimo y Máximo desplazamiento panorámico
	minOffset:0,
	maxOffset:300,
	// Desplazamiento de panorámica actual
	offsetLeft:0,
	// La puntuación del juego
	score:0,

    //despliegue de la pantalla para centrarse en newCenter
    panTo:function(newCenter){
		if (Math.abs(newCenter-game.offsetLeft-game.canvas.width/4)>0 
			&& game.offsetLeft <= game.maxOffset && game.offsetLeft >= game.minOffset){
		
			var deltaX = Math.round((newCenter-game.offsetLeft-game.canvas.width/4)/2);
			if (deltaX && Math.abs(deltaX)>game.maxSpeed){
				deltaX = game.maxSpeed*Math.abs(deltaX)/(deltaX);
			}
			game.offsetLeft += deltaX; 
		} else {
			
			return true;
		}
		if (game.offsetLeft <game.minOffset){
			game.offsetLeft = game.minOffset;
			return true;
		} else if (game.offsetLeft > game.maxOffset){
			game.offsetLeft = game.maxOffset;
			return true;
		}		
		return false;
	},


    handlePanning:function(){
        if(game.mode=="intro"){		
            if(game.panTo(700)){
                game.mode = "load-next-hero";
            }			 
        }	   

       

     if(game.mode=="wait-for-firing"){
         if (mouse.dragging){
             game.panTo(mouse.x + game.offsetLeft)
         } else {
             game.panTo(game.slingshotX);
         }
     }

     if (game.mode == "load-next-hero"){
         //to do
         //comprobar si algun villano está vivo
         //comprobar si quedan mas heroes para cargar
         //cargar el heroe y fijar a modo de espero para disparar
         game.mode="wait-for-firing";
     }

     if(game.mode == "firing"){
         game.panTo(game.slingshotX);
     }
     if (game.mode=="fired"){
         //to do
         //hacer panoramica donde quiera que el heroe se encuentre actualmente
     }
    },

    animate:function(){
        //anima el fondo
        game.handlePanning();
        
        //Anima los personajes

        //dibuja el fondo con desplazamiento
        game.context.drawImage(game.currentLevel.backgroundImage,game.offsetLeft/4,0,640,480,0,0,640,480);
		game.context.drawImage(game.currentLevel.foregroundImage,game.offsetLeft,0,640,480,0,0,640,480);

		// Dibujar la honda
		game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);

        //Dibuja todos los cuerpos
        game.drawAllBodies();

        // Dibujar el frente de la honda
		game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

		if (!game.ended){
			game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
		}
    },
    drawAllBodies:function(){
        box2d.world.DrawDebugData();
        //Iterar a traves de todos los cuerpos y dibujarlos sobre el canvas del juego.
        for(var body=box2d.world.GetBodyList();body;body = body.getNext()){
            var entity = body.GetUserData();

            if(entity){
                var entityX = body.GetPosition().x*box2d.scale;
                if(entityX<0 || entityX>game.currentLevel.foregroundImage.width || (entity.health && entity.health <0)){
                    box2d.world.DestroyBody(body);
                    if(entity.type=="villain"){
                        game.score +=entity.calories;
                        $('score').html('Score: '+game.score);
                    }
                    if(entity.breakSound){
                        entity.breakSound.play();
                    }
                } else{
                    entity.draw(entity,body.GetPosition(),body.GetAngle())
                }
            }
        }
    }
}

/*****************
**OBJETO LEVELS***
******************/
/*El objeto levels tiene un array con información acerca 
de cada nivel */
var levels = {
    data:[
        {//Primer nivel
            foreground:'desert-foreground',
            background:'clouds-background',
            entities:[
                //SUELO
                {type:"ground",name:"dirt",x:500,y:440,width:1000,height:20,isStatic:true},
                {type:"ground",name:"wood",x:185,y:390,width:30,height:80,isStatic:true},

                //VILLANO Y BLOQUES
                {type:"block",name:"wood",x:520,y:380,angle:90,width:100,height:25},
                {type:"block",name:"glass",x:520,y:280,angle:90,width:100,height:25},
                {type:"villain",name:"burger",x:520,y:205,calories:590},
                
                //HEROE
                {type:"hero",name:"orange",x:80,y:405},
                {type:"hero",name:"orange",x:140,y:405},
            ]
        },

        {//Segundo nivel
            foreground:'desert-foreground',
            background:'clouds-background',
            entities:[
                //SUELO
                {type:"ground",name:"dirt",x:500,y:440,width:1000,height:20,isStatic:true},
                {type:"ground",name:"wood",x:185,y:390,width:30,height:80,isStatic:true},

                //BLOQUES
                {type:"block",name:"wood",x:820,y:380,angle:90,width:100,height:25},
                {type:"block",name:"wood",x:720,y:380,angle:90,width:100,height:25},
                {type:"block",name:"wood",x:620,y:380,angle:90,width:100,height:25},
                {type:"block",name:"glass",x:670,y:317.5,angle:90,width:100,height:25},

                {type:"block",name:"glass",x:715,y:155,angle:90,width:100,height:25},
                {type:"block",name:"glass",x:770,y:255,angle:90,width:100,height:25},
                {type:"block",name:"wood",x:770,y:192.5,width:100,height:25},
                
                //VILLANOS
                {type:"villain",name:"burger",x:715,y:155,calories:590},
                {type:"villain",name:"fries",x:670,y:405,calories:420},
                {type:"villain",name:"sodocan",x:765,y:400,calories:150},

                //HEROES
                {type:"hero",name:"strawnerry",x:30,y:415},
                {type:"hero",name:"orange",x:80,y:405},
                {type:"hero",name:"apple",x:140,y:405},
            ]
        }


    ],
    //inicializa la pantalla de seleccion de nivel
   	// Inicializar pantalla de selección de nivel
	init:function(){
		var html = "";
		for (var i=0; i < levels.data.length; i++) {
			var level = levels.data[i];
			html += '<input type="button" value="'+(i+1)+'">';
		};
		$('#levelselectscreen').html(html);
		
		// Establecer los controladores de eventos de clic de botón para cargar el nivel
		$('#levelselectscreen input').click(function(){
			levels.load(this.value-1);
            $('#levelselectscreen').hide();
		});
	},
    //Cargar todos los datos e imagenes de un nivel
    load:function(number){
        //Inicializar box2d world cada vez que se carga un nivel
        box2d.init();

        //Declarar un nuevo objeto de nivel actual
        game.currentLevel = {number:number,hero:[]};
        game.score=0;
        $('#score').html('Score: ' +game.score);
        game.currentHero=undefined;
        var level = levels.data[number];

        //Carga el fondo, el primer plano y las imagenes de la honda
        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/"+level.background+".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/"+level.foreground+".png");
        game.slingshotImage=loader.loadImage("images/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");

        //Cargar todas las entidades
        for(var i = level.entities.length-1; i>=0;i--){
            var entity = level.entities[i];
            entities.create(entity);
        }

        //Llamar a game start cuando todo este cargado
        if(loader.loaded){
            game.start();
        }else {
            loader.onload = game.start;
        }
    }
}

/*****************
***OBJETO LOADER**
******************/
var loader = {
    loaded:true,
    loadedCount:0,//assets que han sido cargados antes
    totalCount:0,//numero de assets total necesarios a cargar

    init:function(){
        //Comprueba el soporte para sonido
        var mp3Support,oggSupport;
        var audio = document.createElement('audio');
        if (audio.canPlayType) {
            //canPlayType() devuelve: "", "maybe" o "probably"
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');

        }
        else{//la etiqueta de audio no es soportada
            mp3Support = false;
            oggSupport = false;
        }

        //Comprueba para ogg, mp3 y finalmente fija soundFileExtn a indefinido
        loader.soundFileExtn = oggSupport?".gg":mp3Support?".mp3":undefined;
    },

    loadImage:function(url){
        this.totalCount++;
        this.loaded=false;
        $('#loadingscreen').show();
        var image= new Image();
        image.src= url;
        image.onload = loader.itemLoaded;
        return image;
    },

    soundFileExtn:".ogg",
    loadSound:function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src=url+loader.soundFileExtn;
        audio.addEventListener("canplaythrough",loader.itemLoaded,false);
        return audio;
    },

    itemLoaded:function(){
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded ' +loader.loadedCount+' of ' +loader.totalCount);
        if (loader.loadedCount === loader.totalCount){
            //el loader ha cargado completamente..
            loader.loaded=true;
            //Oculta la pantalla de carga
            $('#loadingscreen').hide();
            //y llamamos al metodo loader.onload si este existe
            if(loader.onload){
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}

/*****************
***OBJETO MOUSE***
******************/
var mouse = {
	x:0,
	y:0,
	down:false,
	init:function(){
		$('#gamecanvas').mousemove(mouse.mousemovehandler);
		$('#gamecanvas').mousedown(mouse.mousedownhandler);
		$('#gamecanvas').mouseup(mouse.mouseuphandler);
		$('#gamecanvas').mouseout(mouse.mouseuphandler);
	},
	mousemovehandler:function(ev){
		var offset = $('#gamecanvas').offset();
		
		mouse.x = ev.pageX - offset.left;
		mouse.y = ev.pageY - offset.top;
		
		if (mouse.down) {
			mouse.dragging = true;
		}
	},
	mousedownhandler:function(ev){
		mouse.down = true;
		mouse.downX = mouse.x;
		mouse.downY = mouse.y;
		ev.originalEvent.preventDefault();
		
	},
	mouseuphandler:function(ev){
		mouse.down = false;
		mouse.dragging = false;
	}
}

/******************
**OBJETO ENTITIES**
*******************/
var entities = {
    definitions:{
        "glass":{
            fullHealth:100,
            density:2.4,
            friction:0.4,
            restitution:0.15,
        },
        "wood":{
            fullHealth:500,
            density:0.7,
            friction:0.4,
            restitution:0.4,
        },
        "dirt":{
            density:3.0,
            friction:1.5,
            restitution:0.2,
        },
        "burger":{
            shape:"circle",
            fullHealth:40,
            radius:40,
            density:1,
            friction:0.5,
            restitution:0.4,
        },
        "sodacan":{
            shape:"rectangle",
            fullHealth:80,
            width:40,
            height:60,
            density:1,
            friction:0.5,
            restitution:0.7,
        },
        "fries":{
            shape:"rectangle",
            fullHealth:50,
            width:40,
            height:50,
            density:1,
            friction:0.5,
            restitution:0.6,
        },
        "apple":{
            shape:"circle",
            radius:25,
            density:1.5,
            friction:0.5,
            restitution:0.4,
        },
        "orange":{
            shape:"circle",
            radius:25,
            density:1.5,
            friction:0.5,
            restitution:0.4,
        },
        "strawberry":{
            shape:"circle",
            radius:15,
            density:2.0,
            friction:0.5,
            restitution:0.4,
        }
    },
    //Tomar la entidad, crear un cuerpo Box2D y añadirlo al mundo
    create:function(entity){
        var definition = entities.definitions[entity.name];
        if(!definition){
            console.log("Undefined entity name",entity.name);
            return;
        }
        switch(entity.type){
            case "block": //Rectángulos simples
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.shape = "rectangle";
                entity.sprite = loader.loadImage("../images/entities/"+entity.name+".png");
                entity.breakSound = game.breakSound[entity.name];
                box2d.createRectangle(entity,definition);
                break;
            case "ground": //Rectángulos simples
                entity.shape="rectangle";
                //No es necesario sprites. Estos no serán dibujados
                box2d.createRectangle(entity,definition);
                break;
            case "hero": //Círculos simples
            case "villain": //Pueden ser círculos o rectangulos
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.sprite = loader.loadImage("../images/entities/"+entity.name+".png");
                entity.shape = definition.shape;
                entity.bounceSound = game.bounceSound;
                if(definition.shape == "circle"){
                    entity.radius = definition.radius;
                    box2d.createCircle(entity,definition);
                } else if(definition.shape == "rectangle"){
                    entity.width = definition.width;
                    entity.height = definition.height;
                    box2d.createRectangle(entity,definition);
                }
                break;
            default:
                console.log("Undefined entity type",entity.type);
                break;
        }
    },
    //Tomar la entidad, su posicion y angulo y dibujarlo en el canvas del juego
    draw:function(entity,position,angle){
        game.context.translate(position.x*box2d.scale-game.offsetLeft,position.y*box2d.scale);
        game.context.rotate(angle);
        switch(entity.type){
            case "block":
                game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
                    -entity.width/2-1,-entity.height/2-1,entity.width+2,entity.height+2);
                break;
            case "villain":
            case "hero":
                if(entity.shape="circle"){
                    game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
                        -entity.radius-1,-entity.radius-1,entity.radius*2+2,entity.radius*2+2);
                } else if(entity.shape="rectangle"){
                    game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
                        -entity.width/2-1,-entity.height/2-1,entity.width+2,entity.height+2);
                }
            break;
            case "ground":
                //No hacer nada... Se dibuja por separado
            break;
        }
        game.context.rotate(-angle);
        game.context.translate(-position.x*box2d.scale+game.offsetLeft,-position.y*box2d.scale);
    }
}

/*****************
***OBJETO BOX2D***
******************/
var box2d = {
    scale:30,
    init:function(){
        //Configurar el mundo de box2d que hará la mayoría de ellos cálculo de física
        var gravity = new b2Vec2(0,9.8);//Declara la gravedad como 9.8 m/s^2
        var allowSleep = true; //Permite que los objetos que están en reposo se queden dormidos y se excluyan de los cálculos
        box2d.world = new b2World(gravity,allowSleep);

        //Configurar la depuración del dibujo
        var debugContext = document.getElementById('debugcanvas').getContext('2d');
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(debugContext);
        debugDraw.SetDrawScale(box2d.scale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        box2d.world.SetDebugDraw(debugDraw);
    },
    createRectangle:function(entity,definition){
            var bodyDef = new b2BodyDef;
            if(entity.isStatic){
                bodyDef.type = b2Body.b2_staticBody;
            } else{
                bodyDef.type = b2Body.b2_dynamicBody;
            }

            bodyDef.position.x = entity.x / box2d.scale;
            bodyDef.position.y = entity.y / box2d.scale;
            if(entity.angle){
                bodyDef.angle = Math.PI*entity.angle/180;
            }
            var fixtureDef = new b2FixtureDef;
            fixtureDef.density = definition.density;
            fixtureDef.friction = definition.friction;
            fixtureDef.restitution = definition.restitution;

            fixtureDef.shape = new b2PolygonShape;
            fixtureDef.shape.SetAsBox(entity.width/2/box2d.scale,entity.height/2/box2d.scale);

            var body = box2d.world.CreateBody(bodyDef);
            body.SetUserData(entity);

            var fixture = body.CreateFixture(fixtureDef);
            return body;
    },
    createCircle:function(entity,definition){
        var bodyDef = new b2BodyDef;
        if(entity.isStatic){
            bodyDef.type = b2Body.b2_staticBody;
        } else{
            bodyDef.type = b2Body.b2_dynamicBody;
        }
        bodyDef.position.x = entity.x/box2d.scale;
        bodyDef.position.y = entity.y/box2d.scale;
        if(entity.angle){
            bodyDef.angle = Math.PI*entity.angle/180;
        }
        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;

        fixtureDef.shape = new b2CircleShape(entity.radius/box2d.scale);
        var body = box2d.world.CreateBody(bodyDef);
        body.SetUserData(entity);

        var fixture = body.CreateFixture(fixtureDef);
        return body;
    },
}