// Define settings for the uploader
var CLOUDINARY_PRESET_NAME = 'ctpreset';
var CLOUDINARY_RETRIEVE_URL = 'https://res.cloudinary.com/andrewburns';
var CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/andrewburns/image/upload';


// Define the image uploader
function cloudinaryImageUploader(dialog) {
    var image, xhr, xhrComplete, xhrProgress;

    // Set up the event handlers
    dialog.addEventListener('imageuploader.cancelupload', function () {
        // Cancel the current upload
        // Stop the upload
        if (xhr) {
            xhr.upload.removeEventListener('progress', xhrProgress);
            xhr.removeEventListener('readystatechange', xhrComplete);
            xhr.abort();
        }

        // Set the dialog to empty
        dialog.state('empty');
    });

    dialog.addEventListener('imageuploader.clear', function () {
        // Clear the current image
        dialog.clear();
        image = null;
    });
    dialog.addEventListener('imageuploader.fileready', function (ev) {
        // Upload a file to Cloudinary
        var formData;
        var file = ev.detail().file;

        // Define functions to handle upload progress and completion
        function xhrProgress(ev) {
            // Set the progress for the upload
            dialog.progress((ev.loaded / ev.total) * 100);
        }

        function xhrComplete(ev) {
            var response;

            // Check the request is complete
            if (ev.target.readyState != 4) {
                return;
            }

            // Clear the request
            xhr = null
            xhrProgress = null
            xhrComplete = null

            // Handle the result of the upload
            if (parseInt(ev.target.status) == 200) {
                // Unpack the response (from JSON)
                response = JSON.parse(ev.target.responseText);

                // Store the image details
                image = {
                    angle: 0,
                    height: parseInt(response.height),
                    maxWidth: parseInt(response.width),
                    width: parseInt(response.width)
                };

                // Apply a draft size to the image for editing
                image.filename = parseCloudinaryURL(response.url)[0];
                image.url = buildCloudinaryURL(
                    image.filename,
                    [{c: 'fit', h: 600, w: 600}]
                );

                // Populate the dialog
                dialog.populate(image.url, [image.width, image.height]);

            } else {
                // The request failed, notify the user
                new ContentTools.FlashUI('no');
            }
        }

        // Set the dialog state to uploading and reset the progress bar to 0
        dialog.state('uploading');
        dialog.progress(0);
        // Build the form data to post to the server
        formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET_NAME);

        // Make the request
        xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', xhrProgress);
        xhr.addEventListener('readystatechange', xhrComplete);
        xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);
        xhr.send(formData);

    });
    function rotate(angle) {
        // Handle a request by the user to rotate the image
        var height, transforms, width;

        // Update the angle of the image
        image.angle += angle;

        // Stay within 0-360 degree range
        if (image.angle < 0) {
            image.angle += 360;
        } else if (image.angle > 270) {
            image.angle -= 360;
        }

        // Rotate the image's dimensions
        width = image.width;
        height = image.height;
        image.width = height;
        image.height = width;
        image.maxWidth = width;

        // Build the transform to rotate the image
        transforms = [{c: 'fit', h: 600, w: 600}];
        if (image.angle > 0) {
            transforms.unshift({a: image.angle});
        }

        // Build a URL for the transformed image
        image.url = buildCloudinaryURL(image.filename, transforms);

        // Update the image in the dialog
        dialog.populate(image.url, [image.width, image.height]);
    }

    dialog.addEventListener(
        'imageuploader.rotateccw',
        function () { rotate(-90); }
    );
    dialog.addEventListener(
        'imageUploader.rotatecw',
        function () { rotate(90); }
    );
    dialog.addEventListener('imageuploader.save', function () {
        // Handle a user saving an image
        var cropRegion, cropTransform, imageAttrs, ratio, transforms;

        // Build a list of transforms
        transforms = [];

        // Angle
        if (image.angle != 0) {
            transforms.push({a: image.angle});
        }

        // Crop
        cropRegion = dialog.cropRegion();
        if (cropRegion.toString() != [0, 0, 1, 1].toString()) {
            cropTransform = {
                c: 'crop',
                x: parseInt(image.width * cropRegion[1]),
                y: parseInt(image.height * cropRegion[0]),
                w: parseInt(image.width * (cropRegion[3] - cropRegion[1])),
                h: parseInt(image.height * (cropRegion[2] - cropRegion[0]))
            };
            transforms.push(cropTransform);

            // Update the image size based on the crop
            image.width = cropTransform.w;
            image.height = cropTransform.h;
            image.maxWidth = cropTransform.w;
        }

        // Resize (the image is inserted in the page at a default size)
        if (image.width > 400 || image.height > 400) {
            transforms.push({c: 'fit', w: 400, h: 400});

            // Update the size of the image in-line with the resize
            ratio = Math.min(400 / image.width, 400 / image.height);
            image.width *= ratio;
            image.height *= ratio;
        }

        // Build a URL for the image we'll insert
        image.url = buildCloudinaryURL(image.filename, transforms);

        // Build attributes for the image
        imageAttrs = {'alt': '', 'data-ce-max-width': image.maxWidth};

        // Save/insert the image
        dialog.save(image.url, [image.width, image.height]);
    });
    // Capture image resize events and update the Cloudinary URL
    ContentEdit.Root.get().bind('taint', function (element) {
        var args, filename, newSize, transforms, url;

        // Check the element tainted is an image
        if (element.type() != 'Image') {
            return;
        }

        // Parse the existing URL
        args = parseCloudinaryURL(element.attr('src'));
        filename = args[0];
        transforms = args[1];

        // If no filename is found then exit (not a Cloudinary image)
        if (!filename) {
            return;
        }

        // Remove any existing resize transform
        if (transforms.length > 0 &&
            transforms[transforms.length -1]['c'] == 'fill') {
            transforms.pop();
        }

        // Change the resize transform for the element
        transforms.push({c: 'fill', w: element.size()[0], h: element.size()[1]});
        url = buildCloudinaryURL(filename, transforms);
        if (url != element.attr('src')) {
            element.attr('src', url);
        }
    });
}

