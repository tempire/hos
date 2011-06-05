var j       = window.j = jQuery;
var paper   = window.paper = {};
var infobar = window.infobar = {};

j(function() {
  var hos = draw_hos(j('#hos'));
  var dim = hos_dimensions();

  // initial function box
  var box = create_box(dim.width/2-50, dim.height/2-100);

  pulsate_handler(box, 'right');
  pulsate_handler(box, 'left');

  // object for right info bar
  var bar = j('#infobar');
  infobar = new InfoBar(bar, hos);

  // create input for current function
  infobar.create_input();
});

function hos_dimensions() {
  var el = j('#hos');

  return {
    width:  el.width(),
    height: el.height()
  };
}

function box_dimensions(box) {
  var rect = box.rect;
  var dim  = rect.getBBox();

  return {
    width:  dim.width,
    height: dim.height
  };
}

function draw_hos() {
  var dim = hos_dimensions();

  // canvas
  paper = window.paper = Raphael('hos', dim.width, dim.height);
  var p = paper.rect(0, 0, dim.width, dim.height).attr({fill: 'white'});

  // resize event
  j(window).resize(resize_hos);

  return p;
}

function create_fname_prompt(box) {
  var dim  = box_dimensions(box);
  var text = box.text;

  var set = j('\
    <div class="function_overlay">          \
      <form>                                \
        <input type="text" name="input" />  \
      </form>                               \
    </div>');

  set
    .css('text-align', 'center')
    .css('width', dim.width)
    .css('height', dim.height)
    .css('margin-top', 15);

  set.find('input')
    .css('width', dim.width);

  if (text != undefined)
    set.find('input').val(text.attr('text'));

  set.find('form').unbind('submit').submit(function(ev) {
    var name = j(this).find('input').val();
    if (name == '') return;

    box.text = create_function_name(box, name);
    j(this).parent('.function_overlay').remove();
    return false;
  });

  // Remove function overlay on blur
  set.find('input').blur(function(ev) {
    j(this).parent('.function_overlay').remove();
  });

  return set;
}

function create_function_name(box, name) {
  var rect   = box.rect;
  var width  = rect.attr('width');
  var height = rect.attr('height');

  var x = rect.attr('x')+width/2;
  var y = rect.attr('y')+height/2;

  var text = paper.text(x, y, name).attr({
    fill: 'white',
    font: '20px tahoma'
  });

  text.dblclick(function(ev) {
    display_fname_prompt(box, text.attr('text'));
    this.remove();
  });

  return text;
}

function resize_hos(ev) {
  var main   = j('#hos');
  var width  = main.width();
  var height = main.height();

  paper.setSize(width, height);
}

function create_box(x, y) {
  var width  = 150;
  var height = 50;

  var box = {
    rect:  paper.rect(x, y, width, height, 10).attr({fill: 'green'}),
    top:   paper.circle(x+width/2, y+0, 7).attr({fill: 'red'}),
    left:  paper.circle(x+0, y+height, 7).attr({fill: 'red'}),
    right: paper.circle(x+width, y+height, 7).attr({fill: 'red'})
  };

  //box.text = create_function_name(box, 'function name');
  display_fname_prompt(box);

  //set_box_width(box, width);

  box.rect.attr({
    gradient:           '90-#526c7a-#64a0c1',
    stroke:             '#3b4449',
    'stroke-width':     5,
    'stroke-linejoin':  'round',
  });

  return assign_events(box);
}

function pulsate_handler(box, which) {
  var circle = box[which];
  var current = circle.attr('r');

  circle.animate({
    '10%': {r: current+2},
    '50%': {r: current+5},
    '100%': {r: current},
  }, 200);
}

function set_box_width(box, width) {
  box.rect.attr({width: width});

  box.top.attr(
      {cx: box.rect.attr('x')+box.rect.attr('width')/2});;

  box.right.attr(
      {cx: box.rect.attr('x')+box.rect.attr('width')});;

  return box;
}

function assign_events(box) {

  return assign_info_events(
      assign_drag_events(
        assign_child_spawn_events(box)));
}

function assign_info_events(box) {
  var rect = box.rect;

  rect.dblclick(function(ev) {
    display_fname_prompt(box);
  });

  return box;
}

function display_fname_prompt(box) {
  var rect    = box.rect;

  var div     = create_fname_prompt(box);
  box.prompt  = div;

  // Set position over box
  div.css({
    position: 'absolute',
    left:     rect.attr('x'),
    top:      rect.attr('y')
  });

  // Assign in hos window
  j('#hos').append(div);

  // Accept function name immeidately
  div.find('input').focus();
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
  box.text.toFront();
  box.right.toFront();
  box.left.toFront();
}

function assign_child_spawn_events(box) {
  var left  = box.left;
  var right = box.right;

  var x_offset = 20;
  var y_offset = 30;

  left.click(function(ev) {
    link_to_parent(
      box, 'left',
      create_box(
        left.attrs.cx-x_offset-box.rect.attr('width'),
        left.attrs.cy+y_offset));

      this.unclick(this.events[0].f);
    }); 

  right.click(function(ev) {
    link_to_parent(
      box, 'right',
      create_box(
        right.attrs.cx+x_offset,
        right.attrs.cy+y_offset));

      this.unclick(this.events[0].f);
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

  var rect    = box.rect;
  var text    = box.text;
  var prompt  = box.prompt;

  box.isMoving = true;

  // Record initial states

  // Rect
  rect.ox = rect.attr('x');
  rect.oy = rect.attr('y');
  rect.attr({opacity: .5});

  // Function name
  if (text != undefined) {
    text.ox = text.attr('x');
    text.oy = text.attr('y');
  }

  // Prompt
  if (prompt != undefined) {
    prompt.data('ox', prompt.css('left'));
    prompt.data('oy', prompt.css('top'));
  }

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
  var rect   = box.rect;
  var text   = box.text;
  var prompt = box.prompt;

  // Move rect
  rect.attr({x: rect.ox+x, y: rect.oy+y});

  // Move function name
  if (text != undefined) 
    text.attr({x: text.ox+x, y: text.oy+y});
 
  // Move prompt
  if (prompt != undefined) {
    prompt
      .css('left', parseInt(prompt.data('ox'))+x)
      .css('top', parseInt(prompt.data('oy'))+y);
  }

  // Move connector handles
  ['top', 'left', 'right'].forEach(function(circle) {
    box[circle].attr({cx: box[circle].ox + x, cy: box[circle].oy + y});
    box[circle].attr({cx: box[circle].ox + x, cy: box[circle].oy + y});
  });

  // Move children
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

  if (box.parentLink == undefined) return box;

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
