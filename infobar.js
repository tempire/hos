function InfoBar(bar, hos) {

  this.create_input = function() {

    var set = j('<p />').append(
      'Input',
      '<input />', {
        name: 'input',
        type: 'text'
      });

    set.appendTo(bar);
  };

}
