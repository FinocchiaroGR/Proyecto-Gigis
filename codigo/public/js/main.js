document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
  });

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.tooltipped');
  var instances = M.Tooltip.init(elems);
});

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);
});

document.addEventListener('DOMContentLoaded', function() {
var elems = document.querySelectorAll('select');
var instances = M.FormSelect.init(elems);
});

const showPassLogin = (ico) => {
  var input = $($(ico).attr("toggle"));
  if (input.attr("type") == "password") {
      input.attr("type", "text");
      $(spanpass).html('<span toggle="#password" class="material-icons field-icon orange-text text-darken-4" onclick="showPassLogin(this)">visibility</span>');
  } else {
      input.attr("type", "password");
      $(spanpass).html('<span toggle="#password" class="material-icons field-icon grey-text" onclick="showPassLogin(this)">visibility_off</span>');
  }
}

const showPassCambiarPass = (ico) => {
  var input = $($(ico).attr("toggle"));
  if (input.attr("type") == "password") {
      input.attr("type", "text");
      $(spanpass1).html('<span toggle="#contraseña-nueva" class="material-icons field-icon orange-text text-darken-4" onclick="showPassCambiarPass(this)">visibility</span>');
  } else {
      input.attr("type", "password");
      $(spanpass1).html('<span toggle="#contraseña-nueva" class="material-icons field-icon grey-text" onclick="showPassCambiarPass(this)">visibility_off</span>');
  }
}

const showPassCambiarConfirm = (ico) => {
  var input = $($(ico).attr("toggle"));
  if (input.attr("type") == "password") {
      input.attr("type", "text");
      $(spanpass2).html('<span toggle="#confirmacion" class="material-icons field-icon orange-text text-darken-4" onclick="showPassCambiarConfirm(this)">visibility</span>');
  } else {
      input.attr("type", "password");
      $(spanpass2).html('<span toggle="#confirmacion" class="material-icons field-icon grey-text" onclick="showPassCambiarConfirm(this)">visibility_off</span>');
  }
}