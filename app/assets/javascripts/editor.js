window.addEventListener('load', function() {
    var editor;
    ContentTools.StylePalette.add([
        new ContentTools.Style('Author', 'author', ['p'])
    ]);
    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name');


    editor.addEventListener('saved', function (ev) {
        var regions

        // Check that something changed
        regions = ev.detail().regions;
        if (Object.keys(regions).length == 0) {
            return;
        }

        // Set the editor as busy while we save our changes
        this.busy(true);

        var title = document.getElementById('post_title');
        title.value = document.getElementById('post-title-block').textContent

        var content= document.getElementById('post_content');
        content.value = JSON.stringify(regions['main-content']);

        $('#postsubmit').submit();

        // Send the update content to the server to be saved
        function onStateChange(ev) {
            // Check if the request is finished
            if (ev.target.readyState == 4) {
                editor.busy(false);
                if (ev.target.status == '200') {
                    // Save was successful, notify the user with a flash
                    new ContentTools.FlashUI('ok');
                } else {
                    // Save failed, notify the user with a flash
                    new ContentTools.FlashUI('no');
                }
            }
        }

    });


});