'use strict';
// CommonJS support for easier testing
(function(root,factory, undefined){
  root.Backbone.sync = factory(root.Backbone, root.$);
})(this,function(Backbone, $){

  // Keep track of original sync
  var origSync = Backbone.sync;

  var newSync = function(method, model, options) {
    
    // Keep track of original callbacks to have a seamless integration
    var origSuccess = options.success;
    var origError = options.error;
    
    // Let's get a nice promise
    var deferred = $.Deferred();

    // Override success
    options.success = function(model, response, options) {
      if (origSuccess) origSuccess(model, response, options);
      return deferred.resolve(model);
    };
    // Override error
    options.error = function(model, response, options) {
      if (origError) origError(model, response, options);
      return deferred.reject(response);
    };

    origSync(method, model, options);
    
    return deferred.promise;
  };

  return newSync;

});