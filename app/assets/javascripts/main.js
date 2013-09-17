_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
window.budget = (function($){
  var _budget = this;
  _budget.content = 'div.content.main';
  _budget.classes = {};
  _budget.views = {};
  _budget.current_view = null;

  _budget.debug = true;
  _budget.log = function(stuff) {
    if (_budget.debug)
      console.log(stuff);
  };

  _budget.init = function() {
    _budget.$content = $(_budget.content);
    _budget.authorization = new _budget.classes.Authorization();
    _budget.bank = (new _budget.classes.Bank());
    _budget.bujit = (new _budget.classes.Bujit());
    $(_budget.authorization).on('authed', function() {
      _budget.bank.fetch();
      _budget.bujit.fetch();
    });
    _budget.app_router = new _budget.classes.AppRouter();

    _budget.authorization.load();
  };

  _budget.set_current_view = function(view, name) {
    if (_budget.current_view) {
      _budget.current_view.hide();
      if (!_budget.current_view.save_as)
        _budget.current_view.remove();
    }
    if (view) {
      _budget.current_view = view;
      if (view.save_as)
        _budget.views[view.save_as] = view;
    }
    else {
      _budget.current_view = _budget.views[name];
    }
    if (_budget.current_view)
      return _budget.current_view.show();
    else
      return false;
  };

  _budget.add_error = function(error_message) {
    if (error_message) {
      var $div = $('<div/>').addClass('error');
      var $h5 = $('<h5/>').text(error_message);
      $div.append($h5).appendTo(_budget.current_view.$el.find('div.footer'));
    }
  };

  _budget.clear_errors = function() {
    _budget.current_view.$el.find('div.footer div.error').remove();
  };

  _budget.classes.AppRouter = Backbone.Router.extend({  
    routes: {
      "": "home",
      "user/:action": "user",
      "bujit/:action": "bujit",
      "bank/:action": "bank",
      "transaction/:action": "transaction",
      "auth/:action": "auth"
    },
    home: function() {
      if (!_budget.set_current_view(null, 'home'))
        _budget.set_current_view(new _budget.classes.HomeView({save_as: 'home'})
          .bind_source('authorization', _budget.authorization)
          .bind_source('bank', _budget.bank)
          .bind_source('bujit', _budget.bujit)      
          .render());
    },
    user: function(action) {  
      switch (action) {
        case 'new':
          _budget.set_current_view(new _budget.classes.SignUpView({model: new _budget.classes.User()}).render());
          break;
      }
    },
    bujit: function(action) {  
      switch (action) {
        case 'edit':
          _budget.set_current_view(new _budget.classes.BujitView({model: _budget.bujit}).render());
          break;
      }
    },
    bank: function(action) {  
      switch (action) {
        case 'edit':
          _budget.set_current_view(new _budget.classes.BankView({model: _budget.bank}).render());
          break;
      }
    },
    transaction: function(action) {  
      switch (action) {
        case 'new':
          _budget.set_current_view(new _budget.classes.TransactionView({model: new _budget.classes.Transaction()}).render());
          break;
      }
    },
    auth: function(action) {
      switch (action) {
        case 'in':
          _budget.set_current_view(new _budget.classes.LogInView({model: new _budget.classes.Session()}).render());
          break;
        case 'out':
          _budget.authorization.save(null, null);
          _budget.app_router.navigate('', true);
          break;
      }
    }
  });

  _budget.classes.TemplateView = Backbone.Epoxy.View.extend({
    // remember, needs template, and a collection or a model
    render: function() {
      if (!this._template)
        this._template = _.template($('.template' + this.template).html());
      this.$el.append(this._template(this.collection || this.model));
      this.$el.appendTo(_budget.content).hide();
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
      'div.authed': 'toggle:authorization_is_authed',
      'div.not_authed': 'toggle:not(authorization_is_authed)',
      'span.bank.total': 'text:bank_total',
      'span.bujit.amount': 'text:bujit_amount'
    }
  });

  _budget.classes.SignUpView = _budget.classes.TemplateView.extend({
    template: '.user.new',
    bindings: {
      'input#email': 'value:email,events:["keyup"]',
      'input#password': 'value:password,events:["keyup"]'
    },
    events: {
      'click button': "submit"
    },
    initialize: function() {
      _.bindAll(this, 'onSync', 'onError');
      this.model.on('sync', this.onSync);
      this.model.on('error', this.onError);
    },
    submit: function(e) {
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.authorization.save(data[0], this.model.get('email'));
      _budget.app_router.navigate('', true);
    },
    onError: function(model, errors, options) {
      _budget.clear_errors();
      _.each(errors.responseJSON, _budget.add_error);
    }
  });

  _budget.classes.LogInView = _budget.classes.TemplateView.extend({
    template: '.session.new',
    bindings: {
      'input#email': 'value:email,events:["keyup"]',
      'input#password': 'value:password,events:["keyup"]'
    },
    events: {
      'click button': "submit"
    },
    initialize: function() {
      _.bindAll(this, 'onSync', 'onError');
      this.model.on('sync', this.onSync);
      this.model.on('error', this.onError);
    },
    submit: function(e) {
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.authorization.save(data[0], this.model.get('email'));
      _budget.app_router.navigate('', true);
    },
    onError: function(model, errors, options) {
      _budget.clear_errors();
      _.each(errors.responseJSON, _budget.add_error);
    }
  });

  _budget.classes.TransactionView = _budget.classes.TemplateView.extend({
    template: '.transaction.new',
    bindings: {
      'input#amount': 'value:amount,events:["keyup"]'
    },
    events: {
      'click button': "submit"
    },
    initialize: function() {
      _.bindAll(this, 'onSync', 'onError');
      this.model.on('sync', this.onSync);
      this.model.on('error', this.onError);
    },
    submit: function(e) {
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.app_router.navigate('', true);
    },
    onError: function(model, errors, options) {
      _budget.clear_errors();
      _.each(errors.responseJSON, _budget.add_error);
    }
  });

  _budget.classes.BujitView = _budget.classes.TemplateView.extend({
    template: '.bujit.edit',
    bindings: {
      'input#amount': 'value:amount,events:["keyup"]'
    },
    events: {
      'click button': "submit"
    },
    initialize: function() {
      _.bindAll(this, 'onSync', 'onError');
      this.model.on('sync', this.onSync);
      this.model.on('error', this.onError);
    },
    submit: function(e) {
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.app_router.navigate('', true);
    },
    onError: function(model, errors, options) {
      _budget.clear_errors();
      _.each(errors.responseJSON, _budget.add_error);
    }
  });

  _budget.classes.BankView = _budget.classes.TemplateView.extend({
    template: '.bank.edit',
    bindings: {
      'input#total': 'value:total,events:["keyup"]'
    },
    events: {
      'click button': "submit"
    },
    initialize: function() {
      _.bindAll(this, 'onSync', 'onError');
      this.model.on('sync', this.onSync);
      this.model.on('error', this.onError);
    },
    submit: function(e) {
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.app_router.navigate('', true);
    },
    onError: function(model, errors, options) {
      _budget.clear_errors();
      _.each(errors.responseJSON, _budget.add_error);
    }
  });

  _budget.classes.Authorization = Backbone.Epoxy.Model.extend({
    defaults: {
      token_cookie: 'token',
      user_cookie: 'user',
      token: null,
      user: null
    },
    computeds: {
      is_authed: function() {
        var token = this.get('token');
        var user = this.get('user');
        return token && user;
      }
    },
    load: function() {
      var was_authed = this.get('is_authed');
      this.set('token', $.cookie(this.get('token_cookie')));
      this.set('user', $.cookie(this.get('user_cookie')));
      this.trigger_auth_events(was_authed, this.get('is_authed'));
      return this;
    },
    save: function(token, user) {
      var was_authed = this.get('is_authed');
      this.set('token', token);
      this.set('user', user)
      $.cookie(this.get('token_cookie'), this.get('token'), { expires: 7, path: '/' });
      $.cookie(this.get('user_cookie'), this.get('user'), { expires: 7, path: '/' });
      this.trigger_auth_events(was_authed, this.get('is_authed'));
      return this;
    },
    trigger_auth_events: function(old_auth_state, new_auth_state) {
      if (!old_auth_state && new_auth_state)
        $(this).trigger('authed');
      else if (old_auth_state && !new_auth_state)
        $(this).trigger('deauthed');
    }
  });

  _budget.classes.User = Backbone.Epoxy.Model.extend({
    url: 'user',
    defaults: {
      email: null,
      password: null
    }
  });

  _budget.classes.Session = Backbone.Epoxy.Model.extend({
    url: 'session',
    defaults: {
      email: null,
      password: null
    }
  });

  _budget.classes.Transaction = Backbone.Epoxy.Model.extend({
    url: 'transaction',
    defaults: {
      amount: 0
    }
  });

  _budget.classes.Bujit = Backbone.Epoxy.Model.extend({
    urlRoot: 'bujit',
    defaults: {
      amount: 0
    }
  });

  _budget.classes.Bank = Backbone.Epoxy.Model.extend({
    urlRoot: 'bank',
    defaults: {
      total: 0
    }
  });

  return _budget;
})(jQuery);

$(document).ready(function() {
  budget.init();
  Backbone.history.start();
});
