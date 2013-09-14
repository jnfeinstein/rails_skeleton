_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
window.budget = (function($){
  var _budget = this;
  _budget.content = 'div.content.main';
  _budget.classes = {};

  _budget.debug = true;
  _budget.log = function(stuff) {
    if (_budget.debug)
      console.log(stuff);
  };

  _budget.init = function() {
    _budget.$content = $(_budget.content);
    _budget.session = (new _budget.classes.Session()).load();
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
        _budget.home_view = new _budget.classes.HomeView().bind_source('session', _budget.session);
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
      this.applyBindings();
      return this;
    },
    show: function() {
      this.$el.show();
      return this;
    },
    hide: function() {
      this.$el.hide();
      return this;
    },
    bind_source: function(name, object) {
      if (!this.bindingSources)
        this.bindingSources = {};
      this.bindingSources[name] = object;
      return this;
    }
  });

  _budget.classes.HomeView = _budget.classes.TemplateView.extend({
    template: '.home',
    bindings: {
      'div.authed': 'toggle:session_is_authed',
      'div.not_authed': 'toggle:not(session_is_authed)'
    }
  });

  _budget.classes.Session = Backbone.Epoxy.Model.extend({
    cookie: 'budget_auth_token',
    auth_token: null,
    load: function() {
      this.set('auth_token', $.cookie(this.cookie));
      return this;
    },
    save: function(auth_token) {
      this.set('auth_token', auth_token);
      $.cookie(this.cookie, this.get('auth_token'));
      return this;
    },
    auth: function(username, password) {
      var _this = this;
      var deferred = $.Deferred();
      $.post(budget_urls.auth, {username: username, password: password}, function(auth_token) {
        if (result) {
          _this.save(auth_token);
          deferred.resolve();
        }
        else
          deferred.reject();
      });
      return deferred.promise();
    },
    de_auth: function() {
      this.save(null);
    },
    computeds: {
      is_authed: function() {
        return this.get('auth_token') != null;
      }
    }
  });

  return _budget;
})(jQuery);

$(document).ready(function() {
  budget.init();
  Backbone.history.start();
});
