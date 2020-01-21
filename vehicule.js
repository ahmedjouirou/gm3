

class Vehicule {
  constructor(x, y, ms, mf, pPlanets) {
    this.position = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(1, 0);
    this.velocity = createVector(random(-1,1), random(-1,1));
    this.r = 6;
    this.color = hslToRgb(random(0,1),1,0.5,255);
    this.color = random(pPlanets).color
    this.maxspeed = ms || 4;
    this.maxforce = mf || 0.1;

    this.path = [];


    var lPoss = [ 
    createVector(-10, random(0,height)), 
    createVector(width+10, random(0,height)),
    createVector(random(0,width), -10),
    createVector(random(0,width), height+10)
    ]
    this.position = random(lPoss)
    this.maxspeed = random(0.2,0.5);

    this.seek( createVector( width/2+random(-100,100),height/2+random(-100,100) ) )

  }

  run() {
    this.update();
    this.display();
  }

  // This function implements Craig Reynolds' path following algorithm
  // http://www.red3d.com/cwr/steer/PathFollow.html
  follow(p) {


    // Predict location 50 (arbitrary choice) frames ahead
    // This could be based on speed
    let predict = this.velocity.copy();
    predict.normalize();
    predict.mult(50);
    let predictLoc = p5.Vector.add(this.position, predict);

    // Now we must find the normal to the path from the predicted location
    // We look at the normal for each line segment and pick out the closest one

    let normal = null;
    let target = null;
    let worldRecord = 1000000; // Start with a very high record distance that can easily be beaten

    // Loop through all points of the path
    for (let i = 0; i < p.points.length - 1; i++) {

      // Look at a line segment
      let a = p.points[i];
      let b = p.points[i + 1];
      //println(b);

      // Get the normal point to that line
      let normalPoint = getNormalPoint(predictLoc, a, b);
      // This only works because we know our path goes from left to right
      // We could have a more sophisticated test to tell if the point is in the line segment or not
      if (normalPoint.x < a.x || normalPoint.x > b.x) {
        // This is something of a hacky solution, but if it's not within the line segment
        // consider the normal to just be the end of the line segment (point b)
        normalPoint = b.copy();
      }

      // How far away are we from the path?
      let distance = p5.Vector.dist(predictLoc, normalPoint);
      // Did we beat the record and find the closest line segment?
      if (distance < worldRecord) {
        worldRecord = distance;
        // If so the target we want to steer towards is the normal
        normal = normalPoint;

        // Look at the direction of the line segment so we can seek a little bit ahead of the normal
        let dir = p5.Vector.sub(b, a);
        dir.normalize();
        // This is an oversimplification
        // Should be based on distance to path & velocity
        dir.mult(10);
        target = normalPoint.copy();
        target.add(dir);
      }
    }

    // Only if the distance is greater than the path's radius do we bother to steer
    if (worldRecord > p.radius && target !== null) {
      this.seek(target);
    }

    // Draw the debugging stuff
    if (debug) {
      // Draw predicted future location
      stroke(255);
      fill(200);
      line(this.position.x, this.position.y, predictLoc.x, predictLoc.y);
      ellipse(predictLoc.x, predictLoc.y, 4, 4);

      // Draw normal location
      stroke(255);
      fill(200);
      ellipse(normal.x, normal.y, 4, 4);
      // Draw actual target (red if steering towards it)
      line(predictLoc.x, predictLoc.y, normal.x, normal.y);
      if (worldRecord > p.radius) fill(255, 0, 0);
      noStroke();
      ellipse(target.x, target.y, 8, 8);
    }
  }


  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the position to the target

    // If the magnitude of desired equals 0, skip out of here
    // (We could optimize this to check if x and y are 0 to avoid mag() square root
    if (desired.mag() === 0) return;

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);

    //Arrival behaviour
    var d = this.position.dist(target);
    if(d<4 && 0==1){ //TODO !!!
      desired.setMag(map(d,0,10,0,this.maxspeed));
    }
    else{
      desired.setMag(this.maxspeed);
    }

    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force

    this.applyForce(steer);
    return d;
  }

  // Method to update position
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelerationelertion to 0 each cycle
    this.acceleration.mult(0);
  }

  // Wraparound
  borders(p) {
    if (this.position.x > p.getEnd().x + this.r) {
      this.position.x = p.getStart().x - this.r;
      this.position.y = p.getStart().y + (this.position.y - p.getEnd().y);
    }
  }
  boundaries() {
    var d = 5;
    var desired = null;
    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  }

  display() {
    // Draw a triangle rotated in the direction of velocity
    for(var i =0;i<this.path.length;i++){
      //noStroke();
      //fill(255);
      //ellipse(this.path[i].x, this.path[i].y, 2,2);
      stroke(255)
      if(i==0){
        line(this.position.x, this.position.y, this.path[i].x, this.path[i].y);
      }
      else{
        line(this.path[i-1].x, this.path[i-1].y, this.path[i].x, this.path[i].y)
      }
    }
    let theta = this.velocity.heading() + PI / 2;
    fill(this.color);
    stroke(255);
    strokeWeight(1);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    push();
    noFill();
    circle(0,0,50);
    pop();
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();

    push();
    translate(this.position.x, this.position.y);
    noFill()
    stroke(color(255,0,0))
    var lh = createVector(this.velocity.x, this.velocity.y)
    lh.setMag(50);
    line(0,0,lh.x,lh.y);
    fill(255)
    textSize(10)
    if(this.angb != null){
      ///text(parseInt(this.angb),0,30)
    }
    pop();
  }

}

// A function to get the normal point from a point (p) to a line segment (a-b)
// This function could be optimized to make fewer new Vector objects
function getNormalPoint(p, a, b) {
  // Vector from a to p
  let ap = p5.Vector.sub(p, a);
  // Vector from a to b
  let ab = p5.Vector.sub(b, a);
  ab.normalize(); // Normalize the line
  // Project vector "diff" onto line by using the dot product
  ab.mult(ap.dot(ab));
  let normalPoint = p5.Vector.add(a, ab);
  return normalPoint;
}