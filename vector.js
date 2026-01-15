class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    setMag(m) {
        if (this.mag() === 0) return this;
        const currentMag = this.mag();
        this.x = (this.x / currentMag) * m;
        this.y = (this.y / currentMag) * m;
        return this;
    }

    lerp(target, amount) {
        this.x = this.x + (target.x - this.x) * amount;
        this.y = this.y + (target.y - this.y) * amount;
        return this;
    }
    
    copy() {
        return new Vector(this.x, this.y);
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    static dist(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
}