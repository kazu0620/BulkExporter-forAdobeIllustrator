(function() {

    const SAVE_DIR = "";
    const LAYER_PREFIX = "[bulk_export]";
    const GROUP_PREFIX = "@";
    const TEXT_SEPARATOR = ",";

    var layers = [],
        exportedLayerCount = 0;

    layers = activeDocument.layers;

    for( i=0; i < layers.length; i++){
        if( layers[i].name.indexOf(LAYER_PREFIX) < 0 ){
            continue;
        }
        exportAllGroupsInLayer( layers[i] );
        exportedLayerCount++;
    }

    if( !exportedLayerCount ){
        showLayerNameError();
        return;
    }

    // --------------------------------------------------
    function exportAllGroupsInLayer( layer ){
        var exportInfo    = "",
            exportGroups  = [],
            exportedCount = 0;;

        exportInfo   = getExportInfoByLayerName( layer.name );
        exportGroups = getTargetGroupsInLayer( layer );

        if( !exportInfo["fileType"].match(/^(png|jpg|gif)$/) ){
            showLayerNameError();
            return;
        }

        if( !exportGroups.length ){
            showGroupNameError();
            return;
        }

        alert("Export Start.\n");

        for( i=0; i < exportGroups.length; i++ ){
            exportGroupToImageFile( exportGroups[i], exportInfo);
            exportedCount++;
        }

        alert("Export Success.\n" + exportedCount + " images exported.\n exported path:" + exportedDir());
    }

    function exportGroupToImageFile( group, exportInfo ){
        var filePath = "",
            exportSettings = {},
            options,
            exportType,
            file;

        adjustGroupItemPosition( group );
        setArtboardRect( group );

        exportSettings = getExportSettings( exportInfo );

        options = exportSettings["options"];
        options.artBoardClipping = true;

        exportType = exportSettings["exportType"];

        filePath = setImageFilePath( group, exportInfo["fileType"] );
        file     = new File(filePath);

        app.activeDocument.exportFile( file, exportType, options);
    }

    function setImageFilePath( group, fileType ){
        var filename = "";
        filename = group.name.replace(GROUP_PREFIX, "");
        return exportedDir() + filename + "." + fileType;
    }

    function exportedDir(){
        return ( SAVE_DIR ) ? SAVE_DIR : activeDocument.path.toString() + "/";
    }

    function setArtboardRect( group ){
        var artboards = [],
            artboard,
        artboards = app.activeDocument.artboards;
        artboard  = artboards[artboards.getActiveArtboardIndex()];
        artboard.artboardRect =  group.visibleBounds;
    }

    function adjustGroupItemPosition( group ){
        group.position[0] = Math.round( group.position[0] );
        group.position[1] = Math.round( group.position[1] );
        group.height = Math.round( group.height );
        group.width = Math.round( group.width);
    }

    function getTargetGroupsInLayer( layer ){
        var groupsInLayer = [];
        var targetGroups  = [];

        groupsInLayer = layer.groupItems;
        for( i; i < groupsInLayer.length; i++){
            if( groupsInLayer[i].name.indexOf( GROUP_PREFIX ) > -1 ){
                targetGroups.push( groupsInLayer[i] );
            }
        }

        return targetGroups;
    }

    function getExportSettings( exportInfo ){
        exportSettings = {};

        switch( exportInfo["fileType"] ){
            case "gif":
                gifOpt = new ExportOptionsGIF ;
                gifOpt.antiAliasing = true ;
                gifOpt.colorCount = exportInfo["quality"];
                exportSettings["options"]    = gifOpt;
                exportSettings["exportType"] = ExportType.GIF;
                return exportSettings;
            case "jpg":
                jpegOpt = new ExportOptionsJPEG();
                jpegOpt.qualitySetting = exportInfo["quality"];
                exportSettings["options"]    = jpegOpt;
                exportSettings["exportType"] = ExportType.JPEG;
                return exportSettings;
            case "png":
                pngOpt = new ExportOptionsPNG24() ;
                pngOpt.antiAliasing = true ;
                pngOpt.colorCount = exportInfo["quality"];
                exportSettings["options"]    = pngOpt;
                exportSettings["exportType"] = ExportType.PNG24;
                return exportSettings;
            default:
                return;
        }
    }

    function getExportInfoByLayerName( layerName ){
        var exportInfo  = {},
            splitedText = [];

        infoText = layerName.replace(LAYER_PREFIX, "");
        splitedText = infoText.split ( TEXT_SEPARATOR );
        exportInfo["fileType"] = splitedText[0];
        exportInfo["quality"]  = splitedText[1];

        return exportInfo;
    }

    /* -------------------------------
       error messages
    ------------------------------- */
    function showLayerNameError() {
        var errorMessage = "";
        errorMessage = "Target layer not found.\n";
        errorMessage += "To export group items, you have to set specific name to layer.\n\n";
        errorMessage += LAYER_PREFIX +  "FILE_TYPE(jpg/png/gif),IMAGE_QUALITY\n\n" ;
        errorMessage += LAYER_PREFIX + ":you have to set this prefix with layers name\n\n";
        errorMessage += "IMAGE_QUALITY:on export JPEG image you can set compression ratio,";
        errorMessage += "on export PNG image you can set bit color.\n\n" ;
        errorMessage += "example\n" + LAYER_PREFIX + "jpg, 80";
        alert(errorMessage);
    }

    function showGroupNameError() {
        var errorMessage = "";
        errorMessage = "Target group not found.\n";
        errorMessage += "To export gruop items, you have to set prefix";
        errorMessage += "[" + GROUP_PREFIX + "] with group name\n\n";
        errorMessage += "example\n" + GROUP_PREFIX + "imagefile";
        alert(errorMessage);
    }

})();
