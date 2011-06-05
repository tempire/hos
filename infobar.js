function InfoBar(bar, hos) {

  var that = this;

  // create_input
  this.create_input = function() {

    var set = j('<p />').append(
      'Input',
      '<input />', {
        name: 'input',
        type: 'text'
      });

    set.appendTo(bar);

    this.assign_input_handler(set.find('input'));

    return set.find('input');
  };

  // assign_input_handler
  this.assign_input_handler = function(elem) {

    j(elem).unbind('keyup').bind('keyup',
        function(ev) {
 
          // Not ENTER key
          if (ev.which != 13) return;
 
          // Not last input element
          if (!bar.find('input:last').is(ev.currentTarget)) return;
 
          // No current input name
          if (j(ev.currentTarget).val() == '') return;

          that.create_input().focus();
        });
  }
}
