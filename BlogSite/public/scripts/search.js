$('#blog-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/blog?' + search, function(data) {
    $('#blog-grid').html('');
    data.forEach(function(blog) {
      $('#blog-grid').append(`
        <div class="col-md-3 col-sm-6">
          <div class="thumbnail">
            <img src="${ blog.image }">
            <div class="caption">
              <h4>${ blog.name }</h4>
            </div>
            <p>
              <a href="/blog/${ blog._id }" class="btn btn-primary">More Info</a>
            </p>
          </div>
        </div>
      `);
    });
  });
});

$('#blog-search').submit(function(event) {
  event.preventDefault();
});