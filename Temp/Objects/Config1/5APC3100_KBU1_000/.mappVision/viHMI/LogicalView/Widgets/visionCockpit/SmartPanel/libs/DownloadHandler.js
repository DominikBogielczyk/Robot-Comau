define(function() {

    'use strict';

    var DownloadHandler = {
        sendFileToClient: function(filename, fileContent) {
            if (filename === undefined || filename === null || filename.length === 0) {
                throw new Error("Filename must be provided, but was [" + filename + "].");
            }
            if (fileContent === undefined || fileContent === null) {
                throw new Error("File content must be provided, but was [" + fileContent + "].");
            }

            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }
    };

    return DownloadHandler;
});