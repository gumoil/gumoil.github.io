var dom = document.getElementById;
var iex = document.all;

function eeSaddEvent(event, method) {
    this[event] = method;
}
function eeSremoveEvent(event) {
    this[event] = null;
}
function eeSgetElement(name, nest) {
    nest = nest ? "document." + nest + ".": "";
    var el = dom ? document.getElementById(name): iex ? document.all[name]: false;
    el.css = el.style;
    el.getTop = function() {
        return parseInt(el.css.top) || 0
    };
    el.setTop = function(y) {
        el.css.top = y + "px"
    };
    el.getHeight = function() {
        return el.offsetHeight
    };
    el.getClipHeight = function() {
        return el.offsetHeight
    };
    el.hideVis = function() {
        el.css.visibility = "hidden"
    };
    el.eeSaddEvent = eeSaddEvent;
    el.eeSremoveEvent = eeSremoveEvent;
    return el;
}
function getYMouse(e) {
    if ( ! e)
        var e = window.event;
    if (e.PageY)
        return e.pageY;
    else if (e.clientY)
        return e.clientY + document.body.scrollTop;
}

document.eeSaddEvent = eeSaddEvent;
document.eeSremoveEvent = eeSremoveEvent;

// ||||||||||||||||||||||||||||||||||||||||||||||||||
// Scroller Class

ScrollObj = function(speed, dragHeight, trackHeight, trackObj, upObj, downObj, dragObj, contentMaskObj, contentObj) {
    this.speed = speed;
    this.dragHeight = dragHeight;
    this.trackHeight = trackHeight;
    this.trackObj = eeSgetElement(trackObj);
    this.upObj = eeSgetElement(upObj);
    this.downObj = eeSgetElement(downObj);
    this.dragObj = eeSgetElement(dragObj);
    this.contentMaskObj = eeSgetElement(contentMaskObj);
    this.contentObj = eeSgetElement(contentObj, contentMaskObj);
    this.obj = contentObj + "Object";
    eval(this.obj + "=this");
    
    this.trackTop = this.dragObj.getTop();
    this.trackLength = this.trackHeight - this.dragHeight;
    this.trackBottom = this.trackTop + this.trackLength;
    this.contentMaskHeight = this.contentMaskObj.getClipHeight();
    this.contentHeight = this.contentObj.getHeight();
    this.contentLength = this.contentHeight - this.contentMaskHeight;
    this.scrollLength = this.trackLength / this.contentLength;
    this.scrollTimer = null;
    
    if (this.contentHeight <= this.contentMaskHeight) {
        this.dragObj.hideVis();
        this.upObj.hideVis();
        this.downObj.hideVis();
        this.trackObj.hideVis();
    } else {
        var self = this;
        this.trackObj.eeSaddEvent("onmousedown", function(e) {
            self.scrollJump(e);
            return false
        });
        this.upObj.eeSaddEvent("onmousedown", function() {
            self.scroll(self.speed);
            return false
        });
        this.upObj.eeSaddEvent("onmouseup", function() {
            self.stopScroll()
            });
        this.upObj.eeSaddEvent("onmouseout", function() {
            self.stopScroll()
            });
        this.downObj.eeSaddEvent("onmousedown", function() {
            self.scroll( - self.speed);
            return false
        });
        this.downObj.eeSaddEvent("onmouseup", function() {
            self.stopScroll()
            });
        this.downObj.eeSaddEvent("onmouseout", function() {
            self.stopScroll()
            });
        this.dragObj.eeSaddEvent("onmousedown", function(e) {
            self.startDrag(e);
            return false
        });
        if (iex)
            this.dragObj.eeSaddEvent("ondragstart", function() {
            return false
        });
    }
}
ScrollObj.prototype.startDrag = function(e) {
    this.dragStartMouse = getYMouse(e);
    this.dragStartOffset = this.dragObj.getTop();
    var self = this;
    document.eeSaddEvent("onmousemove", function(e) {
        self.drag(e)
        });
    document.eeSaddEvent("onmouseup", function() {
        self.stopDrag()
        });
}
ScrollObj.prototype.stopDrag = function() {
    document.eeSremoveEvent("onmousemove");
    document.eeSremoveEvent("onmouseup");
}
ScrollObj.prototype.drag = function(e) {
    var currentMouse = getYMouse(e);
    var mouseDifference = currentMouse - this.dragStartMouse;
    var dragDistance = this.dragStartOffset + mouseDifference;
    var dragMovement = (dragDistance < this.trackTop) ? this.trackTop: (dragDistance > this.trackBottom) ? this.trackBottom: dragDistance;
    this.dragObj.setTop(dragMovement);
    var contentMovement = -(dragMovement - this.trackTop) * (1 / this.scrollLength);
    this.contentObj.setTop(contentMovement);
}
ScrollObj.prototype.scroll = function(speed) {
    var contentMovement = this.contentObj.getTop() + speed;
    var dragMovement = this.trackTop - Math.round(this.contentObj.getTop() * (this.trackLength / this.contentLength));
    if (contentMovement > 0) {
        contentMovement = 0;
    } else if (contentMovement < -this.contentLength) {
        contentMovement = -this.contentLength;
    }
    if (dragMovement < this.trackTop) {
        dragMovement = this.trackTop;
    } else if (dragMovement > this.trackBottom) {
        dragMovement = this.trackBottom;
    }
    this.contentObj.setTop(contentMovement);
    this.dragObj.setTop(dragMovement);
    this.scrollTimer = window.setTimeout(this.obj + ".scroll(" + speed + ")", 25);
}
ScrollObj.prototype.stopScroll = function() {
    if (this.scrollTimer) {
        window.clearTimeout(this.scrollTimer);
        this.scrollTimer = null;
    }
}
ScrollObj.prototype.scrollJump = function(e) {
    
    var currentMouse = getYMouse(e);
    var dragDistance = currentMouse - findPosY(this.trackObj);
    var dragMovement = (dragDistance < this.trackTop) ? this.trackTop: (dragDistance > this.trackBottom) ? this.trackBottom: dragDistance;
    this.dragObj.setTop(dragMovement);
    var contentMovement = -(dragMovement - this.trackTop) * (1 / this.scrollLength);
    this.contentObj.setTop(contentMovement);
    
}
// findPosY from http://www.quirksmode.org
function findPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
        }
    } else if (obj.y) {
        curtop += obj.y;
    }
    return curtop;
}