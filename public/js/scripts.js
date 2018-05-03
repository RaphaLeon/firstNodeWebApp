$(document).ready(function(){
    $('#post-comment').hide();
    $('#btn-comment').on('click', function(event){
        event.preventDefault();
        console.log('btn-comment clicked!');
        $('#post-comment').show();
    });
    
    $('#btn-like').on('click', function(event){
        event.preventDefault();
        console.log('btn-like clicked!');

        var imgId = $(this).data('id');
        
        $.post('/images/' + imgId +'/like').done(function(data){
            $('.likes-count').text(data.likes);
        });
    });

    $('#btn-delete').on('click', function(event){
        event.preventDefault();
        var $this = $(this);

        var remove = confirm('Are you sure you want to delete this image?');

        if(remove) {
            var imageId = $(this).data('id');
            $.ajax({
                url: '/images/' + imageId,
                type: 'DELETE',
            })
            .done(function(result){
                if(result) {
                    $this.removeClass('btn-danger').addClass('btn-success');
                    $this.find('i').removeClass('fa-times').addClass('fa-check');
                    $this.append('<span> Deleted!</span>');

                    setTimeout(function(){
                        alert('Image deleted!');
                        window.location.replace("http://localhost:3300/");
                    }, 2000)
                }
            });
        }
    });
}); 