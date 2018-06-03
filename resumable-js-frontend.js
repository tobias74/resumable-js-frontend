var ResumableUploadFrontend = function(resumableUploader, config){
  /*global $*/
  /*global SparkMD5*/
  /*global performance*/

  var self = this;

  var queue = new SimpleTaskQueue();
  queue.run();

  var showButDisableUploadButton = function(){
    $(config.startUploadSelector).show();
    $(config.startUploadSelector).prop("disabled",true);
  };

  var showAndEnableUploadButton = function(){
    $(config.startUploadSelector).show();
    $(config.startUploadSelector).prop("disabled",false);
  };

  var showButDisableCancelButton = function(){
    $(config.cancelUploadSelector).show();
    $(config.cancelUploadSelector).prop("disabled",true);
  };

  var showPauseButton = function(){
    $(config.pauseUploadSelector).show();
  };

  var hidePauseButton = function(){
    $(config.pauseUploadSelector).hide();
  };
  
  var hideUploadButton = function(){
    $(config.startUploadSelector).hide();
  };
  
  var updateStatusOfUploadButton = function(){
    if (resumableUploader.files.filter(function(fileItem){
      return !fileItem.isComplete();
    }).length > 0){
      
      if (resumableUploader.isUploading()){
        hideUploadButton();
        showPauseButton();                
      }
      else {
        showAndEnableUploadButton();
        hidePauseButton();
      }
    }
    else {
      console.log('ok, no files to upload');
      showButDisableUploadButton();
    }
  };


  var setStatus = function(resumableFile, html) {
    $(config.fileStatusSelector(resumableFile.layoutIdentifier)).html(html);    
  };
  self.setStatus = setStatus;

  var setProgress = function(resumableFile, percentage) {
    $(config.fileProgressTextSelector(resumableFile.layoutIdentifier)).html(Math.floor(percentage*100) + '%');
    $(config.fileProgressBarSelector(resumableFile.layoutIdentifier)).css({width:Math.floor(percentage*100) + '%'});
  };
  
  var hideProgressText = function(resumableFile, percentage) {
    $(config.fileProgressTextSelector(resumableFile.layoutIdentifier)).css({visibility:'hidden'});
  };
  self.hideProgressText = hideProgressText;
  
  var setOverallProgress = function(percentage){
    $(config.overallProgressBarSelector).css({width:Math.floor(percentage*100) + '%'});
  };


  
  var fileTemplate = $(config.fileTemplateSelector).html();
  Mustache.parse(fileTemplate);   // optional, speeds up future uses
  
  
  $(config.dropAreaSelector).show();
  resumableUploader.assignDrop($(config.dropAreaSelector)[0]);

  resumableUploader.assignBrowse($(config.fileBrowserSelector)[0]);
  resumableUploader.assignBrowse($(config.folderBrowserSelector)[0], true);

  $(config.resumeUploadSelector).click(function(){
    resumableUploader.upload();
  });

  $(config.pauseUploadSelector).click(function(){
    resumableUploader.pause();
  });


  showButDisableUploadButton();
  showButDisableCancelButton();
  hidePauseButton();


  resumableUploader.on('fileAdded', function(resumableFile) {
    queue.addTask(function(finishedCallback){
      setTimeout(function(){
        
        config.afterFileHasBeenAdded(resumableFile);
        resumableFile.layoutIdentifier = 'layoutID-' + SparkMD5.hash('' + Math.random() + performance.now());

        var newRowHtml = Mustache.render(fileTemplate, resumableFile);
        $(config.fileListSelector).append(newRowHtml);

        updateStatusOfUploadButton();
      
        finishedCallback();
      },0);    
    });
  });

  resumableUploader.on('pause', function(){
    showAndEnableUploadButton();
    hidePauseButton();
  });

  resumableUploader.on('complete', function(){
    showButDisableUploadButton();
    showButDisableCancelButton();
    hidePauseButton();
  });

  resumableUploader.on('uploadStart', function(){
    hideUploadButton();
    showPauseButton();
  });

  
  resumableUploader.on('fileSuccess', function(file,message){
    setStatus(file, '(completed)');
  });

  resumableUploader.on('fileError', function(file, message){
    setStatus(file, '(file could not be uploaded: '+message+')');
  });

  resumableUploader.on('fileProgress', function(file){
    setProgress(file, file.progress());
    setOverallProgress(resumableUploader.progress());
  });


  resumableUploader.on('cancel', function(){
    $('.resumable-file-progress').html('canceled');
  });
  
  resumableUploader.on('catchAll', function(event){
    //console.log('catch all was called ', event);
  });
  
  resumableUploader.on('progress', function(){
    updateStatusOfUploadButton();              
  });

};




