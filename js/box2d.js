//Declarar objetos utilizados como variables
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;

////Es el corazón del Box2D. 
// Cotiene metodos para:
// -Añadir y eliminar objetos
// -Simular la fisia a traves de pasos incrementales
// -Una opcion para dibujar el mundo sobre el canvas
// Es necesario crear el objeto b2World en a funcion init()
var b2World = Box2D.Dynamics.b2World; 
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var world;
var scale = 30; //30 pixeles en el canvas equivalen a 1 metro en el mundo Box2d
function init(){
	//Configuracion del mundo Box2d que realizara la mayor parte del calculo de la fisica
	var gravity = new b2Vec2(0,9.8);//Declara la gravedad como 9.8 m/s^2
	var allowSleep = true; //Permite que los objetos que estan en reposo se queden dormidos y se excluyan de los calculos

	world = new b2World(gravity,allowSleep);

	createFloor();
	//Crear algunos cuerpos con formas simples
	createRectangularBody();
	createCircularBody();
	createSimplePolygon();
	createComplexBody();
	createRevoluteJoint();
	
	setupDebugDraw();
	animate();
}

var timeStep = 1/60;
//La iteration sugerida para Box2D es 8 para la velocidad y 3 para la posicion
var velocityIterations = 8;
var positionIterations = 3;
function animate(){
	world.Step(timeStep,velocityIterations,positionIterations);
	world.ClearForces();
	world.DrawDebugData();

	setTimeOut(animete,timeStep);
}

var context;
function setupDebugDraw(){
	context = document.getElementById('canvas').getContext('2d');

	var debugDraw = new b2DebugDraw();

	//Utilizar este contexto para dibujar la pantalla de depuracion
	debugDraw.setSprite(context);
	//Fijar la escala
	debugDraw.SetDrawScale(scale);
	//Rellenar las cajas con transparencia de 0.3
	debugDraw.SetFillAlpha(0.3);
	//Dibujar lineas con espesor de 1
	debugDraw.SetLineThickness(1.0);
	//Mostrar todas las formas y uniones
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

	//Empezar a utilizar el dibujo de depuracion en el mundo
	world.SetDebugDraw(debugDraw);
}

//Crea el suelo
function createFloor(){
	//Una definicion Body que tiene todos los datos necesarios para construir un cuerpo rigido
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = 640/2/scale;
	bodyDef.position.y = 450/scale;

	//Un accesorio se utiliza para unir una forma a un cuerpo para la deteccion de colisiones
	//La definicion de un accesorio se utiliza para crear un fixture

	var fixtureDef = new b2FixtureDef; //contiene los valores necesarios para añadir la forma
	fixtureDef.density = 1.0; //se usa para calcular el peso
	fixtureDef.friction = 0.5; //para asegurar que el cuerpo se escurre de forma realista
	fixtureDef.restitution = 0.2; //para hacer que el cuerpo rebote. 0 ->no rebote 1->el cuerpo mantenga mas su momentum

	fixtureDef.shape = new b2PolygonShape; //se fija la forma del objeto como poligono.

		//b2PolygonShape tiene un metodo helper llamado SetAsBox 
	//que fija el poligono como una caja centrada en el origen del cuerpo padre 
	//y toma ancho y alto de la caja como parametros

	fixtureDef.shape.SetAsBox(320/scale,10/scale);

	//Finalmente se crea el body pasando bodyDef a world.CreateBody() y
	//se crea el accesorio pasando el fixtureDef a body.CreateFixture()
	var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixtureDef);
}

