class ApplicationController < ActionController::Base
  respond_to :xml, :json
  before_filter :check_token
  helper_method :current_user

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
