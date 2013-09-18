_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
window.budget = (function($){
  var _budget = this;
  _budget.content = 'div.content.main';
  _budget.classes = {};
  _budget.views = {};
  _budget.current_view = null;
  _budget.is_loading = true;

  _budget.debug = true;
  _budget.log = function(stuff) {
    if (_budget.debug)
      console.log(stuff);
  };

  _budget.init = function() {
    _budget.$content = $(_budget.content);
    _budget.bind_enter_key();
    _budget.authorization = new _budget.classes.Authorization();
    _budget.app_router = new _budget.classes.AppRouter();
    _budget.bind_focus_on_navigate();
    _budget.user = new _budget.classes.User();
    if (_budget.authorization.load().get('is_authed'))
      _budget.load_until_user_fetched();
    else
      _budget.set_loading(false);
    Backbone.history.start();
  };

  _budget.bind_enter_key = function() {
    _budget.$content.bind('keypress', function(e){
      if (e.keyCode == 13)
        _budget.$content.find('button.submit').click();
     });
  };

  _budget.bind_focus_on_navigate = function() {
    _budget.app_router.bind('all', function() {
      _budget.$content.find('input:first').focus();
    });
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
    if (!_budget.current_view)
      return false;
    if (!_budget.is_loading)
      _budget.current_view.show();
    return _budget.current_view;
  };

  _budget.set_loading = function(is_loading) {
    if (is_loading) {
      if (_budget.current_view)
        _budget.current_view.hide();
      $('div.loading').show();
    }
    else {
      $('div.loading').hide();
      if (_budget.current_view)
        _budget.current_view.show();
    }
    _budget.is_loading = is_loading;
  };

  _budget.load_until_user_fetched = function() {
    _budget.set_loading(true);
    $.when(_budget.user.fetch.promise)
      .done(function() {
        _budget.set_loading(false);
      })
      .fail(function(errors) {
        if (errors['error'] == 'Forbidden')
          _budget.error_is_403(403);
      });  
  };

  _budget.error_is_403 = function(error) {
    if (error == 403) {
      _budget.app_router.navigate('auth/in', true);
      _budget.add_error("you were logged out");
      _budget.set_loading(false);
      return true;
    }
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
          .bind_source('bank', _budget.user.bank)
          .bind_source('bujit', _budget.user.bujit)      
          .render());
    },
    user: function(action) {  
      switch (action) {
        case 'new':
          _budget.set_current_view(new _budget.classes.SignUpView({model: new _budget.classes.Credentials()}).render());
          break;
      }
    },
    bujit: function(action) {  
      switch (action) {
        case 'edit':
          _budget.set_current_view(new _budget.classes.BujitView({model: _budget.user.bujit}).render());
          break;
      }
    },
    bank: function(action) {  
      switch (action) {
        case 'edit':
          _budget.set_current_view(new _budget.classes.BankView({model: _budget.user.bank}).render());
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
          _budget.set_current_view(new _budget.classes.LogInView({model: new _budget.classes.Credentials()}).render());
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
      _budget.set_loading(true);
      this.model.save(null, {url: 'user'});
    },
    onSync: function(model, data, options) {
      _budget.authorization.save(data[0], this.model.get('email'));
      _budget.app_router.navigate('', true);
      _budget.load_until_user_fetched();
    },
    onError: function(model, errors, options) {
      _budget.clear_errors();
      _.each(errors.responseJSON, _budget.add_error);
      _budget.set_loading(false);
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
      _budget.set_loading(true);
      this.model.save(null, {url: 'session'});
    },
    onSync: function(model, data, options) {
      _budget.authorization.save(data[0], this.model.get('email'));
      _budget.app_router.navigate('', true);
      _budget.load_until_user_fetched();
    },
    onError: function(model, errors, options) {
      _budget.clear_errors();
      _.each(errors.responseJSON, _budget.add_error);
      _budget.set_loading(false);
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
      _budget.set_loading(true);
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.app_router.navigate('', true);
      _budget.user.fetch();
      _budget.load_until_user_fetched();
    },
    onError: function(model, errors, options) {
      if (!_budget.error_is_403(errors.status)) {
        _budget.clear_errors();
        _.each(errors.responseJSON, _budget.add_error);
        _budget.set_loading(false);
      }
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
      _budget.set_loading(true);
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.app_router.navigate('', true);
      _budget.set_loading(false);
    },
    onError: function(model, errors, options) {
      if (!_budget.error_is_403(errors.status)) {
        _budget.clear_errors();
        _.each(errors.responseJSON, _budget.add_error);
        _budget.set_loading(false);
      }
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
      _budget.set_loading(true);
      this.model.save();
    },
    onSync: function(model, data, options) {
      _budget.app_router.navigate('', true);
      _budget.set_loading(false);
    },
    onError: function(model, errors, options) {
      if (!_budget.error_is_403(errors.status)) {
        _budget.clear_errors();
        _.each(errors.responseJSON, _budget.add_error);
        _budget.set_loading(false);
      }
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

  _budget.classes.Credentials = Backbone.Epoxy.Model.extend({
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

  _budget.classes.User = Backbone.Epoxy.Model.extend({
    bujit: null,
    bank: null,

    initialize: function() {
      this.reset();
      _.bindAll(this, 'reset', 'fetch', 'save');
      $(_budget.authorization).on('authed', this.fetch);
      $(_budget.authorization).on('deauthed', this.reset);
    },
    reset: function() {
      this.fetch.promise = null;
      this.save.promise = null;
      this.bujit = new _budget.classes.Bujit();
      this.bank = new _budget.classes.Bank();  
    },
    fetch: function() {
      this.fetch.promise = $.when(this.bujit.fetch()(), this.bank.fetch()()).promise();
      return this.fetch.promise;
    },
    save: function() {
      this.save.promise = $.when(this.bujit.save()(), this.bank.save()()).promise();
      return this.save.promise;
    }
  });

  return _budget;
})(jQuery);

$(document).ready(function() {
  budget.init();
});
