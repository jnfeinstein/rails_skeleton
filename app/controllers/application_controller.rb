class ApplicationController < ActionController::Base
  respond_to :xml, :json
  before_filter :check_token
  helper_method :current_user

  private

  def check_token
    if !current_user || current_user.token != cookies[:token]
      render :nothing => true, :status => :forbidden
      return false
    end
  end

  @_current_user = nil
  def current_user
    @_current_user ||= User.find_by_email(cookies[:user])
  end
end
