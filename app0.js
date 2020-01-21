


var vehicules = [];
var planets = [];

var debug = true;

var last_spawn = 0;
var gScore = 0;

var fks = [];

function setup() {
  //createCanvas(800, 600);
  createCanvas(800, 600);
  //createCanvas(windowWidth, windowHeight);


  //planets.push( new Planet(width/2+random(-50,50), height/2+random(-50,50)));

  while(planets.length < 3){
    var tmpPlanet = new Planet(width/2+random(-150,150), height/2+random(-150,150));
    var tmpPlanet = new Planet(random(100,width-100), random(100,height-100));

    var tmpDist = planets.map(e=>tmpPlanet.position.dist(e.position)).sort((a,b)=>a-b);

    if(tmpDist[0] > 180 || planets.length == 0){
      planets.push(tmpPlanet)
    }
  }


  //vehicules.push( new Vehicule(width/2, height/2, 0.6, 0.1));
  //vehicules.push( new Vehicule(width/2+random(-100,100), height/2+random(-100,100), 0.6, 0.1));

  vehicules.push( new Vehicule(width/2, height/2, 0.2, 0.1, planets));
  /*
  while(vehicules.length < 8){
    var tmpVehicle = new Vehicule(width/2, height/2, 0.6, 0.1);
    var tmpDist = vehicules.map(e=>tmpVehicle.position.dist(e.position)).sort((a,b)=>a-b);
    if(tmpDist[0] > 40){
      vehicules.push(tmpVehicle)
    }
  }
  */
 


}



function draw() {
 
  //console.log(gLastShot)
  background(51);

  fill(color(255,255,0));textAlign(LEFT, TOP);
  textSize(20)
  text("B:002",20,10);

  fill(color(255,255,0));textAlign(LEFT, TOP);
  textSize(40)
  text(gScore,20,60);


  if(frameRate() != 0){
    last_spawn += (1/frameRate());  
  }
  

  for (var i = planets.length - 1; i >= 0; i--) {
   
    planets[i].run();
  }

  for (var i = vehicules.length - 1; i >= 0; i--) {

    //console.log(vehicules[i].path)
    if(vehicules[i].path.length > 0){
      var arrd = vehicules[i].seek(vehicules[i].path[0]);
      if(arrd < 4){
        vehicules[i].path.shift(0);
      }
    }
    
    
    vehicules[i].run();
    vehicules[i].boundaries();
  }


  push();
  for (var i = fks.length-1; i >= 0; i--) {
    fks[i].update();
    fks[i].show();
    if (fks[i].done())
      fks.splice(i, 1);
  }
  pop()

  
  /*
  console.log(planets.map(function(e){
   return ((degrees(vehicules[0].velocity.heading()-e.dir.heading())%360)-90)%360
  }))
  */



  //Collision check - vehicule-vehicule
  for (var idxC=0; idxC<vehicules.length; idxC++) {
    var colls  = vehicules.filter((v,i,a)=> i!=idxC && vehicules[idxC].position.dist(v.position) <= 30);
    for(var i=0;i<colls.length;i++){
      colls[i].collided = true
      fks.push(new Firework(colls[i].position.x, colls[i].position.y))
    }
  }
  vehicules = vehicules.filter((v,i,a)=>v.collided != true);
   

  //Just for display purpose
  for (var idxC=0; idxC<vehicules.length; idxC++) {
    vehicules[idxC].angb = null;
  }

  //Collision check - vehicule-planet
  for (var idxC=0; idxC<planets.length; idxC++) {
    //var colls  = vehicules.filter((v,i,a)=> planets[idxC].position.dist(v.position) <= 25  && abs( ((degrees(v.velocity.heading()-planets[idxC].dir.heading())%360)-90)%360) < 45);
    var colls  = vehicules.filter((v,i,a)=> planets[idxC].position.dist(v.position) <= 25);
    for(var vi=0;vi<colls.length;vi++){
      colls[vi].angb  = (colls[vi].velocity.heading() - planets[idxC].dir.heading()) - (PI/2)
      colls[vi].angb = degrees(colls[vi].angb)
      colls[vi].angb = (colls[vi].angb + 180) % 360 - 180
    }
    
    colls = colls.filter((v,i,a)=>v.angb <= 60);
    for(var i=0;i<colls.length;i++){
      colls[i].finished = true
      gScore += 1;
    }
    
  }
  vehicules = vehicules.filter((v,i,a)=>v.finished != true);


  //Spawn a new vehicule
  if(last_spawn >= random(3,5)){
    if(random()< 0.02 + (gScore/100) ){
      while(true){
        var ltmpVehicule =  new Vehicule(width/2, height/2, 0.2, 0.1, planets);
        var tmpDist_V = vehicules.map(e=>ltmpVehicule.position.dist(e.position)).sort((a,b)=>a-b);
        var tmpDist_P = planets.map(e=>ltmpVehicule.position.dist(e.position)).sort((a,b)=>a-b);
        if(tmpDist_V[0] > 120 && tmpDist_P[0] > 120){
          vehicules.push(ltmpVehicule);
          last_spawn = 0;
          break;
        }
      }
      
    }  
  }
  
}


