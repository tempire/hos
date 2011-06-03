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
  var path = paper.path('M100 100 L200 200');
  path.attr.dx = 300;

  p.click(function(ev) {
      create_box(ev.x, ev.y);
  });
});

function create_box(x, y) {

  var box = {
    rect:  paper.rect(x, y, 100, 50, 10).attr({fill: 'green'}),
    top:   paper.circle(x+50, y+0, 10).attr({fill: 'red'}),
    left:  paper.circle(x+0, y+50, 10).attr({fill: 'red'}),
    right: paper.circle(x+100, y+50, 10).attr({fill: 'red'})
  };

  box.rect.attr({
    gradient:           '90-#526c7a-#64a0c1',
    stroke:             '#3b4449',
    'stroke-width':     5,
    'stroke-linejoin':  'round',
  });

  box = assign_events(box);

  return box;
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

  var tox = child.attrs.cx;
  var toy = child.attrs.cy;

  var link = paper.path(
    'M'+fromx+' '+fromy
    +' '+
    'L'+tox+' '+toy
  );

  box[which + 'Link'] = link;
}

function assign_child_spawn_events(box) {

  var left  = box.left;
  var right = box.right;

  left.click(function(ev) {
    link_to_parent(
      box, 'left', create_box(left.attrs.cx-120, left.attrs.cy+30).top);
    }); 

  right.click(function(ev) {
    link_to_parent(
      box, 'right', create_box(right.attrs.cx+20, right.attrs.cy+30).top);
    }); 

  return box;
}

function assign_drag_events(box) {

  var rect  = box.rect;

  var
    start = function() {
      rect.ox = rect.attr('x');
      rect.oy = rect.attr('y');
      rect.attr({opacity: .5});

      // Connector handles
      ['top', 'left', 'right'].forEach(function(circle) {
        box[circle].ox = box[circle].attr('cx');
        box[circle].oy = box[circle].attr('cy');
        box[circle].attr({opacity: .8});
      });

      ['leftLink', 'rightLink'].forEach(function(line) {
        if (box[line] == undefined)
          return;

        box[line].ox = 0;
        box[line].oy = 0;
        box[line].attr({opacity: .8});
      });
    },
    move = function(x, y) {
      rect.attr({x: rect.ox + x, y: rect.oy + y});
      rect.attr({x: rect.ox + x, y: rect.oy + y});

      // Connector handles
      ['top', 'left', 'right'].forEach(function(circle) {
        box[circle].attr({cx: box[circle].ox + x, cy: box[circle].oy + y});
        box[circle].attr({cx: box[circle].ox + x, cy: box[circle].oy + y});
      });
      ['leftLink', 'rightLink'].forEach(function(line) {
        if (box[line]== undefined)
          return;

        box[line].translate(x - box[line].ox, y - box[line].oy);
        box[line].ox = x;
        box[line].oy = y;
      });
    },
    up = function() {
      ['rect', 'top', 'left', 'right'].forEach(function(thing) {
        box[thing].attr({opacity: 1});
      });

      console.log(box);
    };

  rect.drag(move, start, up);

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
