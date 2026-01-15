class Blob {
    constructor(x, y, r, color, name = "", isPlayer = false) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.targetPos = this.pos.copy();

        this.r = r;
        this.color = color;
        this.name = name;
        this.isPlayer = isPlayer;
        this.isHunting = false;

        if (!this.isPlayer) {
            this.setNewTarget();
        }
    }

    setNewTarget() {
        const limit = window.boundary || 5000;
        const margin = 300;
        const safeMinX = -limit + margin + 200;
        const safeMaxX = limit - margin - 200;
        const safeMinY = -limit + margin + 200;
        const safeMaxY = limit - margin - 200;
        
        let newX = random(this.pos.x - 600, this.pos.x + 600);
        let newY = random(this.pos.y - 600, this.pos.y + 600);
        
        const nearLeftEdge = Math.abs(this.pos.x - (-limit + margin)) < 200;
        const nearRightEdge = Math.abs(this.pos.x - (limit - margin)) < 200;
        const nearTopEdge = Math.abs(this.pos.y - (-limit + margin)) < 200;
        const nearBottomEdge = Math.abs(this.pos.y - (limit - margin)) < 200;
        
        if (nearLeftEdge) {
            newX = random(this.pos.x + 100, this.pos.x + 800);
        } else if (nearRightEdge) {
            newX = random(this.pos.x - 800, this.pos.x - 100);
        }
        
        if (nearTopEdge) {
            newY = random(this.pos.y + 100, this.pos.y + 800);
        } else if (nearBottomEdge) {
            newY = random(this.pos.y - 800, this.pos.y - 100);
        }
        
        newX = Math.max(safeMinX, Math.min(safeMaxX, newX));
        newY = Math.max(safeMinY, Math.min(safeMaxY, newY));
        
        this.targetPos = new Vector(newX, newY);
    }

    update(mouse, canvas, boostDuration = 0, controlMode = 'mouse', keys = null, hasShield = false, isInOblivionZone = false) {
        this.isHunting = false;

        let baseSpeed = 9.0 / Math.sqrt(this.r / 30);
        let minSpeed = 4.5;
        let maxSpeed = Math.max(baseSpeed, minSpeed);

        let target = new Vector(0, 0);
        
        let lerpFactor = this.isPlayer ? 0.12 : 0.08; 

        if (this.isPlayer && boostDuration > 0) {
            if(window.isChargeBoost){
                maxSpeed *= 2.5;
            } else {
                maxSpeed *= 1.4;
            }
        }

        if (this.isPlayer) {
            if (controlMode === 'mouse') {
                target = new Vector(
                    mouse.x - canvas.width / 2,
                    mouse.y - canvas.height / 2
                );
            } else if (controlMode === 'arrows' && keys) {
                let dx = 0, dy = 0;
                if (keys.KeyA || keys.ArrowLeft) dx -= 1;
                if (keys.KeyD || keys.ArrowRight) dx += 1;
                if (keys.KeyW || keys.ArrowUp) dy -= 1;
                if (keys.KeyS || keys.ArrowDown) dy += 1;
                target = new Vector(dx * 1000, dy * 1000);
            }
        } else {
            const settings = window.DIFFICULTY_SETTINGS[window.difficultyMode];
            const player = window.blob;
            const d = Vector.dist(this.pos, player.pos);

            if (isInOblivionZone) {
                target = this.targetPos.sub(this.pos);
            }
            else {
                let nameHash = 0;
                for (let i = 0; i < this.name.length; i++) {
                    nameHash = ((nameHash << 5) - nameHash) + this.name.charCodeAt(i);
                    nameHash = nameHash & nameHash;
                }
                const isSmart = (Math.abs(nameHash) % 2) === 0;
                
                if (!isSmart) {
                    target = this.targetPos.sub(this.pos);
                    lerpFactor = 0.05;
                    if (Vector.dist(this.pos, this.targetPos) < 400) {
                        this.setNewTarget();
                    }
                } else {
                    const limit = window.boundary || 5000;
                    const margin = 300;
                    const nearEdgeX = Math.abs(this.pos.x - (-limit + margin)) < 200 || Math.abs(this.pos.x - (limit - margin)) < 200;
                    const nearEdgeY = Math.abs(this.pos.y - (-limit + margin)) < 200 || Math.abs(this.pos.y - (limit - margin)) < 200;
                    
                    if (this.r < player.r * 0.95 && d < settings.fleeDistance + this.r * 1.5) {
                        if (nearEdgeX || nearEdgeY) {
                            target = this.targetPos.sub(this.pos);
                            lerpFactor = 0.07;
                            if (Vector.dist(this.pos, this.targetPos) < 400) {
                                this.setNewTarget();
                            }
                        } else {
                            target = this.pos.sub(player.pos);
                            lerpFactor = 0.1;
                        }
                    }
                    else if (this.r > player.r * 1.2) {
                        if (Math.random() < settings.npcAggression) {
                            if (nearEdgeX || nearEdgeY) {
                                target = this.targetPos.sub(this.pos);
                                lerpFactor = 0.07;
                                if (Vector.dist(this.pos, this.targetPos) < 400) {
                                    this.setNewTarget();
                                }
                            } else {
                                target = player.pos.sub(this.pos);
                                this.isHunting = true;
                                lerpFactor = 0.06 + settings.npcAggression * 0.05; 
                            }
                        } else {
                            target = this.targetPos.sub(this.pos);
                            lerpFactor = 0.05;
                            if (Vector.dist(this.pos, this.targetPos) < 400) {
                                this.setNewTarget();
                            }
                        }
                    }
                    else {
                        target = this.targetPos.sub(this.pos);
                        lerpFactor = 0.05;
                        if (Vector.dist(this.pos, this.targetPos) < 400) {
                            this.setNewTarget();
                        }
                    }
                }
            }
        }

        target.setMag(maxSpeed);
        this.vel.lerp(target, lerpFactor);
        
        if (!this.isPlayer) {
            this.vel.mult(0.99); 
        }
        
        this.pos.add(this.vel);

        const limit = window.boundary || 5000;
        const margin = this.isPlayer ? 0 : 300;
        const oldX = this.pos.x;
        const oldY = this.pos.y;
        this.pos.x = constrain(this.pos.x, -limit + margin, limit - margin);
        this.pos.y = constrain(this.pos.y, -limit + margin, limit - margin);
        
        if (!this.isPlayer) {
            if (oldX !== this.pos.x || oldY !== this.pos.y) {
                this.vel.x *= 0.5;
                this.vel.y *= 0.5;
                const distToTarget = Vector.dist(this.pos, this.targetPos);
                if (distToTarget < 450 || Math.abs(this.pos.x - (-limit + margin)) < 250 || Math.abs(this.pos.x - (limit - margin)) < 250 ||
                    Math.abs(this.pos.y - (-limit + margin)) < 250 || Math.abs(this.pos.y - (limit - margin)) < 250) {
                    this.setNewTarget();
                }
            } else {
                const distToTarget = Vector.dist(this.pos, this.targetPos);
                if (distToTarget < 300) {
                    this.setNewTarget();
                }
            }
        }
    }

    eats(other) {
        const d = Vector.dist(this.pos, other.pos);
        const touchDistance = this.r + other.r;

        if (this.r > other.r && d < touchDistance) {
            const sumArea =
                Math.PI * this.r * this.r +
                Math.PI * other.r * other.r;

            this.r = Math.sqrt(sumArea / Math.PI);
            return true;
        }
        return false;
    }

    draw(ctx, hasShield = false) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
        ctx.fill();

        if (this.name === "Charge") {
            ctx.fillStyle = "#FFD700";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `${this.r * 1.2}px Arial, sans-serif`;
            ctx.fillText("⚡", this.pos.x, this.pos.y);
        }

        if (this.isPlayer && hasShield) {
            ctx.lineWidth = 10;
            ctx.strokeStyle = "rgba(255,215,0,0.8)";
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.r + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.r > 16) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#000";
            ctx.stroke();
        }

        if (this.r > 25 && this.name !== "" && this.name !== "Charge") {
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `${this.r / 3.5}px Poppins, sans-serif`;
            ctx.fillText(this.name, this.pos.x, this.pos.y + this.r * 0.15);
        }
    }
}