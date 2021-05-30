document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
  });

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.tooltipped');
  var instances = M.Tooltip.init(elems);
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