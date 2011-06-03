var j = window.j = jQuery;

/*
{
  parent: null,
  node: 'box',
  construct: 'join',
  left: {
    parent:  
    node: 'box',
    ...
  },
  right: {
    parent: null
    node: 'box',
    ...
  }
}

[
  box,
  [construct],
  left,
  [
    box,
    [construct],
    left,
    right
  ]
]
*/


j(function() {

  var main   = j('#main');
  var width  = main.width();
  var height = main.height();

  var paper = window.paper = Raphael('main', width, height);
  var p = paper.rect(0, 0, width, height).attr({fill: 'white'});

  p.click(function(ev) {
      create_box(ev.x, ev.y);
  });
});

function create_box(x, y) {

  var box = {
    rect:  paper.rect(x, y, 100, 50, 10).attr({fill: 'green'}),
    top:   paper.circle(x+50, y+0, 7).attr({fill: 'red'}),
    left:  paper.circle(x+0, y+50, 7).attr({fill: 'red'}),
    right: paper.circle(x+100, y+50, 7).attr({fill: 'red'})
  };

  box.rect.attr({
    gradient:           '90-#526c7a-#64a0c1',
    stroke:             '#3b4449',
    'stroke-width':     5,
    'stroke-linejoin':  'round',
  });

  return assign_events(box);
}

function assign_events(box) {

  return assign_drag_events(
    box, assign_child_spawn_events(box));
}

function link_to_parent(box, which, child) {

  var parent = box[which];

  box[which + 'Child'] = child;
  box.parent = parent;

  var fromx = parent.attrs.cx;
  var fromy = parent.attrs.cy;

  var tox = child.top.attrs.cx;
  var toy = child.top.attrs.cy;

  var link = paper.path(
    'M'+fromx+' '+fromy
    +' '+
    'L'+tox+' '+toy
  ).attr({
    'stroke-width':    3,
    'stroke-linejoin': 'round',
     stroke:           '#3b4449'
  });

  box[which + 'Link'] = link;
  child.parentLink    = link;

  child.top.toFront();
  box.rect.toFront();
  box.right.toFront();
  box.left.toFront();
}

function assign_child_spawn_events(box) {

  var left  = box.left;
  var right = box.right;

  left.click(function(ev) {
    link_to_parent(
      box, 'left', create_box(left.attrs.cx-120, left.attrs.cy+30));
    }); 

  right.click(function(ev) {
    link_to_parent(
      box, 'right', create_box(right.attrs.cx+20, right.attrs.cy+30));
    }); 

  return box;
}

function assign_drag_events(box) {

  var rect  = box.rect;

  rect.drag(
    function(x, y)  { move(box, x, y) },
    function()      { start(box) },
    function()      { up(box) }
  );

  return box;
}

function start(box) {

  if (box.isMoving) return box;

  var rect = box.rect;

  box.isMoving = true;

  // Initial states
  rect.ox = rect.attr('x');
  rect.oy = rect.attr('y');
  rect.attr({opacity: .5});

  // Connector handles
  ['top', 'left', 'right'].forEach(function(circle) {
    box[circle].ox = box[circle].attr('cx');
    box[circle].oy = box[circle].attr('cy');
    box[circle].attr({opacity: .8});
  });

  // Connector links
  ['leftLink', 'rightLink'].forEach(function(line) {
    if (box[line] != undefined) {

      box[line].ox = 0;
      box[line].oy = 0;
      box[line].attr({opacity: .8});
    }
  });

  return box;
}

function move(box, x, y) {

  var rect = box.rect;

  rect.attr({x: rect.ox + x, y: rect.oy + y});
  rect.attr({x: rect.ox + x, y: rect.oy + y});

  // Connector handles
  ['top', 'left', 'right'].forEach(function(circle) {
    box[circle].attr({cx: box[circle].ox + x, cy: box[circle].oy + y});
    box[circle].attr({cx: box[circle].ox + x, cy: box[circle].oy + y});
  });

  // Move children as well
  ['left', 'right'].forEach(function(which) {
    var link = box[which+'Link'];

    if (link != undefined) {

      link.translate(x - link.ox, y - link.oy);
      link.ox = x;
      link.oy = y;

      var child = box[which+'Child'];
      move(start(child), x, y);
    }
  });

  // Move parent link along with child
  var plink  = box.parentLink;
  var xSrc  = plink.attrs.path[0][1];
  var ySrc  = plink.attrs.path[0][2];
  var xDest = box.top.ox+x;
  var yDest = box.top.oy+y;

  plink.attr({path: 'M'+xSrc+' '+ySrc+' L'+xDest+' '+yDest});

  return box;
}

function up(box) {
  ['rect', 'top', 'left', 'right'].forEach(function(thing) {
    box[thing].attr({opacity: 1});
  });

  ['left', 'right'].forEach(function(which) {
    var child = box[which+'Child'];

    if (child != undefined)
      up(child);
  });

  box.isMoving = false;

  return box;
}

function uuid(p) {
  if (typeof(p) == 'object' && typeof(p.prefix) == 'string') {
    jQuery._uuid_default_prefix = p.prefix;
  }
  else {
    p = p || jQuery._uuid_default_prefix || '';
    return(p+uuidlet()+uuidlet()+"-"+uuidlet()+"-"+uuidlet()+"-"+uuidlet()+"-"+uuidlet()+uuidlet()+uuidlet());
  };
}

function uuidlet () {
  return(((1+Math.random())*0x10000)|0).toString(16).substring(1);
};
