function InfoBar(bar, hos) {

  var that = this;

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

  this.assign_input_handler = function(elem) {

    j(elem).unbind('keyup').bind('keyup',
        function(ev) {
          if (ev.which != 13) return; // Not ENTER key
          if (!bar.find('input:last').is(ev.currentTarget)) return; // Not last input element
          if (j(ev.currentTarget).val() == '') return; // No current input name

          that.create_input().focus();
        });
  }
}
