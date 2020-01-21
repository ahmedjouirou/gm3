

class Planet {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.r = 60;
    this.color = hslToRgb(random(0,1),1,0.5,255);
    this.maxspeed =  4;
    this.maxforce =  0.1;

    this.dir = createVector(random(-1,1),random(-1,1))
    this.dir.setMag(70);

  }

  run() {
    this.update();
    this.display();
  }

  
  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
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


  display() {
    // Draw a triangle rotated in the direction of velocity

    let theta = this.velocity.heading() + PI / 2;
    fill(this.color);
    stroke(255);
    strokeWeight(1);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    circle(0,0,this.r)
    stroke(color(255,0,0));
    line(0,0,this.dir.x, this.dir.y)
    pop();
  }

}