//Crea una forma rectangular
function createRectangularBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 40/scale;
	bodyDef.position.y = 100/scale;

	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.3;

	fixtureDef.shape = new b2PolygonShape;
	fixtureDef.shape.SetAsBox(30/scale,50/scale);

	var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixtureDef);
}
//Crea una forma circular
function createCircularBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 130/scale;
	bodyDef.position.y = 100/scale;

	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.7;

	fixtureDef.shape = new b2CircleShape(30/scale);

	var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixtureDef);
}
//Crea un polígono simple (union de puntos)
function createSimplePolygon(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 230/scale;
	bodyDef.position.y = 50/scale;

	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.2;

	fixtureDef.shape=new b2PolygonShape;
	//crear un array de puntos b2Vec2 en la direccion de las agujas del reloj
	var points = [
		new b2Vec2(0,0),
		new b2Vec2(40/scale,50/scale),
		new b2Vec2(50/scale,100/scale),
		new b2Vec2(-50/scale,100/scale),
		new b2Vec2(-40/scale,50/scale),
	];
	// Usar SetAsArray para definir la forma utilizando el array de puntos
	fixtureDef.shape.SetAsArray(points,points.length);

	var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixture);
}

//Crea un poligono complejo (union de dos formas)
function createComplexBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type=b2Body.b2_dynamicBody;
	bodyDef.position.x=350/scale;
	bodyDef.position.y=50/scale;
	var body = world.CreateBody(bodyDef);

	//Crear el primer accesorio y añadir una forma circular al cuerpo
	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.7;
	fixtureDef.shape = new b2CircleShape(40/scale);
	body.CreateFixture(fixtureDef);

	//Crear el segundo accesorio y añadir una forma poligonal al cuerpo
	var points = [
		new b2Vec2(0,0),
		new b2Vec2(40/scale,50/scale),
		new b2Vec2(50/scale,100/scale),
		new b2Vec2(-50/scale,100/scale),
		new b2Vec2(-40/scale,50/scale),
	];
	fixtureDef.shape.SetAsArray(points,points.length);
	body.CreateFixture(fixtureDef);
}

/*Conectar cuerpos con artefactos
Box2D soporta muchos tipos de articulaciones como pulley
(polea), gear (engranaje), distance (distancia), revolute
(revolución) y weld (soldadura).
*/

function createRevoluteJoint(){
	//Definir el primer cuerpo
	//-----------------------
	var bodyDef1 = new b2BodyDef;
	bodyDef1.type=b2Body.b2_dynamicBody;
	bodyDef1.position.x=480/scale;
	bodyDef1.position.y=50/scale;
	var body1 = world.CreateBody(bodyDef1);

	//Crear el primer accesorio y añadir una forma rectangular al cuerpo
	var fixtureDef1 = new b2FixtureDef;
	fixtureDef1.density = 1.0;
	fixtureDef1.friction = 0.5;
	fixtureDef1.restitution = 0.5;
	fixtureDef1.shape = new b2PolygonShape;
	fixtureDef1.shape.setAsBox(50/scale,10/scale);

	body1.CreateFixture(fixtureDef);

	//Definir el segundo cuerpo
	//-------------------------
	var bodyDef2 = new b2BodyDef;
	bodyDef2.type=b2Body.b2_dynamicBody;
	bodyDef2.position.x=470/scale;
	bodyDef2.position.y=50/scale;
	var body2 = world.CreateBody(bodyDef2);

	//Crear el segundo accesorio y añadir un poligono
	var fixtureDef2 = new b2FixtureDef;
	fixtureDef2.density = 1.0;
	fixtureDef2.friction = 0.5;
	fixtureDef2.restitution = 0.5;
	fixtureDef2.shape = new b2PolygonShape;
		var points = [
		new b2Vec2(0,0),
		new b2Vec2(40/scale,50/scale),
		new b2Vec2(50/scale,100/scale),
		new b2Vec2(-50/scale,100/scale),
		new b2Vec2(-40/scale,50/scale),
	];
	fixtureDef2.shape.SetAsArray(points,points.length);
	body2.CreateFixture(fixtureDef2);

	//Crear una articulacion entre el body1 y el body2
	var jointDef = new b2RevoluteJointDef;
	var jointCenter = new b2Vec2(470/scale,50/scale);

	jointDef.Initialize(body1,body2,jointCenter);
	world.CreateJoint(joinDef);

}