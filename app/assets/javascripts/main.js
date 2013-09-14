_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
window.budget = (function($){
  _budget = this;
  _budget.content = 'div.content.main';
  _budget.classes = {};

  _budget.debug = true;
  _budget.log = function(stuff) {
    if (_budget.debug)
      console.log(stuff);
  };

  _budget.init = function() {
    _budget.$content = $(_budget.content);
    _budget.app_router = new _budget.classes.AppRouter();
  };

  _budget.classes.AppRouter = Backbone.Router.extend({  
    routes: {
      "": "home",
      "user/:action": "user",
      "bujit/:action": "bujit",
      "bank/:action": "bank",
      "transaction/:action": "transaction",  
    },
    home: function() {
      if (!_budget.home_view)
        _budget.home_view = new _budget.classes.HomeView();
      _budget.home_view.render();
    },
    user: function(action) {  

    },
    bujit: function(action) {  

    },
    bank: function(action) {  

    },
    transaction: function(action) {  

    }
  });

  _budget.classes.TemplateView = Backbone.Epoxy.View.extend({
    // remember, needs template, and a collection or a model
    render: function() {
      if (!this._template)
        this._template = _.template($('.template' + this.template).html());
      this.$el.append(this._template(this.collection || this.model));
      this.$el.appendTo(_budget.content);
    },
    show: function() {
      this.$el.show();
    },
    hide: function() {
      this.$el.hide();
    }
  });

  _budget.classes.HomeView = _budget.classes.TemplateView.extend({
    template: '.home'
  });

  return _budget;
})(jQuery);

$(document).ready(function() {
  budget.init();
  Backbone.history.start();
});
