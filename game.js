//preparar requestAnimationFrame y cancelAnimationFrame
(function() {
    var lastTime=0;
    var vendors = ['ms','moz','webkit','o'];
    for (var x=0;x<vendors.length && !window.requestAnimationFrame; ++x){
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] ||  window[vendors[x]+'CancelRequestAnimationFrame'];
         
    }

    if(!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback,element){
            var currTime= newDate().getTime();
            var timeToCall = Math.max(0,16- (currTime - lastTime));
            var id = window.setTimeout(function(){ callback(currTime + timeToCall);},
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id){
            clearTimeout(id);
        };
    
}

());

$(window).load(function(){
    game.init();/*necesario para evitar
    comportamientos inesperados, tales como errores
    JavaScript*/
    
});

var game={
    /*comenzar inicialización de objetos, precarga de elementos
    y pantalla de inicio*/
    init:function (){
        /*Ocultar todas las capas del juego y
        mostrar la pantalla de incio */
        levels.init();
        loader.init();
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
	
		game.startBackgroundMusic();
	
		game.mode = "intro";	
		game.offsetLeft = 0;
		game.ended = false;
		game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
	},		

    handlePanning:function(){
        game.offsetLeft++;//marcador de posicion temporal, mantiene la panoramica a la derecha
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

        // Dibujar el frente de la honda
		game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

		if (!game.ended){
			game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
		}
    }


}

/*El objeto levels tiene un array
con información acerca de cada
nivel */
var levels = {
    data:[
        {//Primer nivel
            foreground:'desert-foreground',
            background:'clouds-background',
            entities:[]
        },

        {//Segundo nivel
            foreground:'desert-foreground',
            background:'clouds-background',
            entities:[]
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
    //carga todos los datos e imagenes de un nivel
    load:function(number){
        //declarar un nuevo objeto de nivel actual
        game.currentLevel = {number:number,hero:[]};
        game.score=0;
        $('#score').html('Score: ' +game.score);
        var level = levels.data[number];

        //Carga el fondo, el primer plano y las imagenes de la honda
        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/"+level.background+".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/"+level.foreground+".png");
        game.slingshotImage=loader.loadImage("images/slingshot.png");
        game.slingshotFrontImage = loader,loadImage("images/slingshot-front.png");

        //llamar a game start cuando todo este cargado
        if(loader.loaded){
            game.start();
        }else {
            loader.onload = game.start;
        }
    }
}

var loader = {
    loaded:true,
    loadedCount:0,//assets que han sido cargadps antes
    totalCount:0,//numero de assets total necesarios a cargar

    init:function(){
        //Comprueba el soporte para sonido
        var mp3Support,oggSupport;
        var audio = document.createElement('audio');
        if (audio.canPlayType) {
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');

        }
        else{//la etiqueta de audio no es soportada
            mp3Support = false;
            oggSupport = false;
        }

        //Comprueba para ogg, mp3 y finalmente fija sound
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
        loader.loadImage++;
        $('#loadingmessage').html('Loaded ' +loader.loadedCount+' of' +loader.totalCount);
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

