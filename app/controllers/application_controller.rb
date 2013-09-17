class ApplicationController < ActionController::Base
  include ApplicationHelper

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  helper_method :current_user
  respond_to :xml, :json

  before_filter :check_token

  def check_token
    user = User.find_by_email(cookies[:user])
    if !user || user.token != cookies[:token]
      render :nothing => true, :status => :forbidden
      return false
    end
  end

  private

  def current_user
    User.find_by_email(cookies[:user])
  end
end