function buildCloudinaryURL(filename, transforms) {
    // Build a Cloudinary URL from a filename and the list of transforms
    // supplied. Transforms should be specified as objects (e.g {a: 90} becomes
    // 'a_90').
    var i, name, transform, transformArgs, transformPaths, urlParts;

    // Convert the transforms to paths
    transformPaths = [];
    for  (i = 0; i < transforms.length; i++) {
        transform = transforms[i];

        // Convert each of the object properties to a transform argument
        transformArgs = [];
        for (name in transform) {
            if (transform.hasOwnProperty(name)) {
                transformArgs.push(name + '_' + transform[name]);
            }
        }

        transformPaths.push(transformArgs.join(','));
    }

    // Build the URL
    urlParts = [CLOUDINARY_RETRIEVE_URL];
    if (transformPaths.length > 0) {
        urlParts.push(transformPaths.join('/'));
    }
    urlParts.push(filename);

    return urlParts.join('/');
}

function parseCloudinaryURL(url) {
    // Parse a Cloudinary URL and return the filename and list of transforms
    var filename, i, j, transform, transformArgs, transforms, urlParts;

    // Strip the URL down to just the transforms, version (optional) and
    // filename.
    url = url.replace(CLOUDINARY_RETRIEVE_URL, '');

    // Split the remaining path into parts
    urlParts = url.split('/');

    // The path starts with a '/' so the first part will be empty and can be
    // discarded.
    urlParts.shift();

    // Extract the filename
    filename = urlParts.pop();

    // Strip any version number from the URL
    if (urlParts.length > 0 && urlParts[urlParts.length - 1].match(/v\d+/)) {
        urlParts.pop();
    }

    // Convert the remaining parts into transforms (e.g `w_90,h_90,c_fit >
    // {w: 90, h: 90, c: 'fit'}`).
    transforms = [];
    for (i = 0; i < urlParts.length; i++) {
        transformArgs = urlParts[i].split(',');
        transform = {};
        for (j = 0; j < transformArgs.length; j++) {
            transform[transformArgs[j].split('_')[0]] =
                transformArgs[j].split('_')[1];
        }
        transforms.push(transform);
    }

    return [filename, transforms];
}

window.addEventListener('load', function() {
    var editor;
    ContentTools.StylePalette.add([
        new ContentTools.Style('Author', 'author', ['p'])
    ]);
    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name');
    ContentTools.IMAGE_UPLOADER = cloudinaryImageUploader;

    editor.addEventListener('saved', function (ev) {
        var regions;

        // Check that something changed
        regions = ev.detail().regions;
        if (Object.keys(regions).length == 0) {
            return;
        }

        // Set the editor as busy while we save our changes
        this.busy(true);

        var title = document.getElementById('post_title');
        title.value = document.getElementById('post-title-block').textContent;

        var content = document.getElementById('post_content');
        content.value = regions['main-content'];

        var status = document.getElementById('status');
        console.log(status);

        var picture = document.getElementById('post_picture');
        console.log(picture);

        var teams = document.getElementById('post_teams');
        teams.value = document.getElementById('tags').value;
        console.log(teams);



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



