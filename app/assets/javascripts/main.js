_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};
window.skeleton = (function($){
  var _skeleton = this;
  _skeleton.content = 'div.content.main';
  _skeleton.classes = {};
  _skeleton.views = {};
  _skeleton.current_view = null;
  _skeleton.is_loading = true;

  _skeleton.debug = true;
  _skeleton.log = function(stuff) {
    if (_skeleton.debug)
      console.log(stuff);
  };

  _skeleton.init = function() {
    _skeleton.$content = $(_skeleton.content);
    _skeleton.bind_enter_key();
    _skeleton.authorization = new _skeleton.classes.Authorization();
    _skeleton.app_router = new _skeleton.classes.AppRouter();
    _skeleton.bind_focus_on_navigate();
    _skeleton.user = new _skeleton.classes.User();
    if (_skeleton.authorization.load().get('is_authed'))
      _skeleton.load_until_user_fetched();
    else
      _skeleton.set_loading(false);
    Backbone.history.start();
  };

  _skeleton.bind_enter_key = function() {
    _skeleton.$content.bind('keypress', function(e){
      if (e.keyCode == 13)
        _skeleton.$content.find('button.submit').click();
     });
  };

  _skeleton.bind_focus_on_navigate = function() {
    _skeleton.app_router.bind('all', function() {
      _skeleton.$content.find('input:first').focus();
    });
  };

  _skeleton.set_current_view = function(view, name) {
    if (_skeleton.current_view) {
      _skeleton.current_view.hide();
      if (!_skeleton.current_view.save_as)
        _skeleton.current_view.remove();
    }
    if (view) {
      _skeleton.current_view = view;
      if (view.save_as)
        _skeleton.views[view.save_as] = view;
    }
    else {
      _skeleton.current_view = _skeleton.views[name];
    }
    if (!_skeleton.current_view)
      return false;
    if (!_skeleton.is_loading)
      _skeleton.current_view.show();
    return _skeleton.current_view;
  };

  _skeleton.set_loading = function(is_loading) {
    if (is_loading) {
      if (_skeleton.current_view)
        _skeleton.current_view.hide();
      $('div.loading').show();
    }
    else {
      $('div.loading').hide();
      if (_skeleton.current_view)
        _skeleton.current_view.show();
    }
    _skeleton.is_loading = is_loading;
  };

  _skeleton.load_until_user_fetched = function() {
    _skeleton.set_loading(true);
    $.when(_skeleton.user.fetch.promise)
      .done(function() {
        _skeleton.set_loading(false);
      })
      .fail(function(errors) {
        _skeleton.check_error_is_not_403(errors.status);
      });  
  };

  _skeleton.check_error_is_not_403 = function(error) {
    if (error == 403) {
      _skeleton.app_router.navigate('auth/out', true);
      _skeleton.add_error("you were logged out");
      _skeleton.set_loading(false);
      return false;
    }
    return true;
  };

  _skeleton.check_is_authorized = function() {
    if (!_skeleton.authorization.get('is_authed')) {
      _skeleton.app_router.navigate('auth/out', true);
      return false;
    }
    return true;
  };

  _skeleton.add_error = function(error_message) {
    if (error_message) {
      var $div = $('<div/>').addClass('error');
      var $h5 = $('<h5/>').text(error_message);
      $div.append($h5).appendTo(_skeleton.current_view.$el.find('div.footer'));
    }
  };

  _skeleton.clear_errors = function() {
    _skeleton.current_view.$el.find('div.footer div.error').remove();
  };

  _skeleton.classes.AppRouter = Backbone.Router.extend({  
    routes: {
      "": "home",
      "user/:action": "user",
      "auth/:action": "auth"
    },
    home: function() {
      if (!_skeleton.set_current_view(null, 'home'))
        _skeleton.set_current_view(new _skeleton.classes.HomeView({save_as: 'home'})
          .bind_source('authorization', _skeleton.authorization)   
          .render());
    },
    user: function(action) {  
      switch (action) {
        case 'new':
          _skeleton.set_current_view(new _skeleton.classes.SignUpView({model: new _skeleton.classes.Credentials()}).render());
          break;
        default:
          _skeleton.app_router.navigate('', true);
          break;
      }
    },
    auth: function(action) {
      switch (action) {
        case 'in':
          _skeleton.set_current_view(new _skeleton.classes.LogInView({model: new _skeleton.classes.Credentials()}).render());
          break;
        case 'out':
          _skeleton.authorization.save(null, null);
          _skeleton.app_router.navigate('', true);
          break;
        default:
          _skeleton.app_router.navigate('', true);
          break;
      }
    }
  });

  _skeleton.classes.TemplateView = Backbone.Epoxy.View.extend({
    // remember, needs template, and a collection or a model
    render: function() {
      if (!this._template)
        this._template = _.template($('.template' + this.template).html());
      this.$el.append(this._template(this.collection || this.model));
      this.$el.appendTo(_skeleton.content).hide();
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

  _skeleton.classes.HomeView = _skeleton.classes.TemplateView.extend({
    template: '.home',
    bindings: {
      'div.authed': 'toggle:authorization_is_authed',
      'div.not_authed': 'toggle:not(authorization_is_authed)'
    }
  });

  _skeleton.classes.SignUpView = _skeleton.classes.TemplateView.extend({
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
      _skeleton.set_loading(true);
      this.model.save(null, {url: 'user'});
    },
    onSync: function(model, data, options) {
      _skeleton.authorization.save(data[0], this.model.get('email'));
      _skeleton.app_router.navigate('', true);
      _skeleton.load_until_user_fetched();
    },
    onError: function(model, errors, options) {
      _skeleton.clear_errors();
      _.each(errors.responseJSON, _skeleton.add_error);
      _skeleton.set_loading(false);
    }
  });

  _skeleton.classes.LogInView = _skeleton.classes.TemplateView.extend({
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
      _skeleton.set_loading(true);
      this.model.save(null, {url: 'session'});
    },
    onSync: function(model, data, options) {
      _skeleton.authorization.save(data[0], this.model.get('email'));
      _skeleton.app_router.navigate('', true);
      _skeleton.load_until_user_fetched();
    },
    onError: function(model, errors, options) {
      _skeleton.clear_errors();
      _.each(errors.responseJSON, _skeleton.add_error);
      _skeleton.set_loading(false);
    }
  });

  _skeleton.classes.Authorization = Backbone.Epoxy.Model.extend({
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

  _skeleton.classes.Credentials = Backbone.Epoxy.Model.extend({
    defaults: {
      email: null,
      password: null
    },

    initialize: function() {
      this.oldsave = this.save;
      this.save = function() {
        this.set({password: CryptoJS.SHA3(this.get('password')).toString(CryptoJS.enc.Hex)}, {silent: true});
        this.oldsave.apply(this, arguments);
      }
    }
  });

  _skeleton.classes.User = Backbone.Epoxy.Model.extend({
    initialize: function() {
      this.reset();
      _.bindAll(this, 'reset', 'fetch');
      $(_skeleton.authorization).on('authed', this.fetch);
      $(_skeleton.authorization).on('deauthed', this.reset);
    },
    reset: function() {
      this.fetch.promise = null;
      this.save.promise = null;
    },
    fetch: function() {
      var _user = this;
      var deferred = $.Deferred();
      $.get('user')
        .done(function(data) {
          deferred.resolve();
        })
        .fail(function(errors) {
          deferred.reject(errors);
        });
      this.fetch.promise = deferred.promise();
      return this.fetch.promise;
    }
  });

  return _skeleton;
})(jQuery);

$(document).ready(function() {
  $(window.applicationCache).on('updateready', function() {
    window.applicationCache.swapCache();
    if (confirm('A new version is available! Load it?'))
      window.location.reload();
  });
  skeleton.init();
});