var gSelectedVehicle = null;

function touchStarted() {
  //console.log("touchStarted");
  var mousePoint = createVector(mouseX,mouseY);

  gSelectedVehicle = null;
  for(var i=0;i<vehicules.length;i++){
    var d = mousePoint.dist(vehicules[i].position);
    if(d<=vehicules[i].r+50){
      gSelectedVehicle = vehicules[i];
      gSelectedVehicle.path = [];
      break;
    }  
  } 
}

function touchMoved() {
  //console.log("touchMoved");
  if(gSelectedVehicle==null){return;}

  var newPoint = createVector(mouseX,mouseY);
  if(gSelectedVehicle.path.length == 0){
    gSelectedVehicle.path.push(newPoint);
  }
  else{
    var d = newPoint.dist(gSelectedVehicle.path[gSelectedVehicle.path.length-1]);  
    if(d>=10){
      gSelectedVehicle.path.push(newPoint);
    }
  }
}



function mousePressed() {
  //console.log("Pressed")
  var mousePoint = createVector(mouseX,mouseY);

  gSelectedVehicle = null;
  for(var i=0;i<vehicules.length;i++){
    var d = mousePoint.dist(vehicules[i].position);
    if(d<=vehicules[i].r+50){
      gSelectedVehicle = vehicules[i];
      gSelectedVehicle.path = [];
      break;
    }  
  } 
}

function mouseReleased() {
  //console.log("Released")  
}


function mouseMoved() {

}


function mouseDragged() {
  if(gSelectedVehicle==null){return;}

  var newPoint = createVector(mouseX,mouseY);
  if(gSelectedVehicle.path.length == 0){
    gSelectedVehicle.path.push(newPoint);
  }
  else{
    var d = newPoint.dist(gSelectedVehicle.path[gSelectedVehicle.path.length-1]);  
    if(d>=10){
      gSelectedVehicle.path.push(newPoint);
    }
  }
  
  
  //gTMPPath.addPoint(mouseX, mouseY);
  //console.log("Drag",mouseX, mouseY)
}






//======================================
function Firework(x,y) {
  this.hu = random(255);
  this.firework = new Particle(x,y, this.hu, true);
  this.exploded = false;
  this.particles = [];
  this.gravity  = createVector(0, -0.1);
  
  
  this.done = function() {
    if (this.exploded && this.particles.length === 0){
  return true;
  }else {
    return false;
  }
  }
  this.update = function() { //firstUpdate
    if (!this.exploded) {
      /*
      this.firework.applyForce(this.gravity);
      this.firework.update();
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
      */
      this.exploded = true;
        this.explode();
    }
 for (var i = this.particles.length-1; i >= 0; i--) {
      this.particles[i].applyForce(this.gravity);
      this.particles[i].update();
   if (this.particles[i].done()){
     this.particles.splice(i, 1);
   }
    }
  }
  
  this.explode = function() {
    for (var i = 0; i < 50; i++) {
      var p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
      this.particles.push(p);
    }     
  }
  this.show = function() {
    if (!this.exploded) {
      this.firework.show();
    }
    for (var i = this.particles.length-1; i >= 0; i--) {
      this.particles[i].show();
    }
  }
}

function Particle(x, y, hu, firework) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 80;
    this.hu = hu;

  if (this.firework){
   this.vel = createVector(0, random(-12, -8));
 }else {
   this.vel = p5.Vector.random2D();
   this.vel.mult(random(2, 10));
 }
  
  this.acc = createVector(0, 0);
 
  this.applyForce = function(force) {
    this.acc.add(force);
  }

  this.update = function() { //second update
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  this.done = function(){
    if(this.lifespan < 0){
      return true;
    }else {
      return false;
    }
  }
  this.show = function() {
   colorMode(HSB);
    if (!this.firework) {
     strokeWeight(2);
     stroke(hu, 255, 255, this.lifespan);
   }else {
     strokeWeight(4);
     stroke(hu, 255, 255);
   }
    point(this.pos.x, this.pos.y);
   
  }
}